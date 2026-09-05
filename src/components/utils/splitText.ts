import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";
import { SplitText } from "gsap-trial/SplitText";

interface ParaElement extends HTMLElement {
  anim?: gsap.core.Animation;
  split?: SplitText;
}

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

/**
 * The refresh listener must be bound exactly once.
 *
 * It used to be registered at the end of setSplitText(), which calls itself
 * from that listener - so every invocation added another listener, and each
 * refresh fired all of them. The count doubled per refresh (8 -> 18 -> 38 ->
 * 78 measured), and each call re-splits every .para/.title in the DOM and
 * rebuilds its tweens. That was the main source of the janky intro and of
 * text arriving late when scrolling quickly.
 */
let refreshBound = false;

export default function setSplitText() {
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.innerWidth < 900) return;
  const paras: NodeListOf<ParaElement> = document.querySelectorAll(".para");
  const titles: NodeListOf<ParaElement> = document.querySelectorAll(".title");

  // Start a little earlier so the reveal is already underway by the time the
  // text is comfortably in view, rather than beginning after it has arrived.
  const TriggerStart = window.innerWidth <= 1024 ? "top 70%" : "10% 70%";
  const ToggleAction = "play pause resume reverse";

  paras.forEach((para: ParaElement) => {
    para.classList.add("visible");
    if (para.anim) {
      para.anim.progress(1).kill();
      para.split?.revert();
    }

    para.split = new SplitText(para, {
      type: "lines,words",
      linesClass: "split-line",
    });

    para.anim = gsap.fromTo(
      para.split.words,
      { autoAlpha: 0, y: 80 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: para.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.7,
        ease: "power3.out",
        y: 0,
        stagger: 0.012,
      }
    );
  });
  titles.forEach((title: ParaElement) => {
    if (title.anim) {
      title.anim.progress(1).kill();
      title.split?.revert();
    }
    title.split = new SplitText(title, {
      type: "chars,lines",
      linesClass: "split-line",
    });
    title.anim = gsap.fromTo(
      title.split.chars,
      { autoAlpha: 0, y: 80, rotate: 10 },
      {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: title.parentElement?.parentElement,
          toggleActions: ToggleAction,
          start: TriggerStart,
        },
        duration: 0.6,
        ease: "power2.inOut",
        y: 0,
        rotate: 0,
        stagger: 0.022,
      }
    );
  });

  if (!refreshBound) {
    refreshBound = true;
    ScrollTrigger.addEventListener("refresh", () => setSplitText());
  }
}
