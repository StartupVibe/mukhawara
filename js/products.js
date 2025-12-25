import { apiClient } from "./api/base.js";
import { productService } from "./api/products/productService.js";
import { cartManager } from "./cart.js";

class ProductManager {
  constructor() {
    this.productsContainer =
      document.querySelector(".products .row") ||
      document.getElementById("productsContainer");
    this.searchInput =
      document.querySelector('input[type="text"]') ||
      document.getElementById("productSearch");
    this.loadMoreBtn = document.getElementById("loadMore");
    this.currentPage = 1;
    this.allProducts = [];
    this.filteredProducts = [];
    this.itemsPerPage = 12;
    this.init();
  }

  async init() {
    try {
      await this.loadProducts();
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize product manager:", error);
      this.showError("Failed to load products. Please try again later.");
    }
  }

  async loadProducts() {
    try {
      const response = await productService.getProducts({
        per_page: 100,
      });

      if (response.data && response.data.length > 0) {
        this.allProducts = response.data;
        this.filteredProducts = [...this.allProducts];
        this.renderProducts(this.getPageProducts());
      } else {
        this.showNoProductsMessage();
      }
    } catch (error) {
      console.error("Error loading products:", error);
      throw error;
    }
  }

  getPageProducts() {
    const start = 0;
    const end = this.currentPage * this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  renderProducts(products) {
    if (!this.productsContainer) return;

    const html = products
      .map(
        (product) => `
            <div class="col-6 col-md-4 col-lg-2">
                <div class="card product-card" data-product-id="${
                  product.id
                }" style="transition: all 0.3s ease; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div class="product-image" style="position: relative; overflow: hidden; height: 200px; background: #f5f5f5;">
                        <img src="${
                          product?.thumbnail || "assets/placeholder.jpg"
                        }" 
                             alt="${product.name}" 
                             onerror="this.src='assets/placeholder.jpg'"
                             style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
                        <div class="product-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease;">
                            <button class="view-product-btn" style="background: #fff; color: #333; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">View Details</button>
                        </div>
                    </div>
                    <div class="text" style="padding: 12px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 14px; min-height: 40px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${
                          product.name
                        }</h4>
                        <div class="d-flex justify-content-between align-items-center" style="margin-top: 10px;">
                            <span class="price" style="font-weight: bold; color: #333; font-size: 16px;">${this.formatPrice(
                              product.price
                            )}</span>
                            <button class="add-to-cart-btn" data-product-id="${
                              product.id
                            }" style="background: #ff6b6b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; transition: background 0.3s ease;">
                                <i class="fa-solid fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    if (this.currentPage === 1) {
      this.productsContainer.innerHTML = html;
    } else {
      this.productsContainer.innerHTML += html;
    }

    // Update load more button visibility
    if (this.loadMoreBtn) {
      if (
        this.currentPage * this.itemsPerPage >=
        this.filteredProducts.length
      ) {
        this.loadMoreBtn.style.display = "none";
      } else {
        this.loadMoreBtn.style.display = "block";
      }
    }
  }

  setupEventListeners() {
    // Handle search
    if (this.searchInput) {
      this.searchInput.addEventListener("input", this.handleSearch.bind(this));
    }

    // Handle load more
    if (this.loadMoreBtn) {
      this.loadMoreBtn.addEventListener("click", () => {
        this.currentPage++;
        this.renderProducts(this.getPageProducts());
      });
    }

    // Handle add to cart and view details
    document.addEventListener("click", (e) => {
      if (e.target.closest(".add-to-cart-btn")) {
        e.stopPropagation();
        const productId =
          e.target.closest(".add-to-cart-btn").dataset.productId;
        const product = this.allProducts.find((p) => p.id == productId);
        if (product) {
          this.addToCart(product);
        }
      } else if (
        e.target.closest(".view-product-btn") ||
        (e.target.closest(".product-card") &&
          !e.target.closest(".add-to-cart-btn"))
      ) {
        const card = e.target.closest(".product-card");
        if (card) {
          const productId = card.dataset.productId;
          this.navigateToProduct(productId);
        }
      }
    });

    // Add hover effect
    document.addEventListener("mouseover", (e) => {
      const card = e.target.closest(".product-card");
      if (card) {
        const img = card.querySelector(".product-image img");
        const overlay = card.querySelector(".product-overlay");
        if (img) img.style.transform = "scale(1.1)";
        if (overlay) overlay.style.opacity = "1";
      }
    });

    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".product-card");
      if (card) {
        const img = card.querySelector(".product-image img");
        const overlay = card.querySelector(".product-overlay");
        if (img) img.style.transform = "scale(1)";
        if (overlay) overlay.style.opacity = "0";
      }
    });
  }

  async handleSearch(e) {
    const searchTerm = e.target.value.trim().toLowerCase();
    this.currentPage = 1;

    if (!searchTerm) {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm))
      );
    }

    if (this.filteredProducts.length === 0) {
      this.showNoProductsMessage();
    } else {
      this.renderProducts(this.getPageProducts());
    }
  }

  addToCart(product) {
    try {
      const success = cartManager.addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1,
      });

      if (success) {
        // Add visual feedback
        const btn = document.querySelector(`[data-product-id="${product.id}"]`);
        if (btn) {
          btn.style.background = "#4CAF50";
          btn.textContent = "✓ Added";
          setTimeout(() => {
            btn.style.background = "#ff6b6b";
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i>';
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.showError("Failed to add product to cart");
    }
  }

  navigateToProduct(productId) {
    window.location.href = `product-item.php?id=${productId}`;
  }

  // Utility methods
  truncateText(text, maxLength) {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  }

  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    }).format(price);
  }

  showError(message) {
    console.error(message);
    cartManager.showNotification(message, "error");
  }

  showSuccess(message) {
    console.log(message);
    cartManager.showNotification(message, "success");
  }

  showNoProductsMessage() {
    if (this.productsContainer) {
      this.productsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h4>No products found</h4>
                    <p>There are no products available at the moment.</p>
                </div>
            `;
    }
  }
}

// Export the ProductManager class
export { ProductManager };

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".products")) {
    new ProductManager();
  }
});
