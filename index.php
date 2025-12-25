<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الصفحة الرئيسية</title>
  <link rel="stylesheet" href="css/all.min.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/startupVibeAnimation.css">
  <link rel="stylesheet" href="css/index.css">
  <link rel="stylesheet" href="css/media.css">
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/font-family.css">



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

  <!-- start main section -->
  <section class="main-section ">
    <div class="container">
      <div class="row">
        <div class="col-12 col-lg-6 d-flex align-items-center" data-anim="fade-left">
          <div class="text">
            <h1>مــــــــخـــ<span>ـــــورة</span></h1>
            <p data-translate="main-hero-description">
              اكتشف أقمشة القطن عالية الجودة التي تجمع بين النعومة الطبيعية والأناقة المستدامة. اختبر المزيج المثالي بين
              الراحة والأناقة مع أفضل مجموعات القطن من مخورة.</p>
            <a href="#product" class="btn" id="shop-now">تسوق الان</a>
          </div>
        </div>
        <div class="col-12 col-lg-6 d-flex justify-content-center" data-anim="fade-right">
          <div class="slider-container">
            <img id="mainImage" class="main-img" src="https://via.placeholder.com/200?text=1">
            <div class="thumbs">
              <img src="assets/IMG_0206.jpg" onclick="changeImage(0)"
                style="top:0; left:50%; transform:translateX(-50%);" class="active">
              <img src="assets/IMG_0200.jpg" onclick="changeImage(1)"
                style="right:0; top:50%; transform:translateY(-50%);">
              <img src="assets/IMG_0209.jpg" onclick="changeImage(2)"
                style="bottom:0; left:50%; transform:translateX(-50%);">
              <img src="assets/IMG_0212.jpg" onclick="changeImage(3)"
                style="left:0; top:50%; transform:translateY(-50%);">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--Waves end-->
    <svg class="editorial" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28" preserveAspectRatio="none">
      <defs>
        <path id="gentle-wave" d="M-160 44c30 0 
    58-18 88-18s
    58 18 88 18 
    58-18 88-18 
    58 18 88 18
    v44h-352z" />
      </defs>
      <g class="parallax">
        <use xlink:href="#gentle-wave" x="50" y="0" fill="rgba(255,255,255,0.7" />
        <use xlink:href="#gentle-wave" x="50" y="3" fill="rgba(255,255,255,0.5)" />
        <use xlink:href="#gentle-wave" x="50" y="6" fill="rgba(255,255,255,0.3)" />
      </g>
    </svg>
  </section>


  <!-- ********************************* -->
  <!-- category -->
  <!-- ********************************* -->

  <!-- <section class="categories " data-anim="fade-up" data-anim-duration="1s">
    <div class="container">
      <div class="head-section text-center">
        <h3 class="" id="categories">Categories</h3>
      </div>
      <div class="row" id="home-categories-row">
      </div>
    </div>
  </section> -->

  <!-- ********************************* -->
  <!-- products -->
  <!-- ********************************* -->

  <section id="product" class="products py-5 my-5" data-anim="fade-up"
    data-anim-duration="1s">
    <div class="container">
      <div class="head-sec">
        <h3 class="" id="products-title">المنتجات</h3>
        <a href="products.php" id="view-all">عرض الكل <i class="fa-solid fa-angle-right"></i></a>
      </div>
      <div class="row row-gap-4" id="products-section">
        <div class="col-12 text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden" id="loading-products">Loading products...</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ********************************* -->
  <!-- Offers -->
  <!-- ********************************* -->
  <!-- 
  <section id="offers" class="products my-5" data-anim="fade-up" data-anim-duration="1s">
    <div class="container">
      <div class="head-section text-center">
        <h3 class="" id="offers">Offers</h3>
      </div>
      <div class="row row-gap-4" id="offers-section">
        <div class="col-12 text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden" id="loading-offers">Loading offers...</span>
          </div>
        </div>
      </div>
    </div>
  </section> -->

  <!-- ********************************* -->
  <!-- Bestselling products -->
  <!-- ********************************* -->

  <section id="Bestselling" class="products py-5 my-5" data-anim="fade-up" data-anim-duration="1s">
    <div class="container">
      <div class="head-section text-center">
        <h3 class="" id="bestselling-products">المنتجات الأكثر مبيعا</h3>
      </div>
      <div class="row row-gap-4" id="bestselling-section">
        <div class="col-12 text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
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
  <script src="js/auth-ui-manager.js"></script>
  <script src="js/jquery.min.js"></script>
  <script src="js/loading.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/index.js"></script>
  <script src="js/startupVibeAnimation.js"></script>
  <script src="js/main-section-slider.js"></script>
  <script src="js/shopping-cart.js"></script>
  <script src="js/translate.js"></script>
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

      // Load categories section on home page
      await productsIntegration.loadHomeCategories('#home-categories-row');

      // Load latest products
      await productsIntegration.loadProducts('#products-section', {
        source: 'latest',
        limit: 5
      });

      // Load offers products
      // await productsIntegration.loadOffersProducts('#offers-section', 4);

      // Load best selling (using latest as fallback since best_selling might not be available)
      await productsIntegration.loadProducts('#bestselling-section', {
        source: 'latest',
        limit: 4
      });

      // Handle search
      const searchInput = document.querySelector('.search input');
      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query.length >= 2) {
              window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
          }
        });
      }
    });
  </script>
</body>

</html>