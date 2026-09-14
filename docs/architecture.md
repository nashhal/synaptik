# Synaptik MVP architecture

```text
Next.js Web
   |
FastAPI /api/v1/query
   |
Question parser -> Query planner -> Source execution
   |                         |
   +--> Google Sheets        +--> QuickBooks Online
   |
Entity resolution -> Result fusion -> Validation -> Grounded answer
   |
PostgreSQL + pgvector + full-text search
```

## Non-negotiable rules

1. External source records are the source of truth.
2. Calculations happen before natural-language generation.
3. Every answer returns evidence records.
4. A failed source produces an explicit partial/unavailable answer.
5. Entity matching below the confidence threshold must ask for clarification.
6. Secrets never enter Git history.
