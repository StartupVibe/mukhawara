// تغيير الصورة
let smallImage = document.querySelectorAll(".left-img img");
let bigImage = document.getElementById("mainImag");

smallImage.forEach((img) => {
  img.addEventListener("click", () => {
    bigImage.src = img.src;
  });
});

// العداد
let decBtn = document.getElementById("decQty");
let incBtn = document.getElementById("incQty");
let qtyInput = document.getElementById("qtyInput");

decBtn.addEventListener("click", () => {
  let value = parseInt(qtyInput.value);
  if (value > 1) {
    qtyInput.value = value - 1;
  }
});
incBtn.addEventListener("click", () => {
  let value = parseInt(qtyInput.value);
  qtyInput.value = value + 1;
});

//  المقاس
let sizebut = document.querySelectorAll(".size-btn");
sizebut.forEach(btn => {
  btn.addEventListener("click", () => {
    sizebut.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
