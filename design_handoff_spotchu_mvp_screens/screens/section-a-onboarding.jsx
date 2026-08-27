/* Section A — 온보딩 & 인증 */

// A1: Splash
function ScreenA1Splash() {
  return (
    <MobileFrame bg="var(--grad-hero)" statusStyle="light">
      <div style={{position:'absolute', top:-80, right:-60, width:300, height:300, background:'radial-gradient(circle, rgba(255,200,87,0.5) 0%, transparent 70%)', pointerEvents:'none'}}/>
      <div style={{position:'absolute', bottom:-100, left:-80, width:320, height:320, background:'radial-gradient(circle, rgba(69,214,198,0.45) 0%, transparent 70%)', pointerEvents:'none'}}/>
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--cream)', fontFamily:'var(--font-ko)'}}>
        <img src="assets/mascot/chu-mascot-front.svg" style={{width:'62%', marginBottom:22, animation:'chubob 1.6s ease-in-out infinite'}}/>
        <div style={{fontSize:44, fontWeight:800, letterSpacing:'-0.05em', lineHeight:1}}>스팟츄</div>
        <div style={{fontFamily:'var(--font-latin)', fontSize:12, fontWeight:700, letterSpacing:'0.4em', opacity:0.75, marginTop:8}}>SPOTCHU</div>
        <div style={{fontSize:13, opacity:0.85, marginTop:14}}>찍고 싶은 곳을 발견하다</div>
        <div style={{position:'absolute', bottom:60, left:'50%', transform:'translateX(-50%)', width:60, height:4, background:'rgba(255,249,242,0.25)', borderRadius:100, overflow:'hidden'}}>
          <div style={{position:'absolute', top:0, left:'20%', width:'35%', height:'100%', background:'var(--cream)', borderRadius:100, animation:'splashSlide 1.4s ease-in-out infinite'}}/>
        </div>
      </div>
    </MobileFrame>
  );
}

// A2, A3, A4 — 3-step onboarding
function OnboardingSlide({ step, of, mascot, title, body, chuGrad }) {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:70, right:20, fontFamily:'var(--font-latin)', fontSize:12, fontWeight:600, color:'var(--muted)', letterSpacing:'0.05em', zIndex:10}}>건너뛰기</div>
      <div style={{
        position:'absolute', top:100, left:20, right:20, height:340,
        background: chuGrad, borderRadius:24,
        display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
      }}>
        <div style={{position:'absolute', top:-40, right:-40, width:160, height:160, background:'radial-gradient(circle, rgba(255,200,87,0.5) 0%, transparent 65%)'}}/>
        <img src={mascot} style={{height:280, position:'relative', zIndex:2}}/>
      </div>
      <div style={{position:'absolute', top:480, left:24, right:24, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{fontFamily:'var(--font-latin)', fontSize:11, fontWeight:600, letterSpacing:'0.16em', color:'var(--coral)', textTransform:'uppercase', marginBottom:10}}>0{step} · {step}/{of}</div>
        <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.2}}>{title}</div>
        <div style={{fontSize:14, color:'var(--muted)', marginTop:12, lineHeight:1.55}}>{body}</div>
      </div>
      <div style={{position:'absolute', bottom:120, left:24, right:24, display:'flex', gap:6, justifyContent:'center'}}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height:6, borderRadius:100,
            background: i === step ? 'var(--coral)' : 'var(--line-strong)',
            transition:'width 0.3s ease',
          }}/>
        ))}
      </div>
      <div style={{position:'absolute', bottom:44, left:24, right:24, display:'flex', gap:12}}>
        <div style={{width:52, height:52, borderRadius:16, background:'#fff', border:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--navy)'}}>
          <Icon name="chevron-left"/>
        </div>
        <CoralCTA style={{flex:1}}>{step === of ? '시작하기' : '다음'} →</CoralCTA>
      </div>
    </MobileFrame>
  );
}

function ScreenA2Onboarding1() { return <OnboardingSlide step={1} of={3} mascot="assets/mascot/chu-mascot-map.svg" title={<>지도에서<br/>찾고 있는 그 자리를.</>} body="블로그와 SNS에 흩어진 사진 스팟을 하나의 지도로. 도쿄와 서울, 정확한 촬영 위치까지 안내해요." chuGrad="linear-gradient(180deg, #FF7A85 0%, #E24352 100%)"/>; }
function ScreenA3Onboarding2() { return <OnboardingSlide step={2} of={3} mascot="assets/mascot/chu-mascot-camera.svg" title={<>어디에 서서<br/>어느 방향으로 찍을까.</>} body="스팟마다 촬영 각도, 추천 렌즈, 시간대까지 츄가 세팅해 뒀어요. 그대로 찍으면 그 사진이에요." chuGrad="linear-gradient(180deg, #45D6C6 0%, #38C4B4 100%)"/>; }
function ScreenA4Onboarding3() { return <OnboardingSlide step={3} of={3} mascot="assets/mascot/chu-expression-joy.svg" title={<>발견하고 모으고<br/>인증하는 여행.</>} body="컬렉션에 저장하고 여행 계획으로. 현장에서 GPS 인증하면 배지가 쌓여요." chuGrad="linear-gradient(180deg, #FFC857 0%, #FF7A85 100%)"/>; }

// A5: Login
function ScreenA5Login() {
  const providers = [
    { id:'kakao', label:'카카오로 계속하기', bg:'#FEE500', color:'#17233C', icon:'💬' },
    { id:'google', label:'Google로 계속하기', bg:'#fff', color:'#17233C', border:'1px solid var(--line)', icon:<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.68 4.4-5.35 4.4a5.7 5.7 0 010-11.4c1.8 0 3 .77 3.7 1.44l2.5-2.4A9.1 9.1 0 0012 3a9 9 0 100 18c5.2 0 8.65-3.66 8.65-8.8 0-.6-.07-1.05-.15-1.5z"/></svg> },
    { id:'apple', label:'Apple로 계속하기', bg:'var(--navy)', color:'var(--cream)', icon:<svg width="16" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-72.6-124.4c22.2-27.6 15.7-72.5 15.7-72.5-35.9 1.8-77.3 24.4-99.5 63.8-24.8 43.3-16.4 76.1-16.4 76.1s34.1 5.4 100.2-67.4z"/></svg> },
  ];
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:64, left:0, right:0, display:'flex', flexDirection:'column', alignItems:'center', gap:6, fontFamily:'var(--font-ko)'}}>
        <img src="assets/mascot/chu-mascot-front.svg" style={{height:180}}/>
        <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.03em', color:'var(--navy)', marginTop:-4}}>스팟츄에 오신 걸 환영해요</div>
        <div style={{fontSize:13, color:'var(--muted)'}}>찍고 싶은 곳을 발견하다</div>
      </div>
      <div style={{position:'absolute', bottom:44, left:24, right:24, display:'flex', flexDirection:'column', gap:10, fontFamily:'var(--font-ko)'}}>
        {providers.map(p => (
          <div key={p.id} style={{
            background: p.bg, color: p.color, border: p.border || 'none',
            borderRadius:16, padding:'14px 20px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            fontSize:14, fontWeight:700, letterSpacing:'-0.01em',
            boxShadow:'var(--sh-card)',
          }}>
            <span style={{fontSize:18, display:'inline-flex', alignItems:'center'}}>{p.icon}</span>
            {p.label}
          </div>
        ))}
        <div style={{marginTop:14, fontSize:11, color:'var(--muted)', textAlign:'center', lineHeight:1.6}}>
          계속하면 <span style={{color:'var(--navy)', fontWeight:600}}>이용약관</span> · <span style={{color:'var(--navy)', fontWeight:600}}>개인정보</span> · <span style={{color:'var(--navy)', fontWeight:600}}>위치기반서비스</span>에 동의합니다
        </div>
      </div>
    </MobileFrame>
  );
}

// A6: Location permission
function ScreenA6Permission() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:100, left:24, right:24, textAlign:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <img src="assets/mascot/chu-expression-curious.svg" style={{height:160, marginBottom:20}}/>
        <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.3}}>위치 권한을 허용해 주세요</div>
        <div style={{fontSize:13, color:'var(--muted)', marginTop:12, lineHeight:1.6}}>
          방문 인증과 '내 주변' 스팟 추천을 위해<br/>
          <b style={{color:'var(--navy)'}}>인증 순간에만</b> 위치 정보를 사용해요.<br/>
          이동 경로는 저장되지 않습니다.
        </div>
      </div>
      <div style={{position:'absolute', top:440, left:24, right:24, background:'var(--cream-2)', borderRadius:16, padding:16, fontFamily:'var(--font-ko)'}}>
        <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
          <div style={{color:'var(--mint-deep)'}}><Icon name="shield" size={22}/></div>
          <div style={{fontSize:12, color:'var(--muted)', lineHeight:1.55}}>
            <b style={{color:'var(--navy)'}}>츄가 지키는 것</b><br/>
            원시 좌표는 서버에 저장하지 않아요.<br/>
            인증 결과 (완료/시간) 만 기록됩니다.
          </div>
        </div>
      </div>
      <div style={{position:'absolute', bottom:44, left:24, right:24, display:'flex', flexDirection:'column', gap:10}}>
        <CoralCTA>위치 권한 허용</CoralCTA>
        <div style={{textAlign:'center', fontSize:12, color:'var(--muted)', fontFamily:'var(--font-ko)', padding:'10px', fontWeight:600}}>나중에 설정하기</div>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenA1Splash, ScreenA2Onboarding1, ScreenA3Onboarding2, ScreenA4Onboarding3, ScreenA5Login, ScreenA6Permission });
