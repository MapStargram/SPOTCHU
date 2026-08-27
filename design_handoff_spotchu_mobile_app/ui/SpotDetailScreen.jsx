/* SpotDetailScreen.jsx — spot detail with hero + stats + angle guide + actions */
function SpotDetailScreen({ onBack, saved, onToggleSave, visited, onCheckIn }) {
  return (
    <div style={{position:'absolute', inset:0, background:'var(--cream)', color:'var(--navy)', fontFamily:'var(--font-ko)', overflow:'hidden'}} data-screen-label="03 Spot Detail">
      {/* Hero */}
      <div style={{
        position:'relative',
        height: '42%',
        background: 'var(--grad-hero)',
        overflow: 'hidden',
      }}>
        {/* Radial glows */}
        <div style={{position:'absolute', top:-60, right:-60, width:280, height:280, background:'radial-gradient(circle, rgba(255,200,87,0.5) 0%, transparent 65%)', pointerEvents:'none'}}></div>
        <div style={{position:'absolute', bottom:-80, left:-60, width:260, height:260, background:'radial-gradient(circle, rgba(69,214,198,0.45) 0%, transparent 65%)', pointerEvents:'none'}}></div>

        {/* Top nav */}
        <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', zIndex:5}}>
          <button onClick={onBack} style={{
            width:40, height:40, borderRadius:'50%',
            background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)',
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }} aria-label="back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17233C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button onClick={onToggleSave} style={{
            width:40, height:40, borderRadius:'50%',
            background:'rgba(255,249,242,0.9)', backdropFilter:'blur(12px)',
            border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          }} aria-label="save">
            {saved
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF5F6D"><path d="M12 21s-7-4.5-9.5-9.2C1 9 2.2 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.8 0 5 4 3.5 6.8C19 16.5 12 21 12 21z"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9.2C1 9 2.2 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.8 0 5 4 3.5 6.8C19 16.5 12 21 12 21z"/></svg>}
          </button>
        </div>

        {/* Hero bottom text */}
        <div style={{
          position:'absolute', bottom:56, left:20, right:20,
          color:'var(--cream)',
        }}>
          <span style={{
            display:'inline-block',
            background:'rgba(255,249,242,0.25)', backdropFilter:'blur(8px)',
            padding:'4px 10px', borderRadius:100,
            fontSize:11, fontWeight:600, letterSpacing:'-0.01em',
            marginBottom:10,
          }}>🏯 랜드마크 · 공식 인증</span>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.15}}>모지항에서 본 후지산</div>
          <div style={{
            fontFamily:'var(--font-latin)',
            fontSize:11, fontWeight:500, marginTop:4, opacity:0.85,
          }}>Shizuoka · Japan · 이른 아침 6시 30분 추천</div>
        </div>
      </div>

      {/* Stats card overlapping hero */}
      <div style={{
        margin:'-32px 16px 0',
        background:'#fff',
        borderRadius:16,
        padding:'14px 16px',
        display:'grid',
        gridTemplateColumns:'repeat(3, 1fr)',
        gap:8,
        textAlign:'center',
        boxShadow:'var(--sh-elevated)',
        position:'relative',
        zIndex:6,
      }}>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:18, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.02em'}}>4.9</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:2}}>Rating</div>
        </div>
        <div style={{borderLeft:'1px solid var(--line)', borderRight:'1px solid var(--line)'}}>
          <div style={{fontFamily:'var(--font-latin)', fontSize:18, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.02em'}}>1,248</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:2}}>Visits</div>
        </div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:18, fontWeight:800, color:'var(--coral)', letterSpacing:'-0.02em'}}>348</div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:2}}>Photos</div>
        </div>
      </div>

      {/* Angle guide */}
      <div style={{padding:'22px 20px 100px'}}>
        <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>
          <span style={{width:6, height:6, background:'var(--coral)', borderRadius:'50%'}}></span>
          각도 가이드
        </div>
        <div style={{fontSize:12, color:'var(--muted)', lineHeight:1.65}}>
          모지항 프롬나드 남쪽 끝에서 북북동 방향(약 20°)으로 촬영. 35mm 화각 권장,
          아침 안개가 걷히기 직전이 가장 아름답습니다. 후지산 능선과 크레인이 겹치지 않도록
          삼각대를 60cm 낮춰서 세팅해 보세요.
        </div>

        <div style={{
          marginTop:16, background:'var(--cream-2)', borderRadius:16,
          padding:'14px 16px', display:'flex', gap:12, alignItems:'center',
        }}>
          <img src="../../assets/mascot/chu-expression-focused.svg" style={{width:52, height:52}} alt=""/>
          <div style={{fontSize:12, lineHeight:1.5}}>
            <div style={{fontWeight:700, letterSpacing:'-0.01em'}}>츄의 팁</div>
            <div style={{color:'var(--muted)', marginTop:2}}>바다 방향에서 바람이 강해요.
            렌즈 후드 꼭 챙겨가세요!</div>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div style={{
        position:'absolute', bottom:24, left:16, right:16,
        display:'flex', gap:10,
      }}>
        <button onClick={onCheckIn} disabled={visited} style={{
          flex:1,
          background: visited ? 'var(--mint)' : 'var(--coral)',
          color: 'var(--cream)',
          border:'none', borderRadius:16,
          padding:'14px 16px',
          fontFamily:'var(--font-ko)', fontSize:14, fontWeight:700,
          letterSpacing:'-0.01em',
          boxShadow: visited ? 'none' : 'var(--sh-cta-coral)',
          cursor: visited ? 'default' : 'pointer',
        }}>
          {visited ? '체크인 완료 ✨' : '체크인 하고 수집하기'}
        </button>
        <button onClick={onToggleSave} style={{
          width:52, height:52,
          background:'#fff', border:'1px solid var(--line)',
          borderRadius:16, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }} aria-label="save">
          {saved
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF5F6D"><path d="M12 21s-7-4.5-9.5-9.2C1 9 2.2 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.8 0 5 4 3.5 6.8C19 16.5 12 21 12 21z"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#17233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9.2C1 9 2.2 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.8 0 5 4 3.5 6.8C19 16.5 12 21 12 21z"/></svg>}
        </button>
      </div>
    </div>
  );
}
Object.assign(window, { SpotDetailScreen });
