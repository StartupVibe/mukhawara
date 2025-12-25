/**
 * Salla Products Integration
 * Integrates Salla Product API with all pages
 */

class ProductsIntegration {
  constructor() {
    this.productAPI = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Salla SDK and Product API
   */
  async init() {
    if (this.isInitialized) {
      return this.productAPI;
    }

    // Wait for Salla SDK to load
    if (typeof salla === 'undefined') {
      await new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        const checkSalla = setInterval(() => {
          attempts++;
          if (typeof salla !== 'undefined') {
            clearInterval(checkSalla);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkSalla);
            console.warn('Salla SDK not loaded after timeout');
            resolve();
          }
        }, 100);
      });
    }

    try {
      // Initialize Salla SDK if not already initialized
      if (typeof salla !== 'undefined' && !salla.config) {
        salla.init({
          debug: true,
          language_code: 'ar',
          store: {
            id: 229278595,
            url: 'https://api.salla.dev/store/v1'
          }
        });
      }

      // Wait for Product API to be available
      if (typeof getSallaProductAPI === 'function') {
        this.productAPI = getSallaProductAPI();
      } else {
        // Wait a bit more for the script to load
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof getSallaProductAPI === 'function') {
          this.productAPI = getSallaProductAPI();
        } else {
          console.error('SallaProductAPI not available');
          return null;
        }
      }

      this.isInitialized = true;
      return this.productAPI;
    } catch (error) {
      console.error('Failed to initialize Salla Products:', error);
      return null;
    }
  }

  /**
   * Format price
   */
  formatPrice(price, currency = 'SAR') {
    if (!price) return '0.00 ' + currency;
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  }

  /**
   * Get product image URL
   */
  getProductImage(product) {
    return product.image?.url || 
           product.original_image || 
           product.main_image || 
           product.thumbnail ||
           'assets/IMG_0220.jpg';
  }

  /**
   * Create product card HTML
   */
  createProductCard(product) {
    const imageUrl = this.getProductImage(product);
    const price = product.price || product.regular_price || 0;
    const salePrice = product.sale_price;
    const isOnSale = salePrice && salePrice < price;
    const productId = product.id;
    // Always link to local product details page, not Salla URL
    const productUrl = `product-item.php?id=${productId}`;
    const name = product.name || 'Product';
    const description = product.description || '';
    const shortDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;

    return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card" data-product-id="${productId}">
          <a href="${productUrl}">
            <img src="${imageUrl}" alt="${name}" onerror="this.src='assets/WildRoses-01.webp'">
            <div class="text">
              <h4>${name}</h4>
              ${isOnSale ? `<del>${this.formatPrice(price)}</del>` : ''}
              <span>${this.formatPrice(isOnSale ? salePrice : price)}</span>
            </div>
          </a>
          <div class="add">
            <button class="btn add-to-cart-btn" data-product-id="${productId}" ${!product.is_available ? 'disabled' : ''}>
              ${product.is_available ? ((typeof window.translations !== 'undefined' && window.translations["add-to-cart"]) ? window.translations["add-to-cart"] : 'Add to cart') : ((typeof window.translations !== 'undefined' && window.translations["out-of-stock"]) ? window.translations["out-of-stock"] : 'Out of Stock')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load and render products
   */
  async loadProducts(containerSelector, options = {}) {
    await this.init();
    if (!this.productAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      // Show loading state
      container.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>';

      const params = {
        source: options.source || 'latest',
        limit: options.limit || 20,
        page: options.page || 1
      };

      if (options.sourceValue) {
        params.sourceValue = options.sourceValue;
      }

      const result = await this.productAPI.fetchProducts(params);
      
      if (result.data && result.data.length > 0) {
        const productsHtml = result.data.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHtml;
        
        // Attach add to cart handlers
        this.attachCartHandlers();
      } else {
        container.innerHTML = '<div class="col-12 text-center py-5"><h4>No products found</h4></div>';
      }
    } catch (error) {
      console.error('Error loading products:', error);
      container.innerHTML = '<div class="col-12 text-center py-5"><h4>Error loading products</h4></div>';
    }
  }

  /**
   * Load and render categories in footer
   */
  async loadCategories(containerSelector) {
    await this.init();
    if (!this.productAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const result = await this.productAPI.getCategories({ limit: 10 });
      
      if (result.data && result.data.length > 0) {
        const categoriesHtml = result.data.map(category => {
          const categoryName = category.name || category.title || 'Category';
          const categoryUrl = `products.php?category=${category.id_}`;
          return `<li><a href="${categoryUrl}" class="footer-category-link" data-category-id="${category.id_}">${categoryName}</a></li>`;
        }).join('');
        
        container.innerHTML = categoriesHtml;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  /**
   * Load and render categories as cards in a grid (home categories section)
   */
  async loadHomeCategories(containerSelector) {
    await this.init();
    if (!this.productAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const result = await this.productAPI.getCategories({ limit: 8 });

      if (result.data && result.data.length > 0) {
        const categoriesHtml = result.data.map(category => {
          const categoryName = category.name || category.title || 'Category';
          const categoryUrl = `products.php?category=${category.id_}`;
          const imageUrl = category.image?.url || 'assets/IMG_0220.jpg';
          return `
            <div class="col-12 col-md-3 col-lg-3 d-flex justify-content-between flex-column">
              <div class="card">
                <a href="${categoryUrl}" class="home-category-link" data-category-id="${category.id_}">
                  <img src="${imageUrl}" alt="${categoryName}">
                  <div class="overlay d-flex justify-content-center align-items-center ">
                    <h2>${categoryName}</h2>
                  </div>
                </a>
              </div>
            </div>
          `;
        }).join('');

        container.innerHTML = categoriesHtml;
      }
    } catch (error) {
      console.error('Error loading home categories:', error);
    }
  }

  /**
   * Load single product details
   */
  async loadProductDetails(productId, options = {}) {
    await this.init();
    if (!this.productAPI) return null;

    try {
      const advancedItems = ['images', 'sold_quantity', 'category', 'rating', 'brand', 'options'];
      const result = await this.productAPI.getProductDetails(productId, advancedItems);
      return result.data;
    } catch (error) {
      console.error('Error loading product details:', error);
      return null;
    }
  }

  /**
   * Load related products
   */
  async loadRelatedProducts(productId, containerSelector, limit = 4) {
    await this.init();
    if (!this.productAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const result = await this.productAPI.getRelatedProducts(productId, limit);
      
      if (result.data && result.data.length > 0) {
        const productsHtml = result.data.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHtml;
        this.attachCartHandlers();
      } else {
        // No related offers found for this product
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <h4>No offers / لا توجد عروض</h4>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading related products:', error);
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <h4>No offers / لا توجد عروض</h4>
        </div>
      `;
    }
  }

  /**
   * Load offers products
   */
  async loadOffersProducts(containerSelector, limit = 4) {
    await this.init();
    if (!this.productAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const result = await this.productAPI.getOffersProducts(limit);
      
      if (result.data && result.data.length > 0) {
        const productsHtml = result.data.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHtml;
        this.attachCartHandlers();
      } else {
        // No offers found - show bilingual message
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <h4>No offers found / لا توجد عروض متاحة حاليًا</h4>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading offers products:', error);
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <h4>No offers found / لا توجد عروض متاحة حاليًا</h4>
        </div>
      `;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query, containerSelector) {
    await this.init();
    if (!this.productAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
      const result = await this.productAPI.searchProducts(query, { limit: 20 });
      
      if (result.data && result.data.length > 0) {
        const productsHtml = result.data.map(product => this.createProductCard(product)).join('');
        container.innerHTML = productsHtml;
        this.attachCartHandlers();
      } else {
        container.innerHTML = '<div class="col-12 text-center py-5"><h4>No products found</h4></div>';
      }
    } catch (error) {
      console.error('Error searching products:', error);
      container.innerHTML = '<div class="col-12 text-center py-5"><h4>Error searching products</h4></div>';
    }
  }

  /**
   * Attach add to cart handlers
   */
  attachCartHandlers() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = btn.dataset.productId;
        if (!productId) return;

        btn.disabled = true;
        const addingText = (typeof window.translations !== 'undefined' && window.translations["adding"]) ? window.translations["adding"] : 'Adding...';
        btn.textContent = addingText;

        try {
          // Use cart integration instead of direct API call
          if (typeof getCartIntegration === 'function') {
            const cartIntegration = getCartIntegration();
            await cartIntegration.quickAddToCart(parseInt(productId), { quantity: 1 });
            
            const addedText = (typeof window.translations !== 'undefined' && window.translations["added"]) ? window.translations["added"] : '✓ Added';
            btn.textContent = addedText;
            btn.style.background = '#28a745';
            
            setTimeout(() => {
              const addToCartText = (typeof window.translations !== 'undefined' && window.translations["add-to-cart"]) ? window.translations["add-to-cart"] : 'Add to cart';
              btn.textContent = addToCartText;
              btn.style.background = '';
              btn.disabled = false;
            }, 2000);
          } else {
            throw new Error('Cart integration not available');
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          const addToCartText = (typeof window.translations !== 'undefined' && window.translations["add-to-cart"]) ? window.translations["add-to-cart"] : 'Add to cart';
          btn.textContent = 'Error';
          btn.style.background = '#dc3545';
          
          setTimeout(() => {
            btn.textContent = addToCartText;
            btn.style.background = '';
            btn.disabled = false;
          }, 2000);
        }
      });
    });
  }
}

// Create global instance
const productsIntegration = new ProductsIntegration();

