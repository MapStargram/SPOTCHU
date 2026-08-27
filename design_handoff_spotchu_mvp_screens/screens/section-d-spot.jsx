/* Section D — 스팟 상세 + 비교 슬라이더 + 저장 시트 */

// D1: Spot detail — hero + stats
function ScreenD1SpotHero() {
  const s = SPOTS.find(x => x.id === 'suga-shrine');
  return (
    <MobileFrame bg="var(--cream)" statusStyle="light">
      {/* Hero */}
      <div style={{position:'absolute', top:0, left:0, right:0, height:360, background: s.heroGrad, overflow:'hidden'}}>
        <div style={{position:'absolute', top:-60, right:-60, width:280, height:280, background:'radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)'}}/>
        <div style={{position:'absolute', bottom:-80, left:-60, width:260, height:260, background:'radial-gradient(circle, rgba(69,214,198,0.45), transparent 65%)'}}/>
        {/* Nav */}
        <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
          <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
          <div style={{display:'flex', gap:8}}>
            <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="share"/></div>
            <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="heart"/></div>
          </div>
        </div>
        {/* Hero text */}
        <div style={{position:'absolute', bottom:56, left:20, right:20, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
          <div style={{display:'flex', gap:6, marginBottom:10}}>
            <TagPill variant="glass">⛩️ 애니 성지</TagPill>
            <TagPill variant="glass">공식 인증</TagPill>
          </div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2}}>{s.title}</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:11, marginTop:4, opacity:0.85}}>{s.subtitle}</div>
        </div>
      </div>
      {/* Stats card */}
      <div style={{position:'absolute', top:328, left:16, right:16, background:'#fff', borderRadius:16, padding:'14px 16px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, textAlign:'center', boxShadow:'var(--sh-elevated)', zIndex:6}}>
        {[
          {v:s.rating.toString(), l:'RATING'},
          {v:s.visits.toLocaleString(), l:'VISITS'},
          {v:s.saves.toLocaleString(), l:'SAVES'},
        ].map((it,i) => (
          <div key={i} style={{borderLeft: i > 0 ? '1px solid var(--line)' : 'none'}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:18, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.02em'}}>{it.v}</div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:2}}>{it.l}</div>
          </div>
        ))}
      </div>
      {/* Related work */}
      <div style={{position:'absolute', top:420, left:16, right:16, background:'var(--cream-2)', borderRadius:16, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-ko)'}}>
        <div style={{width:44, height:44, borderRadius:10, background:'linear-gradient(135deg, #E24352 0%, #FFC857 100%)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>⛩️</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Anime · Scene</div>
          <div style={{fontSize:12, fontWeight:700, color:'var(--navy)', marginTop:2, letterSpacing:'-0.01em'}}>너의 이름은. · #7 라스트씬</div>
        </div>
        <Icon name="chevron-right" size={16} stroke="var(--muted)"/>
      </div>
      {/* Angle guide preview */}
      <div style={{position:'absolute', top:496, left:20, right:20, fontFamily:'var(--font-ko)'}}>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)', display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
          <span style={{width:6, height:6, background:'var(--coral)', borderRadius:'50%'}}/> 각도 가이드
        </div>
        <div style={{fontSize:12, color:'var(--muted)', lineHeight:1.65}}>
          카메라를 <b style={{color:'var(--navy)'}}>{s.angle}</b> 방향으로 살짝 낮게 세팅하세요. {s.lens} 렌즈가 이상적입니다. {s.tip}
        </div>
      </div>
      {/* Action row */}
      <div style={{position:'absolute', bottom:24, left:16, right:16, display:'flex', gap:10}}>
        <CoralCTA style={{flex:1}}>체크인 하고 수집하기</CoralCTA>
        <div style={{width:52, height:52, background:'#fff', border:'1px solid var(--line)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="bookmark" size={22}/></div>
      </div>
    </MobileFrame>
  );
}

// D2: Compare slider — WORKING drag
function ScreenD2CompareSlider() {
  const [pct, setPct] = React.useState(50);
  const containerRef = React.useRef(null);
  const dragRef = React.useRef(false);

  const move = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPct(p);
  };
  const start = (e) => {
    dragRef.current = true;
    move(e.touches ? e.touches[0].clientX : e.clientX);
    e.preventDefault();
  };
  const end = () => { dragRef.current = false; };
  const drag = (e) => {
    if (!dragRef.current) return;
    move(e.touches ? e.touches[0].clientX : e.clientX);
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', drag);
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('mousemove', drag);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', drag);
      window.removeEventListener('touchend', end);
    };
  }, []);

  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)', fontFamily:'var(--font-ko)', display:'flex', alignItems:'center'}}>비교 · 원본 vs 내 사진</div>
        <div style={{width:40}}/>
      </div>
      {/* Slider area */}
      <div
        ref={containerRef}
        onMouseDown={start}
        onTouchStart={start}
        style={{
          position:'absolute', top:120, left:16, right:16, height:440,
          borderRadius:20, overflow:'hidden', cursor:'ew-resize',
          userSelect:'none', touchAction:'none',
          boxShadow:'var(--sh-elevated)',
        }}
      >
        {/* Below = 내 사진 */}
        <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, #FBEFE0 0%, #FF7A85 60%, #E24352 100%)'}}>
          <div style={{position:'absolute', top:14, right:14}}><TagPill variant="coral">내 사진</TagPill></div>
          <div style={{position:'absolute', bottom:20, left:20, right:20, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
            <div style={{fontSize:11, opacity:0.85}}>2026.09.14 · 오후 5:34</div>
            <div style={{fontSize:15, fontWeight:700, letterSpacing:'-0.01em', marginTop:2}}>수가 신사 계단에서</div>
          </div>
        </div>
        {/* Above = 대표 (clipped by width) */}
        <div style={{position:'absolute', inset:0, width:`${pct}%`, overflow:'hidden', background:'linear-gradient(180deg, #E24352 0%, #17233C 100%)'}}>
          <div style={{position:'absolute', top:0, left:0, width:`${100 / (pct / 100)}%`, height:'100%'}}>
            <div style={{position:'absolute', inset:0, background:'linear-gradient(180deg, #E24352 0%, #17233C 100%)'}}>
              <div style={{position:'absolute', top:14, left:14}}><TagPill variant="navy">대표 사진</TagPill></div>
              <div style={{position:'absolute', bottom:20, left:20, right:20, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
                <div style={{fontSize:11, opacity:0.85}}>공식 대표 · 노을</div>
                <div style={{fontSize:15, fontWeight:700, letterSpacing:'-0.01em', marginTop:2}}>스가 신사 라스트씬 앵글</div>
              </div>
            </div>
          </div>
        </div>
        {/* Divider */}
        <div style={{position:'absolute', top:0, bottom:0, left:`${pct}%`, width:3, background:'#FFF9F2', boxShadow:'0 0 12px rgba(0,0,0,0.35)', transform:'translateX(-50%)', pointerEvents:'none'}}/>
        <div style={{position:'absolute', top:'50%', left:`${pct}%`, transform:'translate(-50%, -50%)', width:44, height:44, borderRadius:'50%', background:'#FFF9F2', boxShadow:'0 6px 16px rgba(0,0,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:2, pointerEvents:'none'}}>
          <Icon name="chevron-left" size={14} stroke="var(--navy)"/>
          <Icon name="chevron-right" size={14} stroke="var(--navy)"/>
        </div>
      </div>
      {/* Hint */}
      <div style={{position:'absolute', top:576, left:0, right:0, textAlign:'center', fontSize:11, color:'var(--muted)', fontFamily:'var(--font-ko)'}}>
        가운데 핸들을 좌우로 드래그해서 비교해 보세요
      </div>
      {/* Meta */}
      <div style={{position:'absolute', top:614, left:20, right:20, display:'flex', gap:14, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{flex:1, background:'#fff', borderRadius:14, padding:'10px 12px', boxShadow:'var(--sh-card)'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Angle</div>
          <div style={{fontSize:13, fontWeight:800, marginTop:2, letterSpacing:'-0.01em'}}>북서 45°</div>
        </div>
        <div style={{flex:1, background:'#fff', borderRadius:14, padding:'10px 12px', boxShadow:'var(--sh-card)'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Lens</div>
          <div style={{fontSize:13, fontWeight:800, marginTop:2, letterSpacing:'-0.01em'}}>35mm</div>
        </div>
        <div style={{flex:1, background:'#fff', borderRadius:14, padding:'10px 12px', boxShadow:'var(--sh-card)'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Time</div>
          <div style={{fontSize:13, fontWeight:800, marginTop:2, letterSpacing:'-0.01em'}}>PM 5:00</div>
        </div>
      </div>
    </MobileFrame>
  );
}

// D3: Related work + reviews
function ScreenD3SpotBottom() {
  const s = SPOTS.find(x => x.id === 'namsan');
  const reviews = [
    { name:'현우', when:'2026.09.12', body:'삼각대 필수. 일몰 30분 후 하늘색이 진짜 매직. 남산 케이블카 늦은 시간 대기 짧아요.', hasPhoto:true },
    { name:'서연', when:'2026.09.08', body:'저는 조금 늦게 도착해서 살짝 어두웠어요. 다음엔 30분 일찍 갈래요!' },
    { name:'지민', when:'2026.09.02', body:'전망대 유료 층 말고 무료 전망대에서도 각도 잘 나옵니다.', hasPhoto:true },
  ];
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{fontFamily:'var(--font-ko)', fontSize:14, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)', display:'flex', alignItems:'center'}}>{s.title}</div>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="share"/></div>
      </div>
      {/* Chu tip */}
      <div style={{position:'absolute', top:120, left:20, right:20, background:'var(--cream-2)', borderRadius:16, padding:'14px 16px', display:'flex', gap:12, alignItems:'center', fontFamily:'var(--font-ko)'}}>
        <img src="assets/mascot/chu-expression-focused.svg" style={{width:52, height:52}}/>
        <div style={{fontSize:12, lineHeight:1.5}}>
          <div style={{fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)'}}>츄의 팁</div>
          <div style={{color:'var(--muted)', marginTop:2}}>일몰 30분 후 하늘이 남색일 때가 매직 아워. 삼각대 필수예요.</div>
        </div>
      </div>
      {/* Meta */}
      <div style={{position:'absolute', top:224, left:20, right:20, background:'#fff', borderRadius:16, padding:'14px 16px', boxShadow:'var(--sh-card)', fontFamily:'var(--font-ko)'}}>
        <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>Meta</div>
        <div style={{display:'grid', gridTemplateColumns:'80px 1fr', rowGap:8, columnGap:12, fontSize:12}}>
          {[
            ['카메라 방향', s.angle],
            ['추천 렌즈', s.lens],
            ['추천 시간', '일몰 30분 후'],
            ['난이도', '⭐️ 쉬움'],
            ['혼잡도', '주말 매우 붐빔'],
          ].map(([k,v]) => (
            <React.Fragment key={k}>
              <div style={{color:'var(--muted)', fontWeight:500}}>{k}</div>
              <div style={{color:'var(--navy)', fontWeight:700}}>{v}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Reviews */}
      <div style={{position:'absolute', top:406, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
          <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em'}}>방문자의 사진 · <span style={{color:'var(--coral)'}}>2,841</span></div>
          <div style={{fontSize:11, color:'var(--muted)', fontWeight:600}}>전체 →</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {reviews.map((r,i) => (
            <div key={i} style={{background:'#fff', borderRadius:14, padding:'12px 14px', boxShadow:'var(--sh-card)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:24, height:24, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, fontFamily:'var(--font-latin)'}}>{r.name.charAt(0)}</div>
                  <div style={{fontSize:12, fontWeight:700}}>{r.name}</div>
                  {r.hasPhoto && <TagPill variant="mint" style={{fontSize:9, padding:'2px 6px'}}>✓ 인증</TagPill>}
                </div>
                <div style={{fontFamily:'var(--font-latin)', fontSize:10, color:'var(--muted)'}}>{r.when}</div>
              </div>
              <div style={{fontSize:12, color:'var(--navy)', lineHeight:1.55}}>{r.body}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position:'absolute', bottom:24, left:16, right:16, display:'flex', gap:10}}>
        <CoralCTA style={{flex:1}}>체크인 하고 수집하기</CoralCTA>
        <div style={{width:52, height:52, background:'var(--coral)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--cream)'}}><Icon name="heart" stroke="var(--cream)" strokeWidth={2.4}/></div>
      </div>
    </MobileFrame>
  );
}

// D4: Save-to-collection sheet
function ScreenD4SaveSheet() {
  return (
    <MobileFrame bg="rgba(23,35,60,0.35)">
      <div style={{position:'absolute', inset:0, background:'rgba(23,35,60,0.5)'}}/>
      <div style={{position:'absolute', bottom:0, left:0, right:0, background:'var(--cream)', borderTopLeftRadius:28, borderTopRightRadius:28, padding:'20px 22px 30px', fontFamily:'var(--font-ko)', color:'var(--navy)', maxHeight:'75%'}}>
        <div style={{width:40, height:4, borderRadius:100, background:'var(--line-strong)', margin:'0 auto 16px'}}/>
        <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>컬렉션에 저장</div>
        <div style={{fontSize:12, color:'var(--muted)', marginTop:2}}>모지항에서 본 후지산</div>

        <div style={{marginTop:18, display:'flex', alignItems:'center', gap:12, background:'var(--coral)', color:'var(--cream)', padding:'12px 14px', borderRadius:14, boxShadow:'var(--sh-cta-coral)'}}>
          <div style={{width:36, height:36, borderRadius:10, background:'rgba(255,249,242,0.2)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="plus" stroke="var(--cream)"/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em'}}>새 컬렉션 만들기</div>
            <div style={{fontSize:11, opacity:0.85, marginTop:2}}>여행 계획을 새로 시작해요</div>
          </div>
        </div>

        <div style={{marginTop:16, fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>My Collections</div>
        <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:280, overflow:'hidden'}}>
          {COLLECTIONS.filter(c => c.isOwn).map((col,i) => (
            <div key={col.id} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 4px'}}>
              <div style={{width:52, height:52, borderRadius:12, background: col.coverGrad, flexShrink:0}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, letterSpacing:'-0.01em'}}>{col.title}</div>
                <div style={{fontSize:11, color:'var(--muted)', marginTop:2}}>{col.itemCount}개 스팟</div>
              </div>
              <div style={{width:26, height:26, borderRadius:8, border: i === 0 ? 'none' : '1.5px solid var(--line-strong)', background: i === 0 ? 'var(--coral)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {i === 0 && <Icon name="check" size={14} stroke="var(--cream)" strokeWidth={2.4}/>}
              </div>
            </div>
          ))}
        </div>

        <CoralCTA style={{width:'100%', marginTop:16}}>저장 · 1개 선택됨</CoralCTA>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenD1SpotHero, ScreenD2CompareSlider, ScreenD3SpotBottom, ScreenD4SaveSheet });
