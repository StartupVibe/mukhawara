<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سلة المشتريات</title>
  <link rel="stylesheet" href="css/all.min.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/startupVibeAnimation.css">
  <link rel="stylesheet" href="css/index.css">
  <link rel="stylesheet" href="css/media.css">
  <link rel="stylesheet" href="css/cart.css">
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/font-family.css">
</head>

<body class="overflow-x-hidden">

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



  <section id="cart-item" class="shopping-cart my-5 py-5" data-anim="fade-up" data-anim-duration="1s">
    <div class="container">


      <div class="cart-item">

        <h2>سلة المشتريات</h2>
        <p class="sub">You have 3 item in your cart</p>


        <!-- ITEMS -->
        <div class="item d-flex p-4 mb-3">
          <img src="assets/WildRoses-01.webp" />
          <div class="info d-flex flex-column">
            <div class="title">
              <h4>Fabric - The Starry Night</h4>
            </div>
            <div class="action d-flex justify-content-between align-items-center">
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center gap-4">
                  <div class="price">
                    <span>120$</span>
                  </div>
                  <div class="inc-dec">
                    <button data-id="" class="dec"><i class="fa-solid fa-minus" style="color: #3c466b;"></i></button>
                    <span data-id="" class="quantity">3</span>
                    <button data-id="" class="inc"><i class="fa-solid fa-plus" style="color: #3c466b;"></i></button>
                  </div>
                </div>
                <button class="delete btn btn-sm btn-danger mt-2">Delete product</button>
              </div>
              <div class="d-flex align-items-center gap-4">
                <div class="price" style="color: var(--first-color); ">
                  <p class="m-0">Total item : <span>360$</span></p>
                </div>

              </div>
            </div>
          </div>
        </div>


        <div class="item d-flex p-4 mb-3">
          <img src="assets/WildRoses-01.webp" />
          <div class="info d-flex flex-column">
            <div class="title">
              <h4>Fabric - The Starry Night</h4>
            </div>
            <div class="action d-flex justify-content-between align-items-center">
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center gap-4">
                  <div class="price">
                    <span>120$</span>
                  </div>
                  <div class="inc-dec">
                    <button data-id="" class="dec"><i class="fa-solid fa-minus" style="color: #3c466b;"></i></button>
                    <span data-id="" class="quantity">3</span>
                    <button data-id="" class="inc"><i class="fa-solid fa-plus" style="color: #3c466b;"></i></button>
                  </div>
                </div>
                <button class="delete btn btn-sm btn-danger mt-2">Delete product</button>
              </div>
              <div class="d-flex align-items-center gap-4">
                <div class="price" style="color: var(--first-color); ">
                  <p class="m-0">Total item : <span>360$</span></p>
                </div>

              </div>
            </div>
          </div>
        </div>


        <div class="item d-flex p-4 mb3">
          <img src="assets/WildRoses-01.webp" />
          <div class="info d-flex flex-column">
            <div class="title">
              <h4>Fabric - The Starry Night</h4>
            </div>
            <div class="action d-flex justify-content-between align-items-center">
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center gap-4">
                  <div class="price">
                    <span>120$</span>
                  </div>
                  <div class="inc-dec">
                    <button data-id="" class="dec"><i class="fa-solid fa-minus" style="color: #3c466b;"></i></button>
                    <span data-id="" class="quantity">3</span>
                    <button data-id="" class="inc"><i class="fa-solid fa-plus" style="color: #3c466b;"></i></button>
                  </div>
                </div>
                <button class="delete btn btn-sm btn-danger mt-2">Delete product</button>
              </div>
              <div class="d-flex align-items-center gap-4">
                <div class="price" style="color: var(--first-color); ">
                  <p class="m-0">Total item : <span>360$</span></p>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div class="total">
          <span>Total : 1080$</span>
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
</body>

</html>