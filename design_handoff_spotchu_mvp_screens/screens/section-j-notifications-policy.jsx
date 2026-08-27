/* Section J — 알림 & 정책 */

function ScreenJ1Notifications() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.02em'}}>알림</div>
        <div style={{fontSize:12, fontWeight:800, color:'var(--muted)'}}>모두 읽음</div>
      </div>
      <div style={{position:'absolute', top:130, left:16, right:16, bottom:20, overflow:'hidden', fontFamily:'var(--font-ko)'}}>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {NOTIFICATIONS.map(n => {
            const iconBg = n.type === 'badge' ? 'var(--yellow)' : n.type === 'moderation' ? 'var(--mint)' : 'var(--coral)';
            const iconColor = n.type === 'badge' || n.type === 'moderation' ? 'var(--navy)' : 'var(--cream)';
            return (
              <div key={n.id} style={{background: n.unread ? 'var(--cream-2)' : '#fff', borderRadius:16, padding:'14px 14px', display:'flex', gap:12, alignItems:'flex-start', boxShadow: n.unread ? 'none' : 'var(--sh-card)', border: n.unread ? '1px solid var(--line)' : 'none'}}>
                <div style={{width:40, height:40, borderRadius:'50%', background: iconBg, color: iconColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>{n.icon}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                    <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em', color:'var(--navy)'}}>{n.title}</div>
                    <div style={{fontFamily:'var(--font-latin)', fontSize:10, color:'var(--muted)', flexShrink:0}}>{n.time}</div>
                  </div>
                  <div style={{fontSize:12, color:'var(--muted)', marginTop:4, lineHeight:1.5}}>{n.body}</div>
                </div>
                {n.unread && <div style={{width:8, height:8, borderRadius:'50%', background:'var(--coral)', flexShrink:0, marginTop:6}}/>}
              </div>
            );
          })}
          <div style={{textAlign:'center', color:'var(--muted)', fontSize:11, padding:20, fontFamily:'var(--font-ko)'}}>더 이상 알림이 없어요</div>
        </div>
      </div>
    </MobileFrame>
  );
}

function ScreenJ2Privacy() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>POLICY</div>
          <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.02em'}}>개인정보 · 위치정보</div>
        </div>
      </div>
      <div style={{position:'absolute', top:140, left:20, right:20, bottom:20, overflow:'hidden', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        {/* Chu hero */}
        <div style={{background:'linear-gradient(135deg, #45D6C6 0%, #38C4B4 100%)', color:'var(--navy)', borderRadius:20, padding:'20px 18px', display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
          <div style={{color:'var(--navy)'}}><Icon name="shield" size={42} stroke="currentColor" strokeWidth={1.8}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.01em'}}>츄가 지키는 3가지</div>
            <div style={{fontSize:11, marginTop:4, opacity:0.85}}>위치는 인증 순간에만. 원시 좌표는 저장하지 않아요.</div>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {[
            { icon:'crosshair', title:'위치는 인증 순간에만', body:'지도 탐색과 방문 인증 시에만 실시간 위치를 사용합니다. 백그라운드에서 위치를 추적하지 않아요.' },
            { icon:'lock', title:'원시 좌표는 저장 안 함', body:'인증 완료 결과(스팟 ID · 시각)만 서버에 저장됩니다. 이동 경로나 GPS 로그는 남기지 않아요.' },
            { icon:'camera', title:'사진 EXIF 위치는 제거', body:'업로드된 사진에서 EXIF 위치 정보는 서버 저장 전 제거됩니다. 스팟 위치와 사진 위치는 별개예요.' },
            { icon:'users', title:'만 14세 미만 제한', body:'가입 시 만 14세 이상 확인. 법정 대리인 동의 절차는 후속 도입.' },
          ].map((r, i) => (
            <div key={i} style={{background:'#fff', borderRadius:16, padding:'14px 14px', display:'flex', gap:12, alignItems:'flex-start', boxShadow:'var(--sh-card)'}}>
              <div style={{width:40, height:40, borderRadius:12, background:'var(--cream-2)', color:'var(--coral)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><Icon name={r.icon} size={20}/></div>
              <div>
                <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em'}}>{r.title}</div>
                <div style={{fontSize:11, color:'var(--muted)', marginTop:4, lineHeight:1.55}}>{r.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}

function ScreenJ3Safety() {
  return (
    <MobileFrame bg="var(--cream)">
      <div style={{position:'absolute', top:60, left:16, right:16, display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        <div style={{width:40, height:40, borderRadius:'50%', background:'#fff', boxShadow:'var(--sh-card)', display:'flex', alignItems:'center', justifyContent:'center'}}><Icon name="chevron-left"/></div>
        <div>
          <div style={{fontFamily:'var(--font-latin)', fontSize:10, fontWeight:600, letterSpacing:'0.18em', color:'var(--muted)'}}>POLICY</div>
          <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.02em'}}>안전 · 저작권</div>
        </div>
      </div>
      <div style={{position:'absolute', top:140, left:20, right:20, bottom:20, overflow:'hidden', fontFamily:'var(--font-ko)', color:'var(--navy)'}}>
        {/* Warning card */}
        <div style={{background:'rgba(255,95,109,0.08)', border:'1px solid rgba(255,95,109,0.25)', borderRadius:16, padding:'14px 14px', display:'flex', gap:12, alignItems:'flex-start', marginBottom:16}}>
          <div style={{color:'var(--coral-deep)'}}><Icon name="alert-triangle" size={22} stroke="currentColor" strokeWidth={2}/></div>
          <div style={{flex:1, fontSize:12, lineHeight:1.55}}>
            <b style={{color:'var(--coral-deep)'}}>안전이 최우선</b><br/>
            <span style={{color:'var(--muted)'}}>철도 · 차도 · 사유지 침입은 금지. 위험 태그가 붙은 스팟은 신중히 방문하세요.</span>
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {[
            { title:'❌ 등록 차단', body:'철도 선로 · 차도 중앙 · 옥상 무단 진입 등 고위험 유형은 자동 차단됩니다.' },
            { title:'⚠️ 위험 태그', body:'사유지 · 영업장 내 · 철도 근접 스팟은 경고 배너가 표시돼요.' },
            { title:'📸 촬영 매너', body:'다른 방문자의 프라이버시를 지키고, 안내 표지판의 촬영 금지 구역은 지켜주세요.' },
            { title:'©️ 저작권', body:'서비스는 애니 · 드라마 원본 스틸을 호스팅하지 않아요. 비교는 실촬영 사진끼리만 진행합니다.' },
            { title:'🚨 신고 · 삭제 요청', body:'권리자의 삭제 요청은 즉시 반영됩니다(notice & takedown).' },
          ].map((r, i) => (
            <div key={i} style={{background:'#fff', borderRadius:16, padding:'14px 14px', boxShadow:'var(--sh-card)'}}>
              <div style={{fontSize:13, fontWeight:800, letterSpacing:'-0.01em'}}>{r.title}</div>
              <div style={{fontSize:11, color:'var(--muted)', marginTop:4, lineHeight:1.55}}>{r.body}</div>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}

Object.assign(window, { ScreenJ1Notifications, ScreenJ2Privacy, ScreenJ3Safety });
