import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { setSimulationEnabled } from "./clusterStore";
import ClusterRig from "./ClusterRig";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The cluster is a tall narrow column, so a narrow viewport needs to back off
 *  further and widen the field of view to keep the whole height in frame. */
function cameraForWidth(w: number) {
  return w > 1024
    ? { position: [0, 0.2, 12.6] as const, fov: 32 }
    : { position: [0, 0.2, 13.5] as const, fov: 40 };
}

function SceneContents({
  rigRef,
  mouseRef,
  reduced,
}: {
  rigRef: React.MutableRefObject<THREE.Group | null>;
  mouseRef: React.MutableRefObject<{ x: number; y: number; moved: boolean }>;
  reduced: boolean;
}) {
  const { scene } = useThree();
  useEffect(() => { scene.environmentIntensity = 1.25; }, [scene]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#dcc9ff" />
      <directionalLight position={[-6, -1, -4]} intensity={1.1} color="#8f6fd4" />

      {/*
        A procedural environment instead of the 289KB HDR. Decoding that
        Radiance file and building its PMREM cubemap blocked the main thread
        for ~540ms right as the loader was animating. These lightformers are
        rendered once into a small cubemap and cost almost nothing, while
        still giving the metal nodes something to reflect.
      */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#0b080c"]} />
        <Lightformer
          intensity={3.2}
          color="#e8dcff"
          position={[0, 4, -6]}
          scale={[12, 6, 1]}
        />
        <Lightformer
          intensity={1.6}
          color="#c2a4ff"
          position={[-6, 1, 2]}
          scale={[8, 8, 1]}
          rotation-y={Math.PI / 2.4}
        />
        <Lightformer
          intensity={1.1}
          color="#7d5bbe"
          position={[6, -2, 3]}
          scale={[8, 8, 1]}
          rotation-y={-Math.PI / 2.4}
        />
        <Lightformer
          intensity={0.8}
          color="#ffffff"
          position={[0, -5, 1]}
          scale={[10, 4, 1]}
          rotation-x={Math.PI / 2}
        />
      </Environment>

      <ClusterRig rigRef={rigRef} mouseRef={mouseRef} reduced={reduced} />

      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.85}
          luminanceSmoothing={0.25}
          intensity={1.0}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

const Scene = ({ onReady }: { onReady: () => void }) => {
  const rigRef = useRef<THREE.Group | null>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, moved: false });
  const [heroVisible, setHeroVisible] = useState(true);
  const cam = useMemo(() => cameraForWidth(window.innerWidth), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const bounds = modelRef.current?.getBoundingClientRect();
      if (!bounds) return;
      mouseRef.current = {
        x: ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
        y: -((e.clientY - bounds.top) / bounds.height) * 2 + 1,
        moved: e.clientX >= bounds.left && e.clientX <= bounds.right && e.clientY >= bounds.top && e.clientY <= bounds.bottom,
      };
    };
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    setSimulationEnabled(heroVisible && !reduced);
    return () => setSimulationEnabled(false);
  }, [heroVisible, reduced]);

  // Pause the render loop whenever the hero canvas is scrolled out of view.
  useEffect(() => {
    const node = modelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting;
        setHeroVisible(on);
        // Ancestor hook for CSS: pauses the large blurred landing-circle /
        // character-rim animations while the hero is off-screen (Landing.css).
        document.body.classList.toggle("hero-offscreen", !on);
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.body.classList.remove("hero-offscreen");
    };
  }, []);

  return (
    <div className="character-container">
      <div className="character-model" ref={modelRef}>
        <div className="character-rim"></div>
        <Canvas
          frameloop={heroVisible ? "always" : "never"}
          // 1.75 rather than 2: the scene is dominated by a full-screen bloom
          // pass, so DPR 2 on a retina panel is ~30% more fragment work for a
          // difference bloom hides anyway. antialias is off because the
          // EffectComposer renders into its own target - the context MSAA was
          // paid for and then discarded.
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: false }}
          camera={{
            position: [cam.position[0], cam.position[1], cam.position[2]],
            fov: cam.fov,
            near: 0.1,
            far: 200,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            onReady();
          }}
        >
          <SceneContents
            rigRef={rigRef}
            mouseRef={mouseRef}
            reduced={reduced}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Scene;
