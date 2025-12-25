let nav = document.getElementById("collapse");
let barIcon = document.getElementById("open");
let closeIcon = document.getElementById("close");

// Overlay used for both left and right drawers
function ensureOverlay() {
  let overlay = document.getElementById("drawer-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "drawer-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99990;display:none;";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", () => {
      closeNav();
      // also close cart drawer if open
      document.dispatchEvent(new CustomEvent("closeCartDrawer"));
    });
  }
  return overlay;
}

function openNav() {
  const overlay = ensureOverlay();
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
  // If page direction is RTL, nav should slide from right
  nav.style.transform = "translateX(0%)";
  nav.style.right = "0";
}

function closeNav() {
  const overlay = ensureOverlay();
  overlay.style.display = "none";
  document.body.style.overflow = "auto";
  // Slide out the nav depending on direction
  nav.style.transform = "translateX(100%)";
  nav.style.right = "0";
}

barIcon && (barIcon.onclick = () => openNav());
closeIcon && (closeIcon.onclick = () => closeNav());

// Close nav when language changes (to re-evaluate side)
window.addEventListener("lang:changed", () => {
  closeNav();
});

// scroll up
let scrollIcon = document.querySelector("i.fa-solid.fa-arrow-up");
let navSv = document.querySelector("nav");

window.onscroll = function () {
  if (window.scrollY >= 600) {
    scrollIcon.classList.add("show");
  } else {
    scrollIcon.classList.remove("show");
  }
};
scrollIcon.onclick = function () {
  window.scrollTo({
    left: 0,
    top: 0,
    behavior: "smooth",
  });
};

// Global navbar search: on Enter go to products.html with search query
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search input");
  if (!searchInput) return;

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchInput.value.trim();
      // Accept any non-empty query (text or number)
      if (query.length > 0) {
        // Always use text search; category navigation is only via category links
        window.location.href = `products.php?search=${encodeURIComponent(
          query
        )}`;
      }
    }
  });
});
