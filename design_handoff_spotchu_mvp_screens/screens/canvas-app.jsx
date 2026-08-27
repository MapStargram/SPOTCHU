/* canvas-app.jsx — assembles all 40+ screens into a Design Canvas */

const TWEAK_DEFAULS = /*EDITMODE-BEGIN*/{
  "showMobile": true,
  "showDesktop": true,
  "cityFilter": "all",
  "backgroundTint": "cream"
}/*EDITMODE-END*/;

function CanvasApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULS);

  const bgMap = {
    cream: 'var(--cream-2)',
    warm: 'linear-gradient(135deg, #FBEFE0 0%, #FFF9F2 100%)',
    cool: 'linear-gradient(135deg, #E9EEF5 0%, #DDE5EE 100%)',
    dark: '#0B1424',
  };

  const showCity = (city) => t.cityFilter === 'all' || t.cityFilter === city;

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; background: ${bgMap[t.backgroundTint] || bgMap.cream}; }
        * { box-sizing: border-box; }
        @keyframes chubob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-4px);} }
        @keyframes splashSlide { 0%{left:-35%;} 100%{left:100%;} }
        @keyframes markerPulse { 0% { transform: translate(-50%, 50%) scale(0.6); opacity: 0.35;} 100% { transform: translate(-50%, 50%) scale(2.2); opacity: 0;} }
      `}</style>

      <DesignCanvas>
        <DCPostIt top={40} left={40} rotate={-3} width={280}>
          <b>스팟츄 · 전체 화면 세트</b><br/>
          PRD 기반 40+ 화면. 손으로 팬 · 스크롤로 줌.
          <br/><br/>
          <span style={{opacity:0.7}}>D2 비교 슬라이더는 실제로 드래그해 볼 수 있어요.</span>
        </DCPostIt>

        {t.showMobile && (
          <DCSection id="a" title="A · 온보딩 & 인증" subtitle="Splash → 3-step onboarding → Login → 위치 권한">
            <DCArtboard id="a1" label="A1 · Splash" width={390} height={844}><ScreenA1Splash/></DCArtboard>
            <DCArtboard id="a2" label="A2 · Onboarding 1 지도" width={390} height={844}><ScreenA2Onboarding1/></DCArtboard>
            <DCArtboard id="a3" label="A3 · Onboarding 2 각도" width={390} height={844}><ScreenA3Onboarding2/></DCArtboard>
            <DCArtboard id="a4" label="A4 · Onboarding 3 수집" width={390} height={844}><ScreenA4Onboarding3/></DCArtboard>
            <DCArtboard id="a5" label="A5 · Login" width={390} height={844}><ScreenA5Login/></DCArtboard>
            <DCArtboard id="a6" label="A6 · Location Permission" width={390} height={844}><ScreenA6Permission/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="b" title="B · 홈 & 도시 & 작품 상세" subtitle="도시 선택 · 홈 큐레이션 · 애니 성지 진행률">
            <DCArtboard id="b1" label="B1 · City Picker" width={390} height={844}><ScreenB1CityPicker/></DCArtboard>
            {showCity('tokyo') && <DCArtboard id="b2" label="B2 · Home · 도쿄" width={390} height={844}><ScreenB2HomeTokyo/></DCArtboard>}
            {showCity('seoul') && <DCArtboard id="b3" label="B3 · Home · 서울" width={390} height={844}><ScreenB3HomeSeoul/></DCArtboard>}
            <DCArtboard id="b4" label="B4 · Work Detail · 너의 이름은." width={390} height={844}><ScreenB4WorkDetail/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="c" title="C · 탐색 & 검색" subtitle="지도 ⇄ 피드 토글 · 검색 진입 · 필터 시트">
            <DCArtboard id="c1" label="C1 · Explore · Map" width={390} height={844}><ScreenC1Map/></DCArtboard>
            <DCArtboard id="c2" label="C2 · Explore · Feed" width={390} height={844}><ScreenC2Feed/></DCArtboard>
            <DCArtboard id="c3" label="C3 · Search" width={390} height={844}><ScreenC3Search/></DCArtboard>
            <DCArtboard id="c4" label="C4 · Filter Sheet" width={390} height={844}><ScreenC4Filter/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="d" title="D · 스팟 상세" subtitle="Hero · 비교 슬라이더 (실제 드래그) · 리뷰 · 저장 시트">
            <DCArtboard id="d1" label="D1 · Spot · Hero" width={390} height={844}><ScreenD1SpotHero/></DCArtboard>
            <DCArtboard id="d2" label="D2 · Compare Slider · 드래그 ↔" width={390} height={844}><ScreenD2CompareSlider/></DCArtboard>
            <DCArtboard id="d3" label="D3 · Spot · Meta + Reviews" width={390} height={844}><ScreenD3SpotBottom/></DCArtboard>
            <DCArtboard id="d4" label="D4 · Save Sheet" width={390} height={844}><ScreenD4SaveSheet/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="e" title="E · 컬렉션" subtitle="목록 · 리스트/지도 · 생성">
            <DCArtboard id="e1" label="E1 · Collections List" width={390} height={844}><ScreenE1CollectionList/></DCArtboard>
            <DCArtboard id="e2" label="E2 · Collection · List" width={390} height={844}><ScreenE2CollectionListView/></DCArtboard>
            <DCArtboard id="e3" label="E3 · Collection · Map" width={390} height={844}><ScreenE3CollectionMap/></DCArtboard>
            <DCArtboard id="e4" label="E4 · New Collection" width={390} height={844}><ScreenE4CreateCollection/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="f" title="F · GPS 방문 인증" subtitle="시작 · GPS 확인 · 성공 (배지) · 에러 3종">
            <DCArtboard id="f1" label="F1 · Check-in Start" width={390} height={844}><ScreenF1CheckinStart/></DCArtboard>
            <DCArtboard id="f2" label="F2 · GPS Acquiring" width={390} height={844}><ScreenF2Acquiring/></DCArtboard>
            <DCArtboard id="f3" label="F3 · Success + Badge" width={390} height={844}><ScreenF3Success/></DCArtboard>
            <DCArtboard id="f4" label="F4 · Error · 반경 밖" width={390} height={844}><ScreenF4OutOfRange/></DCArtboard>
            <DCArtboard id="f5" label="F5 · Error · 정확도 불량" width={390} height={844}><ScreenF5PoorAccuracy/></DCArtboard>
            <DCArtboard id="f6" label="F6 · Error · 권한 거부" width={390} height={844}><ScreenF6PermissionDenied/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="g" title="G · 프로필 & 게임화" subtitle="프로필 · 배지 도감 · 방문 기록 · 설정">
            <DCArtboard id="g1" label="G1 · Profile" width={390} height={844}><ScreenG1Profile/></DCArtboard>
            <DCArtboard id="g2" label="G2 · Badge Dex" width={390} height={844}><ScreenG2Badges/></DCArtboard>
            <DCArtboard id="g3" label="G3 · Visit History" width={390} height={844}><ScreenG3History/></DCArtboard>
            <DCArtboard id="g4" label="G4 · Settings" width={390} height={844}><ScreenG4Settings/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="h" title="H · 커뮤니티 & 사진" subtitle="도시 피드 · 업로드 · 게시물 상세">
            <DCArtboard id="h1" label="H1 · City Feed" width={390} height={844}><ScreenH1CityFeed/></DCArtboard>
            <DCArtboard id="h2" label="H2 · Upload" width={390} height={844}><ScreenH2Upload/></DCArtboard>
            <DCArtboard id="h3" label="H3 · Post Detail" width={390} height={844}><ScreenH3PostDetail/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="i" title="I · 스팟 제보" subtitle="위치 지정 · 정보 입력 · 완료">
            <DCArtboard id="i1" label="I1 · Pick Location" width={390} height={844}><ScreenI1PickLocation/></DCArtboard>
            <DCArtboard id="i2" label="I2 · Form" width={390} height={844}><ScreenI2Form/></DCArtboard>
            <DCArtboard id="i3" label="I3 · Submitted" width={390} height={844}><ScreenI3Submitted/></DCArtboard>
          </DCSection>
        )}

        {t.showMobile && (
          <DCSection id="j" title="J · 알림 & 정책" subtitle="알림 목록 · 개인정보 · 안전 · 저작권">
            <DCArtboard id="j1" label="J1 · Notifications" width={390} height={844}><ScreenJ1Notifications/></DCArtboard>
            <DCArtboard id="j2" label="J2 · Privacy" width={390} height={844}><ScreenJ2Privacy/></DCArtboard>
            <DCArtboard id="j3" label="J3 · Safety · Copyright" width={390} height={844}><ScreenJ3Safety/></DCArtboard>
          </DCSection>
        )}

        {t.showDesktop && (
          <DCSection id="k" title="K · 웹 어드민 · 데스크톱" subtitle="1280×800 · 검수 큐 대시보드 & 스팟 검수 상세">
            <DCArtboard id="k1" label="K1 · Moderation Queue" width={1280} height={800}><ScreenK1AdminQueue/></DCArtboard>
            <DCArtboard id="k2" label="K2 · Spot Review" width={1280} height={800}><ScreenK2AdminSpotReview/></DCArtboard>
          </DCSection>
        )}
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="플랫폼"/>
        <TweakToggle label="모바일 화면" value={t.showMobile} onChange={v => setTweak('showMobile', v)}/>
        <TweakToggle label="데스크톱 (어드민)" value={t.showDesktop} onChange={v => setTweak('showDesktop', v)}/>

        <TweakSection label="도시 필터"/>
        <TweakRadio label="도시" value={t.cityFilter}
          options={[
            { value:'all', label:'전체' },
            { value:'tokyo', label:'도쿄' },
            { value:'seoul', label:'서울' },
          ]}
          onChange={v => setTweak('cityFilter', v)}/>

        <TweakSection label="캔버스 배경"/>
        <TweakRadio label="배경 톤" value={t.backgroundTint}
          options={[
            { value:'cream', label:'크림' },
            { value:'warm', label:'웜' },
            { value:'cool', label:'쿨' },
            { value:'dark', label:'다크' },
          ]}
          onChange={v => setTweak('backgroundTint', v)}/>
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CanvasApp/>);
