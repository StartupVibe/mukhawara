<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>صفحة المنتج</title>
  <link rel="stylesheet" href="css/product-item.css" />
  <link rel="stylesheet" href="css/all.min.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/startupVibeAnimation.css">
  <link rel="stylesheet" href="css/index.css">
  <link rel="stylesheet" href="css/media.css">
  <link rel="stylesheet" href="css/font-family.css">
</head>

<body>

  <!-- ********************************* -->
  <!-- nab-bar -->
  <!-- ********************************* -->
  <nav id="header" class="navbar navbar-expand-lg p-3 w-100 position-fixed" data-anim="fade-down"
    data-anim-duration="1s" data-anim-timing="linear">
    <div class="container d-flex justify-content-between align-items-center gap-2">
      <div class="d-flex justify-content-between align-items-center gap-3">
        <div id="open" class="bar-icon">
          <span class="one"></span>
          <span class="two"></span>
          <span class="three"></span>
        </div>
        <a class="navbar-brand" href="index.php"><img src="assets/logo2.png" alt=""></a>

        <div id="collapse" class="navbar-ul position-fixed">
          <div class="header-nav d-flex justify-content-between align-items-center">
            <h3 class="" href="index.html">مخورة</h3>
            <i id="close" class="fa-solid fa-xmark"></i>
          </div>
          <ul class="">
            <li><a id="home" href="index.php">الصفحة الرئيسية</a></li>
            <li><a id="about" href="about.php">من نحن</a></li>
            <li><a id="contact" href="contact.php">تواصل معنا</a></li>
            <li><a id="products" href="products.php">المنتجات</a></li>
          </ul>
        </div>
      </div>
      <div class="d-flex justify-content-center align-items-center gap-3">
        <div class="search position-relative">
          <i id="Search-icon" class="fa-solid fa-magnifying-glass position-absolute"></i>
          <input class="form-control" type="text" id="search-input" placeholder="" data-translate="search-placeholder">
        </div>
        <div id="cart-open" class="icon cart d-flex justify-content-center align-items-center gap-3 position-relative">
          <i class="fa-solid fa-cart-shopping"></i>
          <span id="cart" class="d-none d-md-block d-lg-block"></span>
          <span
            class="cart-count header-cart-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style="display: none;">0</span>
        </div>
        <div class="user-info-container icon user d-flex justify-content-center align-items-center gap-2">
          <!-- User info will be dynamically inserted here -->
        </div>
      </div>
    </div>
  </nav>

  <!-- Cart Sidebar (included with header) -->
  <div id="Shopping-cart" class="Shopping-cart">
    <div class="close-icon d-flex justify-content-between align-items-center">
      <h3 id="shopping-cart">سلة المشتريات</h3>
      <i id="close-cart" class="fa-solid fa-xmark"></i>
    </div>
    <div class="cart-items-container" id="item-card">
      <!-- Cart items will be dynamically loaded here -->
      <div class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden" id="loading-cart">Loading cart...</span>
        </div>
      </div>
    </div>
    <div class="cart-summary-container">
      <div class="price">
        <span id="total">Total: <span id="cart-total">0.00</span>$</span>
      </div>
    </div>
  </div>





  <section class="item">
    <div class="container">
      <div class="row w-100">
        <div class="col-lg-6 col-md-12">
          <section class="gallery" id="product-gallery">
            <div class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading images...</span>
              </div>
            </div>
          </section>
        </div>
        <div class="col-lg-6 col-md-12">
          <aside class="details" id="product-details">
            <div class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading product...</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>

  </section>

  <!-- ********************************* -->
  <!-- Offers -->
  <!-- ********************************* -->

  <!-- <section id="offers" class="products my-5" data-anim="fade-up" data-anim-duration="1s">
    <div class="container">
      <div class="head-section text-center">
        <h3 class="" id="suggested">Offers </h3>
      </div>
      <div class="row row-gap-4" id="related-products-container">
        <div class="col-12 text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  </section> -->

  <!-- ********************************* -->
  <!-- footer -->
  <!-- ********************************* -->
  <section class="footer d-flex mt-5 p-5 position-relative overflow-hidden" data-anim="fade-up">
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-6 col-lg-4 d-lg-flex justify-content-center">
          <div class="info">
            <img src="assets/logo2.png" alt="">
            <p class="mt-3" id="footer-description">
              حيث تلتقي النعومة بالاستدامة — اكتشف اللمسة الطبيعية لقطن "<strong>مخورة</strong>".</p>
            <div class="social">
              <a href="https://www.instagram.com/muk.hawara?igsh=cXQ2anliZDUzN2Rk" target="_blank">
                <i class="fa-brands fa-instagram"></i></a>
              <a href="https://www.snapchat.com/add/mukhawara2025?share_id=4hcoXUHB1S0&locale=en-EG" target="_blank">
                <i class="fa-brands fa-snapchat"></i>
              </a>
              <a href="https://www.tiktok.com/@mukhawara3?_r=1&_t=ZS-92OBxFOP6zV" target="_blank"><i
                  class="fa-brands fa-tiktok"></i></a>
            </div>
          </div>
        </div>
        <!-- <div class="col-12 col-md-6 col-lg-3 d-lg-flex justify-content-center">
          <div class="category">
            <p id="categories">Categories</p>
            <ul id="footer-categories">
              <li><a href="#">Loading...</a></li>
            </ul>
          </div>
        </div> -->
        <div class="col-12 col-md-6 col-lg-4 d-lg-flex justify-content-center">
          <div class="pages">
            <p id="pages">الصفحات</p>
            <ul>
              <li><a href="index.php" id="footer-home">الصفحة الرئيسية</a></li>
              <li><a href="about.php" id="footer-about">من نحن</a></li>
              <li><a href="contact.php" id="footer-contact">تواصل معنا</a></li>
              <li><a href="products.php" id="footer-products">المنتجات</a></li>
            </ul>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-4 d-lg-flex justify-content-center">
          <div class="contact">
            <p id="contact-us">تواصل معنا</p>
            <div class="phone">
              <i class="fa-solid fa-phone"></i>
              <p>096613424143</p>
            </div>
            <div class="mail">
              <i class="fa-solid fa-envelope"></i>
              <p>Mukhawara@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  <div class="bottom-footer col-12 p-3">
    <div class="row w-100 overflow-hidden d-flex align-items-center justify-content-between">
      <div class="col-12 col-lg-4 d-flex align-items-center gap-2 px-5">
        <img src="assets/saudi1.png" alt="">
        <div class="text">
          <h4>السجل التجاري</h4>
          <p>7052754814</p>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <p class="m-0">صنع بإتقان بواسطة | <a href="https://thestartupvibe.com/" target="_blank">Startup Vibe</a></p>
      </div>
      <div class="payment col-12 col-lg-4 d-flex">
        <div class="pay"><img src="assets/salla-payment/apple_pay_mini.png" alt=""></div>
        <div class="pay"><img src="assets/salla-payment/bank_mini.png" alt=""></div>
        <div class="pay"><img src="assets/salla-payment/credit_card_mini.png" alt=""></div>
        <div class="pay"><img src="assets/salla-payment/mada_mini.png" alt=""></div>
        <div class="pay"><img src="assets/salla-payment/stc_pay_mini.png" alt=""></div>
        <div class="pay"><img src="assets/salla-payment/tabby_installment_mini.png" alt=""></div>
        <div class="pay"><img class="big" src="assets/salla-payment/tamara_installment_mini.png" alt=""></div>
      </div>
    </div>
  </div>

  <i class="scrolly fa-solid fa-arrow-up"></i>
  <div class="loading"><img src="assets/logo2.png" alt=""></div>
  <!-- Salla SDK and Product API -->
  <script src="https://cdn.salla.network/js/twilight/latest/twilight.js"></script>
  <script src="salla/products/product-api.js"></script>
  <script src="salla/cart/cart-api.js"></script>
  <script src="salla/auth/user-api.js"></script>
  <script src="js/cart-integration.js"></script>
  <script src="js/products-integration.js"></script>
  <script src="js/jquery.min.js"></script>
  <script src="js/loading.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/index.js"></script>
  <script src="js/startupVibeAnimation.js"></script>
  <script src="js/shopping-cart.js"></script>
  <script src="js/product-item.js"></script>
  <script>
    // Initialize page with cart functionality
    document.addEventListener('DOMContentLoaded', async () => {
      // Initialize cart integration
      const cartIntegration = getCartIntegration();
      await cartIntegration.init();

      // Load cart data immediately
      await cartIntegration.loadCartItems('.cart-items-container');
      await cartIntegration.loadCartSummary('.cart-summary-container');

      // Update cart count on page load
      setTimeout(() => {
        cartIntegration.updateCartCount();
      }, 500);

      // Load categories in footer
      await productsIntegration.loadCategories('#footer-categories');

      // Get product ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId) {
        document.getElementById('product-details').innerHTML = '<h3>Product not found</h3>';
        return;
      }

      // Load product details
      const product = await productsIntegration.loadProductDetails(productId);

      if (product) {
        renderProductDetails(product);
        renderProductGallery(product);

        // Load related products
        await productsIntegration.loadRelatedProducts(productId, '#related-products-container', 4);
      } else {
        document.getElementById('product-details').innerHTML = '<h3>Product not found</h3>';
      }
    });

    function renderProductDetails(product) {
      const detailsContainer = document.getElementById('product-details');
      const price = product.price || product.regular_price || 0;
      const salePrice = product.sale_price;
      const isOnSale = salePrice && salePrice < price;
      const currency = product.currency || 'SAR';
      const description = product.description || 'No description available';

      // Get product options if available
      let optionsHtml = '';
      if (product.options) {
        // Render size options if available
        const sizeOptions = product.options.filter(opt => opt.type === 'size' || opt.name?.toLowerCase().includes('size'));
        if (sizeOptions.length > 0) {
          const sizes = sizeOptions[0].values || [];
          const sizeLabel = (typeof window.translations !== 'undefined' && window.translations["size"]) ? window.translations["size"] : "Size";
          const sizeGuideText = (typeof window.translations !== 'undefined' && window.translations["size-guide"]) ? window.translations["size-guide"] : "Size guide";
          optionsHtml += `
            <div class="option-group">
              <label>${sizeLabel}</label>
              <div class="sizes">
                ${sizes.map((size, idx) => `
                  <button class="size-btn ${idx === 0 ? 'active' : ''}" data-size="${size.value || size}">${size.name || size.value || size}</button>
                `).join('')}
              </div>
              <a href="#" class="size-gu" onclick="showSizeGuide(${product.id})">${sizeGuideText}</a>
            </div>
          `;
        }

        // Render color options if available
        const colorOptions = product.options.filter(opt => opt.type === 'color' || opt.name?.toLowerCase().includes('color'));
        if (colorOptions.length > 0) {
          const colors = colorOptions[0].values || [];
          const colorLabel = (typeof window.translations !== 'undefined' && window.translations["color"]) ? window.translations["color"] : "Color";
          optionsHtml += `
            <div class="option-group">
              <label>${colorLabel}</label>
              <div class="colors">
                ${colors.map(color => `
                  <span class="color" style="background-color: ${color.value || color}" data-color="${color.value || color}" title="${color.name || color.value || color}"></span>
                `).join('')}
              </div>
            </div>
          `;
        }
      }

      detailsContainer.innerHTML = `
        <h1 class="pro-title">${product.name || 'Product'}</h1>
        <p class="pro-subtitle">${product.subtitle || product.promotion_title || ''}</p>
        <div class="price-row">
          ${isOnSale ? `<span class="price-old">${productsIntegration.formatPrice(price, currency)}</span>` : ''}
          <span class="price-now">${productsIntegration.formatPrice(isOnSale ? salePrice : price, currency)}</span>
        </div>
        ${optionsHtml}
        <div class="buy-row">
          <div class="qty">
            <button id="decQty" aria-label="Decrease">−</button>
            <input id="qtyInput" type="number" value="1" min="1" max="${product.max_quantity || ''}" />
            <button id="incQty" aria-label="Increase">+</button>
          </div>
          <button id="addToCart" class="btn-primary" data-product-id="${product.id}" ${!product.is_available ? 'disabled' : ''}>
            ${product.is_available ? ((typeof window.translations !== 'undefined' && window.translations["add-to-cart"]) ? window.translations["add-to-cart"] : 'Add to cart') : ((typeof window.translations !== 'undefined' && window.translations["out-of-stock"]) ? window.translations["out-of-stock"] : 'Out of Stock')}
          </button>
        </div>
        <section class="description">
          <h2 id="description">Description</h2>
          <p>${description}</p>
        </section>
      `;

      // Re-attach quantity handlers
      attachQuantityHandlers();
      attachAddToCartHandler(product.id);
    }

    function renderProductGallery(product) {
      const galleryContainer = document.getElementById('product-gallery');
      const images = product.images || [];
      const mainImage = images[0]?.url || product.image?.url || product.original_image || 'assets/18194432701.png';

      if (images.length > 0) {
        galleryContainer.innerHTML = `
          <div class="left-img">
            ${images.slice(0, 4).map((img, idx) => `
              <img src="${img.url || img}" alt="Product image ${idx + 1}" onclick="changeMainImage('${img.url || img}')" />
            `).join('')}
          </div>
          <div class="main-img-wrap">
            <img id="mainImag" src="${mainImage}" alt="${product.name}" />
          </div>
        `;
      } else {
        galleryContainer.innerHTML = `
          <div class="main-img-wrap">
            <img id="mainImag" src="${mainImage}" alt="${product.name}" />
          </div>
        `;
      }
    }

    function changeMainImage(imageUrl) {
      document.getElementById('mainImag').src = imageUrl;
    }

    function attachQuantityHandlers() {
      const decBtn = document.getElementById('decQty');
      const incBtn = document.getElementById('incQty');
      const qtyInput = document.getElementById('qtyInput');

      if (decBtn && incBtn && qtyInput) {
        decBtn.addEventListener('click', () => {
          let value = parseInt(qtyInput.value);
          if (value > 1) {
            qtyInput.value = value - 1;
          }
        });

        incBtn.addEventListener('click', () => {
          let value = parseInt(qtyInput.value);
          qtyInput.value = value + 1;
        });
      }
    }

    async function attachAddToCartHandler(productId) {
      const addToCartBtn = document.getElementById('addToCart');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
          const quantity = parseInt(document.getElementById('qtyInput').value) || 1;

          addToCartBtn.disabled = true;
          addToCartBtn.textContent = 'Adding...';

          try {
            if (typeof salla !== 'undefined' && salla.cart) {
              await salla.cart.addItem({
                id: parseInt(productId),
                quantity: quantity
              });

              const addToCartText = (typeof window.translations !== 'undefined' && window.translations["add-to-cart"]) ? window.translations["add-to-cart"] : 'Add to cart';
              addToCartBtn.textContent = '✓ Added to Cart';
              addToCartBtn.style.background = '#28a745';

              setTimeout(() => {
                addToCartBtn.textContent = addToCartText;
                addToCartBtn.style.background = '';
                addToCartBtn.disabled = false;
              }, 2000);
            }
          } catch (error) {
            console.error('Error adding to cart:', error);
            const addToCartText = (typeof window.translations !== 'undefined' && window.translations["add-to-cart"]) ? window.translations["add-to-cart"] : 'Add to cart';
            addToCartBtn.textContent = 'Error';
            addToCartBtn.style.background = '#dc3545';

            setTimeout(() => {
              addToCartBtn.textContent = addToCartText;
              addToCartBtn.style.background = '';
              addToCartBtn.disabled = false;
            }, 2000);
          }
        });
      }
    }

    async function showSizeGuide(productId) {
      try {
        const result = await productsIntegration.productAPI.getSizeGuide(productId);
        if (result.data) {
          alert('Size Guide: ' + JSON.stringify(result.data));
        } else {
          alert('Size guide not available for this product');
        }
      } catch (error) {
        alert('Size guide not available');
      }
    }
    document.addEventListener('DOMContentLoaded', async () => {
      let headerContent = await fetch('header.php').then(res => res.text());
    });
  </script>
</body>


</html>