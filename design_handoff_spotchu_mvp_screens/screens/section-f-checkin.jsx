/* Section F — GPS 방문 인증 플로우 + 에러 상태 */

// F1: Check-in start (near spot)
function ScreenF1CheckinStart() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="close"/></div>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)', fontFamily:'var(--font-ko)', display:'flex', alignItems:'center'}}>방문 인증</div>
        <div style={{width:40}}/>
      </div>
      {/* Mini map */}
      <div style={{position:'absolute', top:120, left:20, right:20, height:280, borderRadius:20, overflow:'hidden', boxShadow:'var(--sh-card)', background:'#DDE5EE'}}>
        <MapBackground/>
        {/* Spot */}
        <MapMarker state="verified" x={62} y={38} focused/>
        {/* User */}
        <div style={{position:'absolute', left:'42%', top:'60%', transform:'translate(-50%,-50%)', width:20, height:20, borderRadius:'50%', background:'var(--coral)', border:'3px solid #fff', boxShadow:'0 0 0 10px rgba(255,95,109,0.22)', zIndex:5}}/>
        {/* Distance line */}
        <svg style={{position:'absolute', inset:0}}><line x1="42%" y1="60%" x2="62%" y2="38%" stroke="var(--coral)" strokeWidth="2.5" strokeDasharray="5 5"/></svg>
        {/* Distance chip */}
        <div style={{position:'absolute', top:'44%', left:'52%', transform:'translate(-50%,-50%)', background:'#fff', boxShadow:'var(--sh-card)', borderRadius:100, padding:'6px 12px', fontFamily:'var(--font-latin)', fontSize:12, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.01em'}}>32m</div>
      </div>
      {/* Spot label */}
      <div style={{position:'absolute', top:424, left:20, right:20, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <TagPill variant="cream" style={{marginBottom:8}}>⛩️ 애니 성지</TagPill>
        <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2}}>스가 신사 계단</div>
        <div style={{fontFamily:'var(--font-latin)', fontSize:11, color:'var(--muted)', marginTop:4}}>Yotsuya · Tokyo</div>
      </div>
      {/* Progress hint */}
      <div style={{position:'absolute', top:512, left:20, right:20, background:'var(--cream-2)', borderRadius:16, padding:'12px 14px', display:'flex', gap:10, alignItems:'center', fontFamily:'var(--font-ko)'}}>
        <div style={{color:'var(--mint-deep)'}}><Icon name="check" size={20} stroke="var(--mint-deep)" strokeWidth={2.4}/></div>
        <div style={{fontSize:12, color:'var(--navy)', flex:1}}>
          스팟에서 <b>32m</b> 떨어져 있어요. 인증 반경 <span style={{color:'var(--mint-deep)', fontWeight:700}}>100m 이내</span> 입니다.
        </div>
      </div>
      <div style={{position:'absolute', bottom:24, left:16, right:16}}>
        <CoralCTA style={{width:'100%', padding:'16px 20px', fontSize:15}}>
          <Icon name="crosshair" size={20} stroke="currentColor"/> GPS로 방문 인증
        </CoralCTA>
      </div>
    </MobileFrame>
  );
}

// F2: GPS acquiring
function ScreenF2Acquiring() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:64, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="close"/></div>
        <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em', color:'var(--navy)', fontFamily:'var(--font-ko)', display:'flex', alignItems:'center'}}>방문 인증 중</div>
        <div style={{width:40}}/>
      </div>
      <div style={{position:'absolute', top:150, left:0, right:0, textAlign:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{position:'relative', width:220, height:220, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,95,109,0.15), transparent 65%)', animation:'markerPulse 1.8s ease-out infinite'}}/>
          <div style={{position:'absolute', inset:20, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,95,109,0.28), transparent 60%)', animation:'markerPulse 1.8s ease-out 0.6s infinite'}}/>
          <img src="assets/mascot/chu-expression-focused.svg" style={{width:120, position:'relative', zIndex:2}}/>
        </div>
        <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:20}}>GPS 신호 확인 중…</div>
        <div style={{fontSize:13, color:'var(--muted)', marginTop:6}}>정확한 위치를 찾고 있어요</div>
      </div>
      {/* Signal status */}
      <div style={{position:'absolute', top:540, left:20, right:20, fontFamily:'var(--font-ko)', display:'flex', flexDirection:'column', gap:10}}>
        {[
          { label:'GPS 신호', state:'ok', value:'양호 · 정확도 8m' },
          { label:'스팟과의 거리', state:'ok', value:'32m · 반경 이내' },
          { label:'Mock 위치 감지', state:'ok', value:'감지되지 않음' },
        ].map((r,i) => (
          <div key={i} style={{background:'#fff', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'var(--sh-card)'}}>
            <div style={{fontSize:12, color:'var(--muted)'}}>{r.label}</div>
            <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'var(--mint-deep)'}}>
              <span style={{width:6, height:6, background:'var(--mint-deep)', borderRadius:'50%'}}/> {r.value}
            </div>
          </div>
        ))}
      </div>
    </MobileFrame>
  );
}

// F3: Check-in success (badge earned)
function ScreenF3Success() {
  return (
    <MobileFrame bg="var(--grad-hero)" statusStyle="light">
      <div style={{position:'absolute', top:-60, right:-60, width:280, height:280, background:'radial-gradient(circle, rgba(255,200,87,0.5), transparent 65%)'}}/>
      <div style={{position:'absolute', bottom:-100, left:-80, width:320, height:320, background:'radial-gradient(circle, rgba(69,214,198,0.45), transparent 70%)'}}/>
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', color:'var(--cream)', fontFamily:'var(--font-ko)', padding:'0 30px'}}>
        <img src="assets/mascot/chu-expression-joy.svg" style={{width:220, animation:'chubob 1.6s ease-in-out infinite'}}/>
        <div style={{fontFamily:'var(--font-latin)', fontSize:12, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', opacity:0.85, marginTop:12}}>Check-in Complete</div>
        <div style={{fontSize:30, fontWeight:800, letterSpacing:'-0.04em', marginTop:8, lineHeight:1.15}}>방문 인증<br/>완료!</div>
        <div style={{fontSize:14, opacity:0.9, marginTop:14, maxWidth:280}}>스가 신사 계단 · 오늘의 4번째 인증이에요</div>
        {/* Badge */}
        <div style={{marginTop:26, background:'rgba(255,249,242,0.15)', backdropFilter:'blur(12px)', borderRadius:20, padding:'16px 20px', display:'flex', gap:14, alignItems:'center', width:'100%', maxWidth:300}}>
          <div style={{width:56, height:56, borderRadius:'50%', background:'var(--yellow)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 6px 16px rgba(0,0,0,0.2)'}}>🌠</div>
          <div style={{textAlign:'left', flex:1}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.18em', opacity:0.85, textTransform:'uppercase'}}>New Badge</div>
            <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.01em', marginTop:2}}>성지 순례자 · 4</div>
            <div style={{fontSize:11, opacity:0.85, marginTop:2}}>너의 이름은. 4/12</div>
          </div>
        </div>
      </div>
      <div style={{position:'absolute', bottom:44, left:20, right:20, display:'flex', flexDirection:'column', gap:10}}>
        <div style={{background:'var(--cream)', color:'var(--coral)', border:'none', borderRadius:16, padding:'14px 20px', fontFamily:'var(--font-ko)', fontSize:14, fontWeight:800, textAlign:'center', letterSpacing:'-0.01em', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 8px 20px -6px rgba(0,0,0,0.3)'}}>
          <Icon name="camera" size={18} stroke="var(--coral)"/> 오늘 찍은 사진 올리기
        </div>
        <div style={{color:'var(--cream)', textAlign:'center', fontSize:12, fontFamily:'var(--font-ko)', padding:10, fontWeight:600, opacity:0.85}}>다음에 하기</div>
      </div>
    </MobileFrame>
  );
}

// F4: Out of range
function ErrorScreen({ icon, title, body, primary, secondary, iconBg = 'var(--cream-2)', iconColor = 'var(--coral)' }) {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="close"/></div>
        <div/>
        <div style={{width:40}}/>
      </div>
      <div style={{position:'absolute', top:170, left:24, right:24, textAlign:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        {typeof icon === 'string'
          ? <img src={icon} style={{width:180, margin:'0 auto'}}/>
          : <div style={{width:120, height:120, borderRadius:'50%', background: iconBg, color: iconColor, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 4px'}}>{icon}</div>}
        <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', marginTop:16, lineHeight:1.3}}>{title}</div>
        <div style={{fontSize:13, color:'var(--muted)', marginTop:12, lineHeight:1.65}}>{body}</div>
      </div>
      <div style={{position:'absolute', bottom:44, left:20, right:20, display:'flex', flexDirection:'column', gap:10}}>
        <CoralCTA style={{width:'100%'}}>{primary}</CoralCTA>
        {secondary && <div style={{textAlign:'center', fontSize:12, color:'var(--muted)', fontFamily:'var(--font-ko)', padding:10, fontWeight:600}}>{secondary}</div>}
      </div>
    </MobileFrame>
  );
}

function ScreenF4OutOfRange() {
  return <ErrorScreen
    icon="assets/mascot/chu-expression-curious.svg"
    title="아직 도착하지 않았어요"
    body={<>스팟에서 <b style={{color:'var(--coral)'}}>340m</b> 떨어져 있어요.<br/>인증은 <b>100m 이내</b>에서만 가능해요.<br/>츄가 계단 위에서 기다리고 있을게요!</>}
    primary="지도로 길찾기"
    secondary="스팟에 도착한 뒤 다시 시도"
  />;
}

function ScreenF5PoorAccuracy() {
  return <ErrorScreen
    icon={<Icon name="alert-triangle" size={64} stroke="currentColor" strokeWidth={1.6}/>}
    iconBg="rgba(255,200,87,0.2)"
    iconColor="var(--yellow)"
    title="GPS 정확도가 낮아요"
    body={<>실내나 지하에 있을 때 자주 발생해요.<br/>현재 정확도 <b style={{color:'var(--coral)'}}>±180m</b>. 최소 50m 이내가 필요합니다.<br/>실외로 이동한 뒤 다시 시도해 주세요.</>}
    primary="다시 시도"
    secondary="나중에 하기"
  />;
}

function ScreenF6PermissionDenied() {
  return <ErrorScreen
    icon={<Icon name="x-octagon" size={64} stroke="currentColor" strokeWidth={1.6}/>}
    iconBg="rgba(255,95,109,0.15)"
    iconColor="var(--coral)"
    title="위치 권한이 꺼져 있어요"
    body="브라우저 설정에서 위치 권한을 허용해 주세요. 방문 인증과 '내 주변' 기능이 필요해요."
    primary="설정 열기"
    secondary="다음에 하기"
  />;
}

Object.assign(window, { ScreenF1CheckinStart, ScreenF2Acquiring, ScreenF3Success, ScreenF4OutOfRange, ScreenF5PoorAccuracy, ScreenF6PermissionDenied });
