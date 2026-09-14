from datetime import date, datetime, timedelta
from decimal import Decimal
import base64, hashlib, hmac, json, os, re
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://synaptik:synaptik@localhost:5432/synaptik")
TOKEN_SECRET = os.getenv("TOKEN_SECRET", "change-me-in-production")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

app = FastAPI(title="Synaptik API", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

DEMO_SALES = [
    {"id":"sales_102","customer":"Ahmed Mohammed","amount":18500,"currency":"SAR","date":"2026-09-08","source":"google_sheets"},
    {"id":"sales_103","customer":"Ahmed Mohammed","amount":7200,"currency":"SAR","date":"2026-09-11","source":"google_sheets"},
    {"id":"sales_104","customer":"Sara Ali","amount":9100,"currency":"SAR","date":"2026-09-10","source":"google_sheets"},
]
DEMO_INVOICES = [
    {"id":"invoice_1045","customer":"Ahmed Mohammed","amount":25700,"paid":12000,"currency":"SAR","date":"2026-09-01","source":"quickbooks"},
    {"id":"invoice_1046","customer":"Sara Ali","amount":9100,"paid":9100,"currency":"SAR","date":"2026-09-02","source":"quickbooks"},
]

class AuthRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    organization: str = "My Organization"
class LoginRequest(BaseModel):
    email: str
    password: str
class QueryRequest(BaseModel):
    question: str
class ImportRequest(BaseModel):
    source_name: str = "Imported source"
    records: list[dict]
class QueryResponse(BaseModel):
    answer: str
    confidence: float
    sources: list[dict]
    plan: dict

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 210_000)
    return base64.urlsafe_b64encode(salt + digest).decode()

def verify_password(password: str, encoded: str) -> bool:
    try:
        raw = base64.urlsafe_b64decode(encoded.encode())
        return hmac.compare_digest(hash_password(password, raw[:16]), encoded)
    except Exception:
        return False

def make_token(user_id: int, organization_id: int) -> str:
    payload = {"uid": user_id, "oid": organization_id, "exp": int((datetime.utcnow()+timedelta(days=7)).timestamp())}
    body = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")
    sig = hmac.new(TOKEN_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{sig}"

def current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    try:
        body, sig = authorization[7:].split(".", 1)
        expected = hmac.new(TOKEN_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected): raise ValueError()
        payload = json.loads(base64.urlsafe_b64decode(body + "=="))
        if payload["exp"] < int(datetime.utcnow().timestamp()): raise ValueError()
        return payload
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

def init_db():
    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE IF NOT EXISTS organizations (id SERIAL PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())"))
        conn.execute(text("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, organization_id INTEGER REFERENCES organizations(id), email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'manager', created_at TIMESTAMPTZ DEFAULT now())"))
        conn.execute(text("CREATE TABLE IF NOT EXISTS data_sources (id SERIAL PRIMARY KEY, organization_id INTEGER REFERENCES organizations(id), type TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'connected', last_sync_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now())"))
        conn.execute(text("CREATE TABLE IF NOT EXISTS sales (id SERIAL PRIMARY KEY, organization_id INTEGER REFERENCES organizations(id), source_id INTEGER REFERENCES data_sources(id), external_id TEXT, customer_name TEXT NOT NULL, amount NUMERIC NOT NULL, currency TEXT DEFAULT 'SAR', sale_date DATE NOT NULL)"))
        conn.execute(text("CREATE TABLE IF NOT EXISTS invoices (id SERIAL PRIMARY KEY, organization_id INTEGER REFERENCES organizations(id), source_id INTEGER REFERENCES data_sources(id), external_id TEXT, customer_name TEXT NOT NULL, amount NUMERIC NOT NULL, paid NUMERIC NOT NULL DEFAULT 0, currency TEXT DEFAULT 'SAR', invoice_date DATE NOT NULL)"))

@app.on_event("startup")
def startup():
    try: init_db()
    except Exception as exc: print(f"Database unavailable at startup: {exc}")

@app.get("/health")
def health():
    try:
        with engine.connect() as conn: conn.execute(text("SELECT 1"))
        db = "ok"
    except Exception: db = "unavailable"
    return {"status":"ok", "service":"synaptik-api", "version":"0.2.0", "database":db}

@app.post("/api/v1/auth/register")
def register(request: AuthRequest):
    with engine.begin() as conn:
        email = request.email.lower().strip()
        if conn.execute(text("SELECT 1 FROM users WHERE email=:e"), {"e":email}).first(): raise HTTPException(409, "Email already registered")
        org_id = conn.execute(text("INSERT INTO organizations(name) VALUES(:n) RETURNING id"), {"n":request.organization}).scalar_one()
        user_id = conn.execute(text("INSERT INTO users(organization_id,email,password_hash) VALUES(:o,:e,:p) RETURNING id"), {"o":org_id,"e":email,"p":hash_password(request.password)}).scalar_one()
    return {"access_token":make_token(user_id, org_id), "token_type":"bearer", "role":"manager"}

@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    with engine.connect() as conn:
        row = conn.execute(text("SELECT id,organization_id,password_hash,role FROM users WHERE email=:e"), {"e":request.email.lower().strip()}).mappings().first()
    if not row or not verify_password(request.password, row["password_hash"]): raise HTTPException(401, "Invalid email or password")
    return {"access_token":make_token(row["id"], row["organization_id"]), "token_type":"bearer", "role":row["role"]}

@app.get("/api/v1/me")
def me(user=Depends(current_user)): return user

@app.get("/api/v1/sources")
def sources(user=Depends(current_user)):
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id,type,name,status,last_sync_at FROM data_sources WHERE organization_id=:o ORDER BY id DESC"), {"o":user["oid"]}).mappings().all()
    return {"sources":[dict(r) for r in rows]}

@app.post("/api/v1/import/google-sheets")
def import_sheets(request: ImportRequest, user=Depends(current_user)): return import_records(request, user, "google_sheets")
@app.post("/api/v1/import/quickbooks")
def import_quickbooks(request: ImportRequest, user=Depends(current_user)): return import_records(request, user, "quickbooks")

def import_records(request: ImportRequest, user, source_type: str):
    with engine.begin() as conn:
        source_id = conn.execute(text("INSERT INTO data_sources(organization_id,type,name,status,last_sync_at) VALUES(:o,:t,:n,'connected',now()) RETURNING id"), {"o":user["oid"],"t":source_type,"n":request.source_name}).scalar_one()
        imported = 0
        for r in request.records:
            customer = str(r.get("customer") or r.get("customer_name") or "").strip()
            if not customer: continue
            if source_type == "google_sheets":
                conn.execute(text("INSERT INTO sales(organization_id,source_id,external_id,customer_name,amount,currency,sale_date) VALUES(:o,:s,:x,:c,:a,:cur,:d)"), {"o":user["oid"],"s":source_id,"x":str(r.get("id") or r.get("external_id") or f"row-{imported+1}"),"c":customer,"a":Decimal(str(r.get("amount",0))),"cur":r.get("currency","SAR"),"d":r.get("date") or r.get("sale_date") or date.today()})
            else:
                conn.execute(text("INSERT INTO invoices(organization_id,source_id,external_id,customer_name,amount,paid,currency,invoice_date) VALUES(:o,:s,:x,:c,:a,:p,:cur,:d)"), {"o":user["oid"],"s":source_id,"x":str(r.get("id") or r.get("external_id") or f"invoice-{imported+1}"),"c":customer,"a":Decimal(str(r.get("amount",0))),"p":Decimal(str(r.get("paid",0))),"cur":r.get("currency","SAR"),"d":r.get("date") or r.get("invoice_date") or date.today()})
            imported += 1
    return {"status":"ok", "source_id":source_id, "imported":imported}

def normalize(name: str) -> str: return re.sub(r"[^a-z0-9\u0600-\u06ff]", "", name.lower())

def answer_question(question: str, user=None) -> QueryResponse:
    q = question.lower()
    customer_hint = "Ahmed" if "أحمد" in question or "ahmed" in q else "Sara" if "سارة" in question or "sara" in q else None
    if not customer_hint: return QueryResponse(answer="لم أتمكن من تحديد العميل المطلوب. اذكر اسم العميل بوضوح.", confidence=0.35, sources=[], plan={"status":"needs_clarification"})
    sales, invoices = [], []
    if user:
        with engine.connect() as conn:
            sales = [dict(x) for x in conn.execute(text("SELECT id,customer_name,amount,currency,sale_date FROM sales WHERE organization_id=:o AND lower(customer_name) LIKE :c AND sale_date >= date_trunc('month', current_date)::date"), {"o":user["oid"],"c":f"%{customer_hint.lower()}%"}).mappings()]
            invoices = [dict(x) for x in conn.execute(text("SELECT id,customer_name,amount,paid,currency,invoice_date FROM invoices WHERE organization_id=:o AND lower(customer_name) LIKE :c AND invoice_date >= date_trunc('month', current_date)::date"), {"o":user["oid"],"c":f"%{customer_hint.lower()}%"}).mappings()]
    demo = False
    if not sales and not invoices:
        sales = [x for x in DEMO_SALES if normalize(customer_hint) in normalize(x["customer"])]
        invoices = [x for x in DEMO_INVOICES if normalize(customer_hint) in normalize(x["customer"])]
        demo = True
    sales_total = sum(Decimal(str(x["amount"])) for x in sales)
    invoice_total = sum(Decimal(str(x["amount"])) for x in invoices)
    paid_total = sum(Decimal(str(x.get("paid",0))) for x in invoices)
    outstanding = invoice_total - paid_total
    parts=[]
    if any(x in question for x in ["باع","مبيعات","المبيعات"]) or "sales" in q: parts.append(f"إجمالي المبيعات هذا الشهر {sales_total:,.0f} SAR")
    if any(x in question for x in ["دفع","المدفوع"]) or "paid" in q: parts.append(f"المدفوع {paid_total:,.0f} SAR")
    if any(x in question for x in ["باقي","عليه","مديون","المتبقي"]) or "owe" in q or "outstanding" in q: parts.append(f"المتبقي حسب الفواتير {outstanding:,.0f} SAR")
    if not parts: parts=[f"المبيعات {sales_total:,.0f} SAR، المدفوع {paid_total:,.0f} SAR، والمتبقي {outstanding:,.0f} SAR"]
    sources=[{"source":x.get("source","database"),"record":x.get("id")} for x in sales+invoices]
    return QueryResponse(answer="، ".join(parts)+".", confidence=0.96 if sales and invoices else 0.82, sources=sources, plan={"customer_hint":customer_hint,"period":"current_month","sources":["google_sheets","quickbooks"],"demo_fallback":demo})

@app.post("/api/v1/query", response_model=QueryResponse)
def query(request: QueryRequest, user=Depends(current_user)): return answer_question(request.question, user)
