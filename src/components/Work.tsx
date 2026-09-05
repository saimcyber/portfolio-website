import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { projects } from "../data/content";

gsap.registerPlugin(useGSAP);

const Work = () => {
  useGSAP(() => {
    let translateX: number = 0;

    /**
     * How far the row must travel for the last card to come to rest.
     *
     * Measured from the cards themselves, deliberately:
     *  - `.work-flex` is only as wide as its container (1320px at 1440) while
     *    its cards overflow it, so its own right edge is meaningless here.
     *  - `.work-flex` has decorative pseudo-elements that blow `scrollWidth`
     *    up to ~360000px, so that is useless too.
     *
     * The original formula mixed a card width, the container inset and half a
     * padding value and stopped ~20px short. With six placeholder cards that
     * was invisible; with three real projects the last one stayed clipped off
     * the right edge. Travel now ends with the last card inset by the same
     * gutter the first card starts at.
     */
    function setTranslateX() {
      const boxes = document.querySelectorAll<HTMLElement>(".work-box");
      if (!boxes.length) return;
      // Measure from rest - on a resize rebuild the row may still be shifted.
      gsap.set(".work-flex", { x: 0 });
      // On mobile the first card starts slightly off-screen (left: -15), and
      // feeding that back in as the gutter under-scrolls the row, leaving the
      // last card clipped. Clamp to a sane minimum inset.
      const gutter = Math.max(16, boxes[0].getBoundingClientRect().left);
      const right = boxes[boxes.length - 1].getBoundingClientRect().right;
      translateX = Math.max(0, right - (window.innerWidth - gutter));
    }

    setTranslateX();

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: `+=${translateX}`, // Use actual scroll width
        scrub: true,
        pin: true,
        pinSpacing: true,
        id: "work",
      },
    });

    timeline.to(".work-flex", {
      x: -translateX,
      ease: "none",
    });

    /**
     * `pinSpacing: true` above already reserves the pin distance: ScrollTrigger
     * writes it onto the pin-spacer as `padding-bottom`.
     *
     * There used to be a manual `spacer.style.marginBottom = translateX` here,
     * added when the spacer was observed resolving to `padding: 0px`. That is
     * no longer the case, so the margin stacked on top of the padding and every
     * gap after Work was reserved twice - measured at 390px wide: 661px of
     * padding plus 661px of margin, i.e. a full extra viewport of dead black
     * between the last project card and "Digital Footprint" (1323px instead of
     * 662px, and 389px of needless page height). Removing it leaves the pin
     * distance correct and the last card still scrolls fully into view.
     */

    // Clean up (optional, good practice)
    return () => {
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={project.name}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={project.name}
                link={project.link}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
