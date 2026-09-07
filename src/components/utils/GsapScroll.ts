import * as THREE from "three";
import gsap from "gsap";
import { setRollout } from "../Cluster/clusterStore";

/**
 * Scroll choreography for the hero cluster.
 *
 * Carries over several side-effects from the original character timeline that
 * have nothing to do with the 3D scene but live here for scrub timing. The
 * `.what-box-in` display toggle in particular is load-bearing: without it the
 * "What I Do" cards never become visible on desktop.
 */
export function setClusterTimeline(
  rig: THREE.Object3D | null,
  camera: THREE.PerspectiveCamera
) {
  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-section",
      start: "center 55%",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: ".whatIDO",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  if (window.innerWidth > 1024) {
    if (!rig) return;

    tl1
      .fromTo(rig.rotation, { y: 0 }, { y: 0.45, duration: 1 }, 0)
      .to(camera.position, { z: 14.6, y: 0.85 }, 0)
      .fromTo(".character-model", { x: 0 }, { x: "-22%", duration: 1 }, 0)
      .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
      .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
      .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

    // The rollout wave is scrubbed by scroll: scrolling the About section
    // rolls the new version across the cluster, pod by pod.
    const rollout = { v: 0 };

    tl2
      .to(
        camera.position,
        { z: 20.5, y: 1.7, duration: 6, delay: 2, ease: "power3.inOut" },
        0
      )
      .to(".about-section", { y: "30%", duration: 6 }, 0)
      .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
      // Was also scrubbing pointerEvents "inherit" -> "none" here. That
      // wrote an inline style GSAP re-evaluates against scroll position, so
      // anywhere before this tween's segment completed - including a direct
      // nav-link jump or a programmatic scrollIntoView, not just a slow
      // scroll through About - .character-model sat at "inherit" (i.e.
      // effectively auto), overriding the CSS pointer-events: none in
      // Landing.css and letting the hero's fixed-position hit-test box
      // swallow clicks meant for whatever section currently occupies that
      // part of the screen (confirmed via elementFromPoint: Work's arrow
      // buttons). Nothing in Cluster/* needs pointer events at all, so the
      // CSS rule alone is both sufficient and correct at every scroll
      // position - no scrubbed animation needed.
      .to(".character-model", { x: "-10%", delay: 2, duration: 5 }, 0)
      .to(rig.rotation, { y: 0.88, x: 0.24, delay: 2, duration: 4 }, 0)
      .to(
        rollout,
        {
          v: 1,
          duration: 5,
          delay: 1.5,
          ease: "none",
          onUpdate: () => setRollout(rollout.v),
        },
        0
      )
      // Load-bearing: reveals the What I Do cards. Do not remove.
      .fromTo(
        ".what-box-in",
        { display: "none" },
        { display: "flex", duration: 0.1, delay: 6 },
        0
      )
      .fromTo(
        ".character-rim",
        { opacity: 1, scaleX: 1.4 },
        { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
        0.3
      );

    tl3
      .fromTo(
        ".character-model",
        { y: "0%" },
        { y: "-100%", duration: 4, ease: "none", delay: 1 },
        0
      )
      .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
      .to(rig.rotation, { x: 0.05, duration: 2, delay: 1 }, 0);
  } else {
    // Mobile: the cluster sits inside the landing section and the scroll
    // choreography is skipped, but the cards still need revealing.
    const tM2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".what-box-in",
        start: "top 70%",
        end: "bottom top",
      },
    });
    tM2.to(".what-box-in", { display: "flex", duration: 0.1, delay: 0 }, 0);
    setRollout(1);
  }
}

export function setAllTimeline() {
  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 30%",
      end: "100% center",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "10%" },
      { maxHeight: "100%", duration: 0.5 },
      0
    )

    .fromTo(".career-timeline", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: 0, duration: 0.5, delay: 0.2 },
      0
    );
  }
}
