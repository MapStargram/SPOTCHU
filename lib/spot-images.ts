// 위키미디어 커먼스 등 합법(CC/PD) 이미지 매핑.
// url은 자가호스팅 로컬 경로(/spots/<id>.jpg). 원본은 위키미디어에서 내려받아 public/spots/에 저장한다
// (scripts/fetch-spot-images.ts). 위키미디어 핫링크는 허용 크기 버킷만 200을 줘 불안정 → 로컬만 "안 깨짐".
// CC 라이선스 준수: author/license/source(파일 페이지)를 함께 보관하고 상세 화면에 출처표기로 노출한다.
// 인스타·블로그 등 저작권 사진은 절대 넣지 않는다. NC/ND 라이선스도 제외(CC BY / CC BY-SA / CC0 / PD만).
export interface SpotImage {
  url: string; // 자가호스팅 로컬 경로 /spots/<id>.jpg
  author: string;
  license: string;
  source: string; // Wikimedia Commons 파일 페이지 URL(출처표기용)
}

const C = "https://commons.wikimedia.org/wiki/";

// 리서치 에이전트(위키미디어 CC API)로 수집·라이선스 검증한 이미지. 매칭 스팟만 실사진, 나머지는 그라디언트.
export const SPOT_IMAGES: Record<string, SpotImage> = {
  // ── 도쿄 ──
  shibuya: {
    url: "/spots/shibuya.jpg",
    author: "Benh LIEU SONG",
    license: "CC BY-SA 2.0",
    source: C + "File:Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
  },
  harajuku: {
    url: "/spots/harajuku.jpg",
    author: "Syced",
    license: "CC0",
    source: C + "File:Takeshita_Street.jpg",
  },
  azumabashi: {
    url: "/spots/azumabashi.jpg",
    author: "Kakidai",
    license: "CC BY-SA 3.0",
    source:
      C +
      "File:Skytree_%26_Asahi_Breweries_Building,_from_Azumabashi,_Asakusa_%E2%85%A3.JPG",
  },
  tocho: {
    url: "/spots/tocho.jpg",
    author: "Daderot",
    license: "CC0",
    source:
      C +
      "File:Tokyo_Metropolitan_Government_Building_No.1_-_Shinjuku,_Tokyo_-_DSC05442.jpg",
  },
  "roppongi-hills": {
    url: "/spots/roppongi-hills.jpg",
    author: "Chris 73 / 0607crp",
    license: "CC BY-SA 3.0",
    source:
      C + "File:Roppongi_Hills_Mori_Tower_from_Tokyo_Tower_Day_cropped.jpg",
  },
  "shin-bijutsukan": {
    url: "/spots/shin-bijutsukan.jpg",
    author: "Wiiii",
    license: "CC BY-SA 3.0",
    source: C + "File:National_Art_Center_Tokyo_2008.jpg",
  },
  "kamakura-koko": {
    url: "/spots/kamakura-koko.jpg",
    author: "LERK",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:Enoden-EN08-Kamakura-koko-mae-station-building-20200315-134942.jpg",
  },
  "kanda-myojin": {
    url: "/spots/kanda-myojin.jpg",
    author: "Kakidai",
    license: "CC BY-SA 3.0",
    source: C + "File:Kanda-Myojin_2012.JPG",
  },
  "omoide-yokocho": {
    url: "/spots/omoide-yokocho.jpg",
    author: "Joli Rumi",
    license: "CC BY-SA 4.0",
    source: C + "File:Omoide_Yokocho_in_Shinjuku_area,_Tokyo,_Japan.jpg",
  },
  "atago-stairs": {
    url: "/spots/atago-stairs.jpg",
    author: "Chris 73",
    license: "CC BY-SA 3.0",
    source: C + "File:Stairs_to_Atago_jinja_Tokyo.JPG",
  },
  "suga-shrine": {
    url: "/spots/suga-shrine.jpg",
    author: "Hisagi",
    license: "CC BY-SA 4.0",
    source: C + "File:Suga_Shrine_stairs_high-angle_20161113-064246.jpg",
  },
  ochanomizu: {
    url: "/spots/ochanomizu.jpg",
    author: "Roman SUZUKI",
    license: "CC BY 3.0",
    source:
      C +
      "File:%E5%BE%A1%E8%8C%B6%E3%83%8E%E6%B0%B4%E3%80%81_%E8%81%96%E6%A9%8B%E3%80%81%E7%A5%9E%E7%94%B0%E5%B7%9D_-_panoramio.jpg",
  },
  ushigafuchi: {
    url: "/spots/ushigafuchi.jpg",
    author: "Tyoron2",
    license: "Public domain",
    source: C + "File:Chidorigafuchi_sakura.JPG",
  },
  "odaiba-seaside": {
    url: "/spots/odaiba-seaside.jpg",
    author: "DXR",
    license: "CC BY-SA 4.0",
    source:
      C + "File:Rainbow_Bridge,_Tokyo,_South_view_from_Odaiba_20190419_1.jpg",
  },
  mojik: {
    url: "/spots/mojik.jpg",
    author: "Alpsdake",
    license: "CC BY-SA 4.0",
    source: C + "File:Mount_Fuji_from_Lake_Kawaguchi_s2.jpg",
  },
  "park-hyatt-bar": {
    url: "/spots/park-hyatt-bar.jpg",
    author: "Akonnchiroll",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Shinjuku_Park_Tower.jpg",
  },
  "asahi-inari": {
    url: "/spots/asahi-inari.jpg",
    author: "Kanesue",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Asahi_Inari_Shrine_in_Chuo,_Tokyo,_Japan_01_-_Kanesue,_flickr.jpg",
  },
  "azabu-hikawa": {
    url: "/spots/azabu-hikawa.jpg",
    author: "写真家 (talk)",
    license: "CC BY 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Hikawa_shrine_moto-azabu_1.jpg",
  },
  seiseki: {
    url: "/spots/seiseki.jpg",
    author: "いろは団地",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:%E5%A4%9A%E6%91%A9%E5%B8%82%E3%81%AE%E8%81%96%E8%B9%9F%E6%A1%9C%E3%83%B6%E4%B8%98%E9%A7%85%E5%89%8D20170812.jpg",
  },

  // ── 서울 ──
  namsan: {
    url: "/spots/namsan.jpg",
    author: "Matt Kieffer",
    license: "CC BY-SA 2.0",
    source: C + "File:Namsan_Seoul_Tower_at_night_(49175252042).jpg",
  },
  gyeongbok: {
    url: "/spots/gyeongbok.jpg",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg",
  },
  "changdeok-huwon": {
    url: "/spots/changdeok-huwon.jpg",
    author: "Gaël Chardon",
    license: "CC BY-SA 2.0",
    source: C + "File:Juhamnu-001.jpg",
  },
  "banpo-fountain": {
    url: "/spots/banpo-fountain.jpg",
    author: "Cookinu",
    license: "CC BY-SA 4.0",
    source: C + "File:Banpo_Moonlight_Rainbow_Fountain.jpg",
  },
  bukchon: {
    url: "/spots/bukchon.jpg",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:Bukchon-ro_11-gil_street_with_hanok_houses_in_Bukchon_Hanok_Village_Seoul.jpg",
  },
  "naksan-fortress": {
    url: "/spots/naksan-fortress.jpg",
    author: "Rtflakfizer",
    license: "CC BY-SA 4.0",
    source: C + "File:Seoul_Fortress_Wall,_Naksan.jpg",
  },
  "lotte-skytower": {
    url: "/spots/lotte-skytower.jpg",
    author: "Ox1997cow",
    license: "CC BY 3.0",
    source: C + "File:Lotte_World_Tower_near_Cheongdam_Bridge.jpg",
  },
  "deoksugung-wall": {
    url: "/spots/deoksugung-wall.jpg",
    author: "Sungslim",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:%EB%B0%A4%EC%9D%98_%EB%8D%95%EC%88%98%EA%B6%81_%EB%8F%8C%EB%8B%B4%EA%B8%B8.jpg",
  },
  ikseon: {
    url: "/spots/ikseon.jpg",
    author: "S h y numis",
    license: "CC BY-SA 4.0",
    source:
      C + "File:Ikseon-dong_%EC%9D%B5%EC%84%A0%EB%8F%99_October_1_2020_5.jpg",
  },
  "nodeul-island": {
    url: "/spots/nodeul-island.jpg",
    author: "travel oriented",
    license: "CC BY-SA 2.0",
    source: C + "File:Nodeulseom_(14005438206).jpg",
  },
  seongsu: {
    url: "/spots/seongsu.jpg",
    author: "CartoonChess",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Brick_storefront_in_Seongsu-dong.jpg",
  },
  "itaewon-danbam": {
    url: "/spots/itaewon-danbam.jpg",
    author: "Aatu Dorochenko",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Itaewon_summer.jpg",
  },
  "ttukseom-sunset": {
    url: "/spots/ttukseom-sunset.jpg",
    author: "Motoko C. K.",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Ttukseom_Hangang_Park_20260416_1.jpg",
  },
  "jahamun-stairs": {
    url: "/spots/jahamun-stairs.jpg",
    author: "Aatu Dorochenko",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Parasite_filming_location.jpg",
  },

  // ── 오사카 ──
  "dotonbori-glico": {
    url: "/spots/dotonbori-glico.jpg",
    author: "Schellack",
    license: "CC BY-SA 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Glico_Man_sign,_Dotonbori.JPG",
  },
  "osaka-castle-tenshukaku": {
    url: "/spots/osaka-castle-tenshukaku.jpg",
    author: "Mc681",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Osaka_Castle_Keep_Tower_in_201504_001.JPG",
  },
  "umeda-sky-building": {
    url: "/spots/umeda-sky-building.jpg",
    author: "Brücke-Osteuropa",
    license: "CC0",
    source:
      "https://commons.wikimedia.org/wiki/File:Osaka_Umeda_Sky_Building_1.jpg",
  },
  "tsutenkaku-shinsekai": {
    url: "/spots/tsutenkaku-shinsekai.jpg",
    author: "Sakai Yayoi",
    license: "CC0",
    source:
      "https://commons.wikimedia.org/wiki/File:Shinsekai_and_Tsutenkaku_Tower.jpg",
  },
  "sumiyoshi-taisha-sorihashi": {
    url: "/spots/sumiyoshi-taisha-sorihashi.jpg",
    author: "そらみみ",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Sorihashi_Bridge_in_Sumiyoshi_Grand_Shrine_3.jpg",
  },
  "namba-yasaka-shishiden": {
    url: "/spots/namba-yasaka-shishiden.jpg",
    author: "Immanuelle",
    license: "CC BY 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Namba-Yasaka-Jinja-Lions_head_theater-19.jpg",
  },

  // ── 교토 ──
  "fushimi-inari-senbon-torii": {
    url: "/spots/fushimi-inari-senbon-torii.jpg",
    author: "Another Believer",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Fushimi-Inari-taisha_sembon-torii_in_Kyoto,_Japan_(2019)_-_083.jpg",
  },
  "kiyomizu-dera-okunoin-view": {
    url: "/spots/kiyomizu-dera-okunoin-view.jpg",
    author: "Jordy Meow",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Kiyomizu.jpg",
  },
  "arashiyama-bamboo-grove": {
    url: "/spots/arashiyama-bamboo-grove.jpg",
    author: "Benh LIEU SONG from Torcy, France",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Arashiyama_Bamboo_Grove_Benh_2018-10-17.jpg",
  },
  "kinkakuji-golden-pavilion": {
    url: "/spots/kinkakuji-golden-pavilion.jpg",
    author: "Mstyslav Chernov/Unframe/unframe.com",
    license: "CC BY-SA 3.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kinkaku-ji_(-Temple_of_the_Golden_Pavilion-)_seen_across_Ky%C5%8Dko-chi_(Mirror_Pond)._Kita-ku,_Kyoto-2.jpg",
  },
  "gion-hanamikoji-dori": {
    url: "/spots/gion-hanamikoji-dori.jpg",
    author: "Yiannis Theologos Michellis",
    license: "CC0",
    source:
      "https://commons.wikimedia.org/wiki/File:Hanamikoji_Dori_in_Kyoto,_Japan_20170407120827_(34291539351).jpg",
  },
  "kamogawa-delta": {
    url: "/spots/kamogawa-delta.jpg",
    author: "Grendelkhan",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Kamogawa_Delta_from_the_east_bank.jpg",
  },

  // ── 후쿠오카 ──
  "ohori-park-nakanoshima": {
    url: "/spots/ohori-park-nakanoshima.jpg",
    author: "STA3816",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Ohori_Park_02.jpg",
  },
  "fukuoka-tower-momochi-beach": {
    url: "/spots/fukuoka-tower-momochi-beach.jpg",
    author: "そらみみ",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Fukuoka_Tower_and_pine_trees_from_beach_of_Seaside_Momochi_Seaside_Park.jpg",
  },
  "dazaifu-tenmangu-honden": {
    url: "/spots/dazaifu-tenmangu-honden.jpg",
    author: "そらみみ",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Gohonden_Hall_of_Dazaifu_Temman_Shrine_20150101.JPG",
  },
  "canal-city-hakata-nadanokawa-bridge": {
    url: "/spots/canal-city-hakata-nadanokawa-bridge.jpg",
    author: "OKJaguar",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Dancing_fountains,_Canal_City,_Fukuoka,_Japan.jpg",
  },
  "nakasu-seiryu-park-yatai": {
    url: "/spots/nakasu-seiryu-park-yatai.jpg",
    author: "ｍｍｒｙ0241",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Nakasu-yatai.JPG",
  },
  "sakurai-futamigaura-torii": {
    url: "/spots/sakurai-futamigaura-torii.jpg",
    author: "STA3816",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Sakurai_Futamigaura.jpg",
  },

  // ── 부산 ──
  "gamcheon-village": {
    url: "/spots/gamcheon-village.jpg",
    author: "bryan...",
    license: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Gamcheon_Culture_Village_Busan_(45024207514).jpg",
  },
  "haeundae-beach": {
    url: "/spots/haeundae-beach.jpg",
    author: "Mobius6",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Haeundae_Beach_20200522_005.jpg",
  },
  "gwangalli-gwangan-bridge": {
    url: "/spots/gwangalli-gwangan-bridge.jpg",
    author: "bryan...",
    license: "CC BY-SA 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Gwangandaegyo_Diamond_Bridge_Gwangalli_Beach_Busan_(31888343778).jpg",
  },
  "huinnyeoul-village": {
    url: "/spots/huinnyeoul-village.jpg",
    author: "Choi2451",
    license: "CC0",
    source:
      "https://commons.wikimedia.org/wiki/File:Huinnyeoul_culture_village,_Busan_on_October_25th,_2019.jpg",
  },
  "haedong-yonggungsa": {
    url: "/spots/haedong-yonggungsa.jpg",
    author: "Mobius6",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Haedong_Yonggungsa_Temple_20200522_021.jpg",
  },
  taejongdae: {
    url: "/spots/taejongdae.jpg",
    author: "*intacto",
    license: "CC BY 2.0",
    source:
      "https://commons.wikimedia.org/wiki/File:Korea-Busan-Taejongdae-03.jpg",
  },
};
