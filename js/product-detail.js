import { apiClient } from "./api/base.js";
import { productService } from "./api/products/productService.js";

class ProductDetailManager {
  constructor() {
    this.productId = this.getProductIdFromUrl();
    this.init();
  }

  async init() {
    if (!this.productId) {
      this.showError("Product not found");
      return;
    }

    try {
      await this.loadProductDetails();
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize product detail:", error);
      this.showError("Failed to load product details");
    }
  }

  getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  async loadProductDetails() {
    try {
      const product = await productService.getProductById(this.productId);
      if (product) {
        this.renderProductDetails(product);
      } else {
        this.showError("Product not found");
      }
    } catch (error) {
      console.error("Error loading product details:", error);
      throw error;
    }
  }

  renderProductDetails(product) {
    // Update product images
    const productImages = document.querySelector(".product-images");
    if (productImages) {
      productImages.innerHTML = `
                <div class="main-image">
                    <img src="${
                      product.images?.[0]?.url || "assets/placeholder.jpg"
                    }" 
                         alt="${product.name}" 
                         class="img-fluid">
                </div>
                <div class="thumbnails d-flex gap-2 mt-3">
                    ${(product.images || [])
                      .slice(0, 4)
                      .map(
                        (img, index) => `
                        <img src="${img.url}" 
                             alt="${product.name} - ${index + 1}" 
                             class="img-thumbnail ${
                               index === 0 ? "active" : ""
                             }"
                             onclick="document.querySelector('.main-image img').src='${
                               img.url
                             }';
                                     document.querySelectorAll('.thumbnails img').forEach(el => el.classList.remove('active'));
                                     this.classList.add('active');">
                    `
                      )
                      .join("")}
                </div>
            `;
    }

    // Update product info
    const productInfo = document.querySelector(".product-info");
    if (productInfo) {
      productInfo.innerHTML = `
                <h1 class="product-title">${product.name}</h1>
                <div class="price my-3">
                    <span class="current-price">${this.formatPrice(
                      product.price
                    )}</span>
                    ${
                      product.original_price > product.price
                        ? `<span class="original-price">${this.formatPrice(
                            product.original_price
                          )}</span>`
                        : ""
                    }
                </div>
                <div class="description my-4">
                    ${product.description || "No description available."}
                </div>
                <div class="actions d-flex flex-column gap-3">
                    <div class="quantity-selector d-flex align-items-center gap-3">
                        <button class="btn btn-outline-secondary" onclick="this.nextElementSibling.stepDown()">-</button>
                        <input type="number" class="form-control text-center" value="1" min="1" max="${
                          product.quantity || 10
                        }">
                        <button class="btn btn-outline-secondary" onclick="this.previousElementSibling.stepUp()">+</button>
                    </div>
                    <button data-translate="add-to-cart" class="btn btn-primary btn-lg add-to-cart" data-product-id="${
                      product.id
                    }">
                        اضف الى السلة
                    </button>
                </div>
                <div class="product-meta mt-4">
                    <div class="meta-item">
                        <span class="fw-bold">SKU:</span> ${
                          product.sku || "N/A"
                        }
                    </div>
                    <div class="meta-item">
                        <span class="fw-bold">Availability:</span> 
                        ${product.in_stock ? "In Stock" : "Out of Stock"}
                    </div>
                    <div class="meta-item">
                        <span class="fw-bold">Categories:</span> 
                        ${
                          product.categories
                            ?.map((cat) => cat.name)
                            .join(", ") || "Uncategorized"
                        }
                    </div>
                </div>
            `;
    }
  }

  setupEventListeners() {
    // Handle add to cart
    document.addEventListener("click", (e) => {
      if (e.target.closest(".add-to-cart")) {
        const productId = e.target.closest(".add-to-cart").dataset.productId;
        const quantity =
          document.querySelector(".quantity-selector input")?.value || 1;
        this.addToCart(productId, parseInt(quantity));
      }
    });
  }

  async addToCart(productId, quantity = 1) {
    try {
      // Implement your cart logic here
      console.log("Adding to cart:", { productId, quantity });
      // Example: await cartService.addToCart({ productId, quantity });
      this.showSuccess("Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.showError("Failed to add product to cart");
    }
  }

  // Utility methods
  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(price);
  }

  showError(message) {
    // Implement your error notification UI here
    console.error(message);
    alert(message); // Replace with a proper notification system
  }

  showSuccess(message) {
    // Implement your success notification UI here
    console.log(message);
    alert(message); // Replace with a proper notification system
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("product-item.php")) {
    new ProductDetailManager();
  }
});
