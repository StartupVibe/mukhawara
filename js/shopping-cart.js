let cartClose = document.getElementById("close-cart");
let ShoppingCart = document.getElementById("Shopping-cart");
let cartOpen = document.querySelector(".cart");

cartOpen.onclick = () => {
  ShoppingCart.classList.add("open");
  document.body.style.overflow = "hidden";
};

cartClose.onclick = () => {
  ShoppingCart.classList.remove("open");
  document.body.style.overflow = "auto";
};
