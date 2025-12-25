const images = [
  "assets/IMG_0206.jpg",
  "assets/IMG_0200.jpg",
  "assets/IMG_0209.jpg",
  "assets/IMG_0212.jpg",
];

let current = 0;

function changeImage(index) {
  current = index;
  updateSlider();
}

function updateSlider() {
  const main = document.getElementById("mainImage");
  // If slider elements are not present on this page, do nothing
  if (!main) return;

  main.style.opacity = "0";

  setTimeout(() => {
    main.src = images[current];
    main.style.opacity = "1";
  }, 300);

  const thumbs = document.querySelectorAll(".thumbs img");
  thumbs.forEach((el, i) => {
    el.classList.toggle("active", i === current);
  });
}

// Only start auto-rotation if the main slider image exists on this page
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("mainImage");
  if (!main) return;

  setInterval(() => {
    current = (current + 1) % images.length;
    updateSlider();
  }, 3000);
});
