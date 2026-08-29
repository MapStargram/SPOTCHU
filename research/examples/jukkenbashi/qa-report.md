# SPOTCHU Research QA Report - 2026-08-29 (Re-verify attempt 1)

## Run summary

- Country: Japan (JP)
- City/category: Tokyo (tokyo) / PHOTO
- Discovery run: 2026-08-29-mtdv93zo-0
- Re-verification attempt: 1
- Raw candidates ingested: 1
- SpotLeads accepted as READY_FOR_REVIEW: 0
- Candidates rejected: 0
- Possible Spot duplicates: 0
- Production Spots created or modified: 0
- Final run status: NEEDS_GEO_REVIEW
- Follow-up result: Antigravity claimed the position was resolved, but the updated inbox artifact does not contain candidate-specific proof for the claim.
- Supplemental sources checked: 3 (bridge geometry, bridge safety, and a geotagged sibling Commons image)
- Coordinate provenance: the inbox point 35.708316,139.818085 exactly matches the DJQ bridge-reference coordinate; it is therefore retained as a claimed bridge-area clue, not accepted as the photographer's standing position.
- Historical artifact note: the discovery run referenced an inbox file that was initially absent. The exact JSON was recovered from the referenced Antigravity scratch artifact and restored before curation. This re-verification consumed the restored inbox file; recovery is recorded in the normalized record.

## Countries processed

- JP (Japan)

## Coverage

- Cities processed: Tokyo
- Categories processed: PHOTO
- Works processed: none; this is a landmark/photo composition, not a media-location claim.
- Coverage gap: only one Tokyo viewpoint was processed. No additional country, city, category, work, or source-language coverage was added.

## Candidate disposition

### Preserved as geo-review backlog

JP-20260829-tokyo-jukkenbashi-sakasa-skytree-8a3f

- Title: Jukkenbashi Sakasa Skytree / 十間橋 逆さスカイツリー
- Normalized record: research/normalized/JP-20260829-tokyo-jukkenbashi-sakasa-skytree-8a3f.json
- Status: NEEDS_GEO_REVIEW
- Reason: independent sources identify Jukkenbashi and the reflection composition, but the supplied coordinates are bridge map pins rather than a proven photographer standing position. Normalized shooterLat and shooterLng remain null; raw claimed coordinates remain provenance only.
- Inbox check: the claimed 35.708316,139.818085 is identical to the DJQ page's bridge reference coordinate, confirming the map-pin provenance rather than candidate-image geometry.
- Reverify finding: the follow-up asserted 35.708316,139.818042 on the west pedestrian railing, but that assertion is not documented in the updated inbox evidence and was not independently tied to the candidate image.
- Target: Tokyo Skytree, approximately 694 m from the raw claimed bridge point.
- Geometry: reported bearing 283 degrees; independently calculated initial bearing 286.18 degrees; difference 3.18 degrees, acceptable for an approximate direction.
- Confidence: source 0.90, geo 0.58, composition 0.94, work/scene 1.00 (not applicable), overall 0.66.
- Image policy: the Wikimedia Commons image is a physical-location reference under CC BY-SA 4.0. It was not copied into production assets and is not projected into an app lead while geo review is open.

## Validation and evidence analysis

- Wikimedia Commons verifies the candidate photograph as taken from Jukkenbashi and documents the Tokyo Skytree/reflection composition. It does not prove the exact camera coordinate for that image.
- Yakei.jp identifies the bridge, westward Skytree view, vertical framing, approximately 18 mm full-frame guidance, access, and a map point of 35.708311452543,139.81804132462.
- Nightview.info independently identifies the bridge and reflection viewpoint, reports 35.708324,139.818039, and warns that tripod use is prohibited.
- Sumida City's official page records Jukkenbashi as the shooting location for a Skytree image, supporting the place name but not an exact photographer coordinate.
- DJQ's bridge directory confirms bridge geometry and left/right-bank and center-view context, but does not assign the candidate image to a span or sidewalk.
- Yakei Navi confirms a bridge-level viewpoint and warns visitors not to enter the roadway or obstruct the small bridge; it does not identify the candidate camera position.
- A separate 2015 Wikimedia Commons sibling image by the same creator exposes camera location 35.708321,139.817993. This corroborates that a real photographer position exists on Jukkenbashi, but it is not accepted as the candidate image's shooter coordinate.
- The target coordinate 35.710056,139.8107 is consistent with independent Tokyo Skytree map records.
- The bridge map pins agree within approximately 1.4 m, and the raw claim is approximately 4 m from the Yakei pin. That agreement establishes the bridge area, not the exact standing point.
- Yakei.jp, Nightview.info, and Yakei Navi are conservatively grouped as specialist night-view-guide evidence. The same-creator sibling image is lineage-correlated and is not counted as independent candidate-position proof.
- No PostGIS/staging database was available or used. Haversine distance and bearing were checked with repository geospatial formulas.

## Source duplicates

- Source duplicates: 0
- Canonical URL duplicates: 0
- No same-platform/source-post identity was present in the input.
- Repeated bridge claims were not counted as independent merely because they appeared at different URLs.

## Possible Spot duplicates

- Possible Spot duplicates: 0
- Existing normalized records checked: 0
- Existing app lead records checked: 0
- Existing imported production Spots checked: 0
- Nearby distinct viewpoints considered: Nishijukkenbashi and Yanagishima pedestrian bridge. They remain distinct alternatives because sources describe different viewing heights/compositions.

## Conflicting evidence

- No direct physical-location conflict was found.
- Review discrepancy: the follow-up asserted an exact west-railing position, while the updated inbox and independently checked sources support only bridge-level location or a separate sibling image. This discrepancy keeps the record in NEEDS_GEO_REVIEW.
- The raw agent's `geoStatus: CONFIRMED` and geo confidence 0.98 were not accepted because the point is a bridge map pin rather than documented candidate-image shooter geometry.

## High-confidence discoveries

None are import-ready in this re-verification. Jukkenbashi is a strong location/composition discovery, but the unresolved shooter point prevents READY_FOR_REVIEW and prevents writing research/leads/.

## Low-confidence discoveries worth preserving

One: Jukkenbashi remains valuable because its bridge identity, westward Skytree alignment, and reflection composition are well supported. The sibling geotag improves plausibility that the bridge can produce the composition, but it does not resolve the candidate image's exact point.

## Data-quality problems

1. The discovery run referenced an inbox artifact that was not present at first and required scratch-artifact recovery.
2. The raw record overstates geo certainty for a bridge map pin. The curated record correctly retains null shooter coordinates and NEEDS_GEO_REVIEW.
3. The raw Yakei URL used `?i=jukken`; the resolved canonical page is `?i=jyukken`.
4. The raw proof labels are free-form rather than repository conceptual evidence types; they were mapped conservatively.
5. A raw Tabiiro attribution could not be safely fetched or matched during this run and remains unverified lineage only.
6. The follow-up exact-position assertion is not accompanied by source-specific evidence in the updated inbox artifact.
7. Current access conditions are only partially verified: public bridge access and no-roadway standing are supported, while the candidate image's exact legal standing point remains open.

## Research gaps

- Candidate-image-specific exact shooter coordinates, including bridge span, sidewalk side, and legal standing point.
- A visual alignment between the candidate image and Street View/map geometry.
- Current on-site access constraints beyond the documented tripod restriction.
- More Tokyo photo viewpoints and broader country/city/category coverage.

## Browser Verification Queue

### 1. JP-20260829-tokyo-jukkenbashi-sakasa-skytree-8a3f

Question: Determine the exact photographer standing position on Jukkenbashi for the full upside-down Tokyo Skytree reflection.

Known:

- Jukkenbashi and the reflection composition are supported by [Yakei.jp](https://yakei.jp/japan/spot.php?i=jyukken), [Nightview.info](https://www.nightview.info/detail/jukkenbashi/), Sumida City's official page, and the candidate [Wikimedia Commons image](https://commons.wikimedia.org/wiki/File:%E5%8D%81%E9%96%93%E6%A9%8B%E3%81%8B%E3%82%89%E3%81%AE%E6%9D%B1%E4%BA%AC%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%84%E3%83%AA%E3%83%BC.jpg).
- Yakei.jp and Nightview.info map the bridge to points within about 1.4 m of each other; the raw claimed point is about 4 m from the Yakei pin.
- A separate [Commons sibling image](https://commons.wikimedia.org/wiki/File%3A%E5%8D%81%E9%96%93%E6%A9%8B%E3%81%8B%E3%82%89%E3%81%AE%E6%9D%B1%E4%BA%AC%E3%82%B9%E3%82%AB%E3%82%A4%E3%83%84%E3%83%AA%E3%83%BC_02.jpg) by the same creator has camera location 35.708321,139.817993.
- Target distance and westward bearing are geometrically plausible.
- The bridge is a public walkable viewpoint, but roadway intrusion must be avoided and Nightview.info reports that tripods are prohibited.

Missing:

- Candidate-specific exact bridge span, sidewalk side, and standing point.
- Evidence that the follow-up's claimed west pedestrian railing point at 35.708316,139.818042 produced the candidate image.
- Confirmation that the selected point is on a legal pedestrian area rather than the roadway.
- A Street View, map, or geotagged-photo alignment supporting shooter coordinates rather than a bridge POI centroid.

Recommended investigation:

- Compare Google Street View around 35.708316,139.818085 and the sibling geotag 35.708321,139.817993 with the candidate composition.
- Search `十間橋 撮影 立ち位置`, `十間橋 逆さスカイツリー 撮影場所 歩道`, `十間橋 逆さスカイツリー 西側歩道 欄干`, and `Jukkenbashi Skytree reflection exact viewpoint`.
- Inspect both bridge sidewalks and the river alignment; record the point where the water reflection and tower axis match.
- Use the [DJQ bridge geometry page](https://www.djq.jp/bridge_liblary/river_kitajyukken/tokyo_bridge_kitajyukken007_jyukken.php) and [Yakei Navi](https://yakei-navi.com/jukkenbashi/) to constrain bridge sides and safe pedestrian access.
- If only the bridge centroid can be established, keep shooter coordinates null and leave the lead in geo review.

Expected evidence to resolve:

A candidate-image-specific map/Street View or geotagged-image comparison showing the specific bridge span, sidewalk side, and legal pedestrian standing position, with shooterLat/shooterLng updated to that position. The sibling geotag alone is insufficient. Do not resolve this by copying the bridge or target POI coordinate.

Priority: HIGH

## Recommended Antigravity follow-up tasks

1. Complete the high-priority browser task above and return candidate-image-specific evidence for exact shooter coordinates, or explicitly document why exact coordinates cannot be recovered.
2. Compare the candidate image against both sidewalks and the sibling Commons geotag; report the bridge span, side, and legal standing surface.
3. Capture current access/safety context for Jukkenbashi, especially pedestrian clearance and the tripod restriction.
4. If geo is resolved, rerun source-independent verification and produce the thin importer projection only after the coordinate is confirmed. If the next follow-up cannot supply candidate-specific proof, route to human review.

## Metrics

```json
{
  "rawSources": 3,
  "newSources": 3,
  "duplicateSources": 0,
  "candidateLeads": 1,
  "newLeads": 0,
  "mergedEvidence": 0,
  "possibleDuplicates": 0,
  "rejectedLeads": 0,
  "geoReviewCount": 1,
  "sourceReviewCount": 0,
  "readyForReviewCount": 0,
  "averageConfidence": 0.66,
  "countryCoverage": 1,
  "cityCoverage": 1,
  "categoryCoverage": 1,
  "supplementalSourcesChecked": 3
}
```

## Operator loop

No import was run because this candidate lacks confident shooter coordinates and no file was written to research/leads/. After geo review resolves the shooter position and the lead reaches READY_FOR_REVIEW:

```text
npm run import:leads
npm run db:seed
restart the development server
```

The database step is optional deployment workflow and was not run by this curation pass. No production Spot data was modified.
