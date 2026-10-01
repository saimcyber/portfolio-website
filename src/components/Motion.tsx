import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Animation enhances the rendered HTML; content has no loading or visibility gate. */
const Motion = () => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    const root = document.querySelector(".main-body");
    if (root) observer.observe(root);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".nav-progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
      gsap.from("[data-intro]", { y: Math.min(28, window.innerHeight * .025), opacity: 0.3, duration: 1.1, stagger: 0.1, ease: "power3.out", clearProps: "all" });
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 36, opacity: 0.25, duration: 0.85, ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: element, start: "top 92%", once: true },
        });
      });
      gsap.from(".about-word", { opacity: 0.35, stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: ".about-me .para", start: "top 85%", end: "bottom 55%", scrub: 0.5 } });
      gsap.from(".career-timeline", { scaleY: 0, transformOrigin: "top",
        scrollTrigger: { trigger: ".career-info", start: "top 75%", end: "bottom 65%", scrub: 0.6 } });
      gsap.from(".stack-stage", { y: 22, opacity: 0.35, duration: 0.65, stagger: 0.12,
        scrollTrigger: { trigger: ".stack-flow", start: "top 85%", once: true }, clearProps: "all" });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);
      window.addEventListener("load", refresh, { once: true });
      return () => window.removeEventListener("load", refresh);
    });
    return () => { cancelAnimationFrame(resizeFrame); observer.disconnect(); media.revert(); };
  }, []);
  return null;
};
export default Motion;
