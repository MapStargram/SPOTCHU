/* PhoneFrame.jsx — a static device shell for the mobile UI kit */
function PhoneFrame({ children, bg = 'var(--cream)' }) {
  const frameStyle = {
    position: 'relative',
    width: 390,
    height: 844,
    background: '#0B1424',
    borderRadius: 46,
    padding: 8,
    boxShadow: 'var(--sh-device)',
    flexShrink: 0,
  };
  const screenStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 38,
    overflow: 'hidden',
    background: bg,
  };
  const notchStyle = {
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 118,
    height: 32,
    background: '#0B1424',
    borderRadius: 100,
    zIndex: 20,
  };
  const statusStyle = {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    height: 44,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    color: 'inherit',
    fontFamily: 'var(--font-latin)',
    fontSize: 15,
    fontWeight: 600,
    zIndex: 21,
    pointerEvents: 'none',
  };
  return (
    <div style={frameStyle}>
      <div style={screenStyle}>
        <div style={notchStyle}></div>
        <div style={statusStyle}>
          <span>9:41</span>
          <span style={{display:'inline-flex',gap:6,alignItems:'center'}}>
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><path d="M8 11h2V6H8v5zM0 11h2V4H0v7zm4 0h2V2H4v9zm8 0h2V0h-2v11z"/></svg>
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 3c2 0 3.9.7 5.4 2l1.4-1.5C13 1.9 10.6 1 8 1S3 1.9 1.2 3.5L2.6 5C4.1 3.7 6 3 8 3zm0 4c1 0 1.9.3 2.5.9l1.4-1.4C10.9 5.6 9.5 5 8 5s-2.9.6-3.9 1.5l1.4 1.4C6.1 7.3 7 7 8 7zm0 2.5c-.5 0-1 .2-1.4.6L8 11.5l1.4-1.4c-.4-.4-.9-.6-1.4-.6z"/></svg>
            <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor"/><rect x="24" y="4" width="2" height="5" rx="0.8" fill="currentColor" opacity="0.5"/></svg>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { PhoneFrame });
