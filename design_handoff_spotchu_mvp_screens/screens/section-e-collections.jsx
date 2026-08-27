/* Section E — 컬렉션 목록/상세/편집 */

function ScreenE1CollectionList() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:20, right:20, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>MY COLLECTIONS</div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:2}}>컬렉션</div>
        </div>
        <div style={{width:40, height:40, borderRadius:'50%', background:'var(--coral)', color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--sh-cta-coral)'}}><Icon name="plus" stroke="currentColor" strokeWidth={2.4}/></div>
      </div>
      {/* Segmented */}
      <div style={{position:'absolute', top:132, left:20, right:20, background:'var(--cream-2)', borderRadius:100, padding:4, display:'flex', fontFamily:'var(--font-ko)', fontSize:12, fontWeight:700}}>
        <div style={{flex:1, textAlign:'center', background:'#fff', borderRadius:100, padding:'8px 0', boxShadow:'var(--sh-card)', color:'var(--navy)'}}>내 컬렉션</div>
        <div style={{flex:1, textAlign:'center', padding:'8px 0', color:'var(--muted)'}}>큐레이션</div>
      </div>
      {/* Own collections */}
      <div style={{position:'absolute', top:200, left:14, right:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontFamily:'var(--font-ko)'}}>
        {COLLECTIONS.filter(c => c.isOwn).map(col => (
          <div key={col.id} style={{background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'var(--sh-card)'}}>
            <div style={{height:120, background: col.coverGrad, position:'relative'}}>
              <div style={{position:'absolute', bottom:-14, right:10, width:32, height:32, borderRadius:'50%', background:'#fff', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--sh-card)'}}>
                <Icon name="lock" size={14} stroke="var(--muted)"/>
              </div>
            </div>
            <div style={{padding:'14px 12px 12px'}}>
              <div style={{fontSize:12, fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)', lineHeight:1.3}}>{col.title}</div>
              <div style={{fontFamily:'var(--font-latin)', fontSize:10, color:'var(--muted)', marginTop:4}}>{col.itemCount}개 스팟</div>
            </div>
          </div>
        ))}
        <div style={{gridColumn:'1 / -1', height:100, border:'1.5px dashed var(--line-strong)', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, color:'var(--muted)'}}>
          <Icon name="plus" size={22} stroke="var(--muted)"/>
          <div style={{fontSize:12, fontWeight:600, fontFamily:'var(--font-ko)'}}>새 컬렉션 만들기</div>
        </div>
      </div>
      <TabBar active="collections"/>
    </MobileFrame>
  );
}

function ScreenE2CollectionListView() {
  const col = COLLECTIONS[0];
  const spotIds = ['mojik','suga-shrine','shibuya','harajuku'];
  return (
    <MobileFrame bg="var(--cream)" statusStyle="light">
      {/* Hero */}
      <div style={{position:'absolute', top:0, left:0, right:0, height:260, background: col.coverGrad, overflow:'hidden'}}>
        <div style={{position:'absolute', top:-40, right:-40, width:180, height:180, background:'radial-gradient(circle, rgba(255,249,242,0.35), transparent 65%)'}}/>
        <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between'}}>
          <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
          <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="more-horizontal"/></div>
        </div>
        <div style={{position:'absolute', bottom:52, left:20, right:20, color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', opacity:0.85}}>MY COLLECTION</div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:4, lineHeight:1.2}}>{col.title}</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:11, marginTop:6, opacity:0.85}}>{col.itemCount} spots · 지민 · 3박4일</div>
        </div>
      </div>
      {/* List/Map toggle */}
      <div style={{position:'absolute', top:232, left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:100, padding:4, boxShadow:'var(--sh-elevated)', display:'flex', gap:2, fontFamily:'var(--font-ko)', fontSize:12, fontWeight:700, zIndex:5}}>
        <div style={{background:'var(--navy)', color:'var(--cream)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="layers" size={14}/> 리스트</div>
        <div style={{background:'transparent', color:'var(--muted)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="map" size={14}/> 지도</div>
      </div>
      {/* Numbered spot list */}
      <div style={{position:'absolute', top:296, left:16, right:16, bottom:100, overflow:'hidden'}}>
        <div style={{display:'flex', flexDirection:'column', gap:10, fontFamily:'var(--font-ko)'}}>
          {spotIds.map((id, i) => {
            const s = SPOTS.find(x => x.id === id);
            return (
              <div key={id} style={{display:'flex', gap:12, alignItems:'center', background:'#fff', borderRadius:14, padding:'10px 12px', boxShadow:'var(--sh-card)'}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:'var(--cream-2)', color:'var(--coral)', fontFamily:'var(--font-latin)', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{i+1}</div>
                <div style={{width:52, height:52, borderRadius:10, background: s.thumbGrad, flexShrink:0}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.title}</div>
                  <div style={{fontSize:10, color:'var(--muted)', marginTop:2, display:'flex', alignItems:'center', gap:6}}>
                    <span>{s.categoryLabel}</span>
                    <span>·</span>
                    <span style={{fontFamily:'var(--font-latin)'}}>{s.subtitle.split(' · ')[0]}</span>
                  </div>
                </div>
                <div style={{color:'var(--muted)'}}><Icon name="more-horizontal" size={16}/></div>
              </div>
            );
          })}
          <div style={{textAlign:'center', color:'var(--muted)', fontSize:12, padding:'8px 0'}}>+ 6개 더 있음</div>
        </div>
      </div>
      <TabBar active="collections"/>
    </MobileFrame>
  );
}

function ScreenE3CollectionMap() {
  return (
    <MobileFrame bg="#DDE5EE" statusStyle="light">
      <MapBackground/>
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:10}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', borderRadius:100, padding:'10px 16px', fontFamily:'var(--font-ko)', fontSize:13, fontWeight:800, color:'var(--navy)', letterSpacing:'-0.01em'}}>도쿄 3박4일</div>
        <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="edit" size={18}/></div>
      </div>
      {/* Path lines */}
      <svg style={{position:'absolute', inset:0}} viewBox="0 0 390 844">
        <path d="M 100 260 L 200 320 L 280 400 L 200 520" stroke="#FF5F6D" strokeWidth="3" strokeDasharray="6 6" fill="none" opacity="0.7"/>
      </svg>
      {/* Numbered markers */}
      <MapMarker state="saved" x={26} y={30} badge="1" focused/>
      <MapMarker state="saved" x={51} y={38} badge="2"/>
      <MapMarker state="visited" x={72} y={47} badge="3"/>
      <MapMarker state="saved" x={51} y={62} badge="4"/>

      {/* Toggle */}
      <div style={{position:'absolute', top:236, left:'50%', transform:'translateX(-50%)', background:'#fff', borderRadius:100, padding:4, boxShadow:'var(--sh-elevated)', display:'flex', gap:2, fontFamily:'var(--font-ko)', fontSize:12, fontWeight:700, zIndex:9}}>
        <div style={{color:'var(--muted)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="layers" size={14}/> 리스트</div>
        <div style={{background:'var(--navy)', color:'var(--cream)', borderRadius:100, padding:'8px 16px', display:'inline-flex', alignItems:'center', gap:6}}><Icon name="map" size={14}/> 지도</div>
      </div>
      {/* Bottom carousel */}
      <div style={{position:'absolute', bottom:104, left:0, right:0, padding:'0 14px', display:'flex', gap:10, overflow:'hidden', zIndex:9}}>
        {['mojik','suga-shrine','shibuya'].map((id, i) => {
          const s = SPOTS.find(x => x.id === id);
          return (
            <div key={id} style={{flex:'0 0 260px', background:'#fff', borderRadius:16, padding:12, display:'flex', gap:10, alignItems:'center', boxShadow:'var(--sh-elevated)', fontFamily:'var(--font-ko)'}}>
              <div style={{position:'relative', width:56, height:56, borderRadius:12, background: s.thumbGrad, flexShrink:0}}>
                <div style={{position:'absolute', top:-6, left:-6, width:22, height:22, borderRadius:'50%', background:'var(--coral)', color:'var(--cream)', fontFamily:'var(--font-latin)', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center'}}>{i+1}</div>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:12, fontWeight:700, letterSpacing:'-0.01em', color:'var(--navy)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.title}</div>
                <div style={{fontSize:10, color:'var(--muted)', marginTop:2, fontFamily:'var(--font-latin)'}}>{s.subtitle.split(' · ')[0]}</div>
              </div>
            </div>
          );
        })}
      </div>
      <TabBar active="collections"/>
    </MobileFrame>
  );
}

function ScreenE4CreateCollection() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{fontSize:12, fontWeight:600, color:'var(--muted)'}}>취소</div>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.01em'}}>새 컬렉션</div>
        <div style={{fontSize:12, fontWeight:800, color:'var(--coral)'}}>저장</div>
      </div>
      {/* Cover picker */}
      <div style={{position:'absolute', top:120, left:20, right:20, height:140, borderRadius:22, background:'var(--grad-thumb)', position:'relative', display:'flex', alignItems:'flex-end', justifyContent:'flex-end', padding:14}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="camera" size={20}/></div>
      </div>
      <div style={{position:'absolute', top:280, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)', display:'flex', flexDirection:'column', gap:18}}>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6}}>Title</div>
          <input placeholder="예 · 도쿄 3박4일 사진 여행" style={{width:'100%', border:'none', borderBottom:'2px solid var(--coral)', outline:'none', padding:'8px 0', fontSize:18, fontWeight:700, fontFamily:'var(--font-ko)', letterSpacing:'-0.02em', color:'var(--navy)', background:'transparent'}} readOnly/>
        </div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6}}>Description (선택)</div>
          <div style={{border:'1px solid var(--line)', borderRadius:14, padding:14, minHeight:80, fontSize:13, color:'var(--muted)'}}>이 여행에 대한 짧은 메모를 남겨보세요</div>
        </div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8}}>Privacy</div>
          <div style={{display:'flex', gap:8}}>
            <div style={{flex:1, background:'var(--cream-2)', border:'1.5px solid var(--coral)', borderRadius:14, padding:'12px 14px'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700}}><Icon name="lock" size={16}/> 비공개</div>
              <div style={{fontSize:11, color:'var(--muted)', marginTop:4}}>나만 볼 수 있어요</div>
            </div>
            <div style={{flex:1, background:'#fff', border:'1px solid var(--line)', borderRadius:14, padding:'12px 14px'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:700}}><Icon name="share" size={16}/> 링크 공유</div>
              <div style={{fontSize:11, color:'var(--muted)', marginTop:4}}>링크가 있으면 열람 가능</div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenE1CollectionList, ScreenE2CollectionListView, ScreenE3CollectionMap, ScreenE4CreateCollection });
