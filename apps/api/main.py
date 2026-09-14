from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
from decimal import Decimal
import re

app = FastAPI(title="Synaptik API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

SALES = [
    {"id":"sales_102","customer":"Ahmed Mohammed","amount":18500,"currency":"SAR","date":"2026-09-08","source":"google_sheets"},
    {"id":"sales_103","customer":"Ahmed Mohammed","amount":7200,"currency":"SAR","date":"2026-09-11","source":"google_sheets"},
    {"id":"sales_104","customer":"Sara Ali","amount":9100,"currency":"SAR","date":"2026-09-10","source":"google_sheets"},
]
INVOICES = [
    {"id":"invoice_1045","customer":"Ahmed Mohammed","amount":25700,"paid":12000,"currency":"SAR","date":"2026-09-01","source":"quickbooks"},
    {"id":"invoice_1046","customer":"Sara Ali","amount":9100,"paid":9100,"currency":"SAR","date":"2026-09-02","source":"quickbooks"},
]

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    confidence: float
    sources: list[dict]
    plan: dict


def extract_customer(question: str) -> str | None:
    q = question.lower()
    if "أحمد" in question or "ahmed" in q:
        return "Ahmed Mohammed"
    if "سارة" in question or "sara" in q:
        return "Sara Ali"
    return None


def month_records(records, customer):
    today = date.today()
    return [r for r in records if r["customer"] == customer and r["date"][:7] == today.strftime("%Y-%m")]


def answer_question(question: str) -> QueryResponse:
    customer = extract_customer(question)
    if not customer:
        return QueryResponse(answer="لم أتمكن من تحديد العميل المطلوب. اذكر اسم العميل بوضوح.", confidence=0.35, sources=[], plan={"status":"needs_clarification"})

    sales = month_records(SALES, customer)
    invoices = month_records(INVOICES, customer)
    sales_total = sum(Decimal(str(x["amount"])) for x in sales)
    invoice_total = sum(Decimal(str(x["amount"])) for x in invoices)
    paid_total = sum(Decimal(str(x["paid"])) for x in invoices)
    outstanding = invoice_total - paid_total

    sources = [{"source": x["source"], "record": x["id"]} for x in sales + invoices]
    q = question.lower()
    asks_sales = any(x in question for x in ["باع", "مبيعات", "المبيعات"]) or "sales" in q
    asks_paid = any(x in question for x in ["دفع", "دفعه", "المدفوع"]) or "paid" in q
    asks_due = any(x in question for x in ["باقي", "عليه", "مديون", "المتبقي"]) or "owe" in q or "outstanding" in q

    parts = []
    if asks_sales:
        parts.append(f"باع {customer} هذا الشهر بقيمة {sales_total:,.0f} SAR")
    if asks_paid:
        parts.append(f"والمسجل كمدفوع {paid_total:,.0f} SAR")
    if asks_due:
        parts.append(f"والمتبقي عليه حسب الفواتير {outstanding:,.0f} SAR")
    if not parts:
        parts = [f"إجمالي مبيعات {customer} هذا الشهر {sales_total:,.0f} SAR، والمدفوع {paid_total:,.0f} SAR، والمتبقي {outstanding:,.0f} SAR"]

    confidence = 0.97 if sales and invoices else 0.82 if sales or invoices else 0.2
    return QueryResponse(
        answer="، ".join(parts) + ".",
        confidence=confidence,
        sources=sources,
        plan={"customer": customer, "period":"current_month", "sources":["google_sheets","quickbooks"], "metrics":["sales","payments","outstanding"]}
    )

@app.get("/health")
def health():
    return {"status":"ok", "service":"synaptik-api", "version":"0.1.0"}

@app.get("/api/v1/sources")
def sources():
    return {"sources":[{"type":"google_sheets","status":"demo_ready"},{"type":"quickbooks","status":"demo_ready"}]}

@app.post("/api/v1/query", response_model=QueryResponse)
def query(request: QueryRequest):
    return answer_question(request.question)
