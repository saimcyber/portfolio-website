/**
 * The loading-bar progress machine, owned here rather than inside the lazily
 * loaded 3D scene.
 *
 * It used to live in `Cluster/Scene.tsx`, so the eased climb only started once
 * the ~950KB Three.js chunk had downloaded AND parsed - on a slow connection
 * the loader sat frozen at "Loading 0%" until then. The climb is a fixed
 * easing curve with no dependency on real scene readiness (that gates the
 * page reveal separately, via `loaded()`), so it is safe to start from first
 * paint. `LoadingProvider` kicks it off on mount; `Scene` later calls
 * `loaded()` on the same singleton to ease the last stretch to 100%.
 */

/**
 * Drives the displayed percentage.
 *
 * A single requestAnimationFrame loop on a fixed easing curve: every frame
 * moves forward by a small, continuous amount, so the number never freezes
 * and the climb to ~92% completes in a bounded, predictable ~2.3s regardless
 * of device speed - decoupled entirely from real scene readiness, which is
 * what gates the actual page reveal (see Scene.tsx's `handleReady`/MIN_MS).
 * `loaded()` then eases the last stretch to 100 over a quick, fixed 250ms
 * tween.
 */
export const setProgress = (setLoading: (value: number) => void) => {
  const CLIMB_MS = 2300;
  const CLIMB_CAP = 92;
  const FINISH_MS = 250;

  let percent = 0;
  let rafId = 0;
  let settled = false;
  const start = performance.now();

  const climb = (now: number) => {
    if (settled) return;
    const t = Math.min(1, (now - start) / CLIMB_MS);
    // Cubic ease-out: fast at first, gradually slowing as it nears the cap
    // rather than either a linear crawl or an abrupt stop.
    const eased = 1 - Math.pow(1 - t, 3);
    const next = Math.min(CLIMB_CAP, Math.round(eased * CLIMB_CAP));
    if (next !== percent) {
      percent = next;
      setLoading(percent);
    }
    if (t < 1) rafId = requestAnimationFrame(climb);
  };
  rafId = requestAnimationFrame(climb);

  function clear() {
    settled = true;
    cancelAnimationFrame(rafId);
    percent = 100;
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      settled = true;
      cancelAnimationFrame(rafId);
      const from = percent;
      const finishStart = performance.now();
      const finish = (now: number) => {
        const t = Math.min(1, (now - finishStart) / FINISH_MS);
        percent = Math.round(from + (100 - from) * t);
        setLoading(percent);
        if (t < 1) {
          requestAnimationFrame(finish);
        } else {
          resolve(percent);
        }
      };
      requestAnimationFrame(finish);
    });
  }
  return { loaded, percent, clear };
};

/**
 * One machine for the app's lifetime. StrictMode mounts things twice in
 * development; without this guard each mount started its own ticking loop and
 * the two fought over `setLoading`, making the displayed percentage jump
 * backwards.
 */
let machine: ReturnType<typeof setProgress> | null = null;

/** Get (creating on first call, starting the climb) the progress machine. */
export function getProgressMachine(setLoading: (value: number) => void) {
  if (!machine) machine = setProgress(setLoading);
  return machine;
}

/** The machine if it has been created, without creating one. */
export function peekProgressMachine() {
  return machine;
}
