import { useCallback, useEffect, useRef, useState } from "react";
import "./styles/Terminal.css";
import { personal, projects, skillCards } from "../data/content";
import { snapshot } from "./Cluster/clusterStore";
import { FullReport, getFullReport } from "./utils/footprint";

type Line = { text: string; kind?: "cmd" | "ok" | "dim" | "warn" };

const BANNER: Line[] = [
  { text: `${personal.fullName} — ${personal.location}`, kind: "ok" },
  { text: "type 'help' for commands, 'exit' or Esc to close", kind: "dim" },
];

function pad(s: string, n: number) {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

/** Renders the live hero cluster as a kubectl-style table. */
function kubectlNodes(): Line[] {
  const rows = snapshot();
  const out: Line[] = [
    { text: pad("NAME", 20) + pad("STATUS", 14) + pad("ROLE", 10) + "CPU", kind: "dim" },
  ];
  rows.forEach((n) => {
    const status =
      n.health === "healthy"
        ? "Ready"
        : n.health === "degrading"
        ? "Ready,SchedDisabled"
        : n.health === "failed"
        ? "NotReady"
        : "Ready";
    out.push({
      text:
        pad(n.name, 20) +
        pad(status, 14) +
        pad("worker", 10) +
        `${Math.round(n.load * 100)}%`,
      kind: n.health === "failed" ? "warn" : undefined,
    });
  });
  return out;
}

function kubectlPods(): Line[] {
  const rows = snapshot();
  const out: Line[] = [
    {
      text: pad("NAME", 34) + pad("READY", 7) + pad("STATUS", 12) + "NODE",
      kind: "dim",
    },
  ];
  rows.forEach((n) => {
    n.pods.forEach((p) => {
      const status = p.ready
        ? "Running"
        : n.health === "failed"
        ? "Terminating"
        : "Pending";
      out.push({
        text:
          pad(p.name.slice(0, 33), 34) +
          pad(p.ready ? "1/1" : "0/1", 7) +
          pad(status, 12) +
          n.name,
        kind: p.ready ? undefined : "warn",
      });
    });
  });
  return out;
}

/**
 * Condensed reconnaissance report — same data the "Your Digital Footprint"
 * section below shows in full, formatted for the shell. Nothing here is
 * stored or sent anywhere beyond the one ipapi.co lookup getFullReport()
 * already makes to resolve the visitor's IP to a location.
 */
function reconLines(r: FullReport): Line[] {
  const out: Line[] = [
    { text: "NETWORK", kind: "ok" },
    { text: "  ip        " + (r.network.ip ?? "unavailable") },
    {
      text:
        "  location  " +
        ([r.network.city, r.network.region, r.network.country]
          .filter(Boolean)
          .join(", ") || (r.network.error ?? "unavailable")),
    },
    { text: "  isp       " + (r.network.isp ?? "unavailable") },
    { text: "BROWSER", kind: "ok" },
    {
      text: "  agent     " + `${r.browser.browser} ${r.browser.browserVersion} on ${r.browser.os}`,
    },
    { text: "  languages " + r.browser.languages.join(", ") },
    { text: "HARDWARE", kind: "ok" },
    {
      text:
        "  device    " +
        `${r.hardware.cpuCores ?? "?"} cores, ${r.hardware.screenWidth}x${r.hardware.screenHeight} @${r.hardware.pixelRatio}x`,
    },
    { text: "FINGERPRINT", kind: "ok" },
    { text: "  gpu       " + (r.fingerprint.webglRenderer ?? "unavailable") },
    { text: "  hash      " + (r.fingerprint.combinedHash ?? "unavailable") },
    { text: "WEBRTC", kind: "ok" },
    { text: "  local     " + (r.webrtc.localCandidate ?? "none") },
  ];
  out.push({ text: "full breakdown below", kind: "dim" });
  return out;
}

const HELP: Line[] = [
  { text: "whoami       who you're looking at" },
  { text: "skills       what I work with" },
  { text: "projects     things I've built" },
  { text: "resume       open my CV (PDF)" },
  { text: "contact      how to reach me" },
  { text: "kubectl      get nodes | get pods  (live from the hero scene)" },
  { text: "recon        what this site already knows about you" },
  { text: "clear        clear the screen" },
  { text: "exit         close this shell" },
];

const Terminal = () => {
  const [open, setOpen] = useState(false);
  /** The hint is a discovery affordance for the hero. Kept on screen for the
   *  whole page it sat on top of the About paragraph and the project cards on
   *  short viewports, so it fades out once the visitor scrolls past the hero. */
  const [hintVisible, setHintVisible] = useState(true);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const historyRef = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const push = useCallback((next: Line[]) => {
    setLines((prev) => [...prev, ...next]);
  }, []);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      push([{ text: `${personal.initials.toLowerCase()} ~ $ ${cmd}`, kind: "cmd" }]);
      if (!cmd) return;

      historyRef.current = [cmd, ...historyRef.current].slice(0, 40);
      histIdx.current = -1;

      const [head, ...rest] = cmd.split(/\s+/);
      switch (head.toLowerCase()) {
        case "help":
          push(HELP);
          break;
        case "whoami":
          push([
            { text: `${personal.fullName}`, kind: "ok" },
            { text: "DevOps and Cloud Engineer. Kubernetes, Terraform, CI/CD." },
            { text: "Cyber Security undergrad at FAST NUCES, Islamabad." },
          ]);
          break;
        case "skills":
          push(
            skillCards.flatMap((c): Line[] => [
              { text: c.title, kind: "ok" },
              { text: "  " + c.tags.join("  ") },
            ])
          );
          break;
        case "projects":
          push(
            projects.flatMap((p): Line[] => [
              { text: p.name, kind: "ok" },
              { text: "  " + p.category + " — " + p.tools, kind: "dim" },
            ])
          );
          break;
        case "resume":
          window.open(personal.resume, "_blank", "noopener");
          push([{ text: "opening " + personal.resume, kind: "ok" }]);
          break;
        case "contact":
          push([
            { text: "email     " + personal.email },
            { text: "phone     " + personal.phone },
            { text: "github    " + personal.github },
            { text: "linkedin  " + personal.linkedin },
          ]);
          break;
        case "kubectl": {
          const sub = rest.join(" ").toLowerCase();
          if (sub === "get nodes") push(kubectlNodes());
          else if (sub === "get pods") push(kubectlPods());
          else
            push([
              { text: "usage: kubectl get nodes | kubectl get pods", kind: "dim" },
            ]);
          break;
        }
        case "recon":
          push([{ text: "gathering signals…", kind: "dim" }]);
          getFullReport().then((r) => push(reconLines(r)));
          break;
        case "clear":
          setLines([]);
          break;
        case "exit":
        case "quit":
        case "close":
          setOpen(false);
          break;
        case "sudo":
          push([
            { text: "nice try.", kind: "warn" },
            { text: "this incident will be reported.", kind: "dim" },
          ]);
          break;
        default:
          push([
            { text: `command not found: ${head}`, kind: "warn" },
            { text: "type 'help' for commands", kind: "dim" },
          ]);
      }
    },
    [push]
  );

  // Global open/close. `~` needs Shift on most layouts, so accept the
  // backtick too; ignore it whenever a field is focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

      if (!open && (e.key === "~" || e.key === "`") && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      // 0.25 rather than 0.6: the About section starts entering the frame
      // well before a full screen of scroll, and the hint sat on top of it.
      setHintVisible(window.scrollY < window.innerHeight * 0.25);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (h.length) {
        histIdx.current = Math.min(histIdx.current + 1, h.length - 1);
        setValue(h[histIdx.current]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      histIdx.current = Math.max(histIdx.current - 1, -1);
      setValue(histIdx.current < 0 ? "" : historyRef.current[histIdx.current]);
    }
  };

  return (
    <>
      <button
        className={`term-hint${hintVisible ? "" : " term-hint-hidden"}`}
        onClick={() => setOpen(true)}
        tabIndex={hintVisible ? 0 : -1}
        aria-label="Open shell"
        data-cursor="disable"
      >
        <span>~</span> shell
      </button>

      {open && (
        <div className="term-overlay" onMouseDown={() => setOpen(false)}>
          <div
            className="term-panel"
            onMouseDown={(e) => e.stopPropagation()}
            data-cursor="disable"
          >
            <div className="term-bar">
              <i className="term-dot"></i>
              <i className="term-dot"></i>
              <i className="term-dot"></i>
              <span>{personal.initials.toLowerCase()}@portfolio:~ zsh</span>
              <button
                className="term-close"
                onClick={() => setOpen(false)}
                aria-label="Close shell"
              >
                 esc
              </button>
            </div>
            <div className="term-body" ref={bodyRef}>
              {lines.map((l, i) => (
                <div key={i} className={`term-line${l.kind ? " k-" + l.kind : ""}`}>
                  {l.text || " "}
                </div>
              ))}
              <div className="term-input-row">
                <span className="term-prompt">
                  {personal.initials.toLowerCase()} ~ $
                </span>
                <input
                  ref={inputRef}
                  value={value}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Terminal;
