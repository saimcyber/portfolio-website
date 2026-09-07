import { useEffect, useRef, useState } from "react";
import { MdArrowOutward, MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { projects } from "../data/content";

/**
 * A real, native horizontal scroller instead of a vertical-scroll-hijack.
 *
 * The previous version pinned the section and translated the row with a
 * scroll-driven GSAP tween - scrolling the page *down* moved the cards
 * *left*, which read as broken rather than intentional, and needed a
 * separate, half-working CSS patch to avoid also pinning on mobile (where
 * pin+scrub fights the browser's own address-bar-driven viewport changes).
 *
 * `.work-flex` is now a plain `overflow-x: auto` + `scroll-snap` container.
 * The browser handles start/end, momentum and touch scrolling correctly by
 * construction - no measuring the last card's edge, no manual pin-spacing.
 * Vertical page scroll never touches this section at all.
 */
const Work = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= maxScroll - 4);

    const cards = el.querySelectorAll<HTMLElement>(".work-box");
    if (!cards.length) return;
    // Proportional position within the scrollable range, not "nearest card
    // by offsetLeft" - with few cards that barely overflow their container,
    // the reachable scroll range can be much smaller than the last card's
    // own offsetLeft (it can never be scrolled flush left), which made that
    // approach permanently favor an early card and never light up the last
    // dot even sitting at the true scroll end. This always lands on 0 at the
    // start and the last index at the end, which is what the dots actually
    // need to communicate.
    const ratio = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
    setActiveIndex(Math.round(ratio * (cards.length - 1)));
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".work-box");
    const gap = card
      ? parseFloat(getComputedStyle(el).columnGap || "0")
      : 0;
    const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + gap;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  const scrollToCard = (index: number) => {
    const el = trackRef.current;
    const card = el?.querySelectorAll<HTMLElement>(".work-box")[index];
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  /**
   * Mouse drag-to-scroll. Touch already gets native horizontal scrolling for
   * free; this only kicks in for mouse input so it doesn't fight the
   * browser's own touch handling.
   */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add("work-flex-grabbing");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startScroll - dx;
    };
    const endDrag = () => {
      dragging = false;
      el.classList.remove("work-flex-grabbing");
    };
    // Suppress the click on a link/button if the pointer actually dragged,
    // so a drag-release doesn't also fire a navigation.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    el.addEventListener("click", onClickCapture, true);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <div className="work-heading-row">
          <h2>
            My <span>Work</span>
          </h2>
          <div className="work-controls">
            <button
              type="button"
              className="work-arrow"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Previous project"
              data-cursor="disable"
            >
              <MdChevronLeft />
            </button>
            <button
              type="button"
              className="work-arrow"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="Next project"
              data-cursor="disable"
            >
              <MdChevronRight />
            </button>
          </div>
        </div>

        <div className="work-flex" ref={trackRef}>
          {projects.map((project, index) => (
            <div className="work-box" key={project.name}>
              <WorkImage image={project.image} alt={project.name} />
              <div className="work-info">
                <span className="work-index">0{index + 1}</span>
                <h4>{project.name}</h4>
                <p className="work-category">{project.category}</p>
                <div className="work-tools">
                  {project.tools.split(",").map((tool) => (
                    <span className="work-tool" key={tool}>
                      {tool.trim()}
                    </span>
                  ))}
                </div>
                {project.link && (
                  <a
                    className="work-link-btn"
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="disable"
                  >
                    View project <MdArrowOutward />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="work-dots">
          {projects.map((project, index) => (
            <button
              type="button"
              key={project.name}
              className={`work-dot${index === activeIndex ? " is-active" : ""}`}
              onClick={() => scrollToCard(index)}
              aria-label={`Go to ${project.name}`}
              data-cursor="disable"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
