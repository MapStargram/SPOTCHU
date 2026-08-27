/* Section B — 홈 & 도시 & 작품 상세 */

// B1: 도시 선택
function ScreenB1CityPicker() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:64, left:24, right:24, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{fontFamily:'var(--font-latin)', fontSize:11, fontWeight:600, letterSpacing:'0.16em', color:'var(--coral)', textTransform:'uppercase'}}>WHERE TO</div>
        <div style={{fontSize:28, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.15, marginTop:8}}>어느 도시로<br/>떠나볼까요?</div>
        <div style={{fontSize:13, color:'var(--muted)', marginTop:8}}>MVP는 도쿄와 서울에서 시작해요</div>
      </div>
      <div style={{position:'absolute', top:220, left:24, right:24, display:'flex', flexDirection:'column', gap:14, fontFamily:'var(--font-ko)'}}>
        {CITIES.map(c => (
          <div key={c.id} style={{
            position:'relative', borderRadius:22, overflow:'hidden',
            height:180, background: c.heroGrad, color:'var(--cream)',
            boxShadow:'var(--sh-elevated)',
          }}>
            <div style={{position:'absolute', top:-20, right:-20, width:120, height:120, background:'radial-gradient(circle, rgba(255,249,242,0.3), transparent 70%)'}}/>
            <div style={{position:'absolute', top:18, left:20, right:20, display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', opacity:0.85}}>{c.nameEn}</div>
                <div style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, marginTop:4}}>{c.name}</div>
                <div style={{fontSize:11, opacity:0.85, marginTop:6}}>{c.country}</div>
              </div>
              <TagPill variant="glass">{c.spotCount}개 스팟</TagPill>
            </div>
            <div style={{position:'absolute', bottom:16, left:20, right:20, display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
              <div style={{fontSize:12, opacity:0.85}}>탐색 시작 →</div>
              <img src="assets/logo/spotchu-symbol.svg" style={{width:34, opacity:0.9}}/>
            </div>
          </div>
        ))}
        <div style={{border:'1px dashed var(--line-strong)', borderRadius:22, padding:'22px 16px', textAlign:'center', color:'var(--muted)', fontSize:12}}>
          🚧 더 많은 도시는 곧 열려요 · 오사카 · 교토 · 부산
        </div>
      </div>
    </MobileFrame>
  );
}

// Home layout — shared skeleton for B2 (Tokyo) and B3 (Seoul)
function HomeScreen({ city, spotIdsHero, spotIdsList, worksHighlight, tint }) {
  const c = CITIES.find(x => x.id === city);
  const heroSpot = SPOTS.find(s => s.id === spotIdsHero[0]);
  return (
    <MobileFrame bg="var(--cream)">
      {/* Top bar */}
      <div style={{position:'absolute', top:60, left:20, right:20, display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>{c.nameEn.toUpperCase()}</div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:6}}>
            {c.name} <Icon name="chevron-down" size={16}/>
          </div>
        </div>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <Icon name="bell"/>
        </div>
      </div>
      {/* Hero card */}
      <div style={{position:'absolute', top:130, left:16, right:16, height:196, borderRadius:22, overflow:'hidden', background: heroSpot.heroGrad, boxShadow:'var(--sh-elevated)'}}>
        <div style={{position:'absolute', top:-40, right:-40, width:160, height:160, background:'radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)'}}/>
        <div style={{position:'absolute', top:14, left:16}}><TagPill variant="glass">오늘의 스팟</TagPill></div>
        <div style={{position:'absolute', bottom:14, left:16, right:16, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
          <div style={{fontSize:19, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2}}>{heroSpot.title}</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:11, opacity:0.85, marginTop:4}}>{heroSpot.subtitle}</div>
        </div>
        <div style={{position:'absolute', top:14, right:16, display:'flex', gap:6, alignItems:'center', fontSize:11, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
          <Sparkle size={20}/>
        </div>
      </div>
      {/* Section: 큐레이션 컬렉션 */}
      <div style={{position:'absolute', top:346, left:0, right:0, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{padding:'0 20px', display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12}}>
          <div style={{fontSize:16, fontWeight:800, letterSpacing:'-0.02em'}}>큐레이션 컬렉션</div>
          <div style={{fontSize:11, color:'var(--muted)', fontWeight:600}}>더보기 →</div>
        </div>
        <div style={{display:'flex', gap:12, padding:'0 20px', overflow:'hidden'}}>
          {COLLECTIONS.filter(cx => cx.isOfficial).slice(0,2).map(col => (
            <div key={col.id} style={{
              flex:'0 0 160px', height:140, borderRadius:16,
              background: col.coverGrad, position:'relative', color:'var(--cream)',
              boxShadow:'var(--sh-card)', overflow:'hidden',
            }}>
              <div style={{position:'absolute', bottom:12, left:12, right:12}}>
                <div style={{fontSize:12, fontWeight:800, letterSpacing:'-0.01em', lineHeight:1.25}}>{col.title}</div>
                <div style={{fontFamily:'var(--font-latin)', fontSize:10, opacity:0.85, marginTop:3}}>{col.itemCount}개 스팟</div>
              </div>
              <div style={{position:'absolute', top:10, left:10}}><TagPill variant="yellow" style={{fontSize:9, padding:'2px 8px'}}>공식</TagPill></div>
            </div>
          ))}
        </div>
      </div>
      {/* Section: 인기 스팟 */}
      <div style={{position:'absolute', top:530, left:0, right:0, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{padding:'0 20px', display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12}}>
          <div style={{fontSize:16, fontWeight:800, letterSpacing:'-0.02em'}}>지금 인기 있는</div>
          <div style={{fontSize:11, color:'var(--muted)', fontWeight:600}}>전체 →</div>
        </div>
        <div style={{padding:'0 20px', display:'flex', flexDirection:'column', gap:12}}>
          {spotIdsList.map(id => {
            const s = SPOTS.find(x => x.id === id);
            return (
              <div key={id} style={{display:'flex', gap:12, alignItems:'center'}}>
                <div style={{width:60, height:60, borderRadius:14, background: s.thumbGrad, flexShrink:0, position:'relative'}}>
                  {s.verified === 'official' && <div style={{position:'absolute', bottom:-4, right:-4}}><Sparkle size={18}/></div>}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.title}</div>
                  <div style={{display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--muted)', marginTop:2}}>
                    <span>{s.categoryLabel}</span>
                    <span>·</span>
                    <span style={{fontFamily:'var(--font-latin)'}}>{s.visits.toLocaleString()}</span>
                  </div>
                </div>
                <Icon name="chevron-right" size={16} stroke="var(--muted)"/>
              </div>
            );
          })}
        </div>
      </div>
      <TabBar active="home"/>
    </MobileFrame>
  );
}

function ScreenB2HomeTokyo() { return <HomeScreen city="tokyo" spotIdsHero={['mojik']} spotIdsList={['suga-shrine','shibuya','harajuku']} tint="coral"/>; }
function ScreenB3HomeSeoul() { return <HomeScreen city="seoul" spotIdsHero={['namsan']} spotIdsList={['gyeongbok','seongsu','itaewon-danbam']} tint="mint"/>; }

// B4: 작품 상세 (애니 성지 강조)
function ScreenB4WorkDetail() {
  const w = WORKS.find(x => x.id === 'kimi-no-na');
  const progressPct = (w.progress / w.spotCount) * 100;
  const scenes = [
    { ep:'#7', title:'스가 신사 계단', label:'라스트씬', spotId:'suga-shrine', visited:true },
    { ep:'#3', title:'요츠야 역 앞 육교', label:'미츠하 상경', visited:true },
    { ep:'#9', title:'롯폰기 힐즈 전망대', label:'서로를 찾는 밤', visited:true },
    { ep:'#5', title:'신주쿠 스텝스', label:'출근길', visited:true },
    { ep:'#11', title:'뉴 스가모 신사', label:'재회', visited:false },
    { ep:'#2', title:'국립신미술관 계단', label:'디자인 미팅', visited:false },
  ];
  return (
    <MobileFrame bg="var(--cream)">
      {/* Hero */}
      <div style={{position:'absolute', top:0, left:0, right:0, height:280, background:'linear-gradient(180deg, #2E3F5E 0%, #17233C 100%)', overflow:'hidden'}}>
        <div style={{position:'absolute', top:-40, right:-40, width:220, height:220, background:'radial-gradient(circle, rgba(255,200,87,0.35), transparent 65%)'}}/>
        <div style={{position:'absolute', top:-40, left:-40, width:200, height:200, background:'radial-gradient(circle, rgba(69,214,198,0.3), transparent 65%)'}}/>
        {/* Nav */}
        <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
          <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
          <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="share"/></div>
        </div>
        {/* Title */}
        <div style={{position:'absolute', bottom:20, left:20, right:20, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
          <TagPill variant="glass" style={{marginBottom:10}}>⛩️ 애니 성지</TagPill>
          <div style={{fontSize:24, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.15}}>{w.title}</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:11, marginTop:4, opacity:0.85}}>Anime · 신카이 마코토 · 2016</div>
        </div>
      </div>
      {/* Progress card */}
      <div style={{position:'absolute', top:252, left:16, right:16, background:'#fff', borderRadius:20, padding:16, boxShadow:'var(--sh-elevated)', fontFamily:'var(--font-ko)', zIndex:2}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
          <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em', color:'var(--navy)'}}>성지순례 진행률</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:18, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.02em'}}>{w.progress}<span style={{fontSize:12, color:'var(--muted)'}}>/{w.spotCount}</span></div>
        </div>
        <div style={{height:8, borderRadius:100, background:'var(--cream-2)', overflow:'hidden'}}>
          <div style={{width:`${progressPct}%`, height:'100%', background:'var(--grad-body)', borderRadius:100}}/>
        </div>
        <div style={{marginTop:10, display:'flex', gap:8, alignItems:'center', fontSize:11, color:'var(--muted)'}}>
          <span style={{color:'var(--yellow)'}}>🌠</span>
          <span>전체 완주 시 <b style={{color:'var(--navy)'}}>너의 이름은. 마스터</b> 배지 획득</span>
        </div>
      </div>
      {/* Scenes list */}
      <div style={{position:'absolute', top:412, left:0, right:0, bottom:88, overflow:'hidden', fontFamily:'var(--font-ko)'}}>
        <div style={{padding:'0 20px 8px', fontSize:14, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)'}}>회차별 스팟</div>
        <div style={{padding:'0 20px', display:'flex', flexDirection:'column', gap:8}}>
          {scenes.map((sc, i) => (
            <div key={i} style={{display:'flex', gap:12, alignItems:'center', background: sc.visited ? 'var(--cream-2)' : '#fff', border: sc.visited ? 'none' : '1px solid var(--line)', borderRadius:14, padding:'10px 12px'}}>
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background: sc.visited ? 'var(--mint)' : '#fff',
                border: sc.visited ? 'none' : '1px solid var(--line)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--font-latin)', fontSize:11, fontWeight:800,
                color: sc.visited ? 'var(--navy)' : 'var(--muted)',
                flexShrink:0,
              }}>{sc.visited ? <Icon name="check" size={16} stroke="var(--navy)"/> : sc.ep}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:12, fontWeight:700, color:'var(--navy)', letterSpacing:'-0.01em'}}>{sc.title}</div>
                <div style={{fontSize:10, color:'var(--muted)', marginTop:2}}>{sc.ep} · {sc.label}</div>
              </div>
              {sc.visited ? <TagPill variant="mint" style={{fontSize:9, padding:'3px 8px'}}>인증</TagPill> : <Icon name="chevron-right" size={14} stroke="var(--muted)"/>}
            </div>
          ))}
        </div>
      </div>
      <TabBar/>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenB1CityPicker, ScreenB2HomeTokyo, ScreenB3HomeSeoul, ScreenB4WorkDetail });
