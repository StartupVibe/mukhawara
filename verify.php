<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>التحقق من الرمز</title>
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/all.min.css">
  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/font-family.css">
  <link rel="stylesheet" href="css/media.css">
  <link rel="stylesheet" href="css/login.css">
</head>

<body class="overflow-x-hidden">
  <div class="login-page">
    <a href=""
      class="logo position-absolute d-flex justify-content-center align-items-center gap-2 text-black text-decoration-none ">
      <h1>مخورة</h1>
    </a>
    <div class="verify">
      <div class="verify-box">
        <h3 id="verify-title">التحقق <span>رمز</span></h3>
        <p id="verify-instructions">أدخل الرمز المكون من 4 أرقام الذي أرسلناه إلى بريدك الإلكتروني</p>
        <div class="error alert alert-danger d-none mb-3"></div>
        <div class="success alert alert-success d-none mb-3"></div>
        <div class="code-inputs">
          <input type="text" maxlength="1" class="form-control code" id="code1">
          <input type="text" maxlength="1" class="form-control code" id="code2">
          <input type="text" maxlength="1" class="form-control code" id="code3">
          <input type="text" maxlength="1" class="form-control code" id="code4">
        </div>
        <button class="verify-btn" id="verifyBtn" data-translate="verify-btn">تحقق</button>
        <p class="resend" data-translate="resend">لم احصل على الرمز <a href="#" id="resendLink">اعادة الارسال</a></p>
      </div>
    </div>
  </div>

  <!-- Salla User API -->
  <script src="salla/auth/user-api.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="js/translate.js"></script>
  <script>
    // Get saved email from localStorage
    function getSavedEmail() {
      try {
        return localStorage.getItem('salla_auth_email');
      } catch (e) {
        return null;
      }
    }

    // Initialize auth
    let currentEmail = null;
    let signupUserData = null;
    let userAPI = null;

    async function initAuth() {
      userAPI = new SallaUserAPI();
      await userAPI.ensureInitialized();

      // Get saved email and signup data
      currentEmail = getSavedEmail();
      const signupData = sessionStorage.getItem('signup_user_data');
      if (signupData) {
        signupUserData = JSON.parse(signupData);
        if (signupUserData.email) {
          currentEmail = signupUserData.email;
        }
      }
    }

    // Verify the received code - automatically handles registration or authentication
    async function verifyCode(code) {
      if (!userAPI) {
        throw new Error('User API not initialized');
      }

      if (!code) {
        throw new Error('Verification code is required');
      }

      if (!currentEmail) {
        throw new Error('Email is required for verification');
      }

      const payload = {
        type: 'email',
        code: parseInt(code),
        email: currentEmail
      };

      try {
        // Try verify first (works for existing customers)
        const verifyResult = await userAPI.verify(payload);

        // Check if it's a new customer (need to register)
        const caseType = verifyResult?.data?.case || verifyResult?.data?.data?.case;

        if (caseType === 'new_customer') {
          if (!signupUserData) {
            throw new Error('New customer detected but user data is missing. Please complete registration first.');
          }
          // Register the new customer
          await registerUser(code);
          return { success: true, registered: true, message: 'Registration successful' };
        } else {
          // Existing customer - tokens already stored by verify()
          return { success: true, registered: false, message: 'Authentication successful' };
        }
      } catch (error) {
        // If verify fails with "new customer" error, try register
        if (error.message && (error.message.includes('new') || error.message.includes('register'))) {
          if (!signupUserData) {
            throw new Error('New customer detected but user data is missing. Please complete registration first.');
          }
          await registerUser(code);
          return { success: true, registered: true, message: 'Registration successful' };
        }
        throw error;
      }
    }

    // Register user with verification code
    async function registerUser(code) {
      if (!userAPI) {
        throw new Error('User API not initialized');
      }

      if (!signupUserData) {
        throw new Error('User data is required for registration');
      }

      const payload = {
        first_name: signupUserData.first_name || '',
        last_name: signupUserData.last_name || '',
        phone: signupUserData.phone || '',
        country_code: signupUserData.country_code || 'SA',
        country_key: signupUserData.country_key || '966',
        verified_by: 'email',
        email: currentEmail,
        code: parseInt(code)
      };

      try {
        // Register - tokens will be stored automatically by register()
        const response = await userAPI.register(payload);
        return response;
      } catch (e) {
        throw e;
      }
    }

    // Resend verification code
    async function resendVerificationCode() {
      if (!userAPI) {
        throw new Error('User API not initialized');
      }

      if (!currentEmail) {
        throw new Error('Email is required');
      }

      try {
        // Use login() to resend verification code
        const response = await userAPI.login({
          type: 'email',
          email: currentEmail
        });
        return response;
      } catch (e) {
        throw e;
      }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', async () => {
      await initAuth();

      const inputs = document.querySelectorAll(".code-inputs input");
      const verifyBtn = document.getElementById('verifyBtn');
      const resendLink = document.getElementById('resendLink');
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
      function getCode() {
        return Array.from(inputs).map(input => input.value).join('');
      }
      function clearCode() {
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
      }
      // Move focus automatically between inputs
      inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
          // Only allow numbers
          input.value = input.value.replace(/[^0-9]/g, '');
          if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
          // Auto-verify when all 4 digits are entered
          if (index === inputs.length - 1 && input.value.length === 1) {
            const code = getCode();
            if (code.length === 4) {
              handleVerify();
            }
          }
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && input.value === "" && index > 0) {
            inputs[index - 1].focus();
          }
        });
      });
      // Handle verify button click
      verifyBtn.addEventListener('click', handleVerify);
      async function handleVerify() {
        const code = getCode();
        if (code.length !== 4) {
          showError('Please enter the complete 4-digit code');
          return;
        }

        hideMessages();
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
          const result = await verifyCode(code);

          if (result.registered) {
            showSuccess('Registration successful! Redirecting...');
            sessionStorage.removeItem('signup_user_data');
          } else {
            showSuccess('Login successful! Redirecting...');
          }

          // Redirect to home page (tokens are already stored in cookies)
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } catch (error) {
          let errorMessage = error.message || 'Verification failed';

          if (error.response?.data?.error?.fields) {
            const fields = Object.values(error.response.data.error.fields).flat();
            errorMessage = fields.join(', ');
          }

          // If new customer but no data, redirect to signup
          if (errorMessage.includes('user data is missing') || errorMessage.includes('complete registration')) {
            showError('New customer detected. Please complete registration first.');
            setTimeout(() => {
              window.location.href = 'sign-up.php';
            }, 2000);
          } else {
            showError(errorMessage);
            clearCode();
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
          }
        }
      }

      // Handle resend code
      resendLink.addEventListener('click', async (e) => {
        e.preventDefault();
        hideMessages();

        if (!currentEmail) {
          showError('Email not found. Please start over from login page.');
          return;
        }

        resendLink.textContent = 'Sending...';
        resendLink.style.pointerEvents = 'none';

        try {
          await resendVerificationCode();
          showSuccess('Verification code resent! Please check your email.');
          clearCode();
        } catch (error) {
          const errorMessage = error.message || 'Failed to resend code';
          showError(errorMessage);
        } finally {
          resendLink.textContent = 'Resend';
          resendLink.style.pointerEvents = 'auto';
        }
      });

      // Focus first input on load
      inputs[0].focus();
    });
  </script>
</body>

</html>