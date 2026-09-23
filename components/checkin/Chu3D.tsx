"use client";

import { useEffect, useRef, useState } from "react";

// 체크인 성공 연출용 3D Chu(spec §구성 요소 '성공 연출'). three.js는 이 컴포넌트가 마운트될 때만
// 동적 import → 성공 화면 외 번들에 포함되지 않는다. WebGL 불가·로드 실패 시 정지 이미지 유지.
// 에셋: public/assets/mascot/chu-3d.glb(Meshy 생성, ~12k tris, 1024 텍스처).
const MODEL = "/assets/mascot/chu-3d.glb";
const STILL = "/assets/mascot/chu-3d-still.webp";

export function Chu3D({ size = 200 }: { size?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let alive = true;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const [{ GLTFLoader }, { RoomEnvironment }] = await Promise.all([
        import("three/addons/loaders/GLTFLoader.js"),
        import("three/addons/environments/RoomEnvironment.js"),
      ]);
      if (!alive) return;

      const gltf = await new GLTFLoader().loadAsync(MODEL);
      if (!alive) return;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(size, size);
      renderer.toneMapping = THREE.NeutralToneMapping;
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;

      // 모델을 원점 중심으로 옮기고 피벗 그룹으로 흔든다(뒷면은 보이지 않게 ±30°만).
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const dim = box.getSize(new THREE.Vector3());
      model.position.sub(box.getCenter(new THREE.Vector3()));
      const pivot = new THREE.Group();
      pivot.add(model);
      scene.add(pivot);
      const r = Math.max(dim.x, dim.y, dim.z);
      const camera = new THREE.PerspectiveCamera(30, 1, r / 100, r * 10);
      camera.position.set(0, r * 0.1, r * 2.3);
      camera.lookAt(0, 0, 0);

      renderer.domElement.style.cssText =
        "width:100%;height:100%;display:block";
      el.appendChild(renderer.domElement);

      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let raf = 0;
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = (now - t0) / 1000;
        pivot.rotation.y = 0.5 * Math.sin(t * 1.3);
        pivot.position.y = r * 0.03 * Math.abs(Math.sin(t * 2.6)); // 통통 튀는 바운스
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      if (still) renderer.render(scene, camera);
      else raf = requestAnimationFrame(frame);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            for (const m of [o.material].flat()) {
              for (const v of Object.values(m))
                if (v instanceof THREE.Texture) v.dispose();
              m.dispose();
            }
          }
        });
        env.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })().catch(() => {
      // WebGL 미지원·네트워크 실패 → 정지 이미지 폴백 유지(장식 요소라 안내 불필요).
    });

    return () => {
      alive = false;
      cleanup();
    };
  }, [size]);

  return (
    <div
      ref={host}
      aria-hidden
      className="relative"
      style={{ width: size, height: size }}
    >
      {!ready && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={STILL}
          alt=""
          width={size}
          height={size}
          className="absolute inset-0"
        />
      )}
    </div>
  );
}
