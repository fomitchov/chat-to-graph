import { NODE_STYLES } from "../lib/graphTheme";
import type { ConversationGraph, GraphNode } from "../lib/types";

interface Props {
  graph: ConversationGraph;
  nodeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function NodeDetailPanel({ graph, nodeId, onClose, onSelect }: Props) {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const style = NODE_STYLES[node.kind];

  const incoming = graph.edges
    .filter((e) => e.target === node.id)
    .map((e) => ({ edge: e, other: graph.nodes.find((n) => n.id === e.source) }))
    .filter((x): x is { edge: typeof x.edge; other: GraphNode } => !!x.other);
  const outgoing = graph.edges
    .filter((e) => e.source === node.id)
    .map((e) => ({ edge: e, other: graph.nodes.find((n) => n.id === e.target) }))
    .filter((x): x is { edge: typeof x.edge; other: GraphNode } => !!x.other);

  return (
    <div className="absolute top-4 right-4 z-20 w-[360px] max-w-[90vw] overflow-hidden rounded-xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">
            {style.label}
          </div>
          <h3 className="mt-0.5 text-base leading-snug font-semibold text-slate-100">
            {node.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="scroll-thin max-h-[70vh] space-y-4 overflow-y-auto px-4 py-3 text-sm text-slate-200">
        <p className="leading-relaxed text-slate-300">{node.summary}</p>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-slate-500">Importance</span>
          <span className="text-amber-300">
            {"★".repeat(node.importance)}
            <span className="text-slate-700">
              {"★".repeat(5 - node.importance)}
            </span>
          </span>
        </div>

        {node.excerpts && node.excerpts.length > 0 && (
          <div>
            <div className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Excerpts
            </div>
            <div className="space-y-2">
              {node.excerpts.map((q, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-slate-700 bg-slate-900/60 px-3 py-2 text-xs leading-relaxed text-slate-300 italic"
                >
                  &ldquo;{q}&rdquo;
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {incoming.length > 0 && (
          <RelationsList
            label="From"
            items={incoming}
            onSelect={onSelect}
          />
        )}
        {outgoing.length > 0 && (
          <RelationsList
            label="To"
            items={outgoing}
            onSelect={onSelect}
          />
        )}
      </div>
    </div>
  );
}

function RelationsList({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: { edge: { kind: string; label?: string }; other: GraphNode }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </div>
      <ul className="space-y-1">
        {items.map(({ edge, other }, i) => {
          const style = NODE_STYLES[other.kind];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(other.id)}
                className="flex w-full items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-2 py-1.5 text-left text-xs text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              >
                <span className="text-slate-500">{style.icon}</span>
                <span className="flex-1 truncate">{other.title}</span>
                <span className="text-[10px] text-slate-500">
                  {edge.label ?? edge.kind}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
