import { useRef, useState } from "react";

interface Props {
  onAnalyze: (text: string) => void;
  busy: boolean;
  error: string | null;
}

const SAMPLE = [
  "Human: We're picking a database for the new analytics service. Postgres or ClickHouse?",
  "",
  "Assistant: Both can work. Postgres is simpler to operate and your team already knows it. ClickHouse is much faster for the dashboard queries you described (10x+ on wide aggregations) but adds an ops burden. How big is the dataset and what's the team's appetite for new infra?",
  "",
  "Human: ~500M rows now, growing 20% per quarter. Small team, no dedicated SRE.",
  "",
  "Assistant: Given the team size, I'd lean Postgres with TimescaleDB or columnar partitions to start. You can revisit ClickHouse if p95 dashboard latency degrades past 2s.",
  "",
  "Human: Ok, Postgres + Timescale it is. What about the API — REST or GraphQL?",
  "",
  "Assistant: For an internal analytics dashboard, GraphQL is overkill. REST with a few well-designed endpoints will be faster to ship and easier to cache.",
  "",
  "Human: Agreed, REST. Let's also drop the idea of a separate ingestion service for now — we'll just write directly from the workers.",
  "",
  "Assistant: Sounds right for the current scale. To summarize: Postgres + Timescale, REST API, direct ingestion from workers, revisit ClickHouse if dashboards slow down.",
].join("\n");

export function InputPanel({ onAnalyze, busy, error }: Props) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">
          Conversation input
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-slate-100"
            onClick={() => setText(SAMPLE)}
            disabled={busy}
          >
            Load sample
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-slate-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            Upload file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,.md"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </div>

      <textarea
        className="scroll-thin min-h-0 flex-1 resize-none rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-xs text-slate-200 outline-none focus:border-sky-500/60"
        placeholder="Paste a Claude conversation here. Accepts the Claude.ai JSON export, plain text with 'Human:' / 'Assistant:' lines, or markdown."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        spellCheck={false}
      />

      {error && (
        <div className="rounded-md border border-rose-700/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => onAnalyze(text)}
        disabled={busy || !text.trim()}
        className="rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Analyzing…" : "Generate map"}
      </button>
    </div>
  );
}
