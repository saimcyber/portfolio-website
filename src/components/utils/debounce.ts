/**
 * Trailing-edge debounce.
 *
 * Several components each bind their own `resize` listener and do real work in
 * it - `setSplitText()` (reverts + re-splits every paragraph and rebuilds its
 * ScrollTriggers), `ScrollSmoother.refresh(true)`, timeline rebuilds. A single
 * drag-resize fires `resize` dozens of times a second; running any of that per
 * event stalls the main thread for hundreds of ms. Wrap the handler in this so
 * the work runs once, after the drag settles.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait = 150
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: A) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return debounced;
}
