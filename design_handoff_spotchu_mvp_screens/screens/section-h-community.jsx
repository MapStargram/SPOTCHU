/* Section H — 커뮤니티 피드 & 사진 업로드 */

function ScreenH1CityFeed() {
  const posts = [
    { id:'p1', author:'현우', when:'2h', spot:'스가 신사 계단', spotId:'suga-shrine', likes:842, verified:true, gradient:'linear-gradient(180deg, #E24352 0%, #FFC857 100%)', caption:'저녁 5시 30분, 정확히 그 앵글로. 츄가 알려준 그대로 찍었어요.' },
    { id:'p2', author:'서연', when:'6h', spot:'시부야 스크램블', spotId:'shibuya', likes:412, verified:true, gradient:'linear-gradient(180deg, #17233C 0%, #E24352 100%)', caption:'스타벅스 2층 창가 자리. 신호 바뀌기 15초 전이 최고.' },
    { id:'p3', author:'지민', when:'1d', spot:'모지항', spotId:'mojik', likes:1210, verified:true, gradient:'linear-gradient(180deg, #FF7A85 0%, #FFC857 100%)', caption:'6시 30분 안개 걷힌 순간. 후지산 능선이 살짝 보여요.' },
  ];
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:5, fontFamily:'var(--font-ko)'}}>
        <div style={{display:'flex', flexDirection:'column'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>TOKYO · FEED</div>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)'}}>도쿄 피드</div>
        </div>
        <div style={{width:40, height:40, borderRadius:'50%', background:'var(--coral)', color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--sh-cta-coral)'}}><Icon name="camera" size={20} stroke="currentColor"/></div>
      </div>
      {/* Chips */}
      <div style={{position:'absolute', top:130, left:0, right:0, display:'flex', gap:8, overflowX:'auto', padding:'0 16px', zIndex:5}}>
        <Chip active dotColor="var(--yellow)">인기</Chip>
        <Chip dotColor="var(--mint)">방문 인증만</Chip>
        <Chip dotColor="var(--coral)">최신</Chip>
        <Chip dotColor="var(--navy-2)">팔로우</Chip>
      </div>
      {/* Posts */}
      <div style={{position:'absolute', top:180, left:0, right:0, bottom:88, overflow:'hidden'}}>
        <div style={{display:'flex', flexDirection:'column', gap:16, padding:'0 16px', fontFamily:'var(--font-ko)'}}>
          {posts.map(p => (
            <div key={p.id} style={{background:'#fff', borderRadius:20, overflow:'hidden', boxShadow:'var(--sh-card)'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, padding:'12px 14px'}}>
                <div style={{width:32, height:32, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, fontFamily:'var(--font-latin)'}}>{p.author.charAt(0)}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <span style={{fontSize:12, fontWeight:700, color:'var(--navy)'}}>{p.author}</span>
                    {p.verified && <TagPill variant="mint" style={{fontSize:9, padding:'2px 6px'}}>✓ 인증</TagPill>}
                  </div>
                  <div style={{fontSize:10, color:'var(--muted)', marginTop:1, fontFamily:'var(--font-latin)'}}>{p.when} · @ {p.spot}</div>
                </div>
                <Icon name="more-horizontal" size={16} stroke="var(--muted)"/>
              </div>
              <div style={{aspectRatio:'4/5', background: p.gradient, position:'relative'}}>
                <div style={{position:'absolute', top:12, left:12}}><TagPill variant="glass">@ {p.spot}</TagPill></div>
              </div>
              <div style={{padding:'10px 14px 14px'}}>
                <div style={{display:'flex', gap:14, alignItems:'center'}}>
                  <div style={{display:'flex', alignItems:'center', gap:5}}><Icon name="heart" size={20} stroke="var(--coral)" strokeWidth={2}/> <span style={{fontFamily:'var(--font-latin)', fontSize:12, fontWeight:700, color:'var(--navy)'}}>{p.likes}</span></div>
                  <Icon name="share" size={18} stroke="var(--navy)"/>
                  <div style={{marginLeft:'auto'}}><Icon name="bookmark" size={18} stroke="var(--navy)"/></div>
                </div>
                <div style={{fontSize:12, color:'var(--navy)', marginTop:8, lineHeight:1.5}}>
                  <b>{p.author}</b> · {p.caption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="explore"/>
    </MobileFrame>
  );
}

function ScreenH2Upload() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{fontSize:12, fontWeight:600, color:'var(--muted)'}}>취소</div>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.01em'}}>새 게시물</div>
        <div style={{fontSize:12, fontWeight:800, color:'var(--coral)'}}>공유</div>
      </div>
      {/* Photo grid */}
      <div style={{position:'absolute', top:110, left:16, right:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
        <div style={{aspectRatio:'1', borderRadius:14, background:'linear-gradient(180deg, #E24352 0%, #FFC857 100%)', position:'relative'}}>
          <div style={{position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', background:'var(--coral)', color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, fontFamily:'var(--font-latin)', boxShadow:'0 2px 6px rgba(0,0,0,0.25)'}}>1</div>
        </div>
        <div style={{aspectRatio:'1', borderRadius:14, background:'linear-gradient(135deg, #FF7A85 0%, #17233C 100%)', position:'relative'}}>
          <div style={{position:'absolute', top:6, right:6, width:22, height:22, borderRadius:'50%', background:'var(--coral)', color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, fontFamily:'var(--font-latin)', boxShadow:'0 2px 6px rgba(0,0,0,0.25)'}}>2</div>
        </div>
        <div style={{aspectRatio:'1', borderRadius:14, border:'1.5px dashed var(--line-strong)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, color:'var(--muted)'}}>
          <Icon name="plus" size={22}/>
          <div style={{fontSize:10, fontFamily:'var(--font-ko)', fontWeight:600}}>추가</div>
        </div>
      </div>
      {/* Linked spot */}
      <div style={{position:'absolute', top:270, left:16, right:16, background:'var(--cream-2)', borderRadius:16, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-ko)'}}>
        <div style={{width:44, height:44, borderRadius:12, background:'linear-gradient(180deg, #E24352 0%, #FFC857 100%)', flexShrink:0}}/>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Linked spot</div>
          <div style={{fontSize:13, fontWeight:700, color:'var(--navy)', marginTop:2, letterSpacing:'-0.01em'}}>스가 신사 계단</div>
          <div style={{display:'flex', alignItems:'center', gap:6, marginTop:2}}>
            <TagPill variant="mint" style={{fontSize:9, padding:'2px 6px'}}>✓ GPS 인증</TagPill>
            <span style={{fontSize:10, color:'var(--muted)'}}>1시간 전</span>
          </div>
        </div>
        <div style={{color:'var(--coral)', fontSize:12, fontWeight:700}}>변경</div>
      </div>
      {/* Caption */}
      <div style={{position:'absolute', top:362, left:20, right:20}}>
        <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8}}>Caption</div>
        <div style={{border:'1px solid var(--line)', borderRadius:14, padding:14, minHeight:120, fontFamily:'var(--font-ko)', fontSize:13, color:'var(--navy)', lineHeight:1.6}}>
          저녁 5시 30분, 정확히 그 앵글로.<br/>
          츄가 알려준 그대로 찍었어요.<br/>
          <span style={{color:'var(--muted)'}}>#너의이름은 #스가신사 #도쿄</span>
        </div>
      </div>
      {/* Verified toggle */}
      <div style={{position:'absolute', top:562, left:16, right:16, background:'#fff', border:'1px solid var(--line)', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, fontFamily:'var(--font-ko)'}}>
        <div style={{color:'var(--mint-deep)'}}><Icon name="check" size={20} stroke="currentColor" strokeWidth={2.4}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:12, fontWeight:700, color:'var(--navy)'}}>인증 사진 뱃지 표시</div>
          <div style={{fontSize:10, color:'var(--muted)', marginTop:2}}>GPS 인증한 스팟이라 자동 활성</div>
        </div>
        <div style={{width:38, height:22, background:'var(--mint)', borderRadius:100, position:'relative'}}><div style={{position:'absolute', top:2, left:18, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.15)'}}/></div>
      </div>
    </MobileFrame>
  );
}

function ScreenH3PostDetail() {
  return (
    <MobileFrame bg="var(--cream)" statusStyle="light">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:10}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="more-horizontal"/></div>
      </div>
      <div style={{position:'absolute', top:0, left:0, right:0, height:490, background:'linear-gradient(180deg, #E24352 0%, #FFC857 100%)'}}/>
      <div style={{position:'absolute', top:470, left:0, right:0, height:50, background:'linear-gradient(180deg, transparent 0%, var(--cream) 100%)'}}/>
      {/* Author overlay */}
      <div style={{position:'absolute', top:120, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ko)', color:'var(--cream)', zIndex:5}}>
        <div style={{width:36, height:36, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, fontFamily:'var(--font-latin)', border:'2px solid rgba(255,249,242,0.7)'}}>현</div>
        <div>
          <div style={{fontSize:12, fontWeight:700}}>현우</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, opacity:0.85, marginTop:1}}>2h · @ 스가 신사 계단</div>
        </div>
        <div style={{marginLeft:'auto', background:'rgba(255,249,242,0.9)', color:'var(--navy)', borderRadius:100, padding:'6px 14px', fontSize:11, fontWeight:700}}>팔로우</div>
      </div>
      <div style={{position:'absolute', top:180, left:16}}><TagPill variant="mint">✓ GPS 인증</TagPill></div>
      {/* Bottom content */}
      <div style={{position:'absolute', top:510, left:16, right:16, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:5}}>
            <Icon name="heart" size={24} stroke="var(--coral)"/>
            <span style={{fontFamily:'var(--font-latin)', fontSize:14, fontWeight:800}}>842</span>
          </div>
          <Icon name="share" size={22}/>
          <Icon name="bookmark" size={22}/>
        </div>
        <div style={{fontSize:13, marginTop:12, lineHeight:1.6}}>
          저녁 5시 30분, 정확히 그 앵글로.<br/>
          츄가 알려준 그대로 찍었어요. 계단 위쪽에서 뒤로 3발 물러나야 위 프레임에 맞아요.
        </div>
        {/* Linked spot */}
        <div style={{background:'var(--cream-2)', borderRadius:16, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, marginTop:14}}>
          <div style={{width:44, height:44, borderRadius:12, background:'linear-gradient(180deg, #E24352 0%, #FFC857 100%)', flexShrink:0}}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase'}}>Linked spot</div>
            <div style={{fontSize:13, fontWeight:700, marginTop:2}}>스가 신사 계단</div>
          </div>
          <CoralCTA small>보기 →</CoralCTA>
        </div>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenH1CityFeed, ScreenH2Upload, ScreenH3PostDetail });
