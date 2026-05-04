import { useEffect, useState } from "react";

const STORAGE_KEY = "chat-to-graph:apiKey";

interface Props {
  apiKey: string;
  onChange: (key: string) => void;
}

export function useStoredApiKey(): [string, (key: string) => void] {
  const [key, setKey] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    try {
      if (key) localStorage.setItem(STORAGE_KEY, key);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [key]);
  return [key, setKey];
}

export function SettingsBar({ apiKey, onChange }: Props) {
  const [open, setOpen] = useState(!apiKey);
  const masked = apiKey
    ? `${apiKey.slice(0, 6)}…${apiKey.slice(-4)}`
    : "Not set";

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
          apiKey
            ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-200 hover:border-emerald-500"
            : "border-amber-700/60 bg-amber-900/30 text-amber-200 hover:border-amber-500"
        }`}
        title="Click to set your Anthropic API key"
      >
        <span className="h-2 w-2 rounded-full bg-current opacity-80" />
        API key: {masked}
      </button>
      {open && (
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKey}
            placeholder="sk-ant-…"
            onChange={(e) => onChange(e.target.value.trim())}
            className="w-72 rounded-md border border-slate-700 bg-slate-950 px-2.5 py-1.5 font-mono text-xs text-slate-200 outline-none focus:border-sky-500/60"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-[10px] text-slate-500">stored in this browser only</span>
        </div>
      )}
    </div>
  );
}
