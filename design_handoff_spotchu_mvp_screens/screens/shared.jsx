/* shared.jsx — reusable primitives for every screen */

// ============================================================
// Mobile phone frame (390 × 844) — matches the iPhone canvas
// ============================================================
function MobileFrame({ children, bg = 'var(--cream)', showStatus = true, statusStyle = 'dark' }) {
  return (
    <div style={{
      position:'relative', width:390, height:844,
      background:'#0B1424', borderRadius:46, padding:8,
      boxShadow:'var(--sh-device)', flexShrink:0,
    }}>
      <div style={{
        position:'relative', width:'100%', height:'100%',
        borderRadius:38, overflow:'hidden', background: bg,
        color: statusStyle === 'light' ? '#FFF9F2' : '#17233C',
      }}>
        <div style={{
          position:'absolute', top:16, left:'50%', transform:'translateX(-50%)',
          width:118, height:32, background:'#0B1424', borderRadius:100, zIndex:20,
        }}></div>
        {showStatus && <StatusBar tint={statusStyle}/>}
        {children}
      </div>
    </div>
  );
}

function StatusBar({ tint = 'dark' }) {
  const color = tint === 'light' ? '#FFF9F2' : '#17233C';
  return (
    <div style={{
      position:'absolute', top:16, left:0, right:0, height:44,
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'0 32px', color, fontFamily:'var(--font-latin)',
      fontSize:15, fontWeight:600, zIndex:21, pointerEvents:'none',
    }}>
      <span>9:41</span>
      <span style={{display:'inline-flex', gap:6, alignItems:'center'}}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={color}><path d="M8 11h2V6H8v5zM0 11h2V4H0v7zm4 0h2V2H4v9zm8 0h2V0h-2v11z"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={color}><path d="M8 3c2 0 3.9.7 5.4 2l1.4-1.5C13 1.9 10.6 1 8 1S3 1.9 1.2 3.5L2.6 5C4.1 3.7 6 3 8 3zm0 4c1 0 1.9.3 2.5.9l1.4-1.4C10.9 5.6 9.5 5 8 5s-2.9.6-3.9 1.5l1.4 1.4C6.1 7.3 7 7 8 7zm0 2.5c-.5 0-1 .2-1.4.6L8 11.5l1.4-1.4c-.4-.4-.9-.6-1.4-.6z"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke={color} opacity="0.5"/><rect x="2" y="2" width="19" height="9" rx="1.5" fill={color}/><rect x="24" y="4" width="2" height="5" rx="0.8" fill={color} opacity="0.5"/></svg>
      </span>
    </div>
  );
}

// ============================================================
// Bottom tab bar (4 tabs)
// ============================================================
function TabBar({ active = 'home' }) {
  const tabs = [
    { id:'home', label:'홈', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z"/></svg> },
    { id:'explore', label:'탐색', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 4-4 2 2-4 4-2z"/></svg> },
    { id:'collections', label:'컬렉션', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6v14a1 1 0 001 1h14M8 3v14a1 1 0 001 1h11V4a1 1 0 00-1-1H9a1 1 0 00-1 1z"/></svg> },
    { id:'profile', label:'프로필', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg> },
  ];
  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0, height:88,
      background:'rgba(255,249,242,0.92)', backdropFilter:'blur(20px)',
      borderTop:'1px solid var(--line)',
      display:'flex', justifyContent:'space-around', paddingTop:12,
      zIndex:15,
    }}>
      {tabs.map(t => (
        <div key={t.id} style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          color: active === t.id ? 'var(--coral)' : 'var(--muted)',
          fontFamily:'var(--font-ko)', fontSize:10, fontWeight:600,
          letterSpacing:'-0.01em',
        }}>
          {t.icon}
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Small icons (Lucide-style, 2px stroke, 24 grid)
// ============================================================
function Icon({ name, size = 20, stroke = 'currentColor', strokeWidth = 2 }) {
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke, strokeWidth, strokeLinecap:'round', strokeLinejoin:'round' };
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></>,
    'arrow-left': <><path d="M15 6l-6 6 6 6"/></>,
    'chevron-left': <><path d="M15 6l-6 6 6 6"/></>,
    'chevron-right': <><path d="M9 6l6 6-6 6"/></>,
    'chevron-down': <><path d="M6 9l6 6 6-6"/></>,
    'chevron-up': <><path d="M6 15l6-6 6 6"/></>,
    close: <><path d="M18 6L6 18M6 6l12 12"/></>,
    heart: <><path d="M12 21s-7-4.5-9.5-9.2C1 9 2.2 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.8 0 5 4 3.5 6.8C19 16.5 12 21 12 21z"/></>,
    bookmark: <><path d="M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-6-4-6 4V4z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    crosshair: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    'map-pin': <><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill={stroke} stroke="none"/></>,
    star: <><path d="M12 2l3 6.5 7 1-5 5 1.5 7L12 18l-6.5 3.5L7 14.5l-5-5 7-1L12 2z"/></>,
    check: <><path d="M4 12l5 5L20 6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-0.2-1.7l2-1.5-2-3.5-2.4 0.8a7 7 0 00-2.9-1.7L13 2h-4l-0.5 2.5a7 7 0 00-2.9 1.7L3.2 5.3l-2 3.5 2 1.5a7 7 0 000 3.4l-2 1.5 2 3.5 2.4-0.8a7 7 0 002.9 1.7L11 22h4l0.5-2.5a7 7 0 002.9-1.7l2.4 0.8 2-3.5-2-1.5a7 7 0 00.2-1.6z"/></>,
    bell: <><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></>,
    camera: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"/><circle cx="12" cy="13" r="4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    map: <><path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    upload: <><path d="M12 3v13M6 9l6-6 6 6M3 21h18"/></>,
    edit: <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/></>,
    'more-horizontal': <><circle cx="12" cy="12" r="1.5" fill={stroke}/><circle cx="19" cy="12" r="1.5" fill={stroke}/><circle cx="5" cy="12" r="1.5" fill={stroke}/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 4-4 2 2-4 4-2z"/></>,
    'alert-triangle': <><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18v.5"/></>,
    'x-octagon': <><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z"/><path d="M15 9l-6 6M9 9l6 6"/></>,
    sparkle: <><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z"/></>,
    users: <><circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0116 0"/><circle cx="17" cy="6" r="3"/><path d="M23 15a5 5 0 00-8-3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></>,
    shield: <><path d="M12 2l8 3v7c0 5-4 8-8 10-4-2-8-5-8-10V5l8-3z"/></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5"/></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

// ============================================================
// Chips, buttons, cards
// ============================================================
function CoralCTA({ children, style, small, glow = true }) {
  return (
    <div style={{
      background:'var(--coral)', color:'var(--cream)',
      borderRadius: small ? 100 : 16,
      padding: small ? '6px 12px' : '14px 20px',
      fontFamily:'var(--font-ko)', fontSize: small ? 11 : 14, fontWeight:700,
      letterSpacing:'-0.01em', textAlign:'center',
      boxShadow: glow ? 'var(--sh-cta-coral)' : 'none',
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
      ...style,
    }}>{children}</div>
  );
}

function Chip({ children, active, dotColor = 'var(--yellow)', style }) {
  return (
    <div style={{
      background: active ? 'var(--navy)' : '#fff',
      color: active ? 'var(--cream)' : 'var(--navy)',
      borderRadius:100, padding:'8px 14px',
      fontFamily:'var(--font-ko)', fontSize:12, fontWeight:600,
      display:'inline-flex', alignItems:'center', gap:6,
      boxShadow: active ? 'none' : 'var(--sh-card)', whiteSpace:'nowrap', flexShrink:0,
      ...style,
    }}>
      <span style={{width:6, height:6, borderRadius:'50%', background: dotColor}}/>
      {children}
    </div>
  );
}

function TagPill({ children, variant = 'glass', style }) {
  const variants = {
    glass: { background:'rgba(255,249,242,0.25)', color:'var(--cream)', backdropFilter:'blur(8px)' },
    coral: { background:'var(--coral)', color:'var(--cream)' },
    mint:  { background:'var(--mint)',  color:'var(--navy)' },
    navy:  { background:'var(--navy)',  color:'var(--cream)' },
    cream: { background:'var(--cream-2)', color:'var(--navy)' },
    yellow:{ background:'var(--yellow)', color:'var(--navy)' },
  };
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5,
      borderRadius:100, padding:'4px 10px',
      fontFamily:'var(--font-ko)', fontSize:11, fontWeight:600, letterSpacing:'-0.01em',
      ...variants[variant], ...style,
    }}>{children}</div>
  );
}

function Sparkle({ size = 22 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:'var(--yellow)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.5,
    }}>✨</div>
  );
}

// verification badge (● 공식 인증 / ● 사용자 검증 / ● 제보)
function VerifBadge({ level = 'official' }) {
  const cfg = {
    official: { color:'var(--mint-deep)', label:'공식 인증' },
    user: { color:'var(--yellow)', label:'사용자 검증' },
    reported: { color:'var(--muted)', label:'제보' },
  }[level];
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, color: cfg.color, fontFamily:'var(--font-ko)'}}>
      <span style={{width:6, height:6, borderRadius:'50%', background: cfg.color}}/> {cfg.label}
    </div>
  );
}

// ============================================================
// Mock map background (CSS-painted)
// ============================================================
function MapBackground({ variant = 'day' }) {
  const bg = variant === 'night'
    ? `radial-gradient(circle at 20% 30%, rgba(46,63,94,0.5) 0%, transparent 25%),
       radial-gradient(circle at 75% 65%, rgba(46,63,94,0.4) 0%, transparent 22%),
       linear-gradient(180deg, #17233C 0%, #0B1424 100%)`
    : `radial-gradient(circle at 20% 30%, rgba(200,220,190,0.5) 0%, transparent 25%),
       radial-gradient(circle at 75% 65%, rgba(200,220,190,0.4) 0%, transparent 22%),
       linear-gradient(180deg, #E5EDF3 0%, #D8E2EC 100%)`;
  const road = variant === 'night' ? 'rgba(255,249,242,0.15)' : '#FFF9F2';
  const park = variant === 'night' ? 'rgba(69,214,198,0.15)' : 'rgba(120,180,140,0.3)';
  return (
    <>
      <div style={{position:'absolute', inset:0, background:bg}}/>
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} viewBox="0 0 390 844" preserveAspectRatio="none">
        <g stroke={road} strokeWidth="14" fill="none" opacity="0.9">
          <path d="M -20 200 Q 100 260 200 210 T 420 240"/>
          <path d="M 60 -20 Q 100 200 180 340 T 240 780"/>
          <path d="M -20 500 Q 150 480 260 550 T 420 590"/>
          <path d="M 300 -20 Q 260 300 330 500 T 300 900"/>
        </g>
        <g stroke={road} strokeWidth="6" fill="none" opacity="0.7">
          <path d="M -20 380 L 420 400"/>
          <path d="M 150 -20 L 190 900"/>
        </g>
        <g fill={park}>
          <ellipse cx="90" cy="620" rx="70" ry="40"/>
          <ellipse cx="320" cy="180" rx="55" ry="35"/>
        </g>
      </svg>
    </>
  );
}

// ============================================================
// Marker on map
// ============================================================
function MapMarker({ state = 'default', x, y, focused = false, size, badge }) {
  const src = `assets/map-markers/marker-${state}.svg`;
  const w = size ?? (focused ? 42 : 32);
  return (
    <div style={{
      position:'absolute', left:`${x}%`, top:`${y}%`,
      transform:'translate(-50%, -100%)', zIndex: focused ? 6 : 5,
    }}>
      {focused && <div style={{
        position:'absolute', left:'50%', bottom:0,
        transform:'translate(-50%, 50%)',
        width:40, height:40, borderRadius:'50%',
        background:'var(--coral)', opacity:0.28,
        animation:'markerPulse 1.8s ease-out infinite',
        pointerEvents:'none',
      }}/>}
      <img src={src} style={{width:w, height:'auto', filter:'drop-shadow(0 6px 12px rgba(23,35,60,0.35))'}}/>
      {badge && <div style={{
        position:'absolute', top:-4, right:-6,
        minWidth:18, height:18, padding:'0 4px', borderRadius:100,
        background:'var(--yellow)', color:'var(--navy)',
        fontFamily:'var(--font-latin)', fontSize:10, fontWeight:800,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>{badge}</div>}
    </div>
  );
}

// ============================================================
// Placeholder photo — coral-yellow gradient with optional sparkle
// ============================================================
function PhotoSlot({ grad, sparkle, style, children }) {
  return (
    <div style={{
      background: grad || 'var(--grad-thumb)', position:'relative',
      overflow:'hidden', ...style,
    }}>
      {children}
      {sparkle && <div style={{position:'absolute', bottom:8, right:8}}><Sparkle/></div>}
    </div>
  );
}

// ============================================================
// Section-label — the "01 · 온보딩" style header sitting outside artboards
// ============================================================
function SectionLabel({ eyebrow, title, subtitle }) {
  return (
    <div style={{fontFamily:'var(--font-ko)', maxWidth:900, marginBottom:12}}>
      <div style={{fontFamily:'var(--font-latin)', fontSize:12, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--muted)', marginBottom:6}}>{eyebrow}</div>
      <div style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', color:'var(--navy)', lineHeight:1.1}}>{title}</div>
      {subtitle && <div style={{fontSize:14, color:'var(--muted)', marginTop:6, maxWidth:640}}>{subtitle}</div>}
    </div>
  );
}

Object.assign(window, {
  MobileFrame, StatusBar, TabBar, Icon,
  CoralCTA, Chip, TagPill, Sparkle, VerifBadge,
  MapBackground, MapMarker, PhotoSlot, SectionLabel,
});
