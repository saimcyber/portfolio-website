import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";
import { personal } from "../data/content";

import Marquee from "react-fast-marquee";

/**
 * Boot sequence for the loading screen. Each line is keyed to a real progress
 * threshold rather than its own timer, so the terminal tracks the actual load
 * instead of drifting out of sync with the percentage.
 */
const BOOT_LINES: { at: number; text: string; kind?: "ok" | "tip" }[] = [
  { at: 3, text: "$ docker build -t registry/portfolio:latest ." },
  { at: 14, text: "✓ image built, 6 layers cached", kind: "ok" },
  { at: 26, text: "$ terraform init && terraform plan" },
  { at: 38, text: "✓ 12 to add, 0 to change, 0 to destroy", kind: "ok" },
  { at: 50, text: "$ trivy image --severity HIGH,CRITICAL" },
  { at: 63, text: "✓ 0 vulnerabilities found", kind: "ok" },
  { at: 75, text: "$ kubectl apply -f k8s/" },
  { at: 88, text: "✓ deployment.apps/portfolio configured", kind: "ok" },
  { at: 97, text: "✓ rollout complete in 8s", kind: "ok" },
  { at: 100, text: "tip: press ~ anywhere for a shell", kind: "tip" },
];

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Was a bare `if (percent >= 100) setTimeout(...)` in the render body, which
  // scheduled a fresh pair of timers on every single render at 100% (and each
  // of those setState calls caused another render). Running it from an effect
  // keyed on the threshold fires the hand-off exactly once.
  const complete = percent >= 100;
  useEffect(() => {
    if (!complete) return;
    let inner = 0;
    const outer = window.setTimeout(() => {
      setLoaded(true);
      inner = window.setTimeout(() => setIsLoaded(true), 1000);
    }, 600);
    return () => {
      window.clearTimeout(outer);
      window.clearTimeout(inner);
    };
  }, [complete]);

  useEffect(() => {
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true);
        setTimeout(() => {
          if (module.initialFX) {
            module.initialFX();
          }
          setIsLoading(false);
        }, 900);
      }
    });
  }, [isLoaded]);

  // Only the last few lines, like a terminal that has scrolled. Rendering all
  // ten overflows the fixed-height panel and clips rows in half.
  const visibleLines = BOOT_LINES.filter((l) => percent >= l.at).slice(-6);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          {personal.fullName}
        </a>
        <span className="loader-status">
          {percent >= 100 ? "ready" : "provisioning"}
        </span>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span> Automate Everything</span> <span>Secure By Default</span>
            <span> Automate Everything</span> <span>Secure By Default</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>

        <div className={`boot-terminal ${clicked ? "boot-out" : ""}`}>
          <div className="boot-bar">
            <i className="boot-dot"></i>
            <i className="boot-dot"></i>
            <i className="boot-dot"></i>
            <span>saim@portfolio:~/deploy</span>
          </div>
          <div className="boot-body">
            {visibleLines.map((line, i) => (
              <div
                key={line.at}
                className={`boot-line${line.kind === "ok" ? " is-ok" : ""}${
                  line.kind === "tip" ? " is-tip" : ""
                }`}
              >
                {line.text}
                {i === visibleLines.length - 1 && (
                  <span className="boot-cursor"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  let interval = setInterval(() => {
    if (percent <= 50) {
      const rand = Math.round(Math.random() * 5);
      percent = percent + rand;
      setLoading(percent);
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        percent = percent + Math.round(Math.random());
        setLoading(percent);
        if (percent > 91) {
          clearInterval(interval);
        }
      }, 2000);
    }
  }, 100);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          resolve(percent);
          clearInterval(interval);
        }
      }, 2);
    });
  }
  return { loaded, percent, clear };
};
