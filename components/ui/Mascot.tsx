// 마스코트 'Chu' 이미지. 에셋: public/assets/mascot/*.svg (자체 그라디언트 포함 SVG).
// SVG는 next/image 없이 <img>로 표시(장식용, 자체 사이징). 접근성 위해 alt 필수.
export type MascotName =
  | "chu-mascot-front"
  | "chu-mascot-side"
  | "chu-mascot-camera"
  | "chu-mascot-map"
  | "chu-expression-curious"
  | "chu-expression-focused"
  | "chu-expression-joy";

export function Mascot({
  name,
  alt,
  className = "",
  bob = false,
}: {
  name: MascotName;
  alt: string;
  className?: string;
  bob?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/mascot/${name}.svg`}
      alt={alt}
      className={className}
      style={
        bob ? { animation: "chubob 1.6s ease-in-out infinite" } : undefined
      }
    />
  );
}
