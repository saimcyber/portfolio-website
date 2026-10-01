import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { personal } from "../data/content";
import "./styles/Navbar.css";


const Navbar = () => {
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
          <li><a href="#landingDiv"><HoverLinks text="HOME" /></a></li>
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
