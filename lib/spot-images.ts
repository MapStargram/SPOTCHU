// 위키미디어 커먼스 등 합법(CC/PD) 이미지 매핑.
// 현재는 Wikimedia 썸네일 URL을 직접 참조(즉시 실사진). 프로덕션 최적화로 R2 self-host 예정(로드맵).
// CC 라이선스 준수: author/license/source(파일 페이지)를 함께 보관하고 상세 화면에 출처표기로 노출한다.
// 인스타·블로그 등 저작권 사진은 절대 넣지 않는다. NC/ND 라이선스도 제외(CC BY / CC BY-SA / CC0 / PD만).
export interface SpotImage {
  url: string;
  author: string;
  license: string;
  source: string; // Wikimedia Commons 파일 페이지 URL
}

const C = "https://commons.wikimedia.org/wiki/";

// 리서치 에이전트(위키미디어 CC API)로 수집·라이선스 검증한 이미지. 매칭 스팟만 실사진, 나머지는 그라디언트.
export const SPOT_IMAGES: Record<string, SpotImage> = {
  // ── 도쿄 ──
  shibuya: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg/960px-Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
    author: "Benh LIEU SONG",
    license: "CC BY-SA 2.0",
    source: C + "File:Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg",
  },
  harajuku: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Takeshita_Street.jpg/960px-Takeshita_Street.jpg",
    author: "Syced",
    license: "CC0",
    source: C + "File:Takeshita_Street.jpg",
  },
  azumabashi: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Skytree_%26_Asahi_Breweries_Building%2C_from_Azumabashi%2C_Asakusa_%E2%85%A3.JPG/960px-Skytree_%26_Asahi_Breweries_Building%2C_from_Azumabashi%2C_Asakusa_%E2%85%A3.JPG",
    author: "Kakidai",
    license: "CC BY-SA 3.0",
    source:
      C +
      "File:Skytree_%26_Asahi_Breweries_Building,_from_Azumabashi,_Asakusa_%E2%85%A3.JPG",
  },
  tocho: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Tokyo_Metropolitan_Government_Building_No.1_-_Shinjuku%2C_Tokyo_-_DSC05442.jpg/960px-Tokyo_Metropolitan_Government_Building_No.1_-_Shinjuku%2C_Tokyo_-_DSC05442.jpg",
    author: "Daderot",
    license: "CC0",
    source:
      C +
      "File:Tokyo_Metropolitan_Government_Building_No.1_-_Shinjuku,_Tokyo_-_DSC05442.jpg",
  },
  "roppongi-hills": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Roppongi_Hills_Mori_Tower_from_Tokyo_Tower_Day_cropped.jpg/960px-Roppongi_Hills_Mori_Tower_from_Tokyo_Tower_Day_cropped.jpg",
    author: "Chris 73 / 0607crp",
    license: "CC BY-SA 3.0",
    source:
      C + "File:Roppongi_Hills_Mori_Tower_from_Tokyo_Tower_Day_cropped.jpg",
  },
  "shin-bijutsukan": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/National_Art_Center_Tokyo_2008.jpg/960px-National_Art_Center_Tokyo_2008.jpg",
    author: "Wiiii",
    license: "CC BY-SA 3.0",
    source: C + "File:National_Art_Center_Tokyo_2008.jpg",
  },
  "kamakura-koko": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Enoden-EN08-Kamakura-koko-mae-station-building-20200315-134942.jpg/960px-Enoden-EN08-Kamakura-koko-mae-station-building-20200315-134942.jpg",
    author: "LERK",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:Enoden-EN08-Kamakura-koko-mae-station-building-20200315-134942.jpg",
  },
  "kanda-myojin": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Kanda-Myojin_2012.JPG/960px-Kanda-Myojin_2012.JPG",
    author: "Kakidai",
    license: "CC BY-SA 3.0",
    source: C + "File:Kanda-Myojin_2012.JPG",
  },
  "omoide-yokocho": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Omoide_Yokocho_in_Shinjuku_area%2C_Tokyo%2C_Japan.jpg/960px-Omoide_Yokocho_in_Shinjuku_area%2C_Tokyo%2C_Japan.jpg",
    author: "Joli Rumi",
    license: "CC BY-SA 4.0",
    source: C + "File:Omoide_Yokocho_in_Shinjuku_area,_Tokyo,_Japan.jpg",
  },
  "atago-stairs": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Stairs_to_Atago_jinja_Tokyo.JPG/960px-Stairs_to_Atago_jinja_Tokyo.JPG",
    author: "Chris 73",
    license: "CC BY-SA 3.0",
    source: C + "File:Stairs_to_Atago_jinja_Tokyo.JPG",
  },
  "suga-shrine": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Suga_Shrine_stairs_high-angle_20161113-064246.jpg/960px-Suga_Shrine_stairs_high-angle_20161113-064246.jpg",
    author: "Hisagi",
    license: "CC BY-SA 4.0",
    source: C + "File:Suga_Shrine_stairs_high-angle_20161113-064246.jpg",
  },
  ochanomizu: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/%E5%BE%A1%E8%8C%B6%E3%83%8E%E6%B0%B4%E3%80%81_%E8%81%96%E6%A9%8B%E3%80%81%E7%A5%9E%E7%94%B0%E5%B7%9D_-_panoramio.jpg/960px-%E5%BE%A1%E8%8C%B6%E3%83%8E%E6%B0%B4%E3%80%81_%E8%81%96%E6%A9%8B%E3%80%81%E7%A5%9E%E7%94%B0%E5%B7%9D_-_panoramio.jpg",
    author: "Roman SUZUKI",
    license: "CC BY 3.0",
    source:
      C +
      "File:%E5%BE%A1%E8%8C%B6%E3%83%8E%E6%B0%B4%E3%80%81_%E8%81%96%E6%A9%8B%E3%80%81%E7%A5%9E%E7%94%B0%E5%B7%9D_-_panoramio.jpg",
  },
  ushigafuchi: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Chidorigafuchi_sakura.JPG/960px-Chidorigafuchi_sakura.JPG",
    author: "Tyoron2",
    license: "Public domain",
    source: C + "File:Chidorigafuchi_sakura.JPG",
  },
  "odaiba-seaside": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Rainbow_Bridge%2C_Tokyo%2C_South_view_from_Odaiba_20190419_1.jpg/960px-Rainbow_Bridge%2C_Tokyo%2C_South_view_from_Odaiba_20190419_1.jpg",
    author: "DXR",
    license: "CC BY-SA 4.0",
    source:
      C + "File:Rainbow_Bridge,_Tokyo,_South_view_from_Odaiba_20190419_1.jpg",
  },
  mojik: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Mount_Fuji_from_Lake_Kawaguchi_s2.jpg/960px-Mount_Fuji_from_Lake_Kawaguchi_s2.jpg",
    author: "Alpsdake",
    license: "CC BY-SA 4.0",
    source: C + "File:Mount_Fuji_from_Lake_Kawaguchi_s2.jpg",
  },

  // ── 서울 ──
  namsan: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Namsan_Seoul_Tower_at_night_%2849175252042%29.jpg/800px-Namsan_Seoul_Tower_at_night_%2849175252042%29.jpg",
    author: "Matt Kieffer",
    license: "CC BY-SA 2.0",
    source: C + "File:Namsan_Seoul_Tower_at_night_(49175252042).jpg",
  },
  gyeongbok: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg/800px-Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg",
  },
  "changdeok-huwon": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Juhamnu-001.jpg/800px-Juhamnu-001.jpg",
    author: "Gaël Chardon",
    license: "CC BY-SA 2.0",
    source: C + "File:Juhamnu-001.jpg",
  },
  "banpo-fountain": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Banpo_Moonlight_Rainbow_Fountain.jpg/800px-Banpo_Moonlight_Rainbow_Fountain.jpg",
    author: "Cookinu",
    license: "CC BY-SA 4.0",
    source: C + "File:Banpo_Moonlight_Rainbow_Fountain.jpg",
  },
  bukchon: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Bukchon-ro_11-gil_street_with_hanok_houses_in_Bukchon_Hanok_Village_Seoul.jpg/800px-Bukchon-ro_11-gil_street_with_hanok_houses_in_Bukchon_Hanok_Village_Seoul.jpg",
    author: "Basile Morin",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:Bukchon-ro_11-gil_street_with_hanok_houses_in_Bukchon_Hanok_Village_Seoul.jpg",
  },
  "naksan-fortress": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Seoul_Fortress_Wall%2C_Naksan.jpg/800px-Seoul_Fortress_Wall%2C_Naksan.jpg",
    author: "Rtflakfizer",
    license: "CC BY-SA 4.0",
    source: C + "File:Seoul_Fortress_Wall,_Naksan.jpg",
  },
  "lotte-skytower": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lotte_World_Tower_near_Cheongdam_Bridge.jpg/800px-Lotte_World_Tower_near_Cheongdam_Bridge.jpg",
    author: "Ox1997cow",
    license: "CC BY 3.0",
    source: C + "File:Lotte_World_Tower_near_Cheongdam_Bridge.jpg",
  },
  "deoksugung-wall": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/%EB%B0%A4%EC%9D%98_%EB%8D%95%EC%88%98%EA%B6%81_%EB%8F%8C%EB%8B%B4%EA%B8%B8.jpg/800px-%EB%B0%A4%EC%9D%98_%EB%8D%95%EC%88%98%EA%B6%81_%EB%8F%8C%EB%8B%B4%EA%B8%B8.jpg",
    author: "Sungslim",
    license: "CC BY-SA 4.0",
    source:
      C +
      "File:%EB%B0%A4%EC%9D%98_%EB%8D%95%EC%88%98%EA%B6%81_%EB%8F%8C%EB%8B%B4%EA%B8%B8.jpg",
  },
  ikseon: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Ikseon-dong_%EC%9D%B5%EC%84%A0%EB%8F%99_October_1_2020_5.jpg/800px-Ikseon-dong_%EC%9D%B5%EC%84%A0%EB%8F%99_October_1_2020_5.jpg",
    author: "S h y numis",
    license: "CC BY-SA 4.0",
    source:
      C + "File:Ikseon-dong_%EC%9D%B5%EC%84%A0%EB%8F%99_October_1_2020_5.jpg",
  },
  "nodeul-island": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Nodeulseom_%2814005438206%29.jpg/800px-Nodeulseom_%2814005438206%29.jpg",
    author: "travel oriented",
    license: "CC BY-SA 2.0",
    source: C + "File:Nodeulseom_(14005438206).jpg",
  },
};
