import { useMemo, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const demoData = {
  ahmed: {
    customer: 'أحمد محمد',
    sales: 25700,
    paid: 12000,
    outstanding: 13700,
    currency: 'SAR',
    salesRecords: [
      { source: 'Google Sheets', type: 'Sale', id: 'SALE-102', date: '8 Sep 2026', amount: 18500 },
      { source: 'Google Sheets', type: 'Sale', id: 'SALE-108', date: '12 Sep 2026', amount: 7200 }
    ],
    records: [
      { source: 'QuickBooks', type: 'Invoice', id: 'INV-1045', date: '12 Sep 2026', amount: 25700 },
      { source: 'QuickBooks', type: 'Payment', id: 'PAY-881', date: '13 Sep 2026', amount: 12000 }
    ]
  },
  sara: {
    customer: 'سارة علي', sales: 9100, paid: 9100, outstanding: 0, currency: 'SAR',
    salesRecords: [{ source: 'Google Sheets', type: 'Sale', id: 'SALE-119', date: '6 Sep 2026', amount: 9100 }],
    records: [{ source: 'QuickBooks', type: 'Invoice', id: 'INV-1046', date: '6 Sep 2026', amount: 9100 }, { source: 'QuickBooks', type: 'Payment', id: 'PAY-889', date: '7 Sep 2026', amount: 9100 }]
  }
};

function localDemo(question) {
  const q = question.toLowerCase();
  const person = q.includes('سارة') || q.includes('sara') ? demoData.sara : demoData.ahmed;
  if (q.includes('قارن') || q.includes('compare')) {
    return { type: 'comparison', people: [demoData.ahmed, demoData.sara], confidence: .97 };
  }
  return { type: 'answer', ...person, confidence: person === demoData.ahmed ? .98 : .97 };
}

export default function Home() {
  const [question, setQuestion] = useState('كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('search');
  const [history, setHistory] = useState([]);
  const [sources, setSources] = useState([
    { name: 'Google Sheets', icon: 'G', status: 'Connected', records: '12,482', sync: '2 min ago' },
    { name: 'QuickBooks', icon: 'Q', status: 'Connected', records: '11,203', sync: '4 min ago' }
  ]);

  async function ask(text = question) {
    if (!text.trim()) return;
    setQuestion(text); setLoading(true); setResult(null); setTab('search');
    const started = Date.now();
    try {
      const res = await fetch(API + '/api/v1/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text }) });
      if (!res.ok) throw new Error('fallback');
      const data = await res.json();
      setResult({ type: 'answer', answer: data.answer, confidence: data.confidence || .95, sources: data.sources || [], ...demoData.ahmed });
    } catch (_) {
      await new Promise(r => setTimeout(r, 700));
      setResult(localDemo(text));
    } finally {
      setLoading(false);
      setHistory(h => [{ question: text, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), latency: Date.now() - started }, ...h].slice(0, 8));
    }
  }

  const comparison = useMemo(() => [demoData.ahmed, demoData.sara], []);

  return (
    <div className="app" dir="rtl">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">S</span><span>SYNAPTIK</span></div>
        <div className="workspace"><span className="workspaceDot" /> ACME DEMO <span className="chevron">⌄</span></div>
        <nav>
          <button className={tab === 'search' ? 'active' : ''} onClick={() => setTab('search')}><span>⌕</span> البحث</button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}><span>◷</span> السجل</button>
          <button className={tab === 'sources' ? 'active' : ''} onClick={() => setTab('sources')}><span>◈</span> مصادر البيانات</button>
          <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}><span>◎</span> العملاء</button>
          <button className={tab === 'invoices' ? 'active' : ''} onClick={() => setTab('invoices')}><span>▤</span> الفواتير</button>
          <button className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}><span>↗</span> النشاط</button>
        </nav>
        <div className="sidebarBottom"><button onClick={() => setTab('settings')}>⚙ الإعدادات</button><div className="user"><span>ع</span><div><b>Ali Hussein</b><small>Manager</small></div></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div><span className="crumb">Workspace</span><span className="slash">/</span><b>{tab === 'search' ? 'Search' : tab}</b></div><div className="topActions"><span className="secure">● All systems operational</span><button>Help</button><span className="avatar">ع</span></div></header>

        {tab === 'search' && <>
          <section className="searchHero">
            <div className="eyebrow">UNIFIED BUSINESS INTELLIGENCE</div>
            <h1>اسأل شركتك<br /><em>وسنجد الإجابة.</em></h1>
            <p>طبقة ذكاء موحدة فوق بيانات مؤسستك. ابحث في المبيعات والفواتير والمدفوعات من مكان واحد، مع أدلة قابلة للتحقق.</p>
            <div className="queryBox">
              <div className="queryLabel"><span>✦ Synaptik Search</span><kbd>⌘ K</kbd></div>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }} />
              <div className="queryFooter"><div className="suggestions"><button onClick={() => ask('كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟')}>أحمد هذا الشهر</button><button onClick={() => ask('كم باعت سارة وهل عليها أي رصيد؟')}>رصيد سارة</button><button onClick={() => ask('قارن أحمد وسارة')}>قارن العملاء</button></div><button className="run" disabled={loading} onClick={() => ask()}>{loading ? 'جاري التحليل…' : 'اسأل Synaptik  ↵'}</button></div>
            </div>
          </section>

          {loading && <div className="progress"><div className="progressTitle">Synaptik is working</div><div className="steps"><span className="done">✓ فهم السؤال</span><span className="done">✓ البحث في المصادر</span><span className="pulse">● ربط الكيانات</span><span>○ التحقق والحساب</span><span>○ بناء الإجابة</span></div></div>}

          {result && <Answer result={result} onAsk={ask} />}
          {!result && !loading && <section className="starter"><div><span className="miniLabel">TRY A REAL QUESTION</span><h2>من سؤال واحد إلى قرار واضح.</h2><p>هذه ليست إجابة مولدة فقط. Synaptik يجمع الحقائق، يتحقق من الحساب، ثم يريك الأدلة التي بنى عليها النتيجة.</p></div><div className="architecture"><div>Google Sheets<strong>Sales</strong></div><i>→</i><div>Synaptik<strong>Reasoning</strong></div><i>←</i><div>QuickBooks<strong>Invoices + Payments</strong></div></div></section>}
        </>}

        {tab === 'sources' && <Sources sources={sources} setSources={setSources} />}
        {tab === 'history' && <History history={history} onAsk={ask} />}
        {tab === 'customers' && <Customers />}
        {tab === 'invoices' && <Invoices />}
        {tab === 'activity' && <Activity history={history} />}
        {tab === 'settings' && <Settings />}
      </main>

      <style jsx>{css}</style>
    </div>
  );
}

function Answer({ result, onAsk }) {
  if (result.type === 'comparison') return <section className="answerShell"><div className="answerHeader"><div><span className="miniLabel">CROSS-SOURCE ANSWER</span><h2>مقارنة العملاء</h2></div><span className="confidence">97% <small>confidence</small></span></div><div className="table"><div className="tr head"><span>العميل</span><span>المبيعات</span><span>المدفوع</span><span>المتبقي</span></div>{result.people.map(p => <div className="tr" key={p.customer}><b>{p.customer}</b><strong>{p.sales.toLocaleString()} SAR</strong><span>{p.paid.toLocaleString()} SAR</span><span className={p.outstanding ? 'warn' : 'good'}>{p.outstanding.toLocaleString()} SAR</span></div>)}</div><Evidence records={result.people.flatMap(p => [...p.salesRecords, ...p.records])} /></section>;
  const p = result;
  return <section className="answerShell"><div className="answerHeader"><div><span className="miniLabel">VERIFIED ANSWER</span><h2>{p.customer || 'Business answer'}</h2></div><span className="confidence">{Math.round((p.confidence || .95) * 100)}% <small>confidence</small></span></div><div className="metrics"><Metric label="المبيعات هذا الشهر" value={p.sales} /><Metric label="المدفوع" value={p.paid} /><Metric label="المتبقي" value={p.outstanding} tone={p.outstanding ? 'warning' : 'good'} /></div><div className="calculation"><span>CALCULATION</span><b>{p.sales?.toLocaleString()} − {p.paid?.toLocaleString()} = {p.outstanding?.toLocaleString()} SAR</b><small>الحساب تم من البيانات المنظمة وليس من النموذج اللغوي</small></div><Evidence records={[...(p.salesRecords || []), ...(p.records || [])]} /><div className="follow"><span>Ask a follow-up</span><button onClick={() => onAsk('وماذا عن الشهر الماضي؟')}>وماذا عن الشهر الماضي؟ →</button><button onClick={() => onAsk('قارن أحمد وسارة')}>قارن أحمد وسارة →</button></div></section>;
}
function Metric({ label, value, tone }) { return <div className="metric"><small>{label}</small><strong className={tone || ''}>{(value || 0).toLocaleString()} <i>SAR</i></strong></div>; }
function Evidence({ records }) { return <div className="evidence"><div className="evidenceHead"><span>▣ EVIDENCE</span><small>{records.length} records used</small></div>{records.map((r, i) => <div className="evidenceRow" key={i}><span className="sourceLogo">{r.source[0]}</span><div><b>{r.source} · {r.type}</b><small>{r.id} · {r.date}</small></div><strong>{r.amount.toLocaleString()} SAR</strong><span className="check">✓</span></div>)}</div>; }
function Panel({ title, kicker, children, action }) { return <section className="panelPage"><div className="pageHead"><div><span className="miniLabel">{kicker}</span><h1>{title}</h1></div>{action}</div>{children}</section>; }
function Sources({ sources, setSources }) { return <Panel title="مصادر البيانات" kicker="DATA CONNECTIONS" action={<button className="primary" onClick={() => setSources(s => [...s, { name: 'Excel Import', icon: 'X', status: 'Ready', records: 'Demo', sync: 'Just now' }])}>+ إضافة مصدر</button>}><div className="sourceGrid">{sources.map((s, i) => <div className="sourceCard" key={i}><div className="sourceCardTop"><span className="bigLogo">{s.icon}</span><span className="connected">● {s.status}</span></div><h3>{s.name}</h3><p>{s.records} records indexed</p><div className="cardMeta"><span>Last sync</span><b>{s.sync}</b></div><button className="outline">View source →</button></div>)}</div><div className="syncBox"><b>Sync architecture</b><span>Source → Normalize → Index → Evidence</span><small>Synaptik never treats the LLM as the source of truth.</small></div></Panel>; }
function History({ history, onAsk }) { return <Panel title="سجل الأسئلة" kicker="QUERY HISTORY"><div className="list">{history.length ? history.map((h, i) => <button className="historyRow" key={i} onClick={() => onAsk(h.question)}><span>⌕</span><div><b>{h.question}</b><small>{h.time} · {h.latency}ms</small></div><strong>→</strong></button>) : <Empty text="لا توجد أسئلة بعد. جرّب البحث من الصفحة الرئيسية." />}</div></Panel>; }
function Customers() { return <Panel title="العملاء" kicker="ENTITY RESOLUTION"><div className="customerTable"><div className="tableHeader">Customer <span>Sales</span><span>Outstanding</span><span>Match</span></div>{[demoData.ahmed, demoData.sara].map(p => <div className="customerRow" key={p.customer}><b>{p.customer}</b><span>{p.sales.toLocaleString()} SAR</span><span>{p.outstanding.toLocaleString()} SAR</span><strong>98%</strong></div>)}</div><div className="infoNote">Synaptik links the same customer across disconnected systems using name, identifiers, contact details and similarity signals.</div></Panel>; }
function Invoices() { const rows = [{ id:'INV-1045', customer:'أحمد محمد', amount:25700, paid:12000, status:'Partially paid' }, { id:'INV-1046', customer:'سارة علي', amount:9100, paid:9100, status:'Paid' }]; return <Panel title="الفواتير" kicker="FINANCIAL RECORDS"><div className="customerTable"><div className="tableHeader">Invoice <span>Customer</span><span>Amount</span><span>Status</span></div>{rows.map(r => <div className="customerRow" key={r.id}><b>{r.id}</b><span>{r.customer}</span><span>{r.amount.toLocaleString()} SAR</span><strong className={r.paid === r.amount ? 'good' : 'warn'}>{r.status}</strong></div>)}</div></Panel>; }
function Activity({ history }) { return <Panel title="النشاط" kicker="AUDIT & OBSERVABILITY"><div className="activityCards"><div><b>{history.length || 12}</b><small>Queries today</small></div><div><b>98%</b><small>Avg. confidence</small></div><div><b>1.8s</b><small>Avg. latency</small></div><div><b>100%</b><small>Sources healthy</small></div></div><div className="list">{history.slice(0,5).map((h,i)=><div className="historyRow static" key={i}><span className="check">✓</span><div><b>{h.question}</b><small>Query completed · {h.time}</small></div></div>)}</div></Panel>; }
function Settings() { return <Panel title="الإعدادات" kicker="WORKSPACE SETTINGS"><div className="settingsGrid"><div><span>Workspace</span><b>ACME Demo</b><small>Business intelligence workspace</small></div><div><span>Role model</span><b>Manager / Employee</b><small>Organization-level isolation enabled</small></div><div><span>Security</span><b>Token authentication</b><small>Secrets stay server-side</small></div><div><span>AI policy</span><b>Source-first</b><small>Generated answers must be grounded in facts</small></div></div></Panel>; }
function Empty({ text }) { return <div className="empty">{text}</div>; }

const css = `
*{box-sizing:border-box}body{margin:0;background:#f6f8f7;color:#18221f;font-family:Inter,Arial,"Noto Sans Arabic",sans-serif}.app{min-height:100vh;display:flex;background:#f6f8f7}.sidebar{width:248px;background:#0b1512;color:#dfe9e4;min-height:100vh;position:fixed;right:0;top:0;bottom:0;padding:24px 16px;display:flex;flex-direction:column;z-index:5}.brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:2px;font-size:14px;padding:4px 10px 25px}.brandMark{width:30px;height:30px;border-radius:9px;background:#7af0bd;color:#07110e;display:grid;place-items:center;font-weight:900}.workspace{font-size:10px;letter-spacing:1px;color:#9baba5;padding:12px 11px;border:1px solid #26352f;border-radius:9px;margin-bottom:20px}.workspaceDot{display:inline-block;width:7px;height:7px;background:#6eeab5;border-radius:50%;margin-left:6px}.chevron{float:left}nav{display:grid;gap:4px}nav button,.sidebarBottom>button{border:0;background:transparent;color:#8f9f99;text-align:right;padding:11px 12px;border-radius:8px;font-size:12px;cursor:pointer}nav button span{display:inline-block;width:25px;color:#72837c}nav button.active,nav button:hover{background:#14231e;color:#eef7f2}nav button.active span{color:#73eabc}.sidebarBottom{margin-top:auto}.sidebarBottom>button{width:100%;margin-bottom:12px}.user{border-top:1px solid #23312c;padding:15px 6px 0;display:flex;align-items:center;gap:10px}.user>span,.avatar{width:31px;height:31px;border-radius:50%;background:#d7e8df;color:#18221f;display:grid;place-items:center;font-weight:800}.user b{display:block;font-size:11px}.user small{color:#687a73;font-size:9px}.main{width:calc(100% - 248px);margin-right:248px;min-height:100vh}.topbar{height:64px;background:#fff;border-bottom:1px solid #e6ece9;display:flex;justify-content:space-between;align-items:center;padding:0 38px;font-size:11px;color:#66766f}.crumb{color:#a2ada8}.slash{margin:0 9px;color:#c3ccc8}.topActions{display:flex;align-items:center;gap:17px}.topActions button{border:0;background:none;color:#77857f}.secure{color:#4f7c67;font-size:10px}.avatar{width:28px;height:28px;background:#e5eee9}.searchHero{max-width:920px;margin:auto;padding:75px 35px 45px;text-align:center}.eyebrow,.miniLabel{font-size:9px;letter-spacing:2px;font-weight:800;color:#3d8067}.searchHero h1{font-size:clamp(42px,6vw,70px);line-height:1.05;letter-spacing:-3px;margin:18px 0 17px}.searchHero h1 em{font-style:normal;color:#3b8d6e}.searchHero>p{max-width:650px;margin:auto;color:#71807a;line-height:1.9;font-size:14px}.queryBox{background:#fff;border:1px solid #dce5e0;border-radius:16px;margin-top:38px;text-align:right;box-shadow:0 18px 60px rgba(23,49,39,.08);padding:15px}.queryLabel{display:flex;justify-content:space-between;color:#52635c;font-size:11px;font-weight:800;padding:3px 5px 10px}.queryLabel kbd{font-size:9px;color:#98a49f;border:1px solid #e2e8e5;border-radius:5px;padding:3px 6px}.queryBox textarea{width:100%;min-height:86px;border:0;outline:0;resize:none;background:#f8faf9;border-radius:10px;padding:16px;color:#1a2622;font:inherit;font-size:15px;line-height:1.8}.queryFooter{display:flex;justify-content:space-between;gap:10px;align-items:center;padding-top:11px}.suggestions{display:flex;gap:6px;overflow:auto}.suggestions button{white-space:nowrap;border:1px solid #e0e8e4;background:#fff;border-radius:20px;color:#6a7872;padding:7px 11px;font-size:10px;cursor:pointer}.run,.primary{border:0;background:#143c2e;color:#fff;border-radius:8px;padding:11px 16px;font-size:11px;font-weight:800;cursor:pointer}.run:disabled{opacity:.6}.progress{max-width:850px;margin:0 auto 25px;background:#fff;border:1px solid #dfe7e3;border-radius:12px;padding:16px 20px}.progressTitle{font-size:11px;font-weight:800;margin-bottom:13px}.steps{display:flex;gap:20px;flex-wrap:wrap;color:#a0aaa6;font-size:10px}.steps .done{color:#438468}.steps .pulse{color:#c58a37}.answerShell{max-width:850px;margin:10px auto 65px;background:#fff;border:1px solid #dce5e0;border-radius:16px;overflow:hidden;box-shadow:0 15px 50px rgba(23,49,39,.06)}.answerHeader{display:flex;justify-content:space-between;align-items:center;padding:23px 25px;border-bottom:1px solid #e8eeeb}.answerHeader h2{font-size:20px;margin:7px 0 0}.confidence{color:#338264;font-weight:900;font-size:16px}.confidence small{font-weight:500;color:#8d9994;font-size:9px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid #e8eeeb}.metric{padding:23px 25px;border-left:1px solid #edf1ef}.metric:last-child{border-left:0}.metric small{display:block;color:#7c8984;font-size:10px;margin-bottom:10px}.metric strong{font-size:24px}.metric strong i{font-style:normal;color:#9aa59f;font-size:10px;font-weight:500}.metric .warning,.warn{color:#a66f27}.metric .good,.good{color:#3d8769}.calculation{margin:20px 25px;padding:16px;border-radius:10px;background:#f5f8f6;display:grid;gap:6px}.calculation span{font-size:8px;letter-spacing:2px;color:#769087}.calculation b{font-size:15px;direction:ltr;text-align:right}.calculation small{font-size:9px;color:#8b9691}.evidence{padding:0 25px 10px}.evidenceHead{display:flex;justify-content:space-between;border-top:1px solid #e8eeeb;padding:17px 0 9px;font-size:9px;letter-spacing:1.5px;font-weight:800;color:#5f7269}.evidenceHead small{letter-spacing:0;font-weight:400;color:#9ba5a1}.evidenceRow{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid #f0f3f2}.sourceLogo{width:28px;height:28px;border-radius:7px;background:#edf5f1;color:#38775f;display:grid;place-items:center;font-weight:900;font-size:11px}.evidenceRow div{flex:1}.evidenceRow b{display:block;font-size:10px}.evidenceRow small{display:block;color:#929d98;font-size:9px;margin-top:3px}.evidenceRow>strong{font-size:10px}.check{color:#4c9574}.follow{background:#f7f9f8;padding:16px 25px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}.follow>span{font-size:9px;color:#85928c;margin-left:auto}.follow button{border:1px solid #dce6e1;background:#fff;border-radius:20px;padding:7px 10px;font-size:9px;color:#4e665d}.starter{max-width:850px;margin:0 auto 80px;padding:28px;border-top:1px solid #dfe7e3;display:grid;grid-template-columns:1fr 1fr;gap:40px}.starter h2{font-size:22px;margin:8px 0}.starter p{color:#7b8882;font-size:12px;line-height:1.8}.architecture{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;align-items:center;gap:8px}.architecture div{background:#fff;border:1px solid #e0e8e4;border-radius:9px;padding:12px;font-size:9px;color:#718079}.architecture strong{display:block;color:#26352f;margin-top:5px}.architecture i{color:#76a18e;font-style:normal}.panelPage{max-width:1050px;margin:auto;padding:48px 40px 80px}.pageHead{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px}.pageHead h1{font-size:28px;margin:8px 0 0}.sourceGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.sourceCard{background:#fff;border:1px solid #dfe7e3;border-radius:13px;padding:20px}.sourceCardTop{display:flex;justify-content:space-between;align-items:center}.bigLogo{width:42px;height:42px;border-radius:11px;background:#eaf3ee;color:#39795f;display:grid;place-items:center;font-weight:900}.connected{color:#47856b;font-size:9px}.sourceCard h3{margin:18px 0 6px;font-size:16px}.sourceCard p{font-size:10px;color:#8a9691}.cardMeta{border-top:1px solid #edf1ef;margin-top:20px;padding-top:13px;display:flex;justify-content:space-between;font-size:9px;color:#89958f}.outline{margin-top:16px;width:100%;border:1px solid #dbe4df;background:#fff;padding:9px;border-radius:7px;color:#50655c;font-size:9px}.syncBox,.infoNote{margin-top:18px;background:#edf5f1;border:1px solid #d6e6de;border-radius:10px;padding:16px;font-size:10px;color:#496258}.syncBox span{margin-right:20px;color:#3e7f65}.syncBox small{display:block;margin-top:8px;color:#7e9088}.list,.customerTable{background:#fff;border:1px solid #dfe7e3;border-radius:12px;overflow:hidden}.historyRow{width:100%;display:flex;align-items:center;gap:13px;padding:17px;border:0;border-bottom:1px solid #edf1ef;background:#fff;text-align:right;cursor:pointer}.historyRow:hover{background:#f8faf9}.historyRow>span{color:#51876f}.historyRow div{flex:1}.historyRow b{display:block;font-size:11px;color:#2d3b36}.historyRow small{display:block;color:#99a39f;font-size:9px;margin-top:5px}.historyRow strong{color:#a3ada8}.historyRow.static{cursor:default}.tableHeader,.customerRow{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr;padding:14px 18px;font-size:10px;gap:10px}.tableHeader{background:#f7f9f8;color:#8b9792;font-size:8px;text-transform:uppercase}.customerRow{border-top:1px solid #edf1ef}.customerRow strong{color:#418468}.activityCards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}.activityCards>div{background:#fff;border:1px solid #dfe7e3;border-radius:11px;padding:20px}.activityCards b{display:block;font-size:23px}.activityCards small{color:#8b9791;font-size:9px}.settingsGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.settingsGrid>div{background:#fff;border:1px solid #dfe7e3;border-radius:11px;padding:20px}.settingsGrid span,.settingsGrid small{display:block;color:#8c9893;font-size:9px}.settingsGrid b{display:block;margin:8px 0;font-size:12px}.empty{padding:45px;text-align:center;color:#8c9893;font-size:11px}@media(max-width:900px){.sidebar{width:70px;padding:18px 9px}.brand span:last-child,.workspace,nav button:not(.active)::after,.sidebarBottom>button,.user div{display:none}.brand{justify-content:center}.main{width:calc(100% - 70px);margin-right:70px}.topbar{padding:0 20px}.starter{grid-template-columns:1fr}.sourceGrid,.settingsGrid{grid-template-columns:1fr}.activityCards{grid-template-columns:1fr 1fr}}@media(max-width:650px){.topActions .secure,.topActions button{display:none}.topbar{height:55px}.searchHero{padding:50px 18px 30px}.searchHero h1{letter-spacing:-2px}.queryFooter{align-items:stretch;flex-direction:column}.run{width:100%}.metrics{grid-template-columns:1fr}.metric{border-left:0;border-bottom:1px solid #edf1ef}.panelPage{padding:35px 18px}.tableHeader,.customerRow{grid-template-columns:1.2fr 1fr 1fr}.tableHeader span:last-child,.customerRow strong{display:none}.activityCards{grid-template-columns:1fr 1fr}.architecture{grid-template-columns:1fr;}.architecture i{transform:rotate(90deg);justify-self:center}}
`;
