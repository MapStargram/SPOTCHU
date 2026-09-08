import type { Metadata } from "next";

// D-0 스파이크(임시). 인스타에서 공유했을 때 SPOTCHU가 실제로 무엇을 받는지 확인한다.
// share_target(app/manifest.ts)이 넘긴 쿼리 파라미터를 가공 없이 그대로 보여준다.
// 판정 기준: text/title 안에 캡션(=해시태그)이 들어오면 자동 분석이 가능하고,
// URL 하나만 오면 불가능하다. 문서: docs/features/09-community-feed-upload/instagram-crosspost-spec.md §D-0
// 확인이 끝나면 이 페이지와 manifest.ts의 share_target 블록을 함께 정리한다.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Raw = Record<string, string | string[] | undefined>;

const URL_ONLY = /^\s*https?:\/\/\S+\s*$/;

export default async function ShareDebugScreen({
  searchParams,
}: {
  searchParams: Promise<Raw>;
}) {
  const raw = await searchParams;
  const entries = Object.entries(raw).flatMap(([k, v]) =>
    (Array.isArray(v) ? v : v === undefined ? [] : [v]).map(
      (value) => [k, value] as const,
    ),
  );
  const hashtags = entries.flatMap(([, v]) => v.match(/#[^\s#]+/g) ?? []);
  const received = entries.length > 0;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-5 font-mono text-sm">
      <header className="space-y-1 font-sans">
        <h1 className="text-lg font-bold">D-0 · 공유 페이로드 확인</h1>
        <p className="text-neutral-600">
          인스타 게시물을 SPOTCHU로 공유했을 때 넘어온 값을 그대로 보여줍니다.
        </p>
      </header>

      {!received ? (
        <section className="space-y-2 rounded border border-neutral-300 bg-neutral-50 p-4 font-sans">
          <p className="font-bold">아직 받은 값이 없습니다.</p>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-700">
            <li>
              안드로이드 크롬에서 SPOTCHU를 홈 화면에 추가(PWA 설치)합니다.
            </li>
            <li>인스타그램에서 공개 게시물 → [공유] → SPOTCHU를 선택합니다.</li>
            <li>이 화면에 값이 찍힙니다.</li>
          </ol>
          <p className="text-neutral-600">
            iOS Safari는 PWA를 공유 대상으로 등록할 수 없어 이 경로가 아예
            나타나지 않습니다. 안드로이드에서 확인해야 합니다.
          </p>
        </section>
      ) : (
        <section
          className={`rounded border p-4 font-sans ${
            hashtags.length > 0
              ? "border-green-600 bg-green-50"
              : "border-amber-600 bg-amber-50"
          }`}
        >
          <p className="font-bold">
            {hashtags.length > 0
              ? `판정: 해시태그 ${hashtags.length}개 발견 — 자동 분석 가능`
              : "판정: 해시태그 없음 — 캡션이 오지 않았을 가능성이 큼"}
          </p>
          {hashtags.length > 0 && (
            <p className="mt-1 break-all text-neutral-700">
              {hashtags.join(" ")}
            </p>
          )}
        </section>
      )}

      {received && (
        <section className="space-y-3">
          <h2 className="font-sans font-bold">
            받은 파라미터 {entries.length}개
          </h2>
          {entries.map(([key, value], i) => (
            <div
              key={`${key}-${i}`}
              className="rounded border border-neutral-300"
            >
              <div className="flex justify-between gap-2 border-b border-neutral-200 bg-neutral-50 px-3 py-1.5">
                <span className="font-bold">{key}</span>
                <span className="text-neutral-500">
                  {value.length}자{URL_ONLY.test(value) ? " · URL만" : ""}
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all p-3">
                {value}
              </pre>
            </div>
          ))}
        </section>
      )}

      <footer className="border-t border-neutral-200 pt-4 font-sans text-neutral-600">
        <p>
          안드로이드 공유는 <code>url</code> 필드를 채우지 않고 URL을{" "}
          <code>text</code>로 보냅니다. 세 필드를 모두 확인하세요.
        </p>
        <p className="mt-1">
          여기서 URL만 온다면 안드로이드 네이티브로도 결과가 같습니다 — 인스타는
          수신자가 PWA인지 네이티브인지 구분하지 않습니다.
        </p>
      </footer>
    </main>
  );
}
