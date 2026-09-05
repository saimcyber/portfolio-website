import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useLoading } from "../../context/LoadingProvider";
import { setProgress } from "../Loading";
import { setClusterTimeline, setAllTimeline } from "../utils/GsapScroll";
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

/**
 * One progress machine for the app's lifetime. StrictMode mounts the Scene
 * twice in development; without this guard each mount started its own ticking
 * interval and the two fought over `setLoading`, making the displayed
 * percentage jump backwards (75% -> 54%).
 */
let progressMachine: ReturnType<typeof setProgress> | null = null;

/** Signals that the scene graph is mounted; paired with the first rendered
 *  frame to open the loading gate. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

function SceneContents({
  rigRef,
  cameraRef,
  mouseRef,
  onReady,
  reduced,
}: {
  rigRef: React.MutableRefObject<THREE.Group | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  mouseRef: React.MutableRefObject<{ x: number; y: number; moved: boolean }>;
  onReady: () => void;
  reduced: boolean;
}) {
  const { camera, scene } = useThree();
  const firstFrame = useRef(false);

  useEffect(() => {
    cameraRef.current = camera as THREE.PerspectiveCamera;
    // Lights come up only once the intro plays; start dark.
    scene.environmentIntensity = 0;
  }, [camera, scene, cameraRef]);

  useFrame(() => {
    if (!firstFrame.current) {
      firstFrame.current = true;
      onReady();
    }
  });

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
      <ReadySignal onReady={onReady} />

      <ClusterRig rigRef={rigRef} mouseRef={mouseRef} reduced={reduced} />

      <EffectComposer>
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

const Scene = () => {
  const { setLoading } = useLoading();
  const rigRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  // `moved` guards the hover raycast: until the pointer actually moves, the
  // ref sits at (0,0), which is screen centre - that would permanently
  // "hover" whichever node happens to be in the middle of the viewport.
  const mouseRef = useRef({ x: 0, y: 0, moved: false });

  const startedRef = useRef(false);
  const readyCountRef = useRef(0);
  const progressRef = useRef<ReturnType<typeof setProgress> | null>(null);
  const cam = useMemo(() => cameraForWidth(window.innerWidth), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  // Tracks which side of the 1024px breakpoint the camera/timelines were last
  // built for - see onResize below for why this matters.
  const isDesktopRef = useRef(window.innerWidth > 1024);

  if (!progressRef.current) {
    if (!progressMachine) progressMachine = setProgress((v) => setLoading(v));
    progressRef.current = progressMachine;
  }

  /**
   * The old scene gated loading on a 1.5MB model download. Nothing is
   * downloaded now beyond the HDR, so without a floor duration the loader
   * would snap to 100% and the boot sequence would never be readable.
   */
  const handleReady = (force = false) => {
    readyCountRef.current += 1;
    if ((!force && readyCountRef.current < 2) || startedRef.current) return;
    startedRef.current = true;

    setSimulationEnabled(!reduced);

    // Build the scroll timelines now, while the loading screen still covers
    // the page. Creating them triggers a ScrollTrigger refresh - layout reads
    // plus a re-split of every .para/.title - and doing that at intro time
    // put a visible hitch right in the middle of the reveal.
    buildTimelines();

    const MIN_MS = 2600;
    const elapsed = performance.now() - mountedAt.current;
    const wait = Math.max(0, MIN_MS - elapsed);

    window.setTimeout(() => {
      progressRef.current!.loaded().then(() => {
        setTimeout(() => {
          const scene = rigRef.current?.parent;
          if (scene) {
            gsap.to(scene, {
              environmentIntensity: 1.25,
              duration: 2,
              ease: "power2.inOut",
            });
          }
          gsap.to(".character-rim", {
            y: "-50%",
            opacity: 0.34,
            delay: 0.2,
            duration: 2,
          });
        }, 300);
      });
    }, wait);
  };

  const mountedAt = useRef(performance.now());

  const buildTimelines = () => {
    if (!cameraRef.current) return;
    setClusterTimeline(rigRef.current, cameraRef.current);
    setAllTimeline();
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.moved = true;
    };
    document.addEventListener("mousemove", onMouseMove);

    /**
     * This used to kill and rebuild every ScrollTrigger (except Work's pin)
     * on EVERY resize, unconditionally. That's redundant AND actively
     * harmful for the common case: Navbar.tsx already calls
     * `ScrollSmoother.refresh(true)` on every resize, and every trigger in
     * GsapScroll.ts already has `invalidateOnRefresh: true`, so a plain
     * refresh already re-anchors each scrub tween's start value to whatever
     * the current scroll position needs - no destruction required.
     *
     * Killing and recreating tl1/tl2/tl3 on top of that discarded their live
     * state and rebuilt from a fresh baseline instead - confirmed via a
     * Puppeteer resize test: scroll partway into the hero (rig.rotation and
     * `.character-model`'s x-transform mid-scrub), then resize the *width*
     * only (e.g. a Windows snap from fullscreen to half-screen, still well
     * above the 1024px breakpoint on both sides) - the transform reset to
     * its pre-scroll baseline until scrolled again, i.e. exactly the
     * "animation jumps/resets on resize" bug being fixed here.
     *
     * The only case that genuinely needs a rebuild is crossing the
     * desktop/mobile breakpoint, because setClusterTimeline() branches into
     * a structurally different animation graph on each side of it (desktop
     * pins the camera/rig to a 3D scroll sequence; mobile skips that
     * entirely). Everything else is handled by the refresh Navbar.tsx
     * already performs.
     */
    const onResize = () => {
      const nowDesktop = window.innerWidth > 1024;
      const c = cameraRef.current;
      if (c && isDesktopRef.current !== nowDesktop) {
        const next = cameraForWidth(window.innerWidth);
        c.position.set(next.position[0], next.position[1], next.position[2]);
        c.fov = next.fov;
        c.updateProjectionMatrix();
      }
      if (!startedRef.current) return;
      if (isDesktopRef.current === nowDesktop) return;
      isDesktopRef.current = nowDesktop;
      const work = ScrollTrigger.getById("work");
      ScrollTrigger.getAll().forEach((t) => {
        if (t !== work) t.kill();
      });
      buildTimelines();
    };
    window.addEventListener("resize", onResize);

    // Failsafe: the ready gate needs the scene mounted plus a first rendered
    // frame. If WebGL context creation fails or a frame never lands, the
    // loader would sit at ~90% forever. Start regardless.
    const failsafe = window.setTimeout(() => {
      if (!startedRef.current) handleReady(true);
    }, 8000);

    return () => {
      window.clearTimeout(failsafe);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="character-container">
      <div className="character-model">
        <div className="character-rim"></div>
        <Canvas
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          camera={{
            position: [cam.position[0], cam.position[1], cam.position[2]],
            fov: cam.fov,
            near: 0.1,
            far: 200,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <SceneContents
            rigRef={rigRef}
            cameraRef={cameraRef}
            mouseRef={mouseRef}
            onReady={handleReady}
            reduced={reduced}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default Scene;
