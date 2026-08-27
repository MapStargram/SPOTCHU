/* Section I — 스팟 제보 등록 */

function ScreenI1PickLocation() {
  return (
    <MobileFrame bg="#DDE5EE" statusStyle="light">
      <MapBackground/>
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:10}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="close"/></div>
        <div style={{background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)', borderRadius:100, padding:'10px 16px', fontFamily:'var(--font-ko)', fontSize:13, fontWeight:800, color:'var(--navy)'}}>스팟 제보 · 1 / 2</div>
        <div style={{width:40}}/>
      </div>
      {/* Central marker */}
      <div style={{position:'absolute', top:'44%', left:'50%', transform:'translate(-50%, -100%)', zIndex:6, animation:'chubob 2s ease-in-out infinite'}}>
        <img src="assets/map-markers/marker-default.svg" style={{width:64, filter:'drop-shadow(0 8px 16px rgba(23,35,60,0.4))'}}/>
      </div>
      <div style={{position:'absolute', top:'44%', left:'50%', transform:'translate(-50%, 6px)', width:44, height:12, background:'rgba(23,35,60,0.15)', borderRadius:'50%', filter:'blur(4px)', zIndex:5}}/>
      {/* Hint card */}
      <div style={{position:'absolute', top:170, left:16, right:16, background:'#fff', borderRadius:16, padding:'12px 14px', display:'flex', gap:10, alignItems:'center', boxShadow:'var(--sh-elevated)', fontFamily:'var(--font-ko)', zIndex:5}}>
        <img src="assets/mascot/chu-expression-curious.svg" style={{width:44, height:44}}/>
        <div style={{flex:1, fontSize:12, color:'var(--navy)', lineHeight:1.5}}>
          지도를 움직여 <b style={{color:'var(--coral)'}}>촬영자가 서는 위치</b>에 핀을 놓아주세요. 촬영 대상이 아니에요!
        </div>
      </div>
      {/* Bottom */}
      <div style={{position:'absolute', bottom:24, left:16, right:16, background:'#fff', borderRadius:20, padding:'14px 16px', boxShadow:'var(--sh-elevated)', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <Icon name="map-pin" size={16} stroke="var(--coral)"/>
          <div style={{fontSize:12, fontWeight:700}}>선택된 위치</div>
        </div>
        <div style={{fontFamily:'var(--font-latin)', fontSize:12, color:'var(--muted)', marginBottom:12}}>Jongno-gu, Seoul · 37.5796, 126.9770</div>
        <div style={{display:'flex', gap:10}}>
          <div style={{flex:1, background:'#fff', border:'1px solid var(--line)', borderRadius:14, padding:'12px 14px', textAlign:'center', fontSize:13, fontWeight:700, color:'var(--navy)'}}>현재 위치 사용</div>
          <CoralCTA style={{flex:1.4}}>다음 →</CoralCTA>
        </div>
      </div>
    </MobileFrame>
  );
}

function ScreenI2Form() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.01em'}}>스팟 정보 · 2 / 2</div>
        <div style={{fontSize:12, fontWeight:800, color:'var(--muted)'}}>임시저장</div>
      </div>
      <div style={{position:'absolute', top:120, left:20, right:20, bottom:100, overflow:'hidden', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:18}}>
          {/* Photo upload */}
          <div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8}}>Photo <span style={{color:'var(--coral)'}}>*</span></div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
              <div style={{aspectRatio:'1', borderRadius:12, background:'linear-gradient(135deg, #FBEFE0 0%, #FF7A85 100%)'}}/>
              <div style={{aspectRatio:'1', borderRadius:12, border:'1.5px dashed var(--line-strong)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)'}}><Icon name="plus" size={20}/></div>
              <div style={{aspectRatio:'1', borderRadius:12, border:'1.5px dashed var(--line-strong)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)'}}><Icon name="plus" size={20}/></div>
            </div>
          </div>
          {/* Name */}
          <div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:6}}>스팟 이름 <span style={{color:'var(--coral)'}}>*</span></div>
            <input placeholder="예 · 성수동 붉은벽돌 골목" style={{width:'100%', background:'#fff', border:'1px solid var(--line)', borderRadius:14, padding:'12px 14px', fontSize:14, fontFamily:'var(--font-ko)', color:'var(--navy)', outline:'none'}} readOnly/>
          </div>
          {/* Category */}
          <div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8}}>카테고리 <span style={{color:'var(--coral)'}}>*</span></div>
            <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
              {['🏯 랜드마크','⛩️ 애니 성지','🎬 드라마','✨ 포토 스팟'].map((c,i) => (
                <div key={c} style={{border: i === 3 ? '1.5px solid var(--coral)' : '1px solid var(--line)', background: i === 3 ? 'var(--cream-2)' : '#fff', borderRadius:100, padding:'8px 14px', fontSize:12, fontWeight:600}}>{c}</div>
              ))}
            </div>
          </div>
          {/* Camera direction */}
          <div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8}}>카메라 방향 (선택)</div>
            <div style={{background:'#fff', border:'1px solid var(--line)', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:14}}>
              <div style={{width:44, height:44, borderRadius:'50%', background:'var(--cream-2)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--coral)'}}><Icon name="compass" size={24}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, letterSpacing:'-0.01em'}}>남서쪽 · 210°</div>
                <div style={{fontSize:10, color:'var(--muted)', marginTop:2}}>탭해서 방향 조정</div>
              </div>
            </div>
          </div>
          {/* Safety tags */}
          <div>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.16em', color:'var(--muted)', textTransform:'uppercase', marginBottom:8}}>안전 태그 <span style={{color:'var(--coral)'}}>*</span></div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {['사유지 · 사업장 내부 아님','철도 · 차도 위험 없음','일반 촬영 매너 지킴'].map((t, i) => (
                <div key={t} style={{background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:'10px 12px', display:'flex', alignItems:'center', gap:10}}>
                  <div style={{width:20, height:20, borderRadius:6, background: i < 3 ? 'var(--mint)' : '#fff', border: i < 3 ? 'none' : '1.5px solid var(--line-strong)', display:'flex', alignItems:'center', justifyContent:'center'}}>{i < 3 && <Icon name="check" size={12} stroke="var(--navy)" strokeWidth={2.5}/>}</div>
                  <div style={{fontSize:12, fontWeight:600}}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{position:'absolute', bottom:24, left:16, right:16}}><CoralCTA style={{width:'100%'}}>제보 제출</CoralCTA></div>
    </MobileFrame>
  );
}

function ScreenI3Submitted() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:180, left:24, right:24, textAlign:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <img src="assets/mascot/chu-expression-joy.svg" style={{width:200, margin:'0 auto', animation:'chubob 1.8s ease-in-out infinite'}}/>
        <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.03em', marginTop:12, lineHeight:1.2}}>제보를 받았어요!</div>
        <div style={{fontSize:13, color:'var(--muted)', marginTop:12, lineHeight:1.65}}>
          새 스팟이 <b style={{color:'var(--coral)'}}>제보 상태</b>로 지도에 노출됩니다.<br/>
          다른 사용자 <b>3명</b>이 방문 인증하면<br/><b>사용자 검증</b>으로 승격돼요.
        </div>
      </div>
      {/* Reward chip */}
      <div style={{position:'absolute', top:508, left:24, right:24, background:'var(--cream-2)', borderRadius:16, padding:'14px 16px', display:'flex', gap:12, alignItems:'center', fontFamily:'var(--font-ko)'}}>
        <div style={{width:44, height:44, borderRadius:'50%', background:'var(--yellow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22}}>📸</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12, fontWeight:800, letterSpacing:'-0.01em', color:'var(--navy)'}}>제보자 배지 진행</div>
          <div style={{fontSize:11, color:'var(--muted)', marginTop:2}}>3번째 제보 · 5개면 배지 획득</div>
        </div>
      </div>
      <div style={{position:'absolute', bottom:44, left:20, right:20, display:'flex', flexDirection:'column', gap:10}}>
        <CoralCTA>지도에서 확인하기</CoralCTA>
        <div style={{textAlign:'center', fontSize:12, color:'var(--muted)', fontFamily:'var(--font-ko)', padding:10, fontWeight:600}}>다른 스팟 더 제보하기</div>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenI1PickLocation, ScreenI2Form, ScreenI3Submitted });
