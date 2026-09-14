# Synaptik — Product & Engineering Specification

## Product thesis
Synaptik is a unified intelligence layer for business data. A user asks one natural-language question; Synaptik plans which sources are needed, retrieves structured facts, resolves entities across systems, validates calculations, and returns an answer with traceable evidence.

## MVP
- Google Sheets / Excel import
- QuickBooks Online connector
- Natural-language search
- Hybrid keyword + semantic retrieval
- Entity resolution
- Cross-source query planning
- Deterministic calculations
- Evidence and source attribution
- Follow-up questions
- Manager / Employee permissions
- Query history and source health

## Explicitly out of scope
Full ERP modules, payroll, CRM, autonomous departmental agents, proactive complex alerts, full knowledge graph, on-premise deployment, and a large connector catalog.

## Primary user journey
1. Create workspace.
2. Connect Google Sheets and QuickBooks.
3. Wait for source status to become Ready.
4. Ask: `كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟`
5. Synaptik shows Understanding → Searching → Resolving → Calculating → Answering.
6. Result: Sales 25,700 SAR; Paid 12,000 SAR; Outstanding 13,700 SAR.
7. User opens Evidence and sees the source records.
8. User asks a follow-up such as `قارن أحمد وسارة` or `وماذا عن الشهر الماضي؟`.

## Core architecture
```text
Web UI
  -> API/Auth
  -> Question Understanding
  -> Query Planner
  -> Hybrid Search + Connectors
  -> Entity Resolution
  -> Structured Facts
  -> Calculation Engine
  -> Evidence Engine
  -> Answer Generation
  -> Web UI
```

### Source-of-truth rule
The LLM is never the source of truth. The pipeline is:
`source data -> normalized facts -> validation/calculation -> LLM wording`.
If a source is unavailable or data is incomplete, Synaptik must say so and must not invent values.

## Product pages
- `/` — landing + live demo
- `/app` — search workspace
- Sources — connection health, records, sync
- Customers — cross-source entity resolution
- Invoices — financial records
- History — previous queries
- Activity — audit and observability
- Settings — workspace, roles, security, AI policy

## Core UI components
SearchBox, QueryProgress, AnswerCard, Metric, CalculationBlock, EvidencePanel, SourceBadge, ConfidenceIndicator, FollowUpBox, SourceCard, SyncStatus, DataTable, EmptyState, ErrorState.

## Query states
`IDLE`, `UNDERSTANDING`, `SEARCHING`, `RESOLVING`, `CALCULATING`, `GENERATING`, `COMPLETE`, `NEEDS_CLARIFICATION`, `NO_DATA`, `SOURCE_ERROR`, `PARTIAL_DATA`, `CONFLICT`, `TIMEOUT`.

## Source states
`NOT_CONNECTED`, `CONNECTING`, `SYNCING`, `READY`, `STALE`, `ERROR`, `DISCONNECTED`.

## Entity resolution
Use name, email, phone, external IDs, source metadata, and similarity signals. High-confidence matches can be automatic; medium-confidence matches require confirmation; low-confidence matches must not be selected automatically.

## Evidence contract
Every material answer must expose:
- source
- record ID
- record type
- date
- amount/value
- calculation when applicable
- confidence
- warnings when data is incomplete or conflicting

## API contract
`POST /api/v1/query`
```json
{
  "question": "كم باع أحمد هذا الشهر؟"
}
```
Response should contain `status`, `answer`, `confidence`, `sources`, `evidence`, `calculations`, `warnings`, and `metadata`.

## Acceptance criteria
A feature is done only when a user can execute the full path without developer intervention:
`connect -> import/sync -> ask -> retrieve -> resolve -> calculate -> answer -> inspect evidence -> follow up`.

## Demo dataset
Ahmed: sales 18,500 + 7,200 SAR; invoice 25,700 SAR; paid 12,000 SAR; outstanding 13,700 SAR.
Sara: sales 9,100 SAR; invoice 9,100 SAR; paid 9,100 SAR; outstanding 0 SAR.

## Evaluation
Maintain at least 50 evaluation questions covering direct questions, cross-source questions, follow-ups, ambiguous names, missing data, conflicting data, date filters, currency, and aggregation. Initial target: >=90% correct on the defined evaluation set.
