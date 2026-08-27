/* App.jsx — the click-thru prototype root */
function App() {
  const [screen, setScreen] = React.useState('splash');
  const [savedIds, setSavedIds] = React.useState(() => new Set(['ueno']));
  const [visitedIds, setVisitedIds] = React.useState(() => new Set(['meji']));
  const [activeSpot, setActiveSpot] = React.useState('mojik');

  const isSaved = savedIds.has(activeSpot);
  const isVisited = visitedIds.has(activeSpot);

  const toggleSave = () => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(activeSpot)) next.delete(activeSpot);
      else next.add(activeSpot);
      return next;
    });
  };

  const checkIn = () => {
    setVisitedIds(prev => {
      const next = new Set(prev);
      next.add(activeSpot);
      return next;
    });
  };

  const openSpot = (id) => {
    setActiveSpot(id);
    setScreen('detail');
  };

  // Auto-advance splash
  React.useEffect(() => {
    if (screen === 'splash') {
      const t = setTimeout(() => setScreen('discover'), 2200);
      return () => clearTimeout(t);
    }
  }, [screen]);

  return (
    <div style={{
      minHeight:'100vh', width:'100%',
      background:'var(--cream-2)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'flex-start',
      padding:'32px 20px 40px',
      fontFamily:'var(--font-ko)',
      gap: 20,
    }}>
      {/* Top toolbar */}
      <div style={{
        display:'flex', alignItems:'center', gap:12, marginBottom:8,
        background:'#fff', borderRadius:100,
        padding:'8px 8px 8px 18px',
        boxShadow:'var(--sh-card)',
      }}>
        <img src="../../assets/logo/spotchu-ko-horizontal.svg" style={{height:22}} alt="스팟츄"/>
        <div style={{display:'flex', gap:4, background:'var(--cream-2)', borderRadius:100, padding:4}}>
          {[
            {id:'splash', label:'Splash'},
            {id:'discover', label:'Discover'},
            {id:'detail', label:'Spot Detail'},
          ].map(t => (
            <button key={t.id} onClick={() => setScreen(t.id)} style={{
              border:'none', cursor:'pointer',
              background: screen === t.id ? 'var(--navy)' : 'transparent',
              color: screen === t.id ? 'var(--cream)' : 'var(--navy)',
              borderRadius:100, padding:'6px 14px',
              fontFamily:'var(--font-ko)', fontSize:12, fontWeight:600,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <PhoneFrame bg={screen === 'discover' ? '#DDE5EE' : 'var(--cream)'}>
        {screen === 'splash' && <SplashScreen onEnter={() => setScreen('discover')}/>}
        {screen === 'discover' && <DiscoverScreen
          onOpenSpot={openSpot}
          savedIds={savedIds}
          visitedIds={visitedIds}
        />}
        {screen === 'detail' && <SpotDetailScreen
          onBack={() => setScreen('discover')}
          saved={isSaved}
          onToggleSave={toggleSave}
          visited={isVisited}
          onCheckIn={checkIn}
        />}
      </PhoneFrame>

      <div style={{
        fontFamily:'var(--font-mono)', fontSize:11,
        color:'var(--muted)', letterSpacing:'0.02em',
        marginTop:4,
      }}>
        스팟츄 · SPOTCHU mobile UI kit · click marker or 앵글 보기 → to open detail
      </div>
    </div>
  );
}
Object.assign(window, { App });
