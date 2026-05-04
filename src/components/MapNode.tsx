import { Handle, Position, type NodeProps } from "@xyflow/react";
import { NODE_STYLES } from "../lib/graphTheme";
import type { NodeKind } from "../lib/types";

export interface MapNodeData {
  kind: NodeKind;
  title: string;
  importance: number;
  selected?: boolean;
  [key: string]: unknown;
}

export function MapNode({ data, selected }: NodeProps) {
  const d = data as MapNodeData;
  const style = NODE_STYLES[d.kind];
  const scale = 0.85 + d.importance * 0.05;
  const isSelected = selected;

  return (
    <div
      className={[
        "group relative flex w-[240px] items-center gap-3 rounded-xl border px-3 py-2 backdrop-blur transition",
        style.bg,
        style.border,
        style.text,
        style.glow,
        style.dashed ? "border-dashed" : "",
        isSelected ? "ring-2 ring-sky-400/80 ring-offset-0" : "",
      ].join(" ")}
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-slate-500"
      />
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-semibold",
          d.kind === "decision_point"
            ? "bg-amber-400/30 text-amber-50"
            : d.kind === "decision"
              ? "bg-emerald-400/30 text-emerald-50"
              : d.kind === "abandoned"
                ? "bg-slate-700/50 text-slate-500"
                : d.kind === "conclusion"
                  ? "bg-violet-400/30 text-violet-50"
                  : d.kind === "option"
                    ? "bg-slate-700/60 text-slate-300"
                    : "bg-slate-700/60 text-slate-200",
        ].join(" ")}
      >
        {style.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-medium tracking-wide uppercase opacity-60">
          {style.label}
        </div>
        <div
          className={[
            "truncate text-sm font-semibold leading-tight",
            d.kind === "abandoned" ? "line-through opacity-70" : "",
          ].join(" ")}
          title={d.title}
        >
          {d.title}
        </div>
      </div>
      {d.importance >= 4 && (
        <div className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-900 shadow">
          {"★".repeat(Math.min(d.importance, 5))}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-slate-500"
      />
    </div>
  );
}
