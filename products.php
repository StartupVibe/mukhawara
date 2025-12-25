<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>المنتجات</title>
  <link rel="stylesheet" href="css/all.min.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/startupVibeAnimation.css">
  <link rel="stylesheet" href="css/index.css">
  <link rel="stylesheet" href="css/media.css">
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/font-family.css">
  <style>
    /* Carousel image layout controls */
    :root {
      --carousel-image-width: 48%;
      /* change to 40% / 60% etc. */
      --carousel-image-height: 420px;
      /* desktop height */
      --carousel-image-height-sm: 240px;
      /* mobile height */
    }

    .banner {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .banner.image-left .banner-media {
      order: 0;
    }

    .banner.image-right .banner-media {
      order: 1;
    }

    .banner-media {
      flex: 0 0 var(--carousel-image-width);
      max-width: var(--carousel-image-width);
    }

    .banner-media img.img-product {
      width: 100%;
      height: var(--carousel-image-height);
      object-fit: cover;
      border-radius: 8px;
      display: block;
    }

    .banner .banner-text {
      flex: 1;
      max-width: calc(100% - var(--carousel-image-width));
    }

    @media (max-width: 992px) {
      .banner {
        flex-direction: column;
        text-align: center;
      }

      .banner-media {
        width: 100%;
        max-width: 100%;
      }

      .banner-media img.img-product {
        height: var(--carousel-image-height-sm);
      }

      .banner .banner-text {
        max-width: 100%;
      }
    }
  </style>
</head>

<body class="overflow-x-hidden ">

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

  <!-- Cart Sidebar (included with header) -->
  <div id="Shopping-cart" class="Shopping-cart">
    <div class="close-icon d-flex justify-content-between align-items-center">
      <h3 id="shopping-cart">Shopping cart</h3>
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


  <!-- ********************************* -->
  <!-- carousel -->
  <!-- ********************************* -->
  <div id="promoCarousel" class="carousel slide" data-bs-ride="carousel" data-anim="zoom-in" data-anim-duration="1s">

    <!-- Dots indicators -->
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#promoCarousel" data-bs-slide-to="0" class="dot active" aria-current="true"
        aria-label="Slide 1"></button>
      <button class="dot" type="button" data-bs-target="#promoCarousel" data-bs-slide-to="1"
        aria-label="Slide 2"></button>
      <button class="dot" type="button" data-bs-target="#promoCarousel" data-bs-slide-to="2"
        aria-label="Slide 3"></button>
      <button class="dot" type="button" data-bs-target="#promoCarousel" data-bs-slide-to="3"
        aria-label="Slide 4"></button>
      <button class="dot" type="button" data-bs-target="#promoCarousel" data-bs-slide-to="4"
        aria-label="Slide 5"></button>
      <button class="dot" type="button" data-bs-target="#promoCarousel" data-bs-slide-to="5"
        aria-label="Slide 6"></button>
      <button class="dot" type="button" data-bs-target="#promoCarousel" data-bs-slide-to="6"
        aria-label="Slide 7"></button>
    </div>

    <!-- Slides -->
    <div class="carousel-inner">
      <!-- Slide 1 -->
      <div class="carousel-item active">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between image-right">
            <div class="banner-text ">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product product-banner" src="assets/IMG_0205.jpg" alt="Luxury cotton product"
                loading="lazy" decoding="async">
            </div>
          </div>
        </div>

      </div>

      <!-- Slide 2 -->
      <div class="carousel-item">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between">
            <div class="banner-text">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product" src="assets/IMG_0194.jpg" alt="Rolls of cotton fabric" loading="lazy"
                decoding="async">
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 3 -->
      <div class="carousel-item">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between">
            <div class="banner-text">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product" src="assets/IMG_0226.jpg" alt="Close-up of premium cotton fabric" loading="lazy"
                decoding="async">
            </div>
          </div>
        </div>
      </div>

      <!-- Slide 4 -->
      <div class="carousel-item">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between">
            <div class="banner-text">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product" src="assets/IMG_0210.jpg" alt="Cotton fabric on display" loading="lazy"
                decoding="async">
            </div>
          </div>
        </div>
      </div>
      <!-- Slide 5 -->

      <div class="carousel-item">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between">
            <div class="banner-text">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product" src="assets/IMG_0200.jpg" alt="Stack of folded cotton products" loading="lazy"
                decoding="async">
            </div>
          </div>
        </div>
      </div>
      <!-- Slide 6 -->

      <div class="carousel-item">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between">
            <div class="banner-text">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product" src="assets/IMG_0206.jpg" alt="Cotton fabric draped over surface" loading="lazy"
                decoding="async">
            </div>
          </div>
        </div>
      </div>
      <!-- Slide 7 -->

      <div class="carousel-item">
        <div class="container">
          <div class="banner d-flex align-items-center justify-content-between">
            <div class="banner-text">
              <p class="mb-1">نعومة تشعر بها، نقاء تثق به، وجودة تدوم</p>
              <h1>
                حيث تلتقي فخامة الحرير بالحياة اليومية</h1>
            </div>
            <div class="banner-media">
              <img class="img-product" src="assets/IMG_0209.jpg" alt="Cotton textile sample" loading="lazy"
                decoding="async">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Arrows -->
    <button class="carousel-control-prev d-none d-lg-flex" type="button" data-bs-target="#promoCarousel"
      data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true">
        <i class="fa-solid fa-angle-left"></i>
      </span>
    </button>

    <button class="carousel-control-next d-none d-lg-flex" type="button" data-bs-target="#promoCarousel"
      data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true">
        <i class="fa-solid fa-angle-right"></i>
      </span>
    </button>
  </div>

  <!-- ********************************* -->
  <!-- products -->
  <!-- ********************************* -->

  <section id="product" class="products py-5 my-5" data-anim="fade-up" data-anim-duration="1s">
    <div class="container">

      <div class="head-sec">
        <h3 class="" id="products-title">المنتجات</h3>
      </div>
      <div class="row row-gap-4" id="products-container">
        <div class="col-12 text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden" id="loading-products">Loading products...</span>
          </div>
        </div>
      </div>
    </div>
  </section>


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
  <script src="js/main-section-slider.js"></script>
  <script src="js/shopping-cart.js"></script>
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

      // Check if there's a category filter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get('category');
      const searchQuery = urlParams.get('search');

      if (searchQuery) {
        await productsIntegration.searchProducts(searchQuery, '#products-container');
      } else if (categoryId) {
        // Use dedicated getCategoryProducts so SallaProductAPI.getCategoryProducts is executed
        const result = await productsIntegration.productAPI.getCategoryProducts(categoryId, {
          limit: 20
        });

        const container = document.querySelector('#products-container');
        if (result && result.success && result.data && result.data.length > 0) {
          const productsHtml = result.data
            .map(product => productsIntegration.createProductCard(product))
            .join('');
          container.innerHTML = productsHtml;
          productsIntegration.attachCartHandlers();
        } else {
          container.innerHTML = '<div class="col-12 text-center py-5"><h4>No products found</h4></div>';
        }
      } else {
        await productsIntegration.loadProducts('#products-container', {
          source: 'latest',
          limit: 20
        });
      }

      // Handle search
      const searchInput = document.querySelector('.search input');
      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          const query = e.target.value.trim();

          if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
              productsIntegration.searchProducts(query, '#products-container');
            }, 500);
          } else if (query.length === 0) {
            // Reload all products
            productsIntegration.loadProducts('#products-container', {
              source: 'latest',
              limit: 20
            });
          }
        });
      }
    });
  </script>
</body>

</html>