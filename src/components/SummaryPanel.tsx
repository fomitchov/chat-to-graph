import type { ConversationGraph } from "../lib/types";

interface Props {
  graph: ConversationGraph;
}

export function SummaryPanel({ graph }: Props) {
  return (
    <div className="scroll-thin h-full space-y-5 overflow-y-auto p-5 text-sm text-slate-200">
      <div>
        <div className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
          Conversation
        </div>
        <h2 className="mt-0.5 text-lg leading-snug font-semibold text-slate-100">
          {graph.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {graph.oneLineSummary}
        </p>
      </div>

      <Section title="Key decisions" accent="emerald">
        {graph.keyDecisions.length === 0 ? (
          <Empty>No major decisions detected.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {graph.keyDecisions.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 text-emerald-400">✓</span>
                <span className="text-slate-200">{d}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Final conclusions" accent="violet">
        {graph.finalConclusions.length === 0 ? (
          <Empty>No final conclusions detected.</Empty>
        ) : (
          <ul className="space-y-1.5">
            {graph.finalConclusions.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 text-violet-400">★</span>
                <span className="text-slate-200">{d}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="At a glance">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Nodes" value={graph.nodes.length} />
          <Stat label="Edges" value={graph.edges.length} />
          <Stat
            label="Decisions"
            value={
              graph.nodes.filter((n) => n.kind === "decision").length
            }
          />
          <Stat
            label="Options"
            value={graph.nodes.filter((n) => n.kind === "option").length}
          />
          <Stat
            label="Abandoned"
            value={graph.nodes.filter((n) => n.kind === "abandoned").length}
          />
          <Stat
            label="Topics"
            value={graph.nodes.filter((n) => n.kind === "topic").length}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: "emerald" | "violet";
  children: React.ReactNode;
}) {
  const accentColor =
    accent === "emerald"
      ? "before:bg-emerald-400"
      : accent === "violet"
        ? "before:bg-violet-400"
        : "before:bg-slate-500";
  return (
    <div>
      <h3
        className={`relative pl-3 text-[11px] font-semibold tracking-wider text-slate-300 uppercase before:absolute before:top-1/2 before:left-0 before:h-3 before:w-1 before:-translate-y-1/2 before:rounded ${accentColor}`}
      >
        {title}
      </h3>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-500 italic">{children}</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-2">
      <div className="text-base font-semibold text-slate-100">{value}</div>
      <div className="text-[10px] tracking-wider text-slate-500 uppercase">
        {label}
      </div>
    </div>
  );
}
