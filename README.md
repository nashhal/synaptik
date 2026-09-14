# Synaptik

Synaptik is a unified business search layer that answers questions across disconnected business systems.

## MVP

- Google Sheets connector scaffold
- QuickBooks Online connector scaffold
- Unified customer/entity model
- Hybrid search: structured + keyword + semantic-ready interface
- Cross-source question planning
- Grounded answers with source records and confidence
- Manager / employee roles
- PostgreSQL + pgvector ready schema
- Next.js web app + FastAPI API
- Docker Compose

## Core principle

**Source data → validation → calculations → grounded answer**

The language model is never treated as the source of truth. If a source is unavailable or a fact cannot be verified, Synaptik says so.

## Example

> كم باع أحمد هذا الشهر وكم دفع وكم باقي عليه؟

The planner can combine sales from Sheets with invoices/payments from QuickBooks and return one answer with evidence.

## Local development

```bash
docker compose up --build
```

API: http://localhost:8000
API docs: http://localhost:8000/docs
Web: http://localhost:3000

The default development API includes a small deterministic demo dataset, so the search flow can be tested without external credentials.

## Environment

Copy `.env.example` to `.env` and configure PostgreSQL, Google, QuickBooks and optional LLM credentials when real connectors are enabled.

## MVP evaluation

Add 20–50 real cross-source questions under `tests/evaluation/`. Measure correctness, partial answers, inability-to-answer, latency, and time saved versus manually opening both systems.
