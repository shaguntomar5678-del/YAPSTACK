import React, { useState, useMemo, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Network,
  Info,
  Clock,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  Layers,
  Droplets,
  Heart,
  Wind,
  Activity,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { usePatient } from '../../../lib/hooks';
import { Badge } from '../../common/Badge';
import { cn } from '../../../utils/cn';
import { formatRiskPercent } from '../../../utils/formatters';

interface CustomNodeData {
  id: string;
  label: string;
  organKey: 'renal' | 'hepatic' | 'cardio' | 'resp';
  status: string;
  risk: number | null | undefined;
  eventHour?: number;
  isDeteriorated?: boolean;
}

// Custom ReactFlow Node for Clinically Audited Organ
const OrganNodeComponent: React.FC<{ data: CustomNodeData; selected: boolean }> = ({ data, selected }) => {
  const organIcons = {
    renal: <Droplets className="w-4 h-4 text-vitalis-blue" />,
    hepatic: <Activity className="w-4 h-4 text-amber-600" />,
    cardio: <Heart className="w-4 h-4 text-vitalis-critical" />,
    resp: <Wind className="w-4 h-4 text-vitalis-teal" />,
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'elevated':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">Elevated</span>;
      case 'dysfunction_present':
        return <span className="bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Dysfunction</span>;
      case 'low':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-medium px-1.5 py-0.5 rounded">Low Risk</span>;
      case 'insufficient_data':
      default:
        return <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">Insufficient</span>;
    }
  };

  return (
    <div
      className={cn(
        'w-56 bg-white rounded-lg border shadow-card p-3 transition-all select-none',
        data.status === 'elevated' || data.status === 'dysfunction_present'
          ? 'border-vitalis-critical ring-1 ring-vitalis-critical/20'
          : 'border-vitalis-border',
        selected ? 'ring-2 ring-vitalis-blue shadow-elevated border-vitalis-blue' : 'hover:border-vitalis-blue/60'
      )}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-vitalis-navy" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-vitalis-navy" />

      <div className="flex items-center justify-between text-[10px] mb-1.5">
        <div className="flex items-center gap-1.5">
          {organIcons[data.organKey]}
          <span className="font-bold text-xs text-vitalis-text">{data.label}</span>
        </div>
        {statusBadge(data.status)}
      </div>

      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 text-xs">
        <span className="text-vitalis-muted text-[11px]">Modelled Risk:</span>
        <span className="font-mono font-bold text-vitalis-navy">
          {formatRiskPercent(data.risk)}
        </span>
      </div>

      {data.eventHour !== undefined && (
        <div className="mt-1.5 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5 text-[10px] text-amber-900 font-semibold flex items-center justify-between">
          <span>Observed Divergence:</span>
          <span className="font-mono">@{data.eventHour}h</span>
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  organNode: OrganNodeComponent,
};

export const CascadeGraph: React.FC = () => {
  const {
    selectedPatientId,
    setSelectedPatientId,
    selectedAnchorHour,
    setSelectedAnchorHour,
    patients,
    language,
    t,
  } = useApp();

  const { data: patient, loading, error } = usePatient(selectedPatientId);

  const [selectedElement, setSelectedElement] = useState<{
    type: 'node' | 'edge';
    data: any;
  } | null>(null);

  const anchors = useMemo(() => patient?.anchors ?? [], [patient]);

  const currentAnchor = useMemo(() => {
    if (!anchors.length) return null;
    const found = anchors.find((a) => a.hour === selectedAnchorHour);
    return found || anchors[anchors.length - 1];
  }, [anchors, selectedAnchorHour]);

  // Construct ReactFlow Nodes
  const nodes: Node<CustomNodeData>[] = useMemo(() => {
    if (!patient || !currentAnchor) return [];

    const organPositions: Record<'renal' | 'cardio' | 'resp' | 'hepatic', { x: number; y: number; label: string }> = {
      renal: { x: 50, y: 150, label: 'Renal System' },
      cardio: { x: 350, y: 60, label: 'Cardiovascular' },
      resp: { x: 650, y: 150, label: 'Respiratory System' },
      hepatic: { x: 350, y: 280, label: 'Hepatic System' },
    };

    // Events map
    const eventMap: Record<string, number> = {};
    (patient.cascade?.events || []).forEach((ev) => {
      eventMap[ev.organ] = ev.hour;
    });

    return (['renal', 'cardio', 'resp', 'hepatic'] as const).map((key) => {
      const organData = currentAnchor.organs[key];
      const pos = organPositions[key];
      const evHour = eventMap[key];

      return {
        id: key,
        type: 'organNode',
        position: { x: pos.x, y: pos.y },
        data: {
          id: key,
          label: pos.label,
          organKey: key,
          status: organData?.status ?? 'low',
          risk: organData?.risk,
          eventHour: evHour,
          isDeteriorated: organData?.status === 'elevated' || organData?.status === 'dysfunction_present',
        },
      };
    });
  }, [patient, currentAnchor]);

  // Construct ReactFlow Edges
  const edges: Edge[] = useMemo(() => {
    if (!patient?.cascade?.edges) return [];
    const currentH = currentAnchor?.hour ?? 92;

    return patient.cascade.edges
      .filter((e) => {
        // Show if active_from_hour is undefined or <= selectedAnchorHour
        return e.active_from_hour === null || e.active_from_hour === undefined || e.active_from_hour <= currentH;
      })
      .map((e, idx) => {
        const isObserved = e.type === 'observed_sequence_and_plausible';
        return {
          id: `edge-${idx}-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: 'default',
          animated: isObserved,
          style: {
            stroke: isObserved ? '#2563EB' : '#94A3B8',
            strokeWidth: isObserved ? 2.5 : 1.5,
            strokeDasharray: isObserved ? undefined : '5,5',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isObserved ? '#2563EB' : '#94A3B8',
            width: 16,
            height: 16,
          },
          data: {
            ...e,
            classificationText: isObserved
              ? 'Observed temporal sequence (plausible link)'
              : 'Clinically plausible pathway',
          },
        };
      });
  }, [patient?.cascade?.edges, currentAnchor?.hour]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedElement({ type: 'node', data: node.data });
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedElement({ type: 'edge', data: edge.data });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        Loading multi-organ cascade dynamics...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8 text-center text-vitalis-muted">
        <p className="text-vitalis-critical">
          {error || 'Cascade dynamics data could not be loaded.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-card rounded-lg border border-vitalis-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy flex items-center gap-2">
              <Network className="w-5 h-5 text-vitalis-blue" />
              <span>{language === 'hi' ? 'सोपान आरेख (कैस्केड ग्राफ)' : 'Multi-Organ Cascade Dynamics'}</span>
            </h1>
            <Badge variant="navy" size="xs">
              Non-Causal Association Model
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            Temporal propagation, cross-organ couplings &amp; observed sequence verification
          </p>
        </div>

        {/* Patient & Anchor Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="appearance-none bg-slate-50 border border-vitalis-border rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-vitalis-navy focus:outline-none focus:border-vitalis-blue cursor-pointer"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.id} — {pat.name} ({pat.bed})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-vitalis-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-vitalis-border rounded-lg p-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-vitalis-muted ml-1" />
            <select
              value={currentAnchor?.hour}
              onChange={(e) => setSelectedAnchorHour(Number(e.target.value))}
              className="bg-transparent text-vitalis-navy font-mono font-bold focus:outline-none cursor-pointer pr-1"
            >
              {anchors.map((anc) => (
                <option key={anc.hour} value={anc.hour}>
                  Hour {anc.hour}h
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas & Evidence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Canvas - 3 Cols */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-vitalis-border shadow-subtle overflow-hidden flex flex-col h-[520px] relative">
          {/* Canvas Top Bar / Legend */}
          <div className="p-3 bg-slate-50 border-b border-vitalis-border flex flex-wrap items-center justify-between gap-3 text-xs select-none">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-vitalis-navy uppercase text-[11px] tracking-wider">
                Graph Legend:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 bg-[#2563EB]" />
                <span className="text-[11px] text-slate-700">Observed Sequence (Plausible)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-0.5 border-b border-dashed border-[#94A3B8]" />
                <span className="text-[11px] text-slate-500">Plausible Pathway</span>
              </div>
            </div>

            <div className="text-[11px] text-vitalis-muted font-mono">
              Active Anchor: <strong className="text-vitalis-navy">{currentAnchor?.hour}h</strong>
            </div>
          </div>

          {/* React Flow Container */}
          <div className="flex-1 w-full h-full bg-[#F8FAFC]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={0.5}
              maxZoom={1.5}
            >
              <Background color="#DCE4EF" gap={20} size={1} />
              <Controls className="!bg-white !border !border-vitalis-border !rounded-lg !shadow-subtle" />
            </ReactFlow>
          </div>

          {/* Canvas Non-Causal Guardrail Footer */}
          <div className="p-2.5 bg-amber-50 border-t border-amber-200 text-[10px] text-amber-900 flex items-center justify-between">
            <span>
              <strong>Clinical Guardrail:</strong> {patient.cascade?.note || 'Sequence and plausibility only. Never represents correlation as proven causality.'}
            </span>
            <span className="font-mono text-amber-800">4-hourly anchor step</span>
          </div>
        </div>

        {/* Evidence & Details Side Panel - 1 Col */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-vitalis-border pb-2.5">
            <Info className="w-4 h-4 text-vitalis-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-text">
              Coupling &amp; Evidence Audit
            </h3>
          </div>

          {selectedElement?.type === 'node' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-vitalis-border space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-vitalis-muted tracking-wider block">
                  Organ Node Selected
                </span>
                <h4 className="text-sm font-bold text-vitalis-navy">
                  {selectedElement.data.label}
                </h4>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span>Status:</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {selectedElement.data.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Modelled Risk:</span>
                  <span className="font-mono font-bold text-vitalis-navy">
                    {formatRiskPercent(selectedElement.data.risk)}
                  </span>
                </div>
                {selectedElement.data.eventHour !== undefined && (
                  <div className="flex items-center justify-between text-[11px] text-amber-800 font-semibold pt-1 border-t border-slate-200">
                    <span>First Detected Divergence:</span>
                    <span>{selectedElement.data.eventHour}h</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-vitalis-muted">
                Click any connecting directional arrow to examine coupling rationale and empirical lag times.
              </p>
            </div>
          )}

          {selectedElement?.type === 'edge' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-vitalis-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-vitalis-muted tracking-wider block">
                  Cascade Coupling Selected
                </span>
                <div className="flex items-center gap-1.5 font-bold text-vitalis-navy">
                  <span className="uppercase">{selectedElement.data.source}</span>
                  <span>&rarr;</span>
                  <span className="uppercase">{selectedElement.data.target}</span>
                </div>

                <div className="space-y-1 text-[11px] pt-1 border-t border-slate-200">
                  <div className="text-vitalis-muted">Classification:</div>
                  <div className="font-semibold text-slate-800">
                    {selectedElement.data.classificationText}
                  </div>
                </div>

                {selectedElement.data.lag_hours !== null && selectedElement.data.lag_hours !== undefined && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-vitalis-muted">Observed Lag:</span>
                    <span className="font-mono font-bold text-slate-800">
                      +{selectedElement.data.lag_hours} hours
                    </span>
                  </div>
                )}

                <div className="space-y-1 text-[11px] pt-1 border-t border-slate-200">
                  <span className="text-vitalis-muted">Physiological Rationale:</span>
                  <p className="text-slate-800 font-medium">
                    {selectedElement.data.rationale || 'Coupling under continuous clinical observation.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!selectedElement && (
            <div className="p-4 rounded-lg bg-slate-50 border border-vitalis-border text-center text-vitalis-muted text-xs space-y-2">
              <Layers className="w-5 h-5 mx-auto text-vitalis-muted/70" />
              <p>Select any organ node or directional pathway on the canvas to inspect coupling mechanisms.</p>
            </div>
          )}

          {/* Active Cascade Summary */}
          <div className="p-3 rounded-lg border border-vitalis-border bg-slate-50/50 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-vitalis-navy uppercase tracking-wider block">
              Observed Deterioration Sequence:
            </span>
            <div className="space-y-1">
              {(patient.cascade?.events || []).map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800 capitalize">
                    {idx + 1}. {ev.organ}
                  </span>
                  <span className="font-mono text-vitalis-navy font-bold">
                    Hour {ev.hour}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
