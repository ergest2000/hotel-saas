import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barsRef.current) return
    const barData = [35, 50, 45, 68, 55, 82, 72]
    barsRef.current.innerHTML = ''
    barData.forEach((h, i) => {
      const b = document.createElement('div')
      b.className = 'lbar' + (i === 5 ? ' hi' : '')
      b.style.height = h + '%'
      barsRef.current!.appendChild(b)
    })
  }, [])

  const handleCTA = () => {
    const hotel = (document.getElementById('reg-hotel') as HTMLInputElement)?.value
    const email = (document.getElementById('reg-email') as HTMLInputElement)?.value
    if (!hotel || !email) { alert('Ju lutemi plotësoni emrin e hotelit dhe emailin.'); return }
    navigate('/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        .lp-root{--ink:#0a0f1e;--ink2:#1e2640;--muted:#6b7898;--accent:#2d5be3;--accent2:#1a3db5;--surface:#f5f6fa;--white:#ffffff;--border:rgba(10,15,30,.08);--radius:14px}
        .lp-root *{box-sizing:border-box;margin:0;padding:0}
        .lp-root{font-family:'DM Sans',sans-serif;color:var(--ink);background:var(--white);-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .lnav{display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;border-bottom:1px solid var(--border);background:rgba(255,255,255,.92);backdrop-filter:blur(12px);position:sticky;top:0;z-index:100}
        .lnav-logo{font-family:'Instrument Serif',serif;font-size:22px;color:var(--ink);text-decoration:none;cursor:pointer}
        .lnav-links{display:flex;gap:32px}
        .lnav-links a{font-size:14px;color:var(--muted);text-decoration:none;transition:color .2s;cursor:pointer}
        .lnav-links a:hover{color:var(--ink)}
        .lnav-cta{display:flex;gap:10px}
        .lbtn-ghost{font-size:13px;padding:8px 18px;border:1px solid var(--border);border-radius:40px;background:transparent;color:var(--ink);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;text-decoration:none;display:inline-flex;align-items:center}
        .lbtn-ghost:hover{border-color:var(--accent);color:var(--accent)}
        .lbtn-solid{font-size:13px;padding:8px 20px;border:none;border-radius:40px;background:var(--accent);color:#fff;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-weight:500;text-decoration:none;display:inline-flex;align-items:center}
        .lbtn-solid:hover{background:var(--accent2);transform:translateY(-1px)}
        .lhero{max-width:1100px;margin:0 auto;padding:80px 48px 0;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
        .lhero-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--accent);background:#eef2fd;padding:5px 14px;border-radius:40px;margin-bottom:22px;letter-spacing:.3px;animation:lfadeUp .5s ease both}
        .lhbdot{width:6px;height:6px;background:var(--accent);border-radius:50%;animation:lpulse 2s ease-in-out infinite}
        @keyframes lpulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes lfadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .lhero-title{font-family:'Instrument Serif',serif;font-size:52px;line-height:1.1;letter-spacing:-.5px;color:var(--ink);margin-bottom:18px;animation:lfadeUp .5s .08s ease both}
        .lhero-title em{font-style:italic;color:var(--accent)}
        .lhero-sub{font-size:16px;color:var(--muted);line-height:1.7;max-width:420px;margin-bottom:32px;animation:lfadeUp .5s .16s ease both}
        .lhero-btns{display:flex;gap:12px;flex-wrap:wrap;animation:lfadeUp .5s .24s ease both}
        .lbtnp{font-size:15px;padding:14px 28px;border-radius:40px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;background:var(--accent);color:#fff;border:none;transition:all .25s}
        .lbtnp:hover{background:var(--accent2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,91,227,.25)}
        .lbtns{font-size:15px;padding:14px 28px;border-radius:40px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;background:transparent;color:var(--ink);border:1px solid var(--border);transition:all .25s}
        .lbtns:hover{border-color:var(--accent);color:var(--accent)}
        .lhero-trust{display:flex;align-items:center;gap:12px;margin-top:24px;animation:lfadeUp .5s .32s ease both}
        .lavatars{display:flex}
        .lav{width:30px;height:30px;border-radius:50%;border:2px solid #fff;margin-right:-8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500}
        .ltrust-txt{font-size:12px;color:var(--muted);margin-left:12px}
        .lvisual{animation:lfloat 5s ease-in-out infinite}
        @keyframes lfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .ldframe{background:var(--ink);border-radius:16px;padding:20px;box-shadow:0 32px 80px rgba(10,15,30,.2)}
        .ldbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .lddots{display:flex;gap:6px}
        .ldd{width:10px;height:10px;border-radius:50%}
        .ldtabs{display:flex;gap:8px}
        .ldtab{font-size:11px;padding:4px 10px;border-radius:6px;color:rgba(255,255,255,.4)}
        .ldtab.a{background:rgba(255,255,255,.1);color:#fff}
        .ldstats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
        .ldstat{background:rgba(255,255,255,.06);border-radius:10px;padding:14px}
        .ldl{font-size:10px;color:rgba(255,255,255,.4);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
        .ldv{font-size:22px;font-weight:500;color:#fff;letter-spacing:-.5px}
        .lds{font-size:10px;margin-top:3px}
        .ldchart{background:rgba(255,255,255,.04);border-radius:10px;padding:16px;height:96px;margin-bottom:12px}
        .ldcl{font-size:10px;color:rgba(255,255,255,.35);margin-bottom:10px}
        .lbars{display:flex;align-items:flex-end;gap:5px;height:52px}
        .lbar{flex:1;border-radius:4px 4px 0 0;background:rgba(45,91,227,.4)}
        .lbar.hi{background:var(--accent)}
        .ldlist{background:rgba(255,255,255,.04);border-radius:10px;padding:14px}
        .ldll{font-size:10px;color:rgba(255,255,255,.35);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}
        .ldrow{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .ldrow:last-child{border-bottom:none}
        .ldrn{font-size:11px;color:rgba(255,255,255,.7)}
        .lbadge{font-size:10px;padding:2px 8px;border-radius:20px}
        .lbg{background:rgba(74,222,128,.15);color:#4ade80}
        .lba{background:rgba(251,191,36,.15);color:#fbbf24}
        .lbb{background:rgba(96,165,250,.15);color:#60a5fa}
        .lsection{padding:80px 48px;max-width:1100px;margin:0 auto}
        .leyebrow{font-size:12px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
        .lstitle{font-family:'Instrument Serif',serif;font-size:38px;letter-spacing:-.3px;color:var(--ink);margin-bottom:12px;line-height:1.15}
        .lssub{font-size:16px;color:var(--muted);line-height:1.7;max-width:520px;margin-bottom:48px}
        .ldivider{height:1px;background:var(--border);margin:0 48px}
        .lsurf{background:var(--surface)}
        .lsteps{display:grid;grid-template-columns:repeat(3,1fr);gap:0;position:relative}
        .lsteps::before{content:'';position:absolute;top:35px;left:18%;right:18%;height:1px;background:var(--border)}
        .lstep{text-align:center;padding:0 28px}
        .lsc{width:70px;height:70px;border-radius:50%;background:var(--white);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;position:relative;z-index:1;transition:all .3s}
        .lstep:hover .lsc{background:var(--accent);border-color:var(--accent)}
        .lsico{width:26px;height:26px;stroke:var(--accent);fill:none;stroke-width:1.5;transition:stroke .3s}
        .lstep:hover .lsico{stroke:#fff}
        .lstep h3{font-size:16px;font-weight:500;margin-bottom:8px}
        .lstep p{font-size:14px;color:var(--muted);line-height:1.65}
        .lfgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .lfcard{background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:28px;transition:all .3s}
        .lfcard:hover{border-color:rgba(45,91,227,.2);box-shadow:0 8px 32px rgba(45,91,227,.06);transform:translateY(-3px)}
        .lfico{width:44px;height:44px;border-radius:10px;background:#eef2fd;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
        .lfico svg{width:22px;height:22px;stroke:var(--accent);fill:none;stroke-width:1.5}
        .lfcard h3{font-size:15px;font-weight:500;margin-bottom:8px}
        .lfcard p{font-size:13px;color:var(--muted);line-height:1.7}
        .ltags{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
        .ltag{font-size:11px;padding:3px 9px;background:var(--surface);border-radius:20px;color:var(--muted)}
        .lpgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:860px;margin:0 auto}
        .lpcard{border:1px solid var(--border);border-radius:var(--radius);padding:32px;background:var(--white);transition:box-shadow .3s}
        .lpcard:hover{box-shadow:0 12px 40px rgba(10,15,30,.08)}
        .lpcard.feat{background:var(--ink);border-color:var(--ink)}
        .lpname{font-size:12px;font-weight:500;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);margin-bottom:10px}
        .lpcard.feat .lpname{color:rgba(255,255,255,.45)}
        .lprice{font-family:'Instrument Serif',serif;font-size:44px;letter-spacing:-1px;line-height:1;margin-bottom:4px}
        .lpcard.feat .lprice{color:#fff}
        .lpnote{font-size:13px;color:var(--muted);margin-bottom:24px}
        .lpcard.feat .lpnote{color:rgba(255,255,255,.4)}
        .lpdiv{height:1px;background:var(--border);margin-bottom:24px}
        .lpcard.feat .lpdiv{background:rgba(255,255,255,.1)}
        .lpfeats{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
        .lpfeats li{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:8px}
        .lpcard.feat .lpfeats li{color:rgba(255,255,255,.65)}
        .lpfeats li::before{content:'';width:16px;height:16px;border-radius:50%;flex-shrink:0;background:#eef2fd url("data:image/svg+xml,%3Csvg width='10' height='8' viewBox='0 0 10 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4l3 3 5-6' stroke='%232d5be3' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat center}
        .lpcard.feat .lpfeats li::before{background-color:rgba(255,255,255,.1);background-image:url("data:image/svg+xml,%3Csvg width='10' height='8' viewBox='0 0 10 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4l3 3 5-6' stroke='%23fff' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")}
        .lpbtn{width:100%;padding:13px;border-radius:40px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .25s}
        .lpout{background:transparent;border:1px solid var(--border);color:var(--ink)}
        .lpout:hover{border-color:var(--accent);color:var(--accent)}
        .lpwh{background:#fff;border:none;color:var(--ink)}
        .lpwh:hover{background:#eef2fd;color:var(--accent)}
        .lpopular{display:inline-block;font-size:11px;font-weight:500;background:rgba(45,91,227,.18);color:var(--accent);padding:3px 10px;border-radius:20px;margin-bottom:12px}
        .ltgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .ltcard{border:1px solid var(--border);border-radius:var(--radius);padding:28px;transition:box-shadow .3s}
        .ltcard:hover{box-shadow:0 8px 32px rgba(10,15,30,.07)}
        .lstars{color:#f59e0b;font-size:14px;margin-bottom:16px;letter-spacing:2px}
        .ltq{font-family:'Instrument Serif',serif;font-size:17px;line-height:1.55;color:var(--ink);margin-bottom:20px;font-style:italic}
        .ltauth{display:flex;align-items:center;gap:12px}
        .ltav{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:500;font-size:13px;flex-shrink:0}
        .ltname{font-size:13px;font-weight:500}
        .ltrole{font-size:12px;color:var(--muted)}
        .lcta-s{background:var(--ink);margin:0 48px 80px;border-radius:24px;padding:72px 64px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;position:relative;overflow:hidden}
        .lcta-s::before{content:'';position:absolute;top:-60px;right:-60px;width:320px;height:320px;border-radius:50%;background:rgba(45,91,227,.12);pointer-events:none}
        .lcta-s::after{content:'';position:absolute;bottom:-80px;left:25%;width:240px;height:240px;border-radius:50%;background:rgba(45,91,227,.07);pointer-events:none}
        .lcta-ey{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:14px}
        .lcta-t{font-family:'Instrument Serif',serif;font-size:40px;letter-spacing:-.5px;color:#fff;line-height:1.15;margin-bottom:14px}
        .lcta-sub{font-size:15px;color:rgba(255,255,255,.5);line-height:1.7}
        .lcta-form{display:flex;flex-direction:column;gap:12px;position:relative;z-index:1}
        .lci{padding:14px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#fff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border .2s}
        .lci::placeholder{color:rgba(255,255,255,.3)}
        .lci:focus{border-color:rgba(45,91,227,.6)}
        .lbcta{padding:14px;border-radius:10px;background:var(--accent);border:none;color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;cursor:pointer;transition:all .25s}
        .lbcta:hover{background:#4269e8;transform:translateY(-1px);box-shadow:0 8px 24px rgba(45,91,227,.3)}
        .lcta-legal{font-size:11px;color:rgba(255,255,255,.25);text-align:center}
        .lfooter{padding:32px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
        .lflogo{font-family:'Instrument Serif',serif;font-size:18px;color:var(--ink)}
        .lflinks{display:flex;gap:24px}
        .lflinks a{font-size:13px;color:var(--muted);text-decoration:none}
        .lflinks a:hover{color:var(--ink)}
        .lfcopy{font-size:12px;color:var(--muted)}
        @media(max-width:900px){
          .lnav{padding:0 20px}.lnav-links{display:none}
          .lhero{grid-template-columns:1fr;padding:40px 20px 0}
          .lhero-title{font-size:36px}.lvisual{display:none}
          .lsection{padding:48px 20px}.ldivider{margin:0 20px}
          .lfgrid,.ltgrid,.lsteps,.lpgrid{grid-template-columns:1fr}
          .lsteps::before{display:none}
          .lcta-s{grid-template-columns:1fr;margin:0 20px 48px;padding:40px 28px}
          .lfooter{flex-direction:column;gap:16px;text-align:center;padding:24px 20px}
        }
      `}</style>

      <div className="lp-root">
        {/* Nav */}
        <nav className="lnav">
          <span className="lnav-logo">HotelOS</span>
          <div className="lnav-links">
            <a onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>Si funksionon</a>
            <a onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>Modulet</a>
            <a onClick={() => document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}>Çmimet</a>
            <a onClick={() => document.getElementById('cta')?.scrollIntoView({behavior:'smooth'})}>Kontakt</a>
          </div>
          <div className="lnav-cta">
            <Link to="/login" className="lbtn-ghost">Hyr në llogari</Link>
            <Link to="/login" className="lbtn-solid">Regjistrohu Falas →</Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="lhero">
          <div>
            <div className="lhero-badge"><div className="lhbdot" />Platforma #1 për Hotelet Shqiptare</div>
            <h1 className="lhero-title">Menaxho hotelin tënd <em>nga çdo vend</em></h1>
            <p className="lhero-sub">Rezervime, staf, inventory dhe pagesa — gjithçka në një dashboard të vetëm. Pa spreadsheets. Pa kaos.</p>
            <div className="lhero-btns">
              <button className="lbtnp" onClick={() => navigate('/login')}>Regjistrohu Falas</button>
              <button className="lbtns" onClick={() => document.getElementById('how')?.scrollIntoView({behavior:'smooth'})}>Shiko si funksionon →</button>
            </div>
            <div className="lhero-trust">
              <div className="lavatars">
                {[['AK','#eef2fd','#1a3db5'],['BI','#fef3c7','#92400e'],['LM','#dcfce7','#166534'],['RD','#fce7f3','#9d174d']].map(([i,bg,c])=>(
                  <div key={i} className="lav" style={{background:bg,color:c}}>{i}</div>
                ))}
              </div>
              <p className="ltrust-txt">Besuar nga <strong>200+ hotele</strong> në Shqipëri</p>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="lvisual">
            <div className="ldframe">
              <div className="ldbar">
                <div className="lddots">
                  <div className="ldd" style={{background:'#ff5f57'}} />
                  <div className="ldd" style={{background:'#febc2e'}} />
                  <div className="ldd" style={{background:'#28c840'}} />
                </div>
                <div className="ldtabs">
                  <span className="ldtab a">Dashboard</span>
                  <span className="ldtab">Rezervime</span>
                  <span className="ldtab">Stafi</span>
                </div>
              </div>
              <div className="ldstats">
                <div className="ldstat"><div className="ldl">Revenue sot</div><div className="ldv">€2,840</div><div className="lds" style={{color:'#4ade80'}}>↑ 18% vs dje</div></div>
                <div className="ldstat"><div className="ldl">Dhoma aktive</div><div className="ldv">34/48</div><div className="lds" style={{color:'#60a5fa'}}>70.8% occ.</div></div>
                <div className="ldstat"><div className="ldl">Check-in sot</div><div className="ldv">12</div><div className="lds" style={{color:'#fbbf24'}}>4 në pritje</div></div>
              </div>
              <div className="ldchart">
                <div className="ldcl">Revenue 7 ditët e fundit</div>
                <div className="lbars" ref={barsRef} />
              </div>
              <div className="ldlist">
                <div className="ldll">Rezervimet e fundit</div>
                <div className="ldrow"><span className="ldrn">Arjeta Krasniqi — Suite 301</span><span className="lbadge lbg">Konfirmuar</span></div>
                <div className="ldrow"><span className="ldrn">Besnik Hoxha — Dhomë 214</span><span className="lbadge lba">Në pritje</span></div>
                <div className="ldrow"><span className="ldrn">Lira Mema — Double 108</span><span className="lbadge lbb">Check-in sot</span></div>
              </div>
            </div>
          </div>
        </div>

        <div style={{height:48}} />
        <div className="ldivider" />

        {/* Si Funksionon */}
        <div id="how" style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="lsection">
            <div className="leyebrow">Si Funksionon</div>
            <h2 className="lstitle">Nga rezervimi te pagesa<br />— automatikisht</h2>
            <p className="lssub">Tre hapa të thjeshtë që kursejnë orë pune çdo ditë dhe eliminojnë gabimet manuale.</p>
            <div className="lsteps">
              {[
                { icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>, title: '1. Rezervim nga çdo kanal', desc: 'Website juaj, Booking.com, Expedia, Airbnb apo recepsioni — të gjitha rezervimet mblidhen automatikisht.' },
                { icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>, title: '2. Dashboard i unifikuar', desc: 'Kalendarët sinkronizohen në kohë reale. Pa overbooking. Stafi dhe inventory përditësohen automatikisht.' },
                { icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>, title: '3. Pagesa & Njoftime', desc: 'PokPay, Stripe ose cash — pagesa processohet dhe mysafiri merr konfirmim dhe faturë automatikisht.' },
              ].map((s,i) => (
                <div key={i} className="lstep">
                  <div className="lsc"><svg className="lsico" viewBox="0 0 24 24">{s.icon}</svg></div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ldivider" />

        {/* Features */}
        <div id="features" className="lsurf">
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div className="lsection">
              <div className="leyebrow">Modulet</div>
              <h2 className="lstitle">Çdo gjë që hoteli<br />juaj ka nevojë</h2>
              <p className="lssub">Modulet e integruara punojnë si një sistem i vetëm — jo si mjete të ndara pa lidhje mes tyre.</p>
              <div className="lfgrid">
                {[
                  { icon: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, title: 'Menaxhimi i Rezervimeve', desc: 'Kalendarë vizualë, konfirmim automatik, modifikim me një klik. Sinkronizim i plotë me të gjitha OTA-t.', tags: ['Web','OTA','Manual'] },
                  { icon: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></>, title: 'Inventory & Furnitorë', desc: 'Gjurmoni stokun në kohë reale, menaxhoni kontratat dhe merrni alarme kur stoku bie nën minimum.', tags: ['Stok','Alarme','Raporte'] },
                  { icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>, title: 'HR & Planifikimi i Stafit', desc: 'Profile, orare dhe shift-e — gjithçka në një vend. Njoftimet automatike për çdo ndryshim të orarit.', tags: ['Shift-e','Orare','Attendance'] },
                  { icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></>, title: 'Channel Manager', desc: 'Disponueshmëria dhe çmimet sinkronizohen në kohë reale me Booking.com, Expedia, Airbnb dhe Logdify.', tags: ['Booking.com','Airbnb','Logdify'] },
                  { icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>, title: 'Integrim Pagesash', desc: 'PokPay, Stripe, PayPal dhe cash. Fatura dhe konfirmimi dërgohen automatikisht te mysafiri me email.', tags: ['PokPay','Stripe','PayPal'] },
                  { icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>, title: 'Raporte & Analitika', desc: 'RevPAR, ADR, occupancy rate — raporte financiare të detajuara me eksport CSV dhe grafik live.', tags: ['RevPAR','ADR','CSV Export'] },
                ].map((f,i) => (
                  <div key={i} className="lfcard">
                    <div className="lfico"><svg viewBox="0 0 24 24">{f.icon}</svg></div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    <div className="ltags">{f.tags.map(t=><span key={t} className="ltag">{t}</span>)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="ldivider" />

        {/* Pricing */}
        <div id="pricing" style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="lsection" style={{textAlign:'center'}}>
            <div className="leyebrow">Çmimet</div>
            <h2 className="lstitle" style={{margin:'0 auto 12px'}}>Transparent. Pa surpriza.</h2>
            <p className="lssub" style={{margin:'0 auto 48px'}}>Fillo falas. Shkallëzo kur të jesh gati. Anulo kurdo.</p>
            <div className="lpgrid">
              <div className="lpcard">
                <div className="lpname">Basic</div>
                <div className="lprice">€49</div>
                <div className="lpnote">/ muaj · 1 hotel</div>
                <div className="lpdiv" />
                <ul className="lpfeats">
                  {['Deri 30 dhoma','Rezervime web + manual','Dashboard bazë','Email njoftime','Support standard'].map(f=><li key={f}>{f}</li>)}
                </ul>
                <button className="lpbtn lpout" onClick={() => navigate('/login')}>Fillo falas →</button>
              </div>
              <div className="lpcard feat">
                <div className="lpopular">Më i popullarizuari</div>
                <div className="lpname">Pro</div>
                <div className="lprice">€129</div>
                <div className="lpnote">/ muaj · 1 hotel</div>
                <div className="lpdiv" />
                <ul className="lpfeats">
                  {['Dhoma të pakufizuara','OTA + Channel Manager','HR & Inventory moduli','PokPay + Stripe + PayPal','Raporte të avancuara','Support prioritar'].map(f=><li key={f}>{f}</li>)}
                </ul>
                <button className="lpbtn lpwh" onClick={() => navigate('/login')}>14 ditë falas →</button>
              </div>
              <div className="lpcard">
                <div className="lpname">Enterprise</div>
                <div className="lprice" style={{fontSize:30,letterSpacing:'-.5px'}}>Me marrëveshje</div>
                <div className="lpnote">/ muaj · hotele të shumta</div>
                <div className="lpdiv" />
                <ul className="lpfeats">
                  {['Multi-hotel SaaS','White-label opsional','Integrime custom API','SLA i garantuar','Account manager dedikuar'].map(f=><li key={f}>{f}</li>)}
                </ul>
                <button className="lpbtn lpout">Na kontakto →</button>
              </div>
            </div>
          </div>
        </div>

        <div className="ldivider" />

        {/* Testimonials */}
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="lsection">
            <div className="leyebrow">Testimoniale</div>
            <h2 className="lstitle">Hotele që besojnë<br />tek HotelOS</h2>
            <p className="lssub">Rezultate reale nga menaxherë që kursyen kohë dhe rritën revenue.</p>
            <div className="ltgrid">
              {[
                {q:'"Nga kur kalëm në HotelOS, overbooking-et u zhdukën plotësisht. Stafi im kursen 2 orë çdo ditë."',name:'Arben Kelmendi',role:'Menaxher, Hotel Riviera · Durrës',av:'AK',bg:'#eef2fd',c:'#1a3db5'},
                {q:'"Integrimi me Booking.com dhe PokPay ishte i thjeshtë. Revenue u rrit 23% brenda tre muajve."',name:'Besa Isufi',role:'Pronare, Boutique Hotel Besa · Tiranë',av:'BI',bg:'#fef3c7',c:'#92400e'},
                {q:'"Raportet financiare automatike na kursyen orë kontabiliteti çdo muaj. Mjet i domosdoshëm."',name:'Luan Mema',role:'CFO, Grand Hotel Shkodra',av:'LM',bg:'#dcfce7',c:'#166534'},
              ].map((t,i)=>(
                <div key={i} className="ltcard">
                  <div className="lstars">★★★★★</div>
                  <p className="ltq">{t.q}</p>
                  <div className="ltauth">
                    <div className="ltav" style={{background:t.bg,color:t.c}}>{t.av}</div>
                    <div><div className="ltname">{t.name}</div><div className="ltrole">{t.role}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div id="cta" className="lcta-s">
          <div>
            <div className="lcta-ey">Fillo Sot</div>
            <h2 className="lcta-t">Gati të transformosh<br />hotelin tënd?</h2>
            <p className="lcta-sub">14 ditë falas. Pa kartë krediti. Konfigurimi brenda 30 minutave. Asistencë e plotë gjatë onboarding-ut.</p>
          </div>
          <div className="lcta-form">
            <input className="lci" type="text" placeholder="Emri i hotelit tuaj" id="reg-hotel" />
            <input className="lci" type="email" placeholder="Email i biznesit" id="reg-email" />
            <input className="lci" type="tel" placeholder="Numri i telefonit" id="reg-phone" />
            <button className="lbcta" onClick={handleCTA}>Regjistrohu Falas — pa kartë krediti</button>
            <p className="lcta-legal">Duke u regjistruar pranoni Kushtet e Shërbimit · SSL 256-bit i siguruar</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="lfooter">
          <div className="lflogo">HotelOS</div>
          <div className="lflinks">
            <a href="#">Privatësia</a>
            <a href="#">Kushtet</a>
            <a href="#">Dokumentacioni</a>
            <a href="#">Kontakt</a>
          </div>
          <p className="lfcopy">© 2025 HotelOS. Të gjitha të drejtat e rezervuara.</p>
        </footer>
      </div>
    </>
  )
}
