import { NODE_STYLES } from "../lib/graphTheme";
import type { NodeKind } from "../lib/types";

const ORDER: NodeKind[] = [
  "topic",
  "decision_point",
  "option",
  "decision",
  "abandoned",
  "conclusion",
];

export function Legend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/85 p-2 text-[11px] text-slate-300 backdrop-blur">
      {ORDER.map((k) => {
        const s = NODE_STYLES[k];
        return (
          <div key={k} className="flex items-center gap-2">
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded ${s.bg} ${s.border} border ${
                s.dashed ? "border-dashed" : ""
              }`}
            >
              <span className="text-[9px]">{s.icon}</span>
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
