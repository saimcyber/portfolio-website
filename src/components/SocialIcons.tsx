import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { MdMail } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi2";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { personal } from "../data/content";

const SocialIcons = () => {
  /**
   * Magnetic hover on the social rail.
   *
   * Previously each icon started its own uncancellable `requestAnimationFrame`
   * loop and added its own `mousemove` listener to `document`, and the cleanup
   * was `return`ed from inside a `forEach` callback - where a return value is
   * simply discarded, so nothing was ever torn down. That left four permanent
   * rAF loops and four permanent document listeners per mount (and the cleanup
   * it did contain removed the listener from `elem`, which never had one).
   * One loop and one listener now drive all four icons, and both are released.
   */
  useEffect(() => {
    const social = document.getElementById("social");
    if (!social) return;

    const icons = Array.from(social.querySelectorAll("span")).flatMap((elem) => {
      const link = elem.querySelector("a");
      if (!link) return [];
      const rect = elem.getBoundingClientRect();
      return [
        {
          link,
          rect,
          target: { x: rect.width / 2, y: rect.height / 2 },
          current: { x: 0, y: 0 },
        },
      ];
    });
    if (!icons.length) return;

    const onMouseMove = (e: MouseEvent) => {
      for (const icon of icons) {
        const x = e.clientX - icon.rect.left;
        const y = e.clientY - icon.rect.top;
        if (x < 40 && x > 10 && y < 40 && y > 5) {
          icon.target.x = x;
          icon.target.y = y;
        } else {
          icon.target.x = icon.rect.width / 2;
          icon.target.y = icon.rect.height / 2;
        }
      }
    };
    document.addEventListener("mousemove", onMouseMove);

    let frame = 0;
    const tick = () => {
      for (const icon of icons) {
        icon.current.x += (icon.target.x - icon.current.x) * 0.1;
        icon.current.y += (icon.target.y - icon.current.y) * 0.1;
        icon.link.style.setProperty("--siLeft", `${icon.current.x}px`);
        icon.link.style.setProperty("--siTop", `${icon.current.y}px`);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // The cached rects are viewport coordinates for a `position: fixed` rail,
    // so they only go stale on resize.
    const onResize = () => {
      icons.forEach((icon) => {
        icon.rect = icon.link.parentElement!.getBoundingClientRect();
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a
            href={personal.github}
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
        </span>
        <span>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={`mailto:${personal.email}`} aria-label="Email">
            <MdMail />
          </a>
        </span>
        <span>
          <a
            href={personal.resume}
            target="_blank"
            rel="noopener"
            aria-label="Resume"
          >
            <HiOutlineDocumentText />
          </a>
        </span>
      </div>
      <a
        className="resume-button"
        href={personal.resume}
        target="_blank"
        rel="noopener"
        download
      >
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
