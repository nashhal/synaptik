import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

const demoAnswers = {
  ahmed: {
    answer: 'أحمد باع 25,700 ريال هذا الشهر، دفع 12,000 ريال، والمتبقي عليه 13,700 ريال.',
    confidence: 0.98,
    sources: [
      { source: 'Google Sheets', record: 'Sales · Ahmed · 25,700 SAR' },
      { source: 'QuickBooks', record: 'Payments · Ahmed · 12,000 SAR' },
      { source: 'QuickBooks', record: 'Invoice · INV-1045 · 25,700 SAR' }
    ]
  },
  sara: {
    answer: 'سارة باعت 9,100 ريال هذا الشهر، وتم سداد كامل المبلغ. الرصيد المستحق: 0 ريال.',
    confidence: 0.97,
    sources: [
      { source: 'Google Sheets', record: 'Sales · Sara · 9,100 SAR' },
      { source: 'QuickBooks', record: 'Invoice · INV-1046 · Paid' }
    ]
  }
};

function localDemo(question) {
  const q = question.toLowerCase();
  if (q.includes('أحمد') || q.includes('ahmed')) return demoAnswers.ahmed;
  if (q.includes('سارة') || q.includes('sara')) return demoAnswers.sara;
  return {
    answer: 'في النسخة التجريبية، جرّب سؤالاً مثل: كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟',
    confidence: 0.72,
    sources: [{ source: 'Demo workspace', record: 'Sample dataset' }]
  };
}

export default function Home() {
  const [question, setQuestion] = useState('كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(API + '/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (!res.ok) throw new Error('demo fallback');
      const data = await res.json();
      setResult(data);
    } catch (_) {
      await new Promise((r) => setTimeout(r, 450));
      setResult(localDemo(question));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl">
      <header className="nav">
        <div className="logo"><span>◈</span> SYNAPTIK</div>
        <div className="navRight"><span className="status"><i /> Demo workspace</span><button className="ghost">طلب تجربة</button></div>
      </header>

      <section className="hero">
        <div className="eyebrow">UNIFIED BUSINESS INTELLIGENCE</div>
        <h1>كل بيانات مؤسستك.<br /><em>سؤال واحد.</em> إجابة واضحة.</h1>
        <p className="lead">Synaptik يربط بيانات المبيعات والفواتير والمدفوعات من أنظمة مختلفة، ثم يحولها إلى إجابة واحدة مع الأدلة.</p>

        <div className="searchCard">
          <div className="searchTop"><span>اسأل Synaptik</span><span className="hint">اضغط Enter للإرسال</span></div>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }} />
          <div className="searchBottom"><div className="chips"><button onClick={() => setQuestion('كم باع أحمد هذا الشهر وكم دفع وكم بقي عليه؟')}>أحمد هذا الشهر</button><button onClick={() => setQuestion('كم باعت سارة وهل عليها أي رصيد؟')}>رصيد سارة</button></div><button className="ask" onClick={ask} disabled={loading}>{loading ? 'يحلل البيانات…' : 'اسأل Synaptik  →'}</button></div>
        </div>
      </section>

      {result && <section className="resultWrap">
        <div className="resultHead"><div><span className="label">ANSWER</span><h2>الإجابة الموحّدة</h2></div><div className="confidence"><strong>{Math.round((result.confidence || 0) * 100)}%</strong><span>ثقة</span></div></div>
        <div className="answer">{result.answer}</div>
        <div className="evidence"><div className="evidenceTitle">الأدلة المستخدمة <span>{(result.sources || []).length} مصادر</span></div>{(result.sources || []).map((s, i) => <div className="source" key={i}><div className="sourceIcon">{s.source.includes('Google') ? 'G' : s.source.includes('Quick') ? 'Q' : 'S'}</div><div><b>{s.source}</b><p>{s.record}</p></div><span className="verified">✓</span></div>)}</div>
      </section>}

      <section className="trust">
        <div><span className="num">01</span><h3>Source-first</h3><p>البيانات الأصلية هي مصدر الحقيقة، وليس النموذج اللغوي.</p></div>
        <div><span className="num">02</span><h3>Cross-source</h3><p>يربط العميل نفسه بين المبيعات والفواتير والمدفوعات.</p></div>
        <div><span className="num">03</span><h3>Evidence</h3><p>كل إجابة قابلة للتتبع عبر السجلات التي اعتمدت عليها.</p></div>
      </section>

      <footer><span> SYNAPTIK</span><span>Prototype · Business Search Layer</span></footer>
      <style jsx>{css}</style>
    </main>
  );
}

const css = `
*{box-sizing:border-box}body{margin:0;background:#07100e;color:#edf5f0;font-family:Arial,"Noto Sans Arabic",sans-serif}.nav{height:76px;max-width:1180px;margin:auto;padding:0 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07)}.logo{font-weight:900;letter-spacing:2.5px;font-size:15px}.logo span{color:#69e7b1;margin-left:8px}.navRight{display:flex;align-items:center;gap:14px}.status{font-size:12px;color:#9eafa8}.status i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#69e7b1;margin-left:7px;box-shadow:0 0 12px #69e7b1}.ghost{border:1px solid #30413b;background:transparent;color:#d9e6df;border-radius:9px;padding:9px 14px}.hero{max-width:1000px;margin:auto;padding:90px 28px 70px;text-align:center}.eyebrow{font-size:11px;letter-spacing:3px;color:#69e7b1;font-weight:800}.hero h1{font-size:clamp(42px,7vw,78px);line-height:1.03;letter-spacing:-3px;margin:22px 0}.hero h1 em{font-style:normal;color:#69e7b1}.lead{max-width:690px;margin:0 auto;color:#9eafa8;font-size:17px;line-height:1.8}.searchCard{margin:45px auto 0;max-width:850px;text-align:right;background:#0d1916;border:1px solid #25352f;border-radius:20px;padding:17px;box-shadow:0 20px 70px rgba(0,0,0,.28)}.searchTop,.searchBottom{display:flex;justify-content:space-between;align-items:center;padding:3px 4px 10px;font-size:13px;font-weight:700}.hint{font-weight:400;color:#667871;font-size:11px}.searchCard textarea{width:100%;min-height:90px;resize:none;border:0;outline:0;border-radius:12px;background:#09120f;color:#eef7f1;padding:18px;font-size:17px;line-height:1.7}.searchBottom{padding:12px 2px 0}.chips{display:flex;gap:7px}.chips button{background:#13221e;border:1px solid #263b33;color:#9eb0a8;border-radius:20px;padding:8px 12px;font-size:11px}.ask{background:#69e7b1;color:#07120e;border:0;border-radius:10px;padding:12px 18px;font-weight:900}.ask:disabled{opacity:.6}.resultWrap{max-width:850px;margin:0 auto 70px;background:#0c1714;border:1px solid #25352f;border-radius:20px;overflow:hidden}.resultHead{display:flex;justify-content:space-between;align-items:center;padding:25px 28px;border-bottom:1px solid #20302b}.label{font-size:10px;letter-spacing:2px;color:#69e7b1}.resultHead h2{margin:7px 0 0;font-size:22px}.confidence{display:flex;flex-direction:column;align-items:flex-end}.confidence strong{color:#69e7b1;font-size:24px}.confidence span{font-size:10px;color:#74857e}.answer{padding:30px 28px;font-size:24px;line-height:1.7;font-weight:700}.evidence{padding:0 28px 26px}.evidenceTitle{font-size:12px;color:#9eafa8;padding:15px 0;border-top:1px solid #20302b}.evidenceTitle span{float:left;color:#62736c}.source{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}.sourceIcon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;background:#162720;color:#69e7b1;font-weight:900}.source b{font-size:12px}.source p{margin:3px 0 0;color:#82928c;font-size:12px}.verified{margin-right:auto;color:#69e7b1}.trust{max-width:1000px;margin:0 auto;padding:0 28px 90px;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#24332e}.trust>div{background:#07100e;padding:30px 22px}.num{color:#69e7b1;font-size:11px;letter-spacing:2px}.trust h3{margin:18px 0 8px}.trust p{color:#7f9089;font-size:13px;line-height:1.7;margin:0}footer{max-width:1180px;margin:auto;padding:25px 28px 35px;border-top:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;color:#61716b;font-size:10px;letter-spacing:1px}footer span:first-child{color:#69e7b1;font-weight:900}@media(max-width:700px){.navRight .ghost{display:none}.hero{padding-top:60px}.hero h1{letter-spacing:-2px}.searchBottom{flex-direction:column;gap:12px;align-items:stretch}.chips{overflow:auto}.ask{width:100%}.trust{grid-template-columns:1fr}.answer{font-size:19px}.confidence{display:none}}
`;
