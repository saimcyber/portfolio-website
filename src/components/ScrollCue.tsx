import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLoading } from "../context/LoadingProvider";
import "./styles/ScrollCue.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * "Scroll to continue" cue on the hero.
 *
 * Exists to give a first-time visitor a deliberate beat to read "scroll" and
 * do so calmly, rather than immediately mashing Page Down before the hero's
 * own intro animation (initialFX.ts) has even settled - the fast-scroll
 * worry this was built for.
 *
 * Timing: `isLoading` (from LoadingProvider) flips to false in the same
 * setTimeout that fires initialFX() (see Loading.tsx), so that transition is
 * an existing, exact hook for "the intro just started." initialFX()'s own
 * one-shot tweens (name reveal, "At Scale" line, nav fade) are all finished
 * by t~2.0s; the looping word-swap doesn't start until t=4s. Appearing at
 * t=2.2s lands in that settled window - confirmed against the live
 * initialFX.ts timeline, not guessed.
 */
const ScrollCue = () => {
  const { isLoading } = useLoading();
  const wasLoading = useRef(true);
  const elRef = useRef<HTMLDivElement>(null);
  const [everSettled, setEverSettled] = useState(false);
  const [nearTop, setNearTop] = useState(true);
  const reduced = useRef(prefersReducedMotion());

  // One-time: the settle delay only ever applies right after the intro
  // plays, never on a later reveal (e.g. scrolling back to the top).
  useEffect(() => {
    if (wasLoading.current && !isLoading) {
      const t = window.setTimeout(() => setEverSettled(true), 2200);
      return () => window.clearTimeout(t);
    }
    wasLoading.current = isLoading;
  }, [isLoading]);

  // Continuous toggle after that, mirroring Terminal.tsx's proven hint-fade
  // pattern: below a small scroll threshold -> visible, past it -> hidden,
  // and it reappears if the visitor scrolls back to the top.
  useEffect(() => {
    const onScroll = () => setNearTop(window.scrollY < 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = everSettled && nearTop;

  useEffect(() => {
    if (!elRef.current) return;
    gsap.to(elRef.current, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : 10,
      duration: 0.5,
      ease: "power2.out",
      pointerEvents: visible ? "auto" : "none",
    });
  }, [visible]);

  return (
    <div
      ref={elRef}
      className={`scroll-cue${reduced.current ? " scroll-cue-static" : ""}`}
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <span className="scroll-cue-label">Scroll</span>
      <span className="scroll-cue-line">
        <span className="scroll-cue-dot" />
      </span>
    </div>
  );
};

export default ScrollCue;
