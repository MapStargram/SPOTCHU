/* Section K — 웹 어드민 (검수 큐 · 스팟 상세 검수) — 데스크톱 1280×800 */

function AdminFrame({ children, active = 'queue' }) {
  const nav = [
    { id:'dashboard', label:'대시보드', icon:'grid' },
    { id:'queue', label:'검수 큐', icon:'layers', count:12 },
    { id:'spots', label:'스팟', icon:'map-pin' },
    { id:'works', label:'작품', icon:'star' },
    { id:'users', label:'사용자', icon:'users' },
    { id:'reports', label:'신고', icon:'alert-triangle', count:3 },
    { id:'settings', label:'설정', icon:'settings' },
  ];
  return (
    <div style={{width:1280, height:800, background:'var(--cream)', borderRadius:16, overflow:'hidden', boxShadow:'var(--sh-device)', fontFamily:'var(--font-ko)', color:'var(--navy)', display:'flex', flexShrink:0}}>
      {/* Sidebar */}
      <div style={{width:220, background:'var(--navy)', color:'var(--cream)', display:'flex', flexDirection:'column', padding:'22px 14px'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 6px 22px'}}>
          <img src="assets/logo/spotchu-symbol.svg" style={{width:32}}/>
          <div>
            <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em'}}>스팟츄</div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', opacity:0.7, textTransform:'uppercase'}}>Admin</div>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:2}}>
          {nav.map(n => (
            <div key={n.id} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:10,
              background: active === n.id ? 'rgba(255,249,242,0.1)' : 'transparent',
              color: active === n.id ? 'var(--cream)' : 'rgba(255,249,242,0.65)',
              fontSize:13, fontWeight: active === n.id ? 700 : 500, letterSpacing:'-0.01em',
            }}>
              <Icon name={n.icon} size={16} stroke="currentColor"/>
              <span style={{flex:1}}>{n.label}</span>
              {n.count && <span style={{background:'var(--coral)', color:'var(--cream)', fontSize:10, padding:'2px 6px', borderRadius:100, fontFamily:'var(--font-latin)', fontWeight:700}}>{n.count}</span>}
            </div>
          ))}
        </div>
        <div style={{marginTop:'auto', display:'flex', alignItems:'center', gap:10, padding:'10px 6px'}}>
          <div style={{width:32, height:32, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, fontFamily:'var(--font-latin)'}}>M</div>
          <div>
            <div style={{fontSize:12, fontWeight:700}}>Moderator</div>
            <div style={{fontSize:10, opacity:0.7}}>mod@spotchu.com</div>
          </div>
        </div>
      </div>
      {/* Main */}
      <div style={{flex:1, overflow:'hidden'}}>{children}</div>
    </div>
  );
}

function ScreenK1AdminQueue() {
  return (
    <AdminFrame active="queue">
      {/* Top bar */}
      <div style={{padding:'22px 28px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:11, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)', textTransform:'uppercase'}}>Moderation</div>
          <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginTop:4}}>통합 검수 큐</div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{width:280, background:'var(--cream)', borderRadius:100, padding:'10px 16px', display:'flex', alignItems:'center', gap:10, fontSize:13}}>
            <Icon name="search" size={16} stroke="var(--muted)"/>
            <span style={{color:'var(--muted)'}}>스팟 · 작품 · 사용자 검색</span>
          </div>
          <div style={{width:40, height:40, borderRadius:'50%', background:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="bell" size={18}/></div>
        </div>
      </div>
      {/* Metrics row */}
      <div style={{padding:'20px 28px 12px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
        {[
          { l:'대기 중', v:'12', d:'+3 오늘', color:'var(--coral)' },
          { l:'신고 처리 대기', v:'3', d:'긴급 1건', color:'var(--yellow)' },
          { l:'오늘 승인', v:'28', d:'평균 대기 4h', color:'var(--mint-deep)' },
          { l:'검증 승격 후보', v:'6', d:'자동 조건 충족', color:'var(--navy-2)' },
        ].map((m,i) => (
          <div key={i} style={{background:'#fff', borderRadius:14, padding:'14px 16px', border:'1px solid var(--line)'}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>{m.l}</div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:30, fontWeight:800, color: m.color, letterSpacing:'-0.03em', marginTop:4, lineHeight:1}}>{m.v}</div>
            <div style={{fontSize:11, color:'var(--muted)', marginTop:6}}>{m.d}</div>
          </div>
        ))}
      </div>
      {/* Filter tabs */}
      <div style={{padding:'6px 28px 12px', display:'flex', gap:8, alignItems:'center'}}>
        <div style={{background:'var(--navy)', color:'var(--cream)', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:700}}>전체 · 12</div>
        <div style={{background:'#fff', border:'1px solid var(--line)', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600}}>스팟 제보 · 6</div>
        <div style={{background:'#fff', border:'1px solid var(--line)', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600}}>신고 · 3</div>
        <div style={{background:'#fff', border:'1px solid var(--line)', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600}}>공식 승격 · 3</div>
        <div style={{marginLeft:'auto', fontSize:12, color:'var(--muted)'}}>정렬 · 우선순위 ▾</div>
      </div>
      {/* Table */}
      <div style={{padding:'0 28px', overflow:'hidden'}}>
        <div style={{background:'#fff', borderRadius:16, border:'1px solid var(--line)', overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'80px 130px 1fr 140px 100px 200px', gap:16, padding:'12px 20px', background:'var(--cream-2)', fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>
            <div>우선</div><div>유형</div><div>제목</div><div>제출자</div><div>시각</div><div style={{textAlign:'right'}}>액션</div>
          </div>
          {MODERATION_QUEUE.map((row, i) => {
            const prColor = row.priority === 'high' ? 'var(--coral)' : row.priority === 'mid' ? 'var(--yellow)' : 'var(--muted)';
            const prLabel = row.priority === 'high' ? '높음' : row.priority === 'mid' ? '중간' : '낮음';
            return (
              <div key={row.id} style={{display:'grid', gridTemplateColumns:'80px 130px 1fr 140px 100px 200px', gap:16, padding:'14px 20px', alignItems:'center', borderTop: i === 0 ? 'none' : '1px solid var(--line)'}}>
                <div style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color: prColor}}>
                  <span style={{width:6, height:6, borderRadius:'50%', background: prColor}}/> {prLabel}
                </div>
                <div style={{fontSize:12, fontWeight:600, color:'var(--navy-2)'}}>{row.type}</div>
                <div style={{fontSize:13, fontWeight:700, color:'var(--navy)', letterSpacing:'-0.01em'}}>{row.title}</div>
                <div style={{fontFamily:'var(--font-latin)', fontSize:11, color:'var(--muted)'}}>{row.reporter}</div>
                <div style={{fontFamily:'var(--font-latin)', fontSize:11, color:'var(--muted)'}}>{row.time}</div>
                <div style={{display:'flex', gap:6, justifyContent:'flex-end'}}>
                  <div style={{background:'var(--mint)', color:'var(--navy)', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700}}>승인</div>
                  <div style={{background:'#fff', border:'1px solid var(--line)', color:'var(--navy)', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700}}>반려</div>
                  <div style={{background:'#fff', border:'1px solid var(--line)', color:'var(--navy)', borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:700}}>상세</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminFrame>
  );
}

function ScreenK2AdminSpotReview() {
  return (
    <AdminFrame active="queue">
      <div style={{padding:'22px 28px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{color:'var(--muted)', display:'inline-flex', alignItems:'center'}}><Icon name="chevron-left" size={18}/></div>
          <div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:11, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)', textTransform:'uppercase'}}>Review · Spot Report</div>
            <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:2}}>롯데월드타워 63층 스카이덱</div>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <div style={{background:'var(--mint)', color:'var(--navy)', borderRadius:12, padding:'10px 18px', fontSize:13, fontWeight:800, letterSpacing:'-0.01em', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="check" size={16} stroke="currentColor" strokeWidth={2.4}/> 승인</div>
          <div style={{background:'#fff', border:'1px solid var(--line)', color:'var(--navy)', borderRadius:12, padding:'10px 18px', fontSize:13, fontWeight:700}}>수정 요청</div>
          <div style={{background:'#fff', border:'1px solid var(--coral)', color:'var(--coral)', borderRadius:12, padding:'10px 18px', fontSize:13, fontWeight:700}}>반려</div>
        </div>
      </div>
      {/* Two-column body */}
      <div style={{padding:'22px 28px', display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:22}}>
        {/* Left */}
        <div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16}}>
            <div style={{aspectRatio:'4/5', borderRadius:14, background:'linear-gradient(180deg, #FBEFE0 0%, #FF7A85 100%)'}}/>
            <div style={{aspectRatio:'4/5', borderRadius:14, background:'linear-gradient(180deg, #17233C 0%, #E24352 100%)'}}/>
          </div>
          {/* Mini map */}
          <div style={{height:220, borderRadius:14, overflow:'hidden', border:'1px solid var(--line)', position:'relative', background:'#DDE5EE'}}>
            <MapBackground/>
            <MapMarker state="default" x={52} y={44} focused/>
          </div>
        </div>
        {/* Right — meta */}
        <div>
          <div style={{background:'var(--cream-2)', borderRadius:16, padding:'16px 18px', marginBottom:14}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>Meta</div>
            <div style={{display:'grid', gridTemplateColumns:'80px 1fr', rowGap:8, columnGap:12, fontSize:12}}>
              {[
                ['카테고리', '🏯 랜드마크'],
                ['도시', '서울 · 송파구'],
                ['좌표', <span style={{fontFamily:'var(--font-latin)'}}>37.5125, 127.1025</span>],
                ['카메라 방향', '북서 315°'],
                ['추천 시간', '일몰 30분 전'],
                ['추천 렌즈', '24-70mm'],
                ['안전 태그', <span style={{color:'var(--mint-deep)'}}>✓ 유료 시설 · 안전</span>],
              ].map(([k,v], i) => (
                <React.Fragment key={i}>
                  <div style={{color:'var(--muted)', fontWeight:500}}>{k}</div>
                  <div style={{color:'var(--navy)', fontWeight:700}}>{v}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{background:'#fff', border:'1px solid var(--line)', borderRadius:16, padding:'16px 18px', marginBottom:14}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>Chu tip · 촬영 팁</div>
            <div style={{fontSize:12, color:'var(--navy)', lineHeight:1.65}}>
              해가 완전히 지기 30분 전이 골든타워. 유리에 실내조명 반사 방지를 위해 렌즈를 유리에 밀착시켜 촬영하세요. 삼각대 사용 불가 구역이라 손떨림 보정 렌즈 권장.
            </div>
          </div>
          <div style={{background:'#fff', border:'1px solid var(--line)', borderRadius:16, padding:'16px 18px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
              <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Reporter</div>
              <div style={{fontSize:10, color:'var(--mint-deep)', fontWeight:700}}>✓ TRUSTED_USER</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{width:36, height:36, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, fontFamily:'var(--font-latin)'}}>t</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700}}>user_842</div>
                <div style={{fontFamily:'var(--font-latin)', fontSize:11, color:'var(--muted)'}}>제보 24 · 승인율 96%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminFrame>
  );
}

Object.assign(window, { ScreenK1AdminQueue, ScreenK2AdminSpotReview });
