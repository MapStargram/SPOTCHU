/* SplashScreen.jsx — brand splash */
function SplashScreen({ onEnter }) {
  const rootStyle = {
    position: 'absolute',
    inset: 0,
    background: 'var(--grad-hero)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--cream)',
    fontFamily: 'var(--font-ko)',
    overflow: 'hidden',
    cursor: 'pointer',
  };
  const glowYellow = {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(255,200,87,0.5) 0%, transparent 70%)',
    pointerEvents: 'none',
  };
  const glowMint = {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 320,
    height: 320,
    background: 'radial-gradient(circle, rgba(69,214,198,0.45) 0%, transparent 70%)',
    pointerEvents: 'none',
  };
  const mascotStyle = {
    width: '62%',
    marginBottom: 22,
    animation: 'chubob 1.6s ease-in-out infinite',
  };
  const koStyle = {
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: '-0.05em',
    lineHeight: 1,
  };
  const enStyle = {
    fontFamily: 'var(--font-latin)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.4em',
    opacity: 0.75,
    marginTop: 8,
  };
  const tagStyle = {
    fontSize: 13,
    opacity: 0.85,
    marginTop: 14,
  };
  const loaderWrap = {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 4,
    background: 'rgba(255,249,242,0.25)',
    borderRadius: 100,
    overflow: 'hidden',
  };
  const loaderFill = {
    position: 'absolute',
    top: 0,
    left: '-30%',
    width: '35%',
    height: '100%',
    background: 'var(--cream)',
    borderRadius: 100,
    animation: 'splashSlide 1.4s ease-in-out infinite',
  };
  return (
    <div style={rootStyle} onClick={onEnter} data-screen-label="01 Splash">
      <style>{`
        @keyframes chubob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-4px);} }
        @keyframes splashSlide { 0%{left:-35%;} 100%{left:100%;} }
      `}</style>
      <div style={glowYellow}></div>
      <div style={glowMint}></div>
      <img src="../../assets/mascot/chu-mascot-front.svg" style={mascotStyle} alt="Chu mascot"/>
      <div style={koStyle}>스팟츄</div>
      <div style={enStyle}>SPOTCHU</div>
      <div style={tagStyle}>찍고 싶은 곳을 발견하다</div>
      <div style={loaderWrap}><div style={loaderFill}></div></div>
    </div>
  );
}
Object.assign(window, { SplashScreen });
