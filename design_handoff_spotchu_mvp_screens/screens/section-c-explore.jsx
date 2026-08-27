/* Section C — 탐색 (지도⇄피드) · 검색·필터 */

// C1: Map view
function ScreenC1Map() {
  return (
    <MobileFrame bg="#DDE5EE">
      <MapBackground/>
      {/* Top: Map/Feed toggle + search */}
      <div style={{position:'absolute', top:60, left:16, right:16, zIndex:10}}>
        <div style={{background:'#fff', borderRadius:20, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, boxShadow:'var(--sh-search)'}}>
          <Icon name="search" stroke="#17233C"/>
          <div style={{flex:1, fontSize:13, color:'var(--muted)', fontFamily:'var(--font-ko)'}}>어디에서 찍고 싶어요?</div>
          <div style={{width:32, height:32, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-latin)', fontWeight:700, fontSize:13}}>지</div>
        </div>
      </div>
      {/* Map/Feed segmented */}
      <div style={{position:'absolute', top:128, left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:100, padding:4, boxShadow:'var(--sh-card)', zIndex:10, display:'flex', gap:2, fontFamily:'var(--font-ko)', fontSize:12, fontWeight:700}}>
        <div style={{background:'var(--navy)', color:'var(--cream)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="map" size={14}/> 지도</div>
        <div style={{background:'transparent', color:'var(--muted)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="grid" size={14}/> 피드</div>
      </div>
      {/* Filter chips */}
      <div style={{position:'absolute', top:186, left:0, right:0, display:'flex', gap:8, overflowX:'auto', padding:'0 16px', zIndex:10}}>
        <Chip active dotColor="var(--yellow)">추천</Chip>
        <Chip dotColor="var(--mint)">애니 성지</Chip>
        <Chip dotColor="var(--coral)">드라마</Chip>
        <Chip dotColor="var(--navy-2)">랜드마크</Chip>
        <Chip dotColor="var(--yellow)"><Icon name="filter" size={12}/> 더보기</Chip>
      </div>
      {/* Markers */}
      <MapMarker state="verified" x={44} y={32} focused/>
      <MapMarker state="default" x={22} y={48}/>
      <MapMarker state="default" x={70} y={44} badge="7"/>
      <MapMarker state="saved" x={78} y={62}/>
      <MapMarker state="visited" x={32} y={70}/>
      <MapMarker state="default" x={54} y={54}/>
      {/* Current-location dot */}
      <div style={{position:'absolute', left:'50%', top:'56%', transform:'translate(-50%,-50%)', width:18, height:18, borderRadius:'50%', background:'var(--coral)', border:'3px solid #fff', boxShadow:'0 0 0 8px rgba(255,95,109,0.2)', zIndex:5}}/>
      {/* FAB */}
      <div style={{position:'absolute', bottom:242, right:16, zIndex:9, display:'flex', flexDirection:'column', gap:10}}>
        <div style={{width:48, height:48, borderRadius:'50%', background:'var(--coral)', color:'var(--cream)', boxShadow:'var(--sh-cta-coral)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="plus" stroke="currentColor"/></div>
        <div style={{width:48, height:48, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="crosshair" size={22}/></div>
      </div>
      {/* Spot preview card */}
      <div style={{position:'absolute', bottom:110, left:14, right:14, background:'#fff', borderRadius:22, padding:14, boxShadow:'var(--sh-elevated)', display:'flex', gap:12, zIndex:9}}>
        <div style={{width:78, height:78, borderRadius:16, background: SPOTS[0].thumbGrad, flexShrink:0, position:'relative'}}>
          <div style={{position:'absolute', bottom:6, right:6}}><Sparkle/></div>
        </div>
        <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:3, fontFamily:'var(--font-ko)'}}>
          <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)'}}>{SPOTS[0].title}</div>
          <div style={{fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:4}}>
            <Icon name="map-pin" size={10} stroke="var(--coral)"/> Shizuoka · Japan
          </div>
          <VerifBadge level="official"/>
          <div style={{marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, color:'var(--muted)'}}>1,248 방문</div>
            <CoralCTA small>앵글 보기 →</CoralCTA>
          </div>
        </div>
      </div>
      <TabBar active="explore"/>
    </MobileFrame>
  );
}

// C2: Feed view
function ScreenC2Feed() {
  const feedSpots = ['mojik','suga-shrine','shibuya','namsan','gyeongbok','seongsu','itaewon-danbam','harajuku'];
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, zIndex:10}}>
        <div style={{background:'#fff', borderRadius:20, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, boxShadow:'var(--sh-search)'}}>
          <Icon name="search" stroke="#17233C"/>
          <div style={{flex:1, fontSize:13, color:'var(--muted)', fontFamily:'var(--font-ko)'}}>어디에서 찍고 싶어요?</div>
          <Icon name="filter" size={20}/>
        </div>
      </div>
      <div style={{position:'absolute', top:128, left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:100, padding:4, boxShadow:'var(--sh-card)', zIndex:10, display:'flex', gap:2, fontFamily:'var(--font-ko)', fontSize:12, fontWeight:700}}>
        <div style={{color:'var(--muted)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="map" size={14}/> 지도</div>
        <div style={{background:'var(--navy)', color:'var(--cream)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="grid" size={14}/> 피드</div>
      </div>
      <div style={{position:'absolute', top:186, left:0, right:0, display:'flex', gap:8, overflowX:'auto', padding:'0 16px', zIndex:10}}>
        <Chip active dotColor="var(--yellow)">전체</Chip>
        <Chip dotColor="var(--coral)">인기순</Chip>
        <Chip dotColor="var(--mint)">거리순</Chip>
        <Chip dotColor="var(--navy-2)">최신순</Chip>
      </div>
      {/* Grid */}
      <div style={{position:'absolute', top:236, left:14, right:14, bottom:100, overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontFamily:'var(--font-ko)'}}>
          {feedSpots.map(id => {
            const s = SPOTS.find(x => x.id === id);
            return (
              <div key={id} style={{borderRadius:16, overflow:'hidden', background:'#fff', boxShadow:'var(--sh-card)'}}>
                <div style={{aspectRatio:'4/5', background: s.thumbGrad, position:'relative'}}>
                  <div style={{position:'absolute', top:8, left:8}}><TagPill variant="glass" style={{fontSize:9, padding:'2px 8px'}}>{s.categoryLabel}</TagPill></div>
                  <div style={{position:'absolute', top:8, right:8, width:26, height:26, borderRadius:'50%', background:'rgba(255,249,242,0.85)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <Icon name="heart" size={14} stroke="var(--navy)"/>
                  </div>
                  {s.verified === 'official' && <div style={{position:'absolute', bottom:6, right:6}}><Sparkle size={18}/></div>}
                </div>
                <div style={{padding:'10px 10px 12px'}}>
                  <div style={{fontSize:12, fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitBoxOrient:'vertical', WebkitLineClamp:2}}>{s.title}</div>
                  <div style={{fontFamily:'var(--font-latin)', fontSize:10, color:'var(--muted)', marginTop:4}}>{s.visits.toLocaleString()} 방문</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <TabBar active="explore"/>
    </MobileFrame>
  );
}

// C3: Search entry
function ScreenC3Search() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', gap:10, alignItems:'center', zIndex:10}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><Icon name="chevron-left"/></div>
        <div style={{flex:1, background:'#fff', borderRadius:20, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, boxShadow:'var(--sh-card)'}}>
          <Icon name="search" size={18} stroke="#17233C"/>
          <input placeholder="스팟, 작품, 지역 검색" style={{border:'none', outline:'none', flex:1, fontSize:13, fontFamily:'var(--font-ko)', background:'transparent', color:'var(--navy)'}} readOnly/>
          <div style={{fontSize:11, color:'var(--muted)', fontFamily:'var(--font-ko)', fontWeight:600}}>취소</div>
        </div>
      </div>
      <div style={{position:'absolute', top:130, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10}}>
          <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em'}}>최근 검색</div>
          <div style={{fontSize:11, color:'var(--muted)', fontWeight:600}}>전체 삭제</div>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {RECENT_SEARCHES.map(q => (
            <div key={q} style={{background:'#fff', border:'1px solid var(--line)', borderRadius:100, padding:'8px 14px 8px 12px', fontSize:12, fontWeight:500, display:'inline-flex', alignItems:'center', gap:6}}>
              <Icon name="search" size={12} stroke="var(--muted)"/> {q}
              <Icon name="close" size={12} stroke="var(--muted)"/>
            </div>
          ))}
        </div>
      </div>
      <div style={{position:'absolute', top:280, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em', marginBottom:10}}>지금 뜨는 검색어</div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          {TRENDING.map((q, i) => (
            <div key={q} style={{display:'flex', alignItems:'center', gap:12, padding:'8px 4px'}}>
              <div style={{fontFamily:'var(--font-latin)', fontSize:14, fontWeight:800, color: i < 3 ? 'var(--coral)' : 'var(--muted)', width:20}}>{String(i+1).padStart(2,'0')}</div>
              <div style={{flex:1, fontSize:13, fontWeight:600, color:'var(--navy)'}}>{q}</div>
              {i < 2 && <TagPill variant="yellow" style={{fontSize:9, padding:'2px 6px'}}>UP</TagPill>}
            </div>
          ))}
        </div>
      </div>
      <TabBar active="explore"/>
    </MobileFrame>
  );
}

// C4: Filter sheet
function ScreenC4Filter() {
  return (
    <MobileFrame bg="rgba(23,35,60,0.35)">
      <div style={{position:'absolute', top:0, left:0, right:0, bottom:0, background:'rgba(23,35,60,0.5)'}}/>
      <div style={{position:'absolute', bottom:0, left:0, right:0, background:'var(--cream)', borderTopLeftRadius:28, borderTopRightRadius:28, padding:'20px 22px 30px', fontFamily:'var(--font-ko)', color:'var(--navy)', maxHeight:'82%', overflow:'hidden'}}>
        <div style={{width:40, height:4, borderRadius:100, background:'var(--line-strong)', margin:'0 auto 16px'}}/>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:20}}>
          <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>필터</div>
          <div style={{fontSize:12, color:'var(--coral)', fontWeight:700}}>초기화</div>
        </div>
        {/* Category */}
        <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>Category</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:22}}>
          {['🏯 랜드마크','⛩️ 애니 성지','🎬 드라마','✨ 포토 스팟','🌸 계절'].map((c,i) => (
            <div key={c} style={{border: i < 2 ? '1.5px solid var(--coral)' : '1px solid var(--line)', background: i < 2 ? 'var(--cream-2)' : '#fff', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600, color:'var(--navy)'}}>{c}</div>
          ))}
        </div>
        {/* Verification */}
        <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>검증 상태</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:22}}>
          {['공식 인증','사용자 검증','제보'].map((c,i) => (
            <div key={c} style={{border: i === 0 ? '1.5px solid var(--coral)' : '1px solid var(--line)', background: i === 0 ? 'var(--cream-2)' : '#fff', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600, color:'var(--navy)'}}>{c}</div>
          ))}
        </div>
        {/* Time */}
        <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:10}}>추천 시간대</div>
        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:22}}>
          {['🌅 일출','☀️ 낮','🌇 일몰','🌙 야경'].map((c,i) => (
            <div key={c} style={{border: i === 2 ? '1.5px solid var(--coral)' : '1px solid var(--line)', background: i === 2 ? 'var(--cream-2)' : '#fff', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600, color:'var(--navy)'}}>{c}</div>
          ))}
        </div>
        {/* Nearby toggle */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--cream-2)', borderRadius:14, padding:'12px 14px', marginBottom:18}}>
          <div>
            <div style={{fontSize:13, fontWeight:700, letterSpacing:'-0.01em'}}>지금 내 주변</div>
            <div style={{fontSize:11, color:'var(--muted)', marginTop:2}}>현재 위치 반경 2km 이내</div>
          </div>
          <div style={{width:44, height:26, background:'var(--mint)', borderRadius:100, position:'relative'}}>
            <div style={{position:'absolute', top:2, left:20, width:22, height:22, borderRadius:'50%', background:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.15)'}}/>
          </div>
        </div>
        <CoralCTA style={{width:'100%'}}>스팟 42개 보기</CoralCTA>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenC1Map, ScreenC2Feed, ScreenC3Search, ScreenC4Filter });
