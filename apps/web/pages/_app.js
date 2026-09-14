import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head><title>Synaptik — Business Intelligence</title></Head>
      <Component {...pageProps} />
      <a className="analyticsLink" href="/synaptik/analytics/" aria-label="مركز تحليل الأعمال">
        <span className="dot" /> تحليل الأعمال
      </a>
      <style jsx global>{`
        .analyticsLink{position:fixed;left:22px;bottom:22px;z-index:9999;display:flex;align-items:center;gap:9px;padding:11px 15px;border-radius:999px;background:#14221e;color:#fff;text-decoration:none;font:800 12px/1 system-ui,sans-serif;box-shadow:0 12px 30px rgba(12,28,23,.16);border:1px solid rgba(255,255,255,.08);transition:transform .2s ease,box-shadow .2s ease}
        .analyticsLink:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(12,28,23,.22)}
        .analyticsLink .dot{width:7px;height:7px;border-radius:50%;background:#72c4a3;box-shadow:0 0 0 4px rgba(114,196,163,.14)}
        @media(max-width:620px){.analyticsLink{left:14px;bottom:14px;padding:10px 13px}}
      `}</style>
    </>
  );
}
