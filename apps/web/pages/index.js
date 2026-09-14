import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || '';

const demo = {
  ahmed: {
    name: 'أحمد محمد',
    sales: 25700,
    paid: 12000,
    outstanding: 13700,
    salesRecords: [
      ['Google Sheets', 'Sales', 'SALE-102', '08 Sep 2026', 18500],
      ['Google Sheets', 'Sales', 'SALE-108', '12 Sep 2026', 7200]
    ],
    financeRecords: [
      ['QuickBooks', 'Invoice', 'INV-1045', '12 Sep 2026', 25700],
      ['QuickBooks', 'Payment', 'PAY-881', '13 Sep 2026', 12000]
    ]
  },
  sara: {
    name: 'سارة علي',
    sales: 9100,
    paid: 9100,
    outstanding: 0,
    salesRecords: [['Google Sheets', 'Sales', 'SALE-119', '06 Sep 2026', 9100]],
    financeRecords: [
      ['QuickBooks', 'Invoice', 'INV-1046', '06 Sep 2026', 9100],
      ['QuickBooks', 'Payment', 'PAY-889', '07 Sep 2026', 9100]
    ]
  }
};

function resolveDemo(question) {
  const q = question.trim().toLowerCase();
  if (!q) return null;
  if (q.includes('قارن') || q.includes('compare')) return { type: 'compare', confidence: 0.97 };
  const person = q.includes('سارة') || q.includes('sara') ? demo.sara : demo.ahmed;
  return { type: 'answer', person, confidence: person === demo.ahmed ? 0.98 : 0.97 };
}

export default function Home() {
  const [question, setQuestion] = useState('كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState('search');
  const [searches, setSearches] = useState([]);

  const ask = async (text = question) => {
    if (!text.trim()) return;
    setQuestion(text);
    setLoading(true);
    setResult(null);
    setActive('search');
    const started = performance.now();
    try {
      if (API) {
        const response = await fetch(`${API}/api/v1/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text })
        });
        if (response.ok) {
          const data = await response.json();
          setResult({
            type: 'api',
            answer: data.answer,
            confidence: data.confidence || 0.95,
            sources: data.sources || []
          });
        } else {
          throw new Error('api');
        }
      } else {
        throw new Error('demo');
      }
    } catch (_) {
      await new Promise((r) => setTimeout(r, 550));
      setResult(resolveDemo(text));
    } finally {
      setLoading(false);
      setSearches((items) => [
        { question: text, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), latency: Math.round(performance.now() - started) },
        ...items
      ].slice(0, 8));
    }
  };

  return (
    <div className="shell" dir="rtl">
      <aside className="rail">
        <div className="logoMark"><span>S</span></div>
        <div className="brandText">SYNAPTIK</div>
        <div className="railRule" />
        <nav className="railNav">
          <NavButton active={active === 'search'} onClick={() => setActive('search')} icon="⌕" label="البحث" />
          <NavButton active={active === 'sources'} onClick={() => setActive('sources')} icon="◈" label="المصادر" />
          <NavButton active={active === 'customers'} onClick={() => setActive('customers')} icon="◎" label="العملاء" />
          <NavButton active={active === 'invoices'} onClick={() => setActive('invoices')} icon="▤" label="الفواتير" />
          <NavButton active={active === 'history'} onClick={() => setActive('history')} icon="◷" label="السجل" />
        </nav>
        <div className="railBottom">
          <button className="iconButton" onClick={() => setActive('settings')}>⚙</button>
          <div className="identity"><span>ع</span><div><b>Ali</b><small>Manager</small></div></div>
        </div>
      </aside>

      <main className="content">
        <header className="header">
          <div className="headerLeft"><span className="liveDot" /><span>Workspace</span><strong>/</strong><b>{labelFor(active)}</b></div>
          <div className="headerRight"><span className="statusPill">● All systems operational</span><button className="headerLink">Help</button><button className="headerAvatar">ع</button></div>
        </header>

        {active === 'search' && (
          <SearchPage question={question} setQuestion={setQuestion} loading={loading} result={result} ask={ask} />
        )}
        {active === 'sources' && <SourcesPage />}
        {active === 'customers' && <CustomersPage />}
        {active === 'invoices' && <InvoicesPage />}
        {active === 'history' && <HistoryPage searches={searches} ask={ask} />}
        {active === 'settings' && <SettingsPage />}
      </main>

      <style jsx>{styles}</style>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return <button className={`navButton ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span><b>{label}</b></button>;
}

function labelFor(active) {
  return { search: 'Search', sources: 'Data sources', customers: 'Customers', invoices: 'Invoices', history: 'History', settings: 'Settings' }[active] || 'Search';
}

function SearchPage({ question, setQuestion, loading, result, ask }) {
  return (
    <div className="page">
      <section className="hero">
        <div className="eyebrow"><span>01</span> INTELLIGENCE WORKSPACE</div>
        <div className="heroGrid">
          <div className="heroCopy">
            <h1>Your business.<br /><em>One intelligent search.</em></h1>
            <p>اسأل عن مبيعاتك وفواتيرك ومدفوعاتك — عبر الأنظمة التي تستخدمها يوميًا. Synaptik يربط البيانات ويشرح النتيجة ويعرض الدليل.</p>
          </div>
          <div className="networkArt" aria-hidden="true">
            <span className="orbit orbit1" /><span className="orbit orbit2" />
            <span className="node n1">S</span><span className="node n2">GS</span><span className="node n3">QB</span><span className="node n4">◎</span>
            <div className="core"><strong>S</strong><small>reasoning layer</small></div>
          </div>
        </div>

        <div className="searchCard">
          <div className="searchTop"><span><i /> Synaptik Search</span><kbd>⌘ K</kbd></div>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }} placeholder="اسأل سؤالًا عن نشاطك التجاري…" />
          <div className="searchBottom">
            <div className="chips">
              <button onClick={() => ask('كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟')}>أحمد هذا الشهر</button>
              <button onClick={() => ask('كم باعت سارة وهل عليها أي رصيد؟')}>رصيد سارة</button>
              <button onClick={() => ask('قارن أحمد وسارة')}>قارن العملاء</button>
            </div>
            <button className="askButton" disabled={loading} onClick={() => ask()}>{loading ? 'جاري التحليل' : 'اسأل Synaptik'} <span>↗</span></button>
          </div>
        </div>

        {loading && <div className="working"><div><b>Synaptik is reasoning</b><small>Reading sources, linking entities and validating arithmetic</small></div><div className="loadBar"><span /></div></div>}
        {result && <ResultCard result={result} ask={ask} />}

        {!result && !loading && <section className="proofStrip">
          <div><small>BUILT FOR TRUST</small><strong>Answer first. Evidence always.</strong></div>
          <div className="proof"><span>GOOGLE SHEETS</span><i>+</i><span>QUICKBOOKS</span><i>→</i><b>SYNAPTIK</b><i>→</i><span>VERIFIED ANSWER</span></div>
        </section>}
      </section>
    </div>
  );
}

function ResultCard({ result, ask }) {
  if (result.type === 'compare') return (
    <section className="result">
      <div className="resultHead"><div><small>VERIFIED / CROSS-SOURCE</small><h2>مقارنة العملاء</h2></div><Confidence value={result.confidence} /></div>
      <div className="comparison">
        {[demo.ahmed, demo.sara].map((person) => <div className="personCard" key={person.name}><div className="personTop"><span className="personAvatar">{person.name[0]}</span><div><b>{person.name}</b><small>Customer entity</small></div></div><div className="valueRow"><small>المبيعات</small><strong>{person.sales.toLocaleString()} SAR</strong></div><div className="valueRow"><small>المدفوع</small><strong>{person.paid.toLocaleString()} SAR</strong></div><div className="valueRow"><small>المتبقي</small><strong className={person.outstanding ? 'negative' : 'positive'}>{person.outstanding.toLocaleString()} SAR</strong></div></div>)}
      </div>
      <Evidence records={[...demo.ahmed.salesRecords, ...demo.ahmed.financeRecords, ...demo.sara.salesRecords, ...demo.sara.financeRecords]} />
    </section>
  );

  const person = result.person || demo.ahmed;
  return (
    <section className="result">
      <div className="resultHead"><div><small>VERIFIED / ANSWER</small><h2>{person.name}</h2></div><Confidence value={result.confidence} /></div>
      {result.type === 'api' && <div className="apiAnswer">{result.answer}</div>}
      <div className="metricGrid">
        <Metric label="المبيعات هذا الشهر" value={person.sales} />
        <Metric label="المدفوع" value={person.paid} />
        <Metric label="المتبقي" value={person.outstanding} tone={person.outstanding ? 'negative' : 'positive'} />
      </div>
      <div className="calc"><div><small>VALIDATED CALCULATION</small><strong>{person.sales.toLocaleString()} − {person.paid.toLocaleString()} = {person.outstanding.toLocaleString()} SAR</strong></div><span>Source data → arithmetic → answer</span></div>
      <Evidence records={[...person.salesRecords, ...person.financeRecords]} />
      <div className="follow"><small>Continue exploring</small><button onClick={() => ask('قارن أحمد وسارة')}>قارن أحمد وسارة <span>↗</span></button><button onClick={() => ask('كم كانت مبيعاته الشهر الماضي؟')}>الشهر الماضي <span>↗</span></button></div>
    </section>
  );
}

function Confidence({ value }) { return <div className="confidence"><strong>{Math.round(value * 100)}%</strong><small>confidence</small></div>; }
function Metric({ label, value, tone }) { return <div className="metric"><small>{label}</small><strong className={tone || ''}>{value.toLocaleString()} <i>SAR</i></strong></div>; }
function Evidence({ records }) {
  return <div className="evidence"><div className="evidenceTitle"><div><small>TRACEABLE EVIDENCE</small><b>المصادر المستخدمة في النتيجة</b></div><span>{records.length} records</span></div>{records.map((r, i) => <div className="evidenceRow" key={`${r[2]}-${i}`}><span className="sourceBadge">{r[0] === 'Google Sheets' ? 'GS' : 'QB'}</span><div><b>{r[0]} · {r[1]}</b><small>{r[2]} · {r[3]}</small></div><strong>{r[4].toLocaleString()} SAR</strong><span className="verified">✓</span></div>)}</div>;
}

function PageFrame({ kicker, title, children, action }) {
  return <section className="subPage"><div className="subHead"><div><small>{kicker}</small><h1>{title}</h1></div>{action}</div>{children}</section>;
}

function SourcesPage() {
  const sources = [
    { name: 'Google Sheets', mark: 'GS', state: 'Connected', records: '12,482', sync: '2 min ago' },
    { name: 'QuickBooks', mark: 'QB', state: 'Connected', records: '11,203', sync: '4 min ago' },
    { name: 'Excel Import', mark: 'X', state: 'Ready', records: 'Demo', sync: 'Just now' }
  ];
  return <PageFrame kicker="DATA FABRIC" title="مصادر البيانات" action={<button className="primary">+ Connect source</button>}><div className="sourceGrid">{sources.map((s) => <div className="sourceTile" key={s.name}><div className="sourceTileTop"><span className="sourceLogoLarge">{s.mark}</span><span className="ready">● {s.state}</span></div><h3>{s.name}</h3><p>{s.records} indexed records</p><div className="tileFoot"><span>Last sync</span><b>{s.sync}</b></div></div>)}</div><div className="fabric"><div><small>SYNAPTIK DATA FABRIC</small><strong>Source → Normalize → Resolve → Index → Verify</strong></div><span>LLM is never the source of truth.</span></div></PageFrame>;
}

function CustomersPage() {
  return <PageFrame kicker="ENTITY LAYER" title="العملاء"><div className="tableCard"><div className="tableRow tableHead"><span>Customer</span><span>Sales</span><span>Outstanding</span><span>Match</span></div>{[demo.ahmed, demo.sara].map((p) => <div className="tableRow" key={p.name}><div className="customerCell"><span>{p.name[0]}</span><b>{p.name}</b></div><strong>{p.sales.toLocaleString()} SAR</strong><span>{p.outstanding.toLocaleString()} SAR</span><em>98%</em></div>)}</div><div className="note">Synaptik resolves the same customer across disconnected systems using identifiers, names and similarity signals.</div></PageFrame>;
}

function InvoicesPage() {
  return <PageFrame kicker="FINANCE" title="الفواتير"><div className="tableCard"><div className="tableRow tableHead"><span>Invoice</span><span>Customer</span><span>Amount</span><span>Status</span></div><div className="tableRow"><b>INV-1045</b><span>أحمد محمد</span><strong>25,700 SAR</strong><em className="partial">Partially paid</em></div><div className="tableRow"><b>INV-1046</b><span>سارة علي</span><strong>9,100 SAR</strong><em className="paid">Paid</em></div></div></PageFrame>;
}

function HistoryPage({ searches, ask }) {
  return <PageFrame kicker="QUERY MEMORY" title="السجل"><div className="historyList">{searches.length ? searches.map((item, i) => <button key={i} onClick={() => ask(item.question)}><span>⌕</span><div><b>{item.question}</b><small>{item.time} · {item.latency}ms</small></div><strong>↗</strong></button>) : <div className="empty">لا توجد أسئلة محفوظة بعد. ابدأ من Search.</div>}</div></PageFrame>;
}

function SettingsPage() {
  return <PageFrame kicker="WORKSPACE" title="الإعدادات"><div className="settingsCard"><div><small>Workspace</small><b>ACME Demo</b></div><div><small>Access model</small><b>Manager / Employee</b></div><div><small>Security</small><b>Permission-aware answers</b></div></div></PageFrame>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap');
:global(*){box-sizing:border-box} :global(html),:global(body),:global(#__next){margin:0;min-height:100%;font-family:'Noto Sans Arabic','DM Sans',sans-serif;background:#f5f6f2;color:#101512} :global(button),:global(textarea){font:inherit} :global(button){cursor:pointer}
.shell{min-height:100vh;display:flex;background:#f5f6f2}.rail{width:82px;background:#0a0d0c;color:#fff;display:flex;flex-direction:column;align-items:center;position:fixed;inset:0 auto 0 0;z-index:20;box-shadow:12px 0 40px rgba(0,0,0,.07)}
.logoMark{margin-top:24px;width:42px;height:42px;border:1px solid rgba(255,255,255,.16);border-radius:13px;display:grid;place-items:center}.logoMark span{font:700 20px 'DM Sans';letter-spacing:-.06em}.brandText{margin-top:9px;font:700 8px 'DM Sans';letter-spacing:.18em;color:#a8b1aa}.railRule{width:28px;height:1px;background:#222824;margin:24px 0 16px}.railNav{display:flex;flex-direction:column;gap:8px;width:100%;align-items:center}.navButton{width:62px;height:56px;border:1px solid transparent;background:transparent;color:#7d887f;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;transition:.2s}.navButton span{font:22px 'DM Sans'}.navButton b{font-size:9px;font-weight:600}.navButton:hover,.navButton.active{background:#131916;color:#fff;border-color:#243229}.navButton.active span{color:#a7ff66}.railBottom{margin-top:auto;padding:16px 0 18px;display:flex;flex-direction:column;align-items:center;gap:14px}.iconButton,.headerAvatar{border:0;background:#151a17;color:#aeb8b0;border-radius:13px;width:40px;height:40px}.identity{display:flex;flex-direction:column;align-items:center;gap:4px}.identity>span{width:34px;height:34px;border-radius:50%;background:#dff5cc;color:#152016;display:grid;place-items:center;font-weight:800}.identity div{display:none}
.content{margin-left:82px;width:calc(100% - 82px);min-height:100vh}.header{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 42px;border-bottom:1px solid #e3e6e1;background:rgba(245,246,242,.92);backdrop-filter:blur(18px);position:sticky;top:0;z-index:10}.headerLeft,.headerRight{display:flex;align-items:center;gap:12px;color:#768079;font-size:12px}.headerLeft strong{color:#b2b9b4}.headerLeft b{color:#1a201c}.liveDot{width:7px;height:7px;background:#a7ff66;border-radius:50%;box-shadow:0 0 0 4px rgba(167,255,102,.14)}.headerRight{gap:18px}.statusPill{color:#49604d}.headerLink{border:0;background:transparent;color:#5f6962;font-size:12px}.headerAvatar{background:#101512;color:#fff;width:36px;height:36px;border-radius:50%}
.page{max-width:1420px;margin:0 auto;padding:58px 54px 90px}.hero{max-width:1280px;margin:auto}.eyebrow{display:flex;align-items:center;gap:12px;font:700 10px 'DM Sans';letter-spacing:.18em;color:#67716a}.eyebrow span{width:28px;height:28px;border:1px solid #d8ddd8;border-radius:9px;display:grid;place-items:center;font-size:9px;letter-spacing:0;color:#222}.heroGrid{display:grid;grid-template-columns:1.35fr .65fr;gap:30px;align-items:end;padding:30px 0 32px}.heroCopy h1{font-size:clamp(48px,6.3vw,88px);line-height:.98;letter-spacing:-.065em;margin:0;max-width:850px;font-weight:700}.heroCopy h1 em{font-style:normal;color:#8d978f}.heroCopy p{max-width:690px;margin:26px 0 0;color:#667069;font-size:15px;line-height:2}.networkArt{height:240px;position:relative;overflow:hidden}.networkArt:before{content:'';position:absolute;inset:0;background-image:linear-gradient(#dfe4df 1px,transparent 1px),linear-gradient(90deg,#dfe4df 1px,transparent 1px);background-size:42px 42px;opacity:.55;mask-image:radial-gradient(circle,#000 25%,transparent 72%)}.orbit{position:absolute;border:1px solid #cdd5ce;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)}.orbit1{width:192px;height:192px}.orbit2{width:118px;height:118px}.core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:92px;height:92px;background:#0f1411;color:#fff;border-radius:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 18px 50px rgba(10,16,12,.16)}.core strong{font:700 34px 'DM Sans'}.core small{font:8px 'DM Sans';color:#9eaaa1;letter-spacing:.08em}.node{position:absolute;background:#fff;border:1px solid #d7ddd8;color:#303833;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font:700 11px 'DM Sans';box-shadow:0 10px 25px rgba(0,0,0,.05)}.n1{top:7%;left:45%}.n2{top:45%;right:3%}.n3{bottom:4%;left:16%}.n4{top:68%;right:22%}
.searchCard,.result,.working,.proofStrip{background:#fff;border:1px solid #e2e6e1;border-radius:26px;box-shadow:0 18px 60px rgba(18,26,20,.06)}.searchCard{padding:20px 22px}.searchTop{display:flex;justify-content:space-between;align-items:center;color:#667069;font-size:11px}.searchTop span{display:flex;align-items:center;gap:8px;font:600 10px 'DM Sans';letter-spacing:.08em}.searchTop i{width:7px;height:7px;background:#a7ff66;border-radius:50%;display:inline-block}.searchTop kbd{padding:5px 8px;border:1px solid #d9ddd9;border-radius:7px;color:#7d867f;font:700 10px 'DM Sans'}.searchCard textarea{width:100%;min-height:112px;border:0;outline:0;resize:vertical;background:transparent;font-size:21px;line-height:1.8;padding:18px 0;color:#121713}.searchCard textarea::placeholder{color:#9ca49e}.searchBottom{display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid #edf0ec;padding-top:16px}.chips{display:flex;gap:8px;flex-wrap:wrap}.chips button,.follow button{border:1px solid #e0e5e0;background:#f7f8f6;padding:9px 13px;border-radius:12px;color:#566159;font-size:11px}.askButton,.primary{border:0;background:#101512;color:#fff;padding:12px 18px;border-radius:13px;font-size:11px;display:inline-flex;align-items:center;gap:8px}.askButton:hover,.primary:hover{background:#1a211d}.askButton:disabled{opacity:.65;cursor:default}.working{margin-top:16px;padding:18px 20px;display:flex;align-items:center;gap:22px}.working div:first-child{display:flex;flex-direction:column;gap:4px;min-width:250px}.working b{font-size:12px}.working small{color:#78827b;font-size:10px}.loadBar{height:5px;flex:1;background:#edf1ec;border-radius:99px;overflow:hidden}.loadBar span{display:block;width:55%;height:100%;background:#a7ff66;border-radius:99px;animation:load 1.4s infinite}@keyframes load{50%{width:87%}100%{width:55%}}
.result{margin-top:18px;padding:28px}.resultHead{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #edf0ec;padding-bottom:20px}.resultHead small,.evidenceTitle small,.calc small,.proofStrip small,.subHead small{display:block;color:#7d887f;font:700 9px 'DM Sans';letter-spacing:.14em}.resultHead h2{margin:8px 0 0;font-size:26px;letter-spacing:-.03em}.confidence{display:flex;flex-direction:column;align-items:flex-end}.confidence strong{font:700 19px 'DM Sans';color:#18201b}.confidence small{color:#818b83;font-size:9px}.metricGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:18px 0}.metric{border:1px solid #edf0ec;background:#fafbf9;border-radius:18px;padding:18px}.metric small{color:#778079;font-size:10px}.metric strong{display:block;margin-top:10px;font:700 30px 'DM Sans';letter-spacing:-.045em}.metric strong i{font-size:11px;font-style:normal;font-weight:600;color:#778079}.negative{color:#aa5d4a}.positive{color:#287045}.apiAnswer{margin:16px 0;padding:16px;background:#f2f6f0;border-radius:14px;color:#1b231e;line-height:1.9}.calc{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:17px 18px;background:#101512;color:#fff;border-radius:18px}.calc strong{display:block;margin-top:6px;font:700 19px 'DM Sans';letter-spacing:-.03em}.calc small{color:#839088}.calc>span{font-size:10px;color:#a4afa7}.evidence{margin-top:17px;border-top:1px solid #edf0ec;padding-top:18px}.evidenceTitle{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.evidenceTitle b{display:block;font-size:13px;margin-top:5px}.evidenceTitle>span{color:#8a938d;font:600 9px 'DM Sans'}.evidenceRow{display:grid;grid-template-columns:34px 1fr auto 18px;gap:11px;align-items:center;padding:11px 0;border-bottom:1px solid #f0f2ef}.sourceBadge{width:34px;height:34px;border:1px solid #dfe4df;border-radius:10px;display:grid;place-items:center;font:700 9px 'DM Sans';color:#3f4842;background:#fbfcfb}.evidenceRow b{display:block;font-size:11px}.evidenceRow small{display:block;color:#89928b;font-size:9px;margin-top:3px}.evidenceRow strong{font:700 12px 'DM Sans'}.verified{color:#3b8c56}.follow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:16px}.follow small{margin-right:auto;color:#89928b;font-size:10px}.follow button span{font-family:'DM Sans'}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:18px 0}.personCard{border:1px solid #e4e8e3;border-radius:20px;padding:18px}.personTop{display:flex;align-items:center;gap:10px;padding-bottom:15px;border-bottom:1px solid #eef0ed}.personAvatar,.customerCell span{width:38px;height:38px;border-radius:12px;background:#e7efe3;color:#35523b;display:grid;place-items:center;font-weight:800}.personTop b{display:block;font-size:13px}.personTop small{display:block;color:#88918a;font-size:9px;margin-top:2px}.valueRow{display:flex;justify-content:space-between;padding-top:14px}.valueRow small{color:#7d877f;font-size:10px}.valueRow strong{font:700 12px 'DM Sans'}
.proofStrip{margin-top:18px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}.proofStrip strong{display:block;font-size:12px;margin-top:5px}.proof{display:flex;align-items:center;gap:11px;flex-wrap:wrap;color:#6c766f;font:700 8px 'DM Sans';letter-spacing:.12em}.proof i{font-style:normal;color:#b1bab3}.proof b{color:#1b211d;background:#a7ff66;padding:7px 10px;border-radius:8px}
.subPage{max-width:1220px;margin:0 auto;padding:58px 54px 90px}.subHead{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px}.subHead h1{font-size:45px;letter-spacing:-.05em;margin:7px 0 0}.sourceGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.sourceTile{background:#fff;border:1px solid #e3e7e2;border-radius:22px;padding:22px;min-height:205px}.sourceTileTop{display:flex;justify-content:space-between;align-items:center}.sourceLogoLarge{width:42px;height:42px;border-radius:13px;background:#101512;color:#fff;display:grid;place-items:center;font:700 12px 'DM Sans'}.ready{font-size:10px;color:#438052}.sourceTile h3{font-size:18px;margin:18px 0 6px}.sourceTile p{margin:0;color:#7c857f;font-size:11px}.tileFoot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf0ec;margin-top:27px;padding-top:12px;color:#89928b;font-size:9px}.tileFoot b{color:#47514a;font-size:10px}.fabric{margin-top:15px;padding:20px;background:#101512;color:#fff;border-radius:21px;display:flex;justify-content:space-between;gap:20px;align-items:center}.fabric small{display:block;color:#8d9890;font:700 9px 'DM Sans';letter-spacing:.13em}.fabric strong{display:block;margin-top:6px;font-size:14px}.fabric>span{font-size:10px;color:#a3aea5}.tableCard{background:#fff;border:1px solid #e3e7e2;border-radius:22px;overflow:hidden}.tableRow{display:grid;grid-template-columns:2fr 1.2fr 1.2fr .8fr;gap:16px;align-items:center;padding:17px 20px;border-top:1px solid #eef0ed;font-size:11px}.tableHead{border-top:0;background:#f8f9f7;color:#88928b;font:700 9px 'DM Sans';letter-spacing:.1em}.tableRow em{font-style:normal}.tableRow .paid{color:#37804e}.tableRow .partial{color:#a26a3e}.customerCell{display:flex;align-items:center;gap:10px}.customerCell span{width:34px;height:34px;border-radius:11px;font-size:12px}.customerCell b{font-size:12px}.tableRow>strong,.tableRow>em{font-family:'DM Sans'}.note{margin-top:15px;padding:15px 17px;border:1px solid #e3e7e2;background:#fbfcfa;border-radius:16px;color:#737d75;font-size:10px;line-height:1.8}.historyList{display:flex;flex-direction:column;gap:9px}.historyList button{display:grid;grid-template-columns:38px 1fr 20px;align-items:center;gap:12px;border:1px solid #e4e8e3;background:#fff;border-radius:17px;padding:15px;text-align:right}.historyList button>span{width:34px;height:34px;border:1px solid #e2e7e2;border-radius:10px;display:grid;place-items:center;color:#526057}.historyList b{display:block;font-size:12px}.historyList small{display:block;color:#89928b;font-size:9px;margin-top:4px}.historyList strong{font:700 14px 'DM Sans';color:#6b766e}.empty{padding:40px;text-align:center;color:#87918a;background:#fff;border:1px dashed #dfe4df;border-radius:18px}.settingsCard{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.settingsCard>div{background:#fff;border:1px solid #e3e7e2;border-radius:20px;padding:20px}.settingsCard small{display:block;color:#87908a;font-size:9px}.settingsCard b{display:block;margin-top:10px;font-size:14px}
@media(max-width:1000px){.heroGrid{grid-template-columns:1fr}.networkArt{height:180px}.sourceGrid{grid-template-columns:1fr}.settingsCard{grid-template-columns:1fr}.comparison{grid-template-columns:1fr}.header{padding:0 22px}.page,.subPage{padding:42px 22px 70px}.heroCopy h1{font-size:52px}.proofStrip{align-items:flex-start;flex-direction:column}.metricGrid{grid-template-columns:1fr}.calc{align-items:flex-start;flex-direction:column}.follow small{margin-right:0;width:100%}}
@media(max-width:700px){.rail{width:64px}.content{margin-left:64px;width:calc(100% - 64px)}.brandText,.railRule,.navButton b{display:none}.navButton{width:50px}.header{height:66px;padding:0 14px}.headerRight .headerLink,.statusPill{display:none}.heroCopy h1{font-size:43px}.searchCard{padding:16px}.searchBottom{align-items:flex-start;flex-direction:column}.askButton{width:100%;justify-content:center}.subHead{align-items:flex-start;gap:15px;flex-direction:column}.subHead h1{font-size:39px}.tableRow{grid-template-columns:1.6fr 1fr 1fr .8fr;padding:13px 12px;font-size:10px}.evidenceRow{grid-template-columns:34px 1fr auto 14px}.networkArt{height:160px}}
`;
