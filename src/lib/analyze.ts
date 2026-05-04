import Anthropic from "@anthropic-ai/sdk";
import type { ConversationGraph, ParsedChat } from "./types";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are an expert in analyzing problem-solving conversations and turning them into a clean visual map.

You receive the full text of a chat between a human and an AI assistant working on a specific problem. Your job: extract the *logical structure* of the conversation, not its surface chronology.

Identify:
- TOPICS: major subject matters that were discussed.
- DECISION POINTS: moments where the conversation forked and a choice had to be made.
- OPTIONS: candidate solutions or approaches considered at a decision point.
- DECISIONS: the option that was chosen / committed to.
- ABANDONED: options or topics that were explicitly dropped, ruled out, or quietly dropped.
- CONCLUSIONS: the final outcomes, agreed-upon answers, action items, or summary verdicts.

Rules:
- Be ruthless about deduplication. Merge near-duplicates.
- Aim for 8–25 nodes total. Fewer is better than more. The goal is a *map*, not a transcript.
- Importance 1–5: 5 = critical decision or final conclusion; 1 = minor side note.
- Every node MUST have a short, punchy title (max ~6 words) and a 1–2 sentence summary.
- Every node SHOULD have 1–2 short verbatim excerpts from the chat (max ~30 words each) that justify it.
- Edges express the logical flow:
    - leads_to: one topic/decision flows into the next
    - considers: decision_point -> option
    - chose: decision_point -> decision (the picked option)
    - rejected: decision_point -> abandoned
    - concludes: any node -> conclusion
    - relates: loose connection
- Make the graph traversable from earliest topics to final conclusions.
- The keyDecisions and finalConclusions arrays should each list 2–6 short bullet strings (plain text, no markdown).
- Output ONLY by calling the emit_conversation_graph tool. Never produce prose.`;

const TOOL_INPUT_SCHEMA = {
  type: "object",
  required: [
    "title",
    "oneLineSummary",
    "keyDecisions",
    "finalConclusions",
    "nodes",
    "edges",
  ],
  properties: {
    title: { type: "string", description: "Short title for the conversation" },
    oneLineSummary: {
      type: "string",
      description: "One-sentence summary of what the chat accomplished",
    },
    keyDecisions: {
      type: "array",
      items: { type: "string" },
      description: "2-6 most important decisions, each as a short bullet",
    },
    finalConclusions: {
      type: "array",
      items: { type: "string" },
      description: "2-6 final conclusions or action items",
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "kind", "title", "summary", "importance"],
        properties: {
          id: {
            type: "string",
            description: "Unique slug-like id, e.g. 'decision_db_choice'",
          },
          kind: {
            type: "string",
            enum: [
              "topic",
              "decision_point",
              "option",
              "decision",
              "abandoned",
              "conclusion",
            ],
          },
          title: { type: "string" },
          summary: { type: "string" },
          importance: { type: "integer", minimum: 1, maximum: 5 },
          excerpts: {
            type: "array",
            items: { type: "string" },
            description: "Short verbatim quotes from the chat",
          },
          messageRefs: {
            type: "array",
            items: { type: "integer" },
            description:
              "Indices of source messages (the [#N ...] tags) supporting this node",
          },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "source", "target", "kind"],
        properties: {
          id: { type: "string" },
          source: { type: "string" },
          target: { type: "string" },
          kind: {
            type: "string",
            enum: [
              "leads_to",
              "considers",
              "chose",
              "rejected",
              "concludes",
              "relates",
            ],
          },
          label: { type: "string" },
        },
      },
    },
  },
} as const;

export interface AnalyzeOptions {
  apiKey: string;
  parsed: ParsedChat;
  model?: string;
}

export async function analyzeConversation(
  opts: AnalyzeOptions,
): Promise<ConversationGraph> {
  const { apiKey, parsed, model = MODEL } = opts;
  if (!apiKey) throw new Error("Missing Anthropic API key");
  if (!parsed.rendered.trim()) throw new Error("No chat content to analyze");

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const userPrompt = `Analyze the following chat${parsed.title ? ` titled "${parsed.title}"` : ""} and emit the conversation graph.

Each turn is delimited by a header line like [#N HUMAN] or [#N ASSISTANT] where N is the message index. Use those indices in messageRefs.

<chat>
${parsed.rendered}
</chat>`;

  const response = await client.messages.create({
    model,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "emit_conversation_graph",
        description:
          "Emit the structured conversation graph that will be rendered as a map.",
        input_schema: TOOL_INPUT_SCHEMA as unknown as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: "tool", name: "emit_conversation_graph" },
    messages: [{ role: "user", content: userPrompt }],
  });

  for (const block of response.content) {
    if (block.type === "tool_use" && block.name === "emit_conversation_graph") {
      return normalizeGraph(block.input as ConversationGraph);
    }
  }
  throw new Error("Model did not return a conversation graph");
}

function normalizeGraph(g: ConversationGraph): ConversationGraph {
  const seen = new Set<string>();
  const nodes = g.nodes.filter((n) => {
    if (!n.id || seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = g.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );
  return {
    title: g.title || "Conversation",
    oneLineSummary: g.oneLineSummary || "",
    keyDecisions: g.keyDecisions || [],
    finalConclusions: g.finalConclusions || [],
    nodes,
    edges,
  };
}
