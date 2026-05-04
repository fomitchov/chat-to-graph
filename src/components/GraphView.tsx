import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useMemo } from "react";
import { EDGE_STYLES, NODE_STYLES } from "../lib/graphTheme";
import { layoutGraph } from "../lib/layout";
import type { ConversationGraph } from "../lib/types";
import { MapNode } from "./MapNode";

const nodeTypes = { map: MapNode };

interface Props {
  graph: ConversationGraph;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function GraphView({ graph, selectedId, onSelect }: Props) {
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = graph.nodes.map((n) => ({
      id: n.id,
      type: "map",
      position: { x: 0, y: 0 },
      data: {
        kind: n.kind,
        title: n.title,
        importance: n.importance,
      },
      selected: n.id === selectedId,
    }));
    const rawEdges: Edge[] = graph.edges.map((e) => {
      const style = EDGE_STYLES[e.kind] ?? EDGE_STYLES.leads_to;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label ?? style.label,
        labelStyle: {
          fill: "#cbd5e1",
          fontSize: 10,
          fontWeight: 500,
        },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.85 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        animated: style.animated ?? false,
        style: {
          stroke: style.stroke,
          strokeWidth: 1.6,
          strokeDasharray: style.dashed ? "5 5" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: style.stroke,
          width: 18,
          height: 18,
        },
      };
    });
    return layoutGraph(rawNodes, rawEdges, "LR");
  }, [graph, selectedId]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: false }}
        onNodeClick={(_, n) => onSelect(n.id)}
        onPaneClick={() => onSelect(null)}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e293b"
        />
        <Controls
          showInteractive={false}
          className="!bg-slate-900/80 !border !border-slate-800 [&_button]:!bg-slate-900 [&_button]:!border-slate-800 [&_button]:!text-slate-200"
        />
        <MiniMap
          pannable
          zoomable
          className="!bg-slate-900/80 !border !border-slate-800"
          nodeColor={(n) => {
            const kind = (n.data as { kind?: keyof typeof NODE_STYLES }).kind;
            if (!kind) return "#475569";
            const map: Record<string, string> = {
              topic: "#94a3b8",
              decision_point: "#fbbf24",
              option: "#64748b",
              decision: "#34d399",
              abandoned: "#334155",
              conclusion: "#a78bfa",
            };
            return map[kind] ?? "#475569";
          }}
          maskColor="rgba(2,6,23,0.6)"
        />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
