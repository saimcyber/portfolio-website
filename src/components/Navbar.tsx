import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { personal } from "../data/content";
import { debounce } from "./utils/debounce";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

const Navbar = () => {
  useEffect(() => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      // 1.7 meant content took ~1.8s to catch up after a fast scroll, which
      // read as text and animations arriving late. 1.0 keeps the smooth feel
      // but roughly halves that lag. 0 = native scroll for reduced-motion.
      smooth: reducedMotion ? 0 : 1,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    // Preserve direct section links and never pause reading for visual effects.
    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) smoother.scrollTo(target, false, "top 100px");
    }

    // Both of these used to be added with no matching cleanup, so a remount
    // (React StrictMode does one in development) left the previous set bound
    // and every nav click ran the scroll twice.
    const onLinkClick = (e: Event) => {
      if (window.innerWidth > 1024) {
        e.preventDefault();
        const elem = e.currentTarget as HTMLAnchorElement;
        const section = elem.getAttribute("data-href");
        if (section) {
          history.pushState(null, "", section);
          smoother.scrollTo(section, true, "top 100px");
        }
      }
    };
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".header ul a")
    );
    links.forEach((element) => element.addEventListener("click", onLinkClick));

    // Debounced: a drag-resize fires `resize` continuously and a deep
    // ScrollSmoother refresh is expensive. Once, after the drag settles.
    const onResize = debounce(() => {
      ScrollSmoother.refresh(true);
    }, 200);
    window.addEventListener("resize", onResize);

    return () => {
      links.forEach((element) =>
        element.removeEventListener("click", onLinkClick)
      );
      smoother?.kill();
      onResize.cancel();
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <>
      <nav className="header" aria-label="Main navigation">
        <a href="/" className="navbar-title" data-cursor="disable">
          {personal.fullName}
        </a>
        <a
          href={`mailto:${personal.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          {personal.email}
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#career" href="#career">
              <HoverLinks text="CAREER" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </nav>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
