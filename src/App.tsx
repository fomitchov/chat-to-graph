import { useCallback, useState } from "react";
import { GraphView } from "./components/GraphView";
import { InputPanel } from "./components/InputPanel";
import { Legend } from "./components/Legend";
import { NodeDetailPanel } from "./components/NodeDetailPanel";
import { SettingsBar, useStoredApiKey } from "./components/SettingsBar";
import { SummaryPanel } from "./components/SummaryPanel";
import { analyzeConversation } from "./lib/analyze";
import { parseChat } from "./lib/parseChat";
import type { ConversationGraph } from "./lib/types";

export default function App() {
  const [apiKey, setApiKey] = useStoredApiKey();
  const [graph, setGraph] = useState<ConversationGraph | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [inputOpen, setInputOpen] = useState(true);

  const handleAnalyze = useCallback(
    async (text: string) => {
      setError(null);
      if (!apiKey) {
        setError("Add your Anthropic API key first (top right).");
        return;
      }
      const parsed = parseChat(text);
      if (parsed.messages.length === 0) {
        setError("Couldn't find any messages in the input.");
        return;
      }
      setBusy(true);
      try {
        const g = await analyzeConversation({ apiKey, parsed });
        setGraph(g);
        setSelectedNode(null);
        setInputOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setBusy(false);
      }
    },
    [apiKey],
  );

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-200">
      <header className="flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/80 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-sky-900/40">
            ⌘
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">
              Chat to Graph
            </div>
            <div className="text-[11px] text-slate-500">
              Turn long Claude conversations into a clean conversation map
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {graph && (
            <button
              type="button"
              onClick={() => setInputOpen((v) => !v)}
              className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-500"
            >
              {inputOpen ? "Hide input" : "Edit input"}
            </button>
          )}
          <SettingsBar apiKey={apiKey} onChange={setApiKey} />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-12">
        {(inputOpen || !graph) && (
          <aside className="col-span-3 min-h-0 border-r border-slate-800 bg-slate-950/60">
            <InputPanel
              onAnalyze={handleAnalyze}
              busy={busy}
              error={error}
            />
          </aside>
        )}

        <section
          className={`relative min-h-0 ${
            inputOpen || !graph ? "col-span-6" : "col-span-9"
          }`}
        >
          {graph ? (
            <>
              <GraphView
                graph={graph}
                selectedId={selectedNode}
                onSelect={setSelectedNode}
              />
              <Legend />
              {selectedNode && (
                <NodeDetailPanel
                  graph={graph}
                  nodeId={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  onSelect={setSelectedNode}
                />
              )}
            </>
          ) : (
            <EmptyState busy={busy} />
          )}
        </section>

        {graph && (
          <aside className="col-span-3 min-h-0 border-l border-slate-800 bg-slate-950/60">
            <SummaryPanel graph={graph} />
          </aside>
        )}
      </main>
    </div>
  );
}

function EmptyState({ busy }: { busy: boolean }) {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/30 to-violet-500/30 text-2xl">
          ◇
        </div>
        <h2 className="text-lg font-semibold text-slate-100">
          {busy ? "Analyzing your chat…" : "Paste a conversation to begin"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Drop a Claude.ai JSON export — or any text using
          <code className="mx-1 rounded bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300">
            Human:
          </code>
          /
          <code className="mx-1 rounded bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-300">
            Assistant:
          </code>
          turns — and Claude will extract the decision points, options
          considered, abandoned paths, and final conclusions, then render them
          as an interactive map.
        </p>
      </div>
    </div>
  );
}
