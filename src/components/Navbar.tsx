import { useEffect, useState } from "react";
import HoverLinks from "./HoverLinks";
import { personal } from "../data/content";
import "./styles/Navbar.css";


const Navbar = () => {
  const [active, setActive] = useState("landingDiv");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const ids = ["landingDiv", "about", "career", "work", "contact"];
      let current = ids[0];
      ids.forEach((id) => { if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < window.innerHeight * .4) current = id; });
      setActive(current);
    };
    const scroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", scroll, { passive: true });
    update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); };
  }, []);
  useEffect(() => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    const navigate = (hash: string, animate: boolean, focus = false) => {
      const target = document.getElementById(hash.slice(1) || "landingDiv");
      if (!target) return;
      const offset = hash && hash !== "#landingDiv" ? 110 : 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: animate && !reducedMotion ? "smooth" : "instant" });
      if (focus) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    };
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const onHistory = () => navigate(window.location.hash, false);
    const initialFrame = requestAnimationFrame(onHistory);
    const onLinkClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      if (!url.hash && !link.hasAttribute("data-home")) return;
      const target = document.getElementById(url.hash.slice(1) || "landingDiv");
      if (!target) return;
      e.preventDefault();
      const destination = url.hash === "#landingDiv" ? url.pathname : url.pathname + url.hash;
      if (destination !== window.location.pathname + window.location.hash) history.pushState(null, "", destination);
      navigate(url.hash, true, true);
    };
    document.addEventListener("click", onLinkClick);
    window.addEventListener("load", onHistory, { once: true });
    window.addEventListener("popstate", onHistory);
    window.addEventListener("hashchange", onHistory);

    return () => {
      cancelAnimationFrame(initialFrame);
      history.scrollRestoration = previousRestoration;
      window.removeEventListener("load", onHistory);
      document.removeEventListener("click", onLinkClick);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("hashchange", onHistory);
    };
  }, []);
  return (
    <>
      <nav className="header" aria-label="Main navigation">
        <a href="/" data-home aria-label="Saim Zaib home" className="navbar-title" data-cursor="disable">
          {personal.fullName}<span>.</span>
        </a>
        <a
          href={`mailto:${personal.email}`}
          className="navbar-connect"
          data-cursor="disable"
        >
          Let's talk ↗
        </a>
        <ul>
          <li><a href="#landingDiv" aria-current={active === "landingDiv" ? "location" : undefined}><HoverLinks text="HOME" /></a></li>
          <li>
            <a data-href="#about" href="#about" aria-current={active === "about" ? "location" : undefined}>
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#career" href="#career" aria-current={active === "career" ? "location" : undefined}>
              <HoverLinks text="CAREER" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work" aria-current={active === "work" ? "location" : undefined}>
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact" aria-current={active === "contact" ? "location" : undefined}>
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </nav>

      <div className="nav-progress" aria-hidden="true" />
    </>
  );
};

export default Navbar;
