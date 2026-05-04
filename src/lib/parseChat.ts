import type { ChatMessage, ParsedChat } from "./types";

const SENDERS = new Set(["human", "user", "assistant", "claude", "system"]);

function normalizeSender(s: string): ChatMessage["sender"] {
  const v = s.toLowerCase().trim();
  if (v === "human" || v === "user") return "human";
  if (v === "assistant" || v === "claude" || v === "ai" || v === "bot")
    return "assistant";
  if (v === "system") return "system";
  return "unknown";
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const p = part as Record<string, unknown>;
          if (typeof p.text === "string") return p.text;
          if (typeof p.content === "string") return p.content;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object") {
    const c = content as Record<string, unknown>;
    if (typeof c.text === "string") return c.text;
  }
  return "";
}

function fromClaudeJson(parsed: unknown): ParsedChat | null {
  // Claude.ai export: either a single conversation object or array of them.
  // Each has chat_messages: [{ sender: "human"|"assistant", text, content }]
  const candidates: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
  for (const cand of candidates) {
    if (!cand || typeof cand !== "object") continue;
    const obj = cand as Record<string, unknown>;
    const chatMessages = obj.chat_messages ?? obj.messages;
    if (!Array.isArray(chatMessages)) continue;

    const messages: ChatMessage[] = [];
    chatMessages.forEach((m, i) => {
      if (!m || typeof m !== "object") return;
      const mo = m as Record<string, unknown>;
      const senderRaw =
        (mo.sender as string) || (mo.role as string) || "unknown";
      let text = "";
      if (typeof mo.text === "string" && mo.text.trim()) text = mo.text;
      else text = extractTextFromContent(mo.content);
      if (!text.trim()) return;
      messages.push({
        index: i,
        sender: normalizeSender(senderRaw),
        text: text.trim(),
      });
    });

    if (messages.length === 0) continue;

    const title =
      (obj.name as string) || (obj.title as string) || "Untitled chat";
    return {
      source: "claude-json",
      title,
      messages,
      rendered: renderMessages(messages),
    };
  }
  return null;
}

function fromMarkdownOrText(text: string): ParsedChat {
  // Look for headings or "Sender:" prefixes that demarcate turns.
  const lines = text.split(/\r?\n/);
  const messages: ChatMessage[] = [];
  let current: ChatMessage | null = null;

  const headerRe =
    /^\s*(?:#{1,6}\s*)?(?:\*\*)?(human|user|assistant|claude|ai|system)(?:\*\*)?\s*[:：-]?\s*$/i;
  const inlineRe =
    /^\s*(?:\*\*)?(human|user|assistant|claude|ai|system)(?:\*\*)?\s*[:：]\s*(.*)$/i;

  for (const line of lines) {
    const headerMatch = line.match(headerRe);
    const inlineMatch = !headerMatch && line.match(inlineRe);

    if (headerMatch && SENDERS.has(headerMatch[1].toLowerCase())) {
      if (current && current.text.trim()) messages.push(current);
      current = {
        index: messages.length,
        sender: normalizeSender(headerMatch[1]),
        text: "",
      };
    } else if (inlineMatch && SENDERS.has(inlineMatch[1].toLowerCase())) {
      if (current && current.text.trim()) messages.push(current);
      current = {
        index: messages.length,
        sender: normalizeSender(inlineMatch[1]),
        text: inlineMatch[2] ?? "",
      };
    } else if (current) {
      current.text += (current.text ? "\n" : "") + line;
    }
  }
  if (current && current.text.trim()) messages.push(current);

  if (messages.length === 0) {
    // Single blob — treat as one human turn so the analyzer still runs.
    messages.push({ index: 0, sender: "human", text: text.trim() });
    return {
      source: "plain-text",
      messages,
      rendered: renderMessages(messages),
    };
  }

  return {
    source: "claude-markdown",
    messages,
    rendered: renderMessages(messages),
  };
}

function renderMessages(messages: ChatMessage[]): string {
  return messages
    .map((m) => `[#${m.index} ${m.sender.toUpperCase()}]\n${m.text.trim()}`)
    .join("\n\n---\n\n");
}

export function parseChat(input: string): ParsedChat {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      source: "plain-text",
      messages: [],
      rendered: "",
    };
  }
  // Try JSON first.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const fromJson = fromClaudeJson(parsed);
      if (fromJson) return fromJson;
    } catch {
      // fall through
    }
  }
  return fromMarkdownOrText(trimmed);
}
