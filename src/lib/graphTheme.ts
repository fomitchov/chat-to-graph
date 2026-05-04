import type { EdgeKind, NodeKind } from "./types";

export interface NodeStyle {
  bg: string;
  border: string;
  text: string;
  glow: string;
  label: string;
  icon: string;
  shape: "rounded" | "diamond" | "pill" | "hex";
  dashed?: boolean;
}

export const NODE_STYLES: Record<NodeKind, NodeStyle> = {
  topic: {
    bg: "bg-slate-800/70",
    border: "border-slate-500/60",
    text: "text-slate-100",
    glow: "shadow-[0_0_24px_-10px_rgba(148,163,184,0.6)]",
    label: "Topic",
    icon: "◆",
    shape: "rounded",
  },
  decision_point: {
    bg: "bg-amber-500/15",
    border: "border-amber-400/70",
    text: "text-amber-50",
    glow: "shadow-[0_0_28px_-6px_rgba(251,191,36,0.55)]",
    label: "Decision point",
    icon: "?",
    shape: "diamond",
  },
  option: {
    bg: "bg-slate-800/50",
    border: "border-slate-600/70",
    text: "text-slate-200",
    glow: "shadow-none",
    label: "Option",
    icon: "○",
    shape: "pill",
  },
  decision: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-400",
    text: "text-emerald-50",
    glow: "shadow-[0_0_30px_-6px_rgba(52,211,153,0.65)]",
    label: "Chosen",
    icon: "✓",
    shape: "rounded",
  },
  abandoned: {
    bg: "bg-slate-900/50",
    border: "border-slate-700",
    text: "text-slate-500",
    glow: "shadow-none",
    label: "Abandoned",
    icon: "✕",
    shape: "pill",
    dashed: true,
  },
  conclusion: {
    bg: "bg-violet-500/15",
    border: "border-violet-400",
    text: "text-violet-50",
    glow: "shadow-[0_0_36px_-4px_rgba(167,139,250,0.7)]",
    label: "Conclusion",
    icon: "★",
    shape: "hex",
  },
};

export const EDGE_STYLES: Record<
  EdgeKind,
  { stroke: string; dashed: boolean; label?: string; animated?: boolean }
> = {
  leads_to: { stroke: "#64748b", dashed: false, animated: false },
  considers: { stroke: "#94a3b8", dashed: true, label: "considers" },
  chose: { stroke: "#34d399", dashed: false, label: "chose", animated: true },
  rejected: { stroke: "#475569", dashed: true, label: "rejected" },
  concludes: {
    stroke: "#a78bfa",
    dashed: false,
    label: "concludes",
    animated: true,
  },
  relates: { stroke: "#475569", dashed: true },
};
