/* DiscoverScreen.jsx — map/discover view */
function DiscoverScreen({ onOpenSpot, savedIds, visitedIds }) {
  const [chip, setChip] = React.useState('recommended');
  const filters = [
    { id: 'recommended', label: '추천', dotColor: 'var(--yellow)' },
    { id: 'anime', label: '애니 성지', dotColor: 'var(--mint)' },
    { id: 'drama', label: '드라마', dotColor: 'var(--coral)' },
    { id: 'landmark', label: '랜드마크', dotColor: 'var(--navy-2)' },
  ];

  const markers = [
    { id: 'mojik', x: 45, y: 32, state: visitedIds.has('mojik') ? 'visited' : (savedIds.has('mojik') ? 'saved' : 'verified'), focused: true },
    { id: 'shibuya', x: 22, y: 48, state: visitedIds.has('shibuya') ? 'visited' : (savedIds.has('shibuya') ? 'saved' : 'default') },
    { id: 'harajuku', x: 68, y: 42, state: 'default' },
    { id: 'ueno', x: 78, y: 60, state: 'saved' },
    { id: 'meji', x: 30, y: 68, state: 'visited' },
  ];

  const markerSrc = (s) => `../../assets/map-markers/marker-${s}.svg`;

  return (
    <div style={{position:'absolute', inset:0, background:'#DDE5EE', fontFamily:'var(--font-ko)', color:'var(--navy)', overflow:'hidden'}} data-screen-label="02 Discover">
      {/* Map background — CSS painted */}
      <div style={{
        position:'absolute', inset:0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(200,220,190,0.5) 0%, transparent 25%),
          radial-gradient(circle at 75% 65%, rgba(200,220,190,0.4) 0%, transparent 22%),
          linear-gradient(180deg, #E5EDF3 0%, #D8E2EC 100%)
        `,
      }}></div>
      {/* Fake roads */}
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} viewBox="0 0 390 844" preserveAspectRatio="none">
        <g stroke="#FFF9F2" strokeWidth="14" fill="none" opacity="0.9">
          <path d="M -20 200 Q 100 260 200 210 T 420 240"/>
          <path d="M 60 -20 Q 100 200 180 340 T 240 780"/>
          <path d="M -20 500 Q 150 480 260 550 T 420 590"/>
          <path d="M 300 -20 Q 260 300 330 500 T 300 900"/>
        </g>
        <g stroke="#FFF9F2" strokeWidth="6" fill="none" opacity="0.7">
          <path d="M -20 380 L 420 400"/>
          <path d="M 150 -20 L 190 900"/>
        </g>
        <g fill="rgba(120,180,140,0.3)">
          <ellipse cx="90" cy="620" rx="70" ry="40"/>
          <ellipse cx="320" cy="180" rx="55" ry="35"/>
        </g>
      </svg>

      {/* Top status area spacer */}
      <div style={{height: 60}}></div>

      {/* Search bar */}
      <div style={{
        position:'absolute', top:58, left:16, right:16, zIndex:10,
        background:'#fff', borderRadius:20, padding:'14px 18px',
        display:'flex', alignItems:'center', gap:12,
        boxShadow:'var(--sh-search)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
        <div style={{flex:1, fontSize:13, color:'var(--muted)'}}>도쿄타워 근처 포토 스팟</div>
        <div style={{width:32, height:32, borderRadius:'50%', background:'var(--mint)', color:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-latin)', fontWeight:700, fontSize:13}}>S</div>
      </div>

      {/* Filter chips */}
      <div style={{
        position:'absolute', top:128, left:0, right:0, zIndex:10,
        display:'flex', gap:8, overflowX:'auto', padding:'0 16px',
      }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setChip(f.id)} style={{
            border:'none',
            background: chip === f.id ? 'var(--navy)' : '#fff',
            color: chip === f.id ? 'var(--cream)' : 'var(--navy)',
            borderRadius:100, padding:'8px 14px',
            fontFamily:'var(--font-ko)', fontSize:12, fontWeight:600,
            display:'inline-flex', alignItems:'center', gap:6,
            boxShadow:'var(--sh-card)', whiteSpace:'nowrap', cursor:'pointer',
            flexShrink:0,
          }}>
            <span style={{width:6, height:6, borderRadius:'50%', background: chip === f.id ? 'var(--yellow)' : f.dotColor}}></span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Markers */}
      {markers.map(m => (
        <div key={m.id} onClick={() => onOpenSpot(m.id)} style={{
          position:'absolute',
          left:`${m.x}%`, top:`${m.y}%`,
          transform:'translate(-50%, -100%)',
          cursor:'pointer', zIndex: m.focused ? 6 : 5,
        }}>
          {m.focused && (
            <div style={{
              position:'absolute',
              left:'50%', bottom:0,
              transform:'translate(-50%, 50%)',
              width:40, height:40, borderRadius:'50%',
              background:'var(--coral)', opacity:0.25,
              animation:'markerPulse 1.8s ease-out infinite',
              pointerEvents:'none',
            }}></div>
          )}
          <img src={markerSrc(m.state)} style={{width: m.focused ? 42 : 32, height:'auto', filter:'drop-shadow(0 6px 12px rgba(23,35,60,0.35))'}} alt=""/>
        </div>
      ))}

      <style>{`
        @keyframes markerPulse { 0% { transform: translate(-50%, 50%) scale(0.6); opacity: 0.35;} 100% { transform: translate(-50%, 50%) scale(2.2); opacity: 0;} }
      `}</style>

      {/* FAB */}
      <button style={{
        position:'absolute', bottom:138, right:16, zIndex:9,
        width:48, height:48, borderRadius:'50%',
        background:'#fff', border:'none', boxShadow:'var(--sh-card)',
        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
      }} aria-label="내 위치">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
      </button>

      {/* Spot card */}
      <div onClick={() => onOpenSpot('mojik')} style={{
        position:'absolute', bottom:22, left:14, right:14, zIndex:8,
        background:'#fff', borderRadius:22, padding:14,
        display:'flex', gap:12, alignItems:'stretch',
        boxShadow:'var(--sh-elevated)', cursor:'pointer',
      }}>
        <div style={{
          width:78, height:78, borderRadius:16,
          background:'var(--grad-thumb)', flexShrink:0, position:'relative',
        }}>
          <div style={{position:'absolute', bottom:6, right:6, width:22, height:22, borderRadius:'50%', background:'var(--yellow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12}}>✨</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:3, minWidth:0, flex:1}}>
          <div style={{fontSize:14, fontWeight:700, letterSpacing:'-0.01em'}}>모지항에서 본 후지산</div>
          <div style={{fontSize:11, color:'var(--muted)', display:'flex', alignItems:'center', gap:4}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--coral)"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
            Shizuoka · Japan
          </div>
          <div style={{fontSize:11, color:'var(--mint-deep)', fontWeight:600}}>● 공식 인증</div>
          <div style={{marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
            <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, color:'var(--muted)', letterSpacing:'0.05em'}}>1,248 방문</div>
            <button style={{
              background:'var(--coral)', color:'var(--cream)',
              border:'none', borderRadius:100,
              padding:'6px 12px', fontSize:11, fontWeight:700,
              fontFamily:'var(--font-ko)', cursor:'pointer',
              boxShadow:'var(--sh-cta-coral)',
            }}>앵글 보기 →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { DiscoverScreen });
