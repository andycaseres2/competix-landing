// Competix landing: scroll reveals, header state and the "Así se ve" showcase.
// Everything degrades gracefully: without JS (or with reduced motion) content is simply visible.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Reveal on scroll ----------
const revealItems = document.querySelectorAll(".reveal");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // animate once, then stop watching
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );
  revealItems.forEach((item) => observer.observe(item));
}

// ---------- Header: subtle border once the page scrolls ----------
const header = document.getElementById("site-header");
const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// ---------- Showcase: tabs that swap real panel screenshots ----------
const showcase = document.querySelector("[data-showcase]");
if (showcase) {
  const tabs = [...showcase.querySelectorAll(".showcase-tab")];
  const images = [...showcase.querySelectorAll(".showcase-img")];
  const progress = showcase.querySelector(".showcase-progress span");
  const AUTOPLAY_MS = 4500;
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = index;
    tabs.forEach((tab, i) => {
      tab.classList.toggle("is-active", i === index);
      tab.setAttribute("aria-selected", String(i === index));
    });
    images.forEach((image, i) => image.classList.toggle("is-active", i === index));
    // Restart the progress bar animation for the new tab.
    if (progress && !reduceMotion) {
      progress.style.animation = "none";
      void progress.offsetWidth;
      progress.style.animation = `showcase-progress ${AUTOPLAY_MS}ms linear`;
    }
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
    if (progress) progress.style.animation = "none";
  };

  const start = () => {
    if (reduceMotion || timer) return;
    show(current);
    timer = setInterval(() => show((current + 1) % tabs.length), AUTOPLAY_MS);
  };

  tabs.forEach((tab, i) =>
    tab.addEventListener("click", () => {
      stop(); // the visitor chose a tab: stop rotating so it does not change under them
      show(i);
    }),
  );

  // Arrow keys move between tabs, as expected from a tab list.
  showcase.querySelector(".showcase-tabs").addEventListener("keydown", (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    stop();
    const next = (current + step + tabs.length) % tabs.length;
    show(next);
    tabs[next].focus();
  });

  // Only rotate while the showcase is on screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.3 }).observe(showcase);
  }
}
