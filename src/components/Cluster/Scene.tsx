import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { useLoading } from "../../context/LoadingProvider";
import { getProgressMachine, setProgress } from "../../context/loadingProgress";
import { setClusterTimeline, setAllTimeline } from "../utils/GsapScroll";
import { debounce } from "../utils/debounce";
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

const Scene = () => {
  const { setLoading } = useLoading();
  const rigRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  // Whether the hero canvas is anywhere near the viewport. Once the scroll
  // timeline has driven `.character-model` fully off-screen (past "What I Do"),
  // the canvas + its full-screen bloom pass were still rendering every frame
  // for the entire rest of the page. Flipping `frameloop` to "never" stops all
  // of that until the visitor scrolls back up.
  const [heroVisible, setHeroVisible] = useState(true);
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
    // LoadingProvider has already created and started this singleton; the
    // callback here is ignored if so. Kept as a fallback for any mount order.
    progressRef.current = getProgressMachine((v) => setLoading(v));
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
      // Work no longer has a ScrollTrigger of its own (it's a native
      // horizontal scroller now, not a pinned/scrubbed one), so there's
      // nothing left to preserve here - kill everything and rebuild.
      ScrollTrigger.getAll().forEach((t) => t.kill());
      buildTimelines();
    };
    // Coalesced: a drag-resize fires dozens of `resize` events and the
    // breakpoint-cross rebuild (plus Navbar's ScrollSmoother.refresh) is heavy.
    // The camera fov nudge waiting an extra 150ms is imperceptible.
    const onResizeDebounced = debounce(onResize, 150);
    window.addEventListener("resize", onResizeDebounced);

    // Failsafe: the ready gate needs the scene mounted plus a first rendered
    // frame. If WebGL context creation fails or a frame never lands, the
    // loader would sit at ~90% forever. Start regardless.
    const failsafe = window.setTimeout(() => {
      if (!startedRef.current) handleReady(true);
    }, 8000);

    return () => {
      window.clearTimeout(failsafe);
      document.removeEventListener("mousemove", onMouseMove);
      onResizeDebounced.cancel();
      window.removeEventListener("resize", onResizeDebounced);
    };
  }, []);

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
          dpr={[1, 1.75]}
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
