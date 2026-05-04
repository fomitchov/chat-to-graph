import type { ConversationGraph } from "./types";

export const DEMO_GRAPH: ConversationGraph = {
  title: "Analytics service architecture",
  oneLineSummary:
    "The team chose Postgres + TimescaleDB, a REST API, and direct ingestion from workers, deferring ClickHouse and a separate ingestion service.",
  keyDecisions: [
    "Use Postgres + TimescaleDB instead of ClickHouse",
    "Expose data via REST, not GraphQL",
    "Workers write directly; no separate ingestion service yet",
  ],
  finalConclusions: [
    "Ship Postgres + Timescale + REST + direct ingestion as v1",
    "Re-evaluate ClickHouse if dashboard p95 latency exceeds 2s",
    "Extract a dedicated ingestion service only when scale demands it",
  ],
  nodes: [
    {
      id: "topic_db",
      kind: "topic",
      title: "Database choice",
      summary:
        "Selecting the storage engine for a new analytics service with ~500M rows growing 20% per quarter.",
      importance: 4,
      excerpts: [
        "We're picking a database for the new analytics service. Postgres or ClickHouse?",
      ],
      messageRefs: [0],
    },
    {
      id: "decision_db",
      kind: "decision_point",
      title: "Postgres vs ClickHouse?",
      summary:
        "Trade off operational simplicity vs. query speed at scale. Anchored to team capacity (no SRE) and current data volume.",
      importance: 5,
      excerpts: [
        "Postgres is simpler to operate… ClickHouse is much faster for the dashboard queries you described but adds an ops burden.",
      ],
      messageRefs: [1, 2],
    },
    {
      id: "option_postgres",
      kind: "option",
      title: "Postgres + TimescaleDB",
      summary:
        "Stay on familiar tech, add Timescale or columnar partitions for time-series workloads.",
      importance: 3,
      excerpts: [
        "I'd lean Postgres with TimescaleDB or columnar partitions to start.",
      ],
      messageRefs: [3],
    },
    {
      id: "option_clickhouse",
      kind: "option",
      title: "ClickHouse",
      summary:
        "10x+ faster on wide aggregations but introduces unfamiliar ops surface for a small team.",
      importance: 2,
      excerpts: ["ClickHouse is much faster… but adds an ops burden."],
      messageRefs: [1],
    },
    {
      id: "decision_postgres",
      kind: "decision",
      title: "Chose Postgres + Timescale",
      summary:
        "Picked for operational simplicity given small team and no dedicated SRE; revisit if dashboards slow down.",
      importance: 5,
      excerpts: ["Ok, Postgres + Timescale it is."],
      messageRefs: [4],
    },
    {
      id: "abandoned_clickhouse",
      kind: "abandoned",
      title: "Deferred ClickHouse",
      summary:
        "Set aside as a future option triggered by a concrete latency threshold rather than ruled out forever.",
      importance: 2,
      excerpts: [
        "You can revisit ClickHouse if p95 dashboard latency degrades past 2s.",
      ],
      messageRefs: [3],
    },
    {
      id: "topic_api",
      kind: "topic",
      title: "API style",
      summary: "How the dashboard and other consumers should query the service.",
      importance: 3,
      excerpts: ["What about the API — REST or GraphQL?"],
      messageRefs: [4],
    },
    {
      id: "decision_api",
      kind: "decision_point",
      title: "REST vs GraphQL?",
      summary:
        "Decision driven by audience (internal dashboard) and time-to-ship rather than client flexibility.",
      importance: 4,
      excerpts: [
        "For an internal analytics dashboard, GraphQL is overkill.",
      ],
      messageRefs: [5],
    },
    {
      id: "option_rest",
      kind: "option",
      title: "REST",
      summary: "A few well-designed endpoints, easy to cache and ship quickly.",
      importance: 3,
      messageRefs: [5],
    },
    {
      id: "option_graphql",
      kind: "option",
      title: "GraphQL",
      summary:
        "More client flexibility, but unnecessary complexity for a single internal consumer.",
      importance: 1,
      messageRefs: [5],
    },
    {
      id: "decision_rest",
      kind: "decision",
      title: "Chose REST",
      summary: "Faster to ship and easier to cache for the dashboard use case.",
      importance: 4,
      excerpts: ["Agreed, REST."],
      messageRefs: [6],
    },
    {
      id: "abandoned_graphql",
      kind: "abandoned",
      title: "Dropped GraphQL",
      summary: "Deemed overkill for an internal dashboard.",
      importance: 1,
      messageRefs: [5],
    },
    {
      id: "topic_ingest",
      kind: "topic",
      title: "Ingestion path",
      summary: "Whether to introduce a dedicated ingestion service.",
      importance: 3,
      excerpts: [
        "Let's also drop the idea of a separate ingestion service for now — we'll just write directly from the workers.",
      ],
      messageRefs: [6],
    },
    {
      id: "abandoned_ingest_service",
      kind: "abandoned",
      title: "Separate ingestion service",
      summary:
        "Dropped for v1 — workers will write directly to Postgres until scale forces a split.",
      importance: 2,
      messageRefs: [6],
    },
    {
      id: "decision_direct_ingest",
      kind: "decision",
      title: "Direct ingest from workers",
      summary:
        "Simpler v1: skip the extra hop, revisit when throughput or coupling becomes a problem.",
      importance: 4,
      messageRefs: [6, 7],
    },
    {
      id: "conclusion_summary",
      kind: "conclusion",
      title: "v1 architecture locked",
      summary:
        "Postgres + Timescale storage, REST API, direct ingestion from workers. ClickHouse and a dedicated ingestion service are deferred behind concrete triggers.",
      importance: 5,
      excerpts: [
        "Postgres + Timescale, REST API, direct ingestion from workers, revisit ClickHouse if dashboards slow down.",
      ],
      messageRefs: [7],
    },
  ],
  edges: [
    { id: "e1", source: "topic_db", target: "decision_db", kind: "leads_to" },
    {
      id: "e2",
      source: "decision_db",
      target: "option_postgres",
      kind: "considers",
    },
    {
      id: "e3",
      source: "decision_db",
      target: "option_clickhouse",
      kind: "considers",
    },
    {
      id: "e4",
      source: "option_postgres",
      target: "decision_postgres",
      kind: "chose",
    },
    {
      id: "e5",
      source: "option_clickhouse",
      target: "abandoned_clickhouse",
      kind: "rejected",
    },
    {
      id: "e6",
      source: "decision_postgres",
      target: "topic_api",
      kind: "leads_to",
    },
    { id: "e7", source: "topic_api", target: "decision_api", kind: "leads_to" },
    {
      id: "e8",
      source: "decision_api",
      target: "option_rest",
      kind: "considers",
    },
    {
      id: "e9",
      source: "decision_api",
      target: "option_graphql",
      kind: "considers",
    },
    {
      id: "e10",
      source: "option_rest",
      target: "decision_rest",
      kind: "chose",
    },
    {
      id: "e11",
      source: "option_graphql",
      target: "abandoned_graphql",
      kind: "rejected",
    },
    {
      id: "e12",
      source: "decision_rest",
      target: "topic_ingest",
      kind: "leads_to",
    },
    {
      id: "e13",
      source: "topic_ingest",
      target: "abandoned_ingest_service",
      kind: "rejected",
    },
    {
      id: "e14",
      source: "topic_ingest",
      target: "decision_direct_ingest",
      kind: "chose",
    },
    {
      id: "e15",
      source: "decision_postgres",
      target: "conclusion_summary",
      kind: "concludes",
    },
    {
      id: "e16",
      source: "decision_rest",
      target: "conclusion_summary",
      kind: "concludes",
    },
    {
      id: "e17",
      source: "decision_direct_ingest",
      target: "conclusion_summary",
      kind: "concludes",
    },
  ],
};
