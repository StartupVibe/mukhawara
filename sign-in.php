<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تسجيل الدخول</title>
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/login.css">
  <link rel="stylesheet" href="css/all.min.css">
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/font-family.css">
  <link rel="stylesheet" href="css/media.css">


</head>

<body class="overflow-x-hidden">

  <div class="login-page d-flex">
    <a href=""
      class="logo position-absolute d-flex justify-content-center align-items-center gap-2 text-black text-decoration-none ">
      <h1>مخورة</h1>
    </a>
    <div class="col-12 login d-flex justify-content-center align-items-center">
      <div class="content">
        <div class="container">
          <div class="text text-center mb-5">
            <h3 id="login-title">تسجيل الدخول</h3>
            <p>أهلاً بك! يرجى إدخال بياناتك.</p>
          </div>
          <div class="error alert alert-danger d-none"></div>
          <div class="success alert alert-success d-none"></div>
          <form id="loginForm" class="d-flex flex-column gap-2">
            <label for="loginEmail">البريد الالكتروني</label>
            <input type="email" name="email" id="loginEmail" class="form-control" placeholder="Example@gmail.com"
              required>
            <div class="check d-flex justify-content-between">
              <div class="remmber-me d-flex align-items-center gap-2">
                <input type="checkbox" id="rememberMe">
                <span data-translate="remember-me">تذكرني</span>
              </div>
            </div>
            <button type="submit" class="submit-input" id="loginBtn" data-translate="verify-btn">تسجيل دخول</button>
          </form>
        </div>
      </div>
    </div>
  </div>


  <!-- Salla User API -->
  <script src="salla/auth/user-api.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script>
    // Initialize auth on page load
    document.addEventListener('DOMContentLoaded', async () => {
      const userAPI = new SallaUserAPI();
      await userAPI.ensureInitialized();

      const loginForm = document.getElementById('loginForm');
      const loginBtn = document.getElementById('loginBtn');
      const errorDiv = document.querySelector('.error');
      const successDiv = document.querySelector('.success');

      function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
        successDiv.classList.add('d-none');
      }

      function showSuccess(message) {
        successDiv.textContent = message;
        successDiv.classList.remove('d-none');
        errorDiv.classList.add('d-none');
      }

      function hideMessages() {
        errorDiv.classList.add('d-none');
        successDiv.classList.add('d-none');
      }

      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        const email = document.getElementById('loginEmail').value.trim();

        if (!email) {
          showError('Please enter your email');
          return;
        }

        // Save email to localStorage for verify page
        try {
          localStorage.setItem('salla_auth_email', email);
        } catch (e) {
          console.warn('Failed to save email', e);
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Sending...';

        try {
          // Use SallaUserAPI.login() to send verification code
          const result = await userAPI.login({
            type: 'email',
            email: email
          });

          showSuccess('Verification code sent! Please check your email.');

          // Redirect to verify page after 1.5 seconds
          setTimeout(() => {
            window.location.href = 'verify.php';
          }, 1500);
        } catch (error) {
          const errorMessage = error.message || 'Failed to send verification code';
          showError(errorMessage);
          loginBtn.disabled = false;
          loginBtn.textContent = 'Sign in';
        }
      });
    });
  </script>
</body>

</html>