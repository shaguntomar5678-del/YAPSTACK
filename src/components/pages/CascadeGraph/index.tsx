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
  SkipForward,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MOCK_CASCADE_DATA } from '../../../services/mockData';
import { CascadeNodeData, CascadeEdgeData } from '../../../types/cascade';
import { Badge } from '../../common/Badge';
import { cn } from '../../../utils/cn';

// Custom React Flow Node Component
const ClinicalNodeComponent: React.FC<{ data: CascadeNodeData; selected: boolean }> = ({ data, selected }) => {
  const categoryStyles = {
    cardiac: 'border-l-4 border-l-red-500',
    renal: 'border-l-4 border-l-blue-600',
    fluid: 'border-l-4 border-l-indigo-600',
    respiratory: 'border-l-4 border-l-teal-600',
    hepatic: 'border-l-4 border-l-amber-500',
    systemic: 'border-l-4 border-l-slate-600',
  };

  const statusBadges = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    watch: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    normal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <div
      className={cn(
        'w-64 bg-white rounded-lg border border-vitalis-border shadow-card p-3 transition-all select-none',
        categoryStyles[data.category],
        selected ? 'ring-2 ring-vitalis-blue shadow-elevated border-vitalis-blue' : 'hover:border-vitalis-blue/60'
      )}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-vitalis-navy" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-vitalis-navy" />

      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="font-mono font-bold text-vitalis-navy uppercase tracking-wider">
          {data.relativeTime}
        </span>
        <span className={cn('px-1.5 py-0.2 rounded font-semibold border text-[9px] uppercase', statusBadges[data.status])}>
          {data.status}
        </span>
      </div>

      <div className="font-bold text-xs text-vitalis-navy leading-snug">
        {data.label}
      </div>

      {data.sublabel && (
        <div className="text-[10px] text-vitalis-muted mt-0.5 truncate">
          {data.sublabel}
        </div>
      )}

      {/* Primary Key Metric Display */}
      <div className="mt-2 pt-1.5 border-t border-vitalis-border/60 flex items-center justify-between text-[11px]">
        <span className="text-vitalis-muted">{data.primaryMetric.name}:</span>
        <span className="font-mono font-bold text-slate-900">
          {data.primaryMetric.value}{' '}
          <span className="text-[10px] text-red-600 font-semibold font-sans">
            ({data.primaryMetric.deltaVsBaseline})
          </span>
        </span>
      </div>

      {data.isTriggerNode && (
        <div className="mt-1.5 text-[9px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 text-center uppercase tracking-wider">
          Primary Distributive Trigger
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  clinicalNode: ClinicalNodeComponent,
};

export const CascadeGraph: React.FC = () => {
  const { selectedPatient, language, t } = useApp();

  const [nodes, setNodes] = useState<Node[]>(MOCK_CASCADE_DATA.nodes as any);
  const [edges, setEdges] = useState<Edge[]>(
    MOCK_CASCADE_DATA.edges.map((e) => ({
      ...e,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.data.isClinicallyReviewed ? '#123B82' : '#64748B',
        width: 16,
        height: 16,
      },
      style: {
        stroke: e.data.isClinicallyReviewed ? '#123B82' : '#94A3B8',
        strokeWidth: e.data.isClinicallyReviewed ? 2.5 : 1.8,
        strokeDasharray: e.data.isClinicallyReviewed ? undefined : '5 5',
      },
    }))
  );

  const [selectedNodeData, setSelectedNodeData] = useState<CascadeNodeData | null>(MOCK_CASCADE_DATA.nodes[0].data);
  const [selectedEdgeData, setSelectedEdgeData] = useState<CascadeEdgeData | null>(null);

  // Timeline Slider State (Step 1 to 5)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(4);
  const timelineSteps = MOCK_CASCADE_DATA.timelineSteps;
  const activeStep = timelineSteps[currentStepIndex];

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data as CascadeNodeData);
    setSelectedEdgeData(null);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeData(edge.data as CascadeEdgeData);
    setSelectedNodeData(null);
  };

  const styledNodes = useMemo(() => {
    return nodes.map((node) => {
      const isActive = activeStep.activeNodeIds.includes(node.id);
      return {
        ...node,
        style: {
          opacity: isActive ? 1 : 0.35,
          transition: 'opacity 0.25s ease',
        },
      };
    });
  }, [nodes, activeStep]);

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const isActive = activeStep.activeEdgeIds.includes(edge.id);
      return {
        ...edge,
        animated: isActive,
        style: {
          ...edge.style,
          opacity: isActive ? 1 : 0.2,
          transition: 'opacity 0.25s ease',
        },
      };
    });
  }, [edges, activeStep]);

  const tc = t.cascade;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-vitalis-navy">
              {tc.title}
            </h1>
            <Badge variant="navy" size="xs">
              {language === 'hi' ? 'सोपान आरेख' : 'Pathophysiological Graph'}
            </Badge>
          </div>
          <p className="text-xs text-vitalis-muted mt-0.5">
            {language === 'hi'
              ? `${selectedPatient?.name || 'Sunita Sharma'} (${selectedPatient?.bed}) हेतु अङ्ग विफलता सोपान एवं प्रसार विश्लेषण`
              : `Temporal propagation analysis for ${selectedPatient?.name || 'Sunita Sharma'} (${selectedPatient?.bed}) • Interactive nodes & directional links`}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-[#F3F6FA] px-3 py-1.5 rounded-lg border border-vitalis-border">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-vitalis-navy inline-block" />
            <span className="text-slate-800 font-medium">{tc.reviewedLink}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" />
            <span className="text-vitalis-muted">{tc.observedAssociation}</span>
          </div>
        </div>
      </div>

      {/* Prominent Clinical Methodology & Causality Disclaimer Banner */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-subtle">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-amber-900">
            {language === 'hi' ? 'चिकित्सीय कारण-संबंध सूचना (Causality Notice):' : 'Clinical Epistemology & Causality Notice:'}
          </span>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {language === 'hi'
              ? 'दिशात्मक तीर प्रेक्षित समय-क्रम एवं प्रकाशित रोग-शारीरिक प्रतिरूपों को दर्शाते हैं। चिकित्सकीय AI नियमों के अनुसार, सांख्यिकीय सहसंबंध को अंतिम सिद्ध कारण नहीं माना जाता।'
              : 'Temporal directional edges illustrate observed chronological precedence and published pathophysiological models. In accordance with clinical AI governance guidelines, statistical correlation is never represented as proven definitive causality.'}
          </p>
        </div>
      </div>

      {/* Main Graph Canvas & Evidence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[560px]">
        {/* Left 3 Cols: React Flow Canvas */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-vitalis-border shadow-subtle relative overflow-hidden flex flex-col">
          <div className="flex-1 w-full h-full">
            <ReactFlow
              nodes={styledNodes}
              edges={styledEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.5}
              maxZoom={1.5}
            >
              <Background color="#DCE4EF" gap={16} size={1} />
              <Controls showInteractive={false} className="!bg-white !border !border-vitalis-border !rounded !shadow-subtle" />
            </ReactFlow>
          </div>

          {/* Bottom Interactive Timeline Slider */}
          <div className="border-t border-vitalis-border bg-slate-50/90 p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-vitalis-navy uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-vitalis-blue" />
                {tc.timelineTitle}
              </span>
              <span className="text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-vitalis-border shadow-subtle">
                {tc.step} {currentStepIndex + 1} / {timelineSteps.length}: {activeStep.label}
              </span>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setCurrentStepIndex(0)}
                className="p-1 text-vitalis-muted hover:text-vitalis-navy"
                title="Reset to Hour 0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min={0}
                max={timelineSteps.length - 1}
                value={currentStepIndex}
                onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
                className="w-full accent-vitalis-navy cursor-pointer"
              />

              <button
                onClick={() => setCurrentStepIndex((prev) => (prev < timelineSteps.length - 1 ? prev + 1 : prev))}
                disabled={currentStepIndex === timelineSteps.length - 1}
                className="p-1 text-vitalis-muted hover:text-vitalis-navy disabled:opacity-40"
                title="Next Step"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Evidence Detail Panel */}
        <div className="bg-card rounded-lg border border-vitalis-border p-4 shadow-subtle flex flex-col overflow-y-auto max-h-[560px]">
          <div className="pb-3 border-b border-vitalis-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-vitalis-navy" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-vitalis-navy">
                {tc.evidenceTitle}
              </h3>
            </div>
            <span className="text-[10px] text-vitalis-muted">
              {selectedNodeData ? 'Node Selected' : selectedEdgeData ? 'Edge Selected' : 'Overview'}
            </span>
          </div>

          <div className="flex-1 py-3 space-y-4 text-xs">
            {selectedNodeData && (
              <div className="space-y-3">
                <div>
                  <Badge variant="navy" size="xs">
                    {selectedNodeData.category.toUpperCase()} SYSTEM
                  </Badge>
                  <h4 className="text-sm font-bold text-vitalis-navy mt-1">
                    {selectedNodeData.label}
                  </h4>
                  <p className="text-[11px] text-vitalis-muted mt-0.5">
                    {selectedNodeData.sublabel} ({selectedNodeData.timestamp})
                  </p>
                </div>

                <div className="bg-slate-50 border border-vitalis-border rounded p-2.5 flex justify-between items-center">
                  <span className="text-vitalis-muted">{selectedNodeData.primaryMetric.name}:</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedNodeData.primaryMetric.value}{' '}
                    <span className="text-xs text-red-600 font-sans">
                      ({selectedNodeData.primaryMetric.deltaVsBaseline})
                    </span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-[11px] text-vitalis-navy uppercase tracking-wider">
                    {tc.observedTelemetry}
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                    {selectedNodeData.observedEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {selectedNodeData.reviewedPathophysiology && (
                  <div className="space-y-1 bg-sky-50/70 border border-sky-100 rounded p-2.5">
                    <span className="font-bold text-[10px] text-vitalis-navy uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-vitalis-teal" />
                      {tc.pathophysiologyBasis}
                    </span>
                    <p className="text-[11px] text-sky-950 leading-relaxed">
                      {selectedNodeData.reviewedPathophysiology}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedEdgeData && (
              <div className="space-y-3">
                <div>
                  <Badge
                    variant={selectedEdgeData.isClinicallyReviewed ? 'teal' : 'outline'}
                    size="xs"
                  >
                    {selectedEdgeData.isClinicallyReviewed
                      ? tc.reviewedLink
                      : tc.observedAssociation}
                  </Badge>
                  <h4 className="text-sm font-bold text-vitalis-navy mt-1">
                    {tc.propagationMechanism}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-vitalis-muted mt-0.5">
                    <span>Lag: <strong className="text-slate-800">{selectedEdgeData.temporalLag}</strong></span>
                    <span>•</span>
                    <span>r: <strong className="font-mono text-slate-800">{selectedEdgeData.correlationScore}</strong></span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[11px] text-vitalis-navy uppercase tracking-wider">
                    {tc.directionalDynamics}
                  </span>
                  <p className="text-[11px] text-slate-700 bg-slate-50 border border-vitalis-border rounded p-2.5 leading-relaxed">
                    {selectedEdgeData.directionDescription}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[11px] text-vitalis-navy uppercase tracking-wider">
                    {tc.statisticalEvidence}
                  </span>
                  <p className="text-[11px] text-slate-600 bg-slate-50 border border-vitalis-border rounded p-2 leading-relaxed">
                    {selectedEdgeData.evidenceSummary}
                  </p>
                </div>

                <div className="space-y-1 bg-sky-50/70 border border-sky-100 rounded p-2.5">
                  <span className="font-bold text-[10px] text-vitalis-navy uppercase tracking-wider">
                    {tc.physiologicalMechanism}
                  </span>
                  <p className="text-[11px] text-sky-950 leading-relaxed">
                    {selectedEdgeData.pathophysiologicalMechanism}
                  </p>
                </div>
              </div>
            )}

            {!selectedNodeData && !selectedEdgeData && (
              <div className="py-12 text-center text-vitalis-muted space-y-1">
                <Network className="w-8 h-8 mx-auto text-slate-300" />
                <p>Click on any organ event node or directional link to view detailed clinical telemetry evidence.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
