/* Section G — 프로필 & 배지 & 기록 */

function ScreenG1Profile() {
  const cityProgress = [
    { city:'도쿄', visited:12, total:342 },
    { city:'서울', visited:8, total:218 },
  ];
  return (
    <MobileFrame bg="var(--cream)">
      {/* Header (coral top area) */}
      <div style={{position:'absolute', top:0, left:0, right:0, height:220, background:'var(--grad-hero)', overflow:'hidden'}}>
        <div style={{position:'absolute', top:-40, right:-40, width:200, height:200, background:'radial-gradient(circle, rgba(255,200,87,0.35), transparent 65%)'}}/>
        <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'rgba(255,249,242,0.85)', textTransform:'uppercase', alignSelf:'center'}}>MY PROFILE</div>
          <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.2)', backdropFilter:'blur(12px)', color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="settings" size={20} stroke="currentColor"/></div>
        </div>
      </div>
      {/* Profile card */}
      <div style={{position:'absolute', top:150, left:16, right:16, background:'#fff', borderRadius:22, padding:'20px 18px', boxShadow:'var(--sh-elevated)', fontFamily:'var(--font-ko)'}}>
        <div style={{display:'flex', gap:14, alignItems:'center'}}>
          <div style={{width:64, height:64, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-latin)', fontSize:24, fontWeight:800, position:'relative'}}>
            지
            <div style={{position:'absolute', bottom:-2, right:-2, width:22, height:22, borderRadius:'50%', background:'var(--yellow)', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12}}>🌠</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, letterSpacing:'-0.01em', color:'var(--navy)'}}>지민</div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:11, color:'var(--muted)', marginTop:2}}>@jimin.chu · 2026.03 가입</div>
          </div>
          <div style={{width:32, height:32, borderRadius:'50%', background:'var(--cream-2)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="edit" size={14}/></div>
        </div>
        <div style={{marginTop:16, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, textAlign:'center'}}>
          {[
            { v:'20', l:'VISITED' },
            { v:'3', l:'BADGES' },
            { v:'42', l:'SAVED' },
          ].map((it,i) => (
            <div key={i} style={{borderRight: i < 2 ? '1px solid var(--line)' : 'none', padding:'2px 0'}}>
              <div style={{fontFamily:'var(--font-latin)', fontSize:20, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.02em'}}>{it.v}</div>
              <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', marginTop:2}}>{it.l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* City progress */}
      <div style={{position:'absolute', top:346, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em', marginBottom:10}}>도시 진행률</div>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {cityProgress.map(cp => {
            const pct = (cp.visited / cp.total) * 100;
            return (
              <div key={cp.city} style={{background:'#fff', borderRadius:14, padding:'12px 14px', boxShadow:'var(--sh-card)'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <div style={{fontSize:13, fontWeight:700}}>{cp.city}</div>
                  <div style={{fontFamily:'var(--font-latin)', fontSize:11, color:'var(--muted)'}}><b style={{color:'var(--coral)'}}>{cp.visited}</b> / {cp.total}</div>
                </div>
                <div style={{height:6, borderRadius:100, background:'var(--cream-2)', overflow:'hidden'}}>
                  <div style={{width:`${pct}%`, height:'100%', background:'var(--grad-body)', borderRadius:100}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Badge peek */}
      <div style={{position:'absolute', top:522, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
          <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em'}}>배지</div>
          <div style={{fontSize:11, color:'var(--muted)', fontWeight:600}}>전체 →</div>
        </div>
        <div style={{display:'flex', gap:8, overflow:'hidden'}}>
          {BADGES.slice(0, 4).map(b => (
            <div key={b.id} style={{flex:'0 0 80px', textAlign:'center'}}>
              <div style={{width:60, height:60, margin:'0 auto', borderRadius:'50%', background: b.earned ? 'var(--yellow)' : 'var(--cream-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, opacity: b.earned ? 1 : 0.4}}>{b.icon}</div>
              <div style={{fontSize:10, fontWeight:700, marginTop:6, letterSpacing:'-0.01em'}}>{b.title}</div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="profile"/>
    </MobileFrame>
  );
}

function ScreenG2Badges() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>BADGES</div>
          <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>배지 도감</div>
        </div>
      </div>
      <div style={{position:'absolute', top:136, left:20, right:20, background:'linear-gradient(135deg, #17233C 0%, #2E3F5E 100%)', color:'var(--cream)', borderRadius:22, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, fontFamily:'var(--font-ko)'}}>
        <img src="assets/mascot/chu-expression-focused.svg" style={{width:64, height:64}}/>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:11, fontWeight:600, letterSpacing:'0.16em', color:'var(--yellow)', textTransform:'uppercase'}}>Progress</div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:2}}>3 <span style={{color:'rgba(255,249,242,0.5)', fontSize:15}}>/ 12</span></div>
          <div style={{fontSize:11, opacity:0.85, marginTop:2}}>다음 배지까지 스팟 6개!</div>
        </div>
      </div>
      {/* Grid */}
      <div style={{position:'absolute', top:280, left:14, right:14, bottom:100, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontFamily:'var(--font-ko)'}}>
          {BADGES.map(b => (
            <div key={b.id} style={{background:'#fff', borderRadius:16, padding:'14px 12px', boxShadow:'var(--sh-card)', textAlign:'center', opacity: b.earned ? 1 : 0.7}}>
              <div style={{width:56, height:56, margin:'0 auto', borderRadius:'50%', background: b.earned ? 'var(--yellow)' : 'var(--cream-2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, filter: b.earned ? 'none' : 'grayscale(0.5)'}}>{b.icon}</div>
              <div style={{fontSize:12, fontWeight:700, marginTop:8, letterSpacing:'-0.01em', color:'var(--navy)'}}>{b.title}</div>
              <div style={{fontSize:10, color:'var(--muted)', marginTop:2, lineHeight:1.4}}>{b.subtitle}</div>
              {b.progress && (
                <div style={{marginTop:8, height:4, borderRadius:100, background:'var(--cream-2)', overflow:'hidden'}}>
                  <div style={{width:`${(b.progress / b.total) * 100}%`, height:'100%', background:'var(--coral)', borderRadius:100}}/>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <TabBar active="profile"/>
    </MobileFrame>
  );
}

function ScreenG3History() {
  const history = [
    { id:'suga-shrine', when:'오늘', badge:true },
    { id:'harajuku', when:'어제' },
    { id:'shibuya', when:'2일 전' },
    { id:'namsan', when:'1주 전' },
    { id:'gyeongbok', when:'1주 전' },
    { id:'seongsu', when:'2주 전' },
  ];
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>HISTORY</div>
          <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>방문 기록</div>
        </div>
      </div>
      <div style={{position:'absolute', top:136, left:20, right:20, bottom:100, overflow:'hidden', fontFamily:'var(--font-ko)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {history.map((h, i) => {
            const s = SPOTS.find(x => x.id === h.id);
            return (
              <div key={i} style={{background:'#fff', borderRadius:14, padding:'12px 14px', display:'flex', gap:12, alignItems:'center', boxShadow:'var(--sh-card)'}}>
                <div style={{width:52, height:52, borderRadius:12, background: s.thumbGrad, flexShrink:0, position:'relative'}}>
                  <div style={{position:'absolute', bottom:-4, right:-4, width:22, height:22, borderRadius:'50%', background:'var(--mint)', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="check" size={12} stroke="var(--navy)" strokeWidth={2.5}/></div>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.title}</div>
                  <div style={{fontSize:10, color:'var(--muted)', marginTop:2, display:'flex', gap:6, alignItems:'center'}}>
                    <span>{s.categoryLabel}</span>
                    <span>·</span>
                    <span style={{fontFamily:'var(--font-latin)'}}>{h.when}</span>
                  </div>
                </div>
                {h.badge && <div style={{width:26, height:26, borderRadius:'50%', background:'var(--yellow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12}}>🌠</div>}
              </div>
            );
          })}
        </div>
      </div>
      <TabBar active="profile"/>
    </MobileFrame>
  );
}

function ScreenG4Settings() {
  const items = [
    { g:'계정', rows:[
      { l:'프로필 편집', icon:'edit' },
      { l:'연결된 로그인', icon:'users', extra:'카카오' },
      { l:'알림 설정', icon:'bell' },
    ]},
    { g:'앱', rows:[
      { l:'다크 모드', icon:'settings', toggle:false },
      { l:'언어', icon:'globe', extra:'한국어' },
    ]},
    { g:'정책', rows:[
      { l:'이용약관', icon:'shield' },
      { l:'개인정보처리방침', icon:'lock' },
      { l:'저작권 · 안전 안내', icon:'alert-triangle' },
    ]},
    { g:'', rows:[
      { l:'로그아웃', icon:'x-octagon', danger:true },
    ]},
  ];
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>설정</div>
      </div>
      <div style={{position:'absolute', top:130, left:16, right:16, bottom:20, overflow:'hidden', fontFamily:'var(--font-ko)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:22}}>
          {items.map((sec, si) => (
            <div key={si}>
              {sec.g && <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6, paddingLeft:6}}>{sec.g}</div>}
              <div style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'var(--sh-card)'}}>
                {sec.rows.map((r, ri) => (
                  <div key={ri} style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom: ri < sec.rows.length - 1 ? '1px solid var(--line)' : 'none'}}>
                    <Icon name={r.icon} size={18} stroke={r.danger ? 'var(--coral)' : 'var(--navy)'}/>
                    <div style={{flex:1, fontSize:13, fontWeight:600, color: r.danger ? 'var(--coral)' : 'var(--navy)', letterSpacing:'-0.01em'}}>{r.l}</div>
                    {r.extra && <div style={{fontSize:11, color:'var(--muted)'}}>{r.extra}</div>}
                    {'toggle' in r
                      ? <div style={{width:38, height:22, background: r.toggle ? 'var(--mint)' : 'rgba(23,35,60,0.15)', borderRadius:100, position:'relative'}}><div style={{position:'absolute', top:2, left: r.toggle ? 18 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.15)'}}/></div>
                      : !r.danger && <Icon name="chevron-right" size={14} stroke="var(--muted)"/>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenG1Profile, ScreenG2Badges, ScreenG3History, ScreenG4Settings });
