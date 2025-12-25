const elements = document.querySelectorAll("[data-anim]");

function applyAnimationSettings(el) {
  const duration = el.dataset.animDuration || "1s";
  const delay = el.dataset.animDelay || "0s";
  const timing = el.dataset.animTiming || "ease";

  el.style.transitionDuration = duration;
  el.style.transitionDelay = delay;
  el.style.transitionTimingFunction = timing;
}

function checkVisibility() {
  elements.forEach((el) => {
    applyAnimationSettings(el); // ✅ نطبق الإعدادات من الـ data attributes

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", checkVisibility);
checkVisibility();
