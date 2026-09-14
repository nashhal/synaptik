import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function Home() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [org, setOrg] = useState('');
  const [token, setToken] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  async function auth() {
    setAuthError('');
    try {
      const path = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, organization: org || 'My Organization' };
      const res = await fetch(API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'تعذر تسجيل الدخول');
      setToken(data.access_token);
    } catch (e) { setAuthError(e.message); }
  }

  async function ask() {
    if (!question.trim() || !token) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch(API + '/api/v1/query', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({question}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'تعذر تنفيذ السؤال');
      setResult(data);
    } catch (e) { setResult({answer:e.message, confidence:0, sources:[]}); }
    finally { setLoading(false); }
  }

  if (!token) return <main dir="rtl"><section className="auth"><div className="brand">SYNAPTIK</div><h1>{mode==='login'?'مرحباً بعودتك':'ابدأ مساحة مؤسستك'}</h1><p>محرك بحث موحد يفهم بيانات مؤسستك عبر الأنظمة المختلفة.</p><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="البريد الإلكتروني" type="email"/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة المرور — 8 أحرف على الأقل" type="password"/>{mode==='register'&&<input value={org} onChange={e=>setOrg(e.target.value)} placeholder="اسم المؤسسة"/>}<button onClick={auth}>{mode==='login'?'تسجيل الدخول':'إنشاء المؤسسة'}</button>{authError&&<div className="error">{authError}</div>}<a onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'إنشاء حساب جديد':'لديك حساب؟ تسجيل الدخول'}</a></section><style jsx>{css}</style></main>;

  return <main dir="rtl"><section className="hero"><div className="brand">SYNAPTIK · UNIFIED BUSINESS SEARCH</div><h1>اسأل بيانات مؤسستك<br/><span>من مكان واحد</span></h1><p>Synaptik يجمع الأدلة من مصادر متعددة ويعطيك إجابة واحدة قابلة للتحقق.</p><div className="searchBox"><textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}} placeholder="مثال: كم باع أحمد هذا الشهر وكم دفع وكم باقي عليه؟"/><button onClick={ask} disabled={loading}>{loading?'جاري التحليل…':'اسأل Synaptik'}</button></div></section>{result&&<section className="answer"><div className="answerTop"><span>الإجابة</span><strong>{Math.round((result.confidence||0)*100)}% ثقة</strong></div><h2>{result.answer}</h2><div className="sources"><b>المصادر المستخدمة</b>{(result.sources||[]).map((s,i)=><div key={i}><span>{s.source}</span><code>{s.record}</code></div>)}</div></section>}<section className="features"><div><b>مصدر واحد للحقيقة</b><p>البيانات هي مصدر الحقيقة وليست اللغة نفسها.</p></div><div><b>Cross-source</b><p>يربط العملاء والفواتير والمدفوعات والمبيعات.</p></div><div><b>Evidence-first</b><p>كل إجابة تعرض السجلات التي اعتمدت عليها.</p></div></section><style jsx>{css}</style></main>;
}

const css = `body{margin:0;background:#07111f;color:#eef5ff;font-family:Arial,sans-serif}.auth{max-width:430px;margin:80px auto;padding:36px 28px;background:#0d1b2d;border:1px solid #20334c;border-radius:24px}.brand{color:#62e6b3;font-weight:800;letter-spacing:2px;font-size:13px}h1{font-size:44px;line-height:1.1;margin:18px 0}h1 span{color:#62e6b3}.auth p,.hero p{color:#9eb0c5;line-height:1.7;font-size:17px}.auth input{display:block;width:100%;box-sizing:border-box;margin:12px 0;padding:15px;border-radius:12px;border:1px solid #243a54;background:#081525;color:white;font-size:16px;outline:none}.auth button{width:100%;margin-top:8px;border:0;border-radius:12px;padding:15px;background:#62e6b3;color:#06131c;font-weight:800;cursor:pointer}.auth a{display:block;text-align:center;color:#62e6b3;margin-top:20px;cursor:pointer}.error{margin-top:14px;color:#ff9d9d}.hero{max-width:920px;margin:0 auto;padding:90px 24px 45px}.searchBox{margin-top:32px;background:#0d1b2d;border:1px solid #20334c;border-radius:20px;padding:14px;display:flex;gap:12px}textarea{flex:1;min-height:80px;background:transparent;border:0;outline:0;color:white;font-size:17px;resize:vertical;padding:10px}button{align-self:flex-end;border:0;border-radius:12px;padding:14px 20px;background:#62e6b3;color:#06131c;font-weight:800;cursor:pointer}.answer{max-width:920px;margin:0 auto 30px;padding:28px 24px;background:#0d1b2d;border:1px solid #20334c;border-radius:20px}.answerTop{display:flex;justify-content:space-between;color:#9eb0c5}.answerTop strong{color:#62e6b3}.answer h2{font-size:25px;line-height:1.6}.sources{border-top:1px solid #20334c;padding-top:18px}.sources div{display:flex;justify-content:space-between;padding:10px 0;color:#b7c5d6}.sources code{color:#62e6b3}.features{max-width:920px;margin:0 auto;padding:20px 24px 80px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.features>div{background:#0b1727;border:1px solid #1b2c43;border-radius:16px;padding:20px}.features p{font-size:14px}@media(max-width:700px){h1{font-size:40px}.searchBox{flex-direction:column}.features{grid-template-columns:1fr}}`;
