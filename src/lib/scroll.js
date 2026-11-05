import Lenis from "lenis";

// One rAF loop for the whole page: Lenis first, then every scroll-driven effect.
const subscribers = new Set();
let lenis = null;
let started = false;
let held = false;

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function startScroll() {
  if (started) return;
  started = true;

  // Touch keeps native scrolling; smoothing is a wheel-only refinement.
  if (!prefersReducedMotion() && hasFinePointer()) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  }

  const tick = (time) => {
    lenis?.raf(time);
    const y = window.scrollY;
    if (!held) subscribers.forEach((fn) => fn(y, time));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    const target = hash === "#" ? document.body : document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    const rect = target.getBoundingClientRect();
    // A pinned scene shows its content at the end of its travel, not at its top.
    const offset = "scrollEnd" in target.dataset ? rect.height - window.innerHeight : 0;
    const y = rect.top + window.scrollY + offset;
    if (lenis) lenis.scrollTo(y, { duration: 1.5 });
    else window.scrollTo({ top: y });
  });
}

export function onFrame(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// While a dialog covers the page nothing behind it needs drawing. The hero's WebGL would
// otherwise repaint every frame under the dialog's blurred backdrop, and the blur with it.
export function holdFrames(on) {
  held = on;
}

export function lockScroll(locked) {
  document.documentElement.classList.toggle("is-locked", locked);
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}
