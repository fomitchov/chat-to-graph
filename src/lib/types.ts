export type NodeKind =
  | "topic"
  | "decision_point"
  | "option"
  | "decision"
  | "abandoned"
  | "conclusion";

export type EdgeKind =
  | "leads_to"
  | "considers"
  | "chose"
  | "rejected"
  | "concludes"
  | "relates";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  title: string;
  summary: string;
  importance: 1 | 2 | 3 | 4 | 5;
  excerpts?: string[];
  /** message indices in the source conversation, useful for ordering */
  messageRefs?: number[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: EdgeKind;
  label?: string;
}

export interface ConversationGraph {
  title: string;
  oneLineSummary: string;
  keyDecisions: string[];
  finalConclusions: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ChatMessage {
  index: number;
  sender: "human" | "assistant" | "system" | "unknown";
  text: string;
}

export interface ParsedChat {
  source: "claude-json" | "claude-markdown" | "plain-text";
  title?: string;
  messages: ChatMessage[];
  /** the formatted plain-text rendering passed to Claude */
  rendered: string;
}
