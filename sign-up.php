<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>انشاء حساب</title>
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
    <div class="col-12 login sign-up d-flex justify-content-center align-items-center">
      <div class="content">
        <div class="container">
          <div class="text text-center mb-5">
            <h3>إنشاء حساب</h3>
            <p>يرجى إدخال بياناتك</p>
          </div>
          <div class="error alert alert-danger d-none"></div>
          <div class="success alert alert-success d-none"></div>
          <form id="signupForm" class="d-flex flex-column gap-2">
            <label for="firstName">الاسم الاول</label>
            <input type="text" name="first_name" id="firstName" class="form-control" placeholder="ادخل الاسم الاول"
              required>
            <label for="lastName">الاسم الاخير</label>
            <input type="text" name="last_name" id="lastName" class="form-control" placeholder="ادخل الاسم الاخير"
              required>
            <label for="countrySearch">الدولة <span class="text-danger">*</span></label>
            <div class="position-relative">
              <input type="text" id="countrySearch" class="form-control" placeholder="ابحث عن الدولة..."
                autocomplete="off" required>
              <select name="country" id="country" class="form-control"
                style="position: absolute; opacity: 0; pointer-events: none; height: 0; padding: 0; border: none;">
                <option value="">اختار الدولة</option>
              </select>
              <div id="countryDropdown" class="position-absolute w-100 bg-white border rounded shadow-sm"
                style="max-height: 200px; overflow-y: auto; z-index: 1000; display: none; top: 100%; margin-top: 2px;">
              </div>
            </div>
            <input type="hidden" id="selectedCountryCode" name="country_code" value="">
            <input type="hidden" id="selectedCountryKey" name="country_key" value="">
            <label for="phone">رقم الهاتف</label>
            <input type="tel" name="phone" id="phone" class="form-control" placeholder="ادخل رقم الهاتف" required>
            <label for="signupEmail">البريد الالكتروني</label>
            <input type="email" name="email" id="signupEmail" class="form-control" placeholder="ادخل البريد الالكتروني"
              required>
            <button type="submit" class="submit-input" id="signupBtn">انشئ حساب</button>
            <p class="sign-up">لديك حساب بالفعل ؟ <a href="sign-in.php">تسجيل الدخول</a></p>
          </form>
        </div>
      </div>
    </div>
  </div>


  <!-- Salla User API -->
  <script src="salla/auth/user-api.js"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script>
    // Complete country list with ISO codes and calling codes
    const countries = [
      { code: 'SA', name: 'Saudi Arabia', key: '966' },
      { code: 'EG', name: 'Egypt', key: '20' },
      { code: 'AE', name: 'United Arab Emirates', key: '971' },
      { code: 'KW', name: 'Kuwait', key: '965' },
      { code: 'QA', name: 'Qatar', key: '974' },
      { code: 'BH', name: 'Bahrain', key: '973' },
      { code: 'OM', name: 'Oman', key: '968' },
      { code: 'YE', name: 'Yemen', key: '967' },
      { code: 'IQ', name: 'Iraq', key: '964' },
      { code: 'JO', name: 'Jordan', key: '962' },
      { code: 'LB', name: 'Lebanon', key: '961' },
      { code: 'SY', name: 'Syria', key: '963' },
      { code: 'PS', name: 'Palestine', key: '970' },
      { code: 'IL', name: 'Israel', key: '972' },
      { code: 'TR', name: 'Turkey', key: '90' },
      { code: 'IR', name: 'Iran', key: '98' },
      { code: 'PK', name: 'Pakistan', key: '92' },
      { code: 'IN', name: 'India', key: '91' },
      { code: 'BD', name: 'Bangladesh', key: '880' },
      { code: 'AF', name: 'Afghanistan', key: '93' },
      { code: 'US', name: 'United States', key: '1' },
      { code: 'CA', name: 'Canada', key: '1' },
      { code: 'GB', name: 'United Kingdom', key: '44' },
      { code: 'FR', name: 'France', key: '33' },
      { code: 'DE', name: 'Germany', key: '49' },
      { code: 'IT', name: 'Italy', key: '39' },
      { code: 'ES', name: 'Spain', key: '34' },
      { code: 'NL', name: 'Netherlands', key: '31' },
      { code: 'BE', name: 'Belgium', key: '32' },
      { code: 'CH', name: 'Switzerland', key: '41' },
      { code: 'AT', name: 'Austria', key: '43' },
      { code: 'SE', name: 'Sweden', key: '46' },
      { code: 'NO', name: 'Norway', key: '47' },
      { code: 'DK', name: 'Denmark', key: '45' },
      { code: 'FI', name: 'Finland', key: '358' },
      { code: 'PL', name: 'Poland', key: '48' },
      { code: 'RU', name: 'Russia', key: '7' },
      { code: 'CN', name: 'China', key: '86' },
      { code: 'JP', name: 'Japan', key: '81' },
      { code: 'KR', name: 'South Korea', key: '82' },
      { code: 'AU', name: 'Australia', key: '61' },
      { code: 'NZ', name: 'New Zealand', key: '64' },
      { code: 'BR', name: 'Brazil', key: '55' },
      { code: 'MX', name: 'Mexico', key: '52' },
      { code: 'AR', name: 'Argentina', key: '54' },
      { code: 'ZA', name: 'South Africa', key: '27' },
      { code: 'NG', name: 'Nigeria', key: '234' },
      { code: 'KE', name: 'Kenya', key: '254' },
      { code: 'MA', name: 'Morocco', key: '212' },
      { code: 'DZ', name: 'Algeria', key: '213' },
      { code: 'TN', name: 'Tunisia', key: '216' },
      { code: 'LY', name: 'Libya', key: '218' },
      { code: 'SD', name: 'Sudan', key: '249' },
      { code: 'ET', name: 'Ethiopia', key: '251' },
      { code: 'GH', name: 'Ghana', key: '233' },
      { code: 'UG', name: 'Uganda', key: '256' },
      { code: 'TZ', name: 'Tanzania', key: '255' },
      { code: 'ID', name: 'Indonesia', key: '62' },
      { code: 'MY', name: 'Malaysia', key: '60' },
      { code: 'SG', name: 'Singapore', key: '65' },
      { code: 'TH', name: 'Thailand', key: '66' },
      { code: 'VN', name: 'Vietnam', key: '84' },
      { code: 'PH', name: 'Philippines', key: '63' },
      { code: 'GR', name: 'Greece', key: '30' },
      { code: 'PT', name: 'Portugal', key: '351' },
      { code: 'IE', name: 'Ireland', key: '353' },
      { code: 'CZ', name: 'Czech Republic', key: '420' },
      { code: 'HU', name: 'Hungary', key: '36' },
      { code: 'RO', name: 'Romania', key: '40' },
      { code: 'BG', name: 'Bulgaria', key: '359' },
      { code: 'HR', name: 'Croatia', key: '385' },
      { code: 'RS', name: 'Serbia', key: '381' },
      { code: 'UA', name: 'Ukraine', key: '380' },
      { code: 'BY', name: 'Belarus', key: '375' },
      { code: 'KZ', name: 'Kazakhstan', key: '7' },
      { code: 'UZ', name: 'Uzbekistan', key: '998' },
      { code: 'LK', name: 'Sri Lanka', key: '94' },
      { code: 'NP', name: 'Nepal', key: '977' },
      { code: 'MM', name: 'Myanmar', key: '95' },
      { code: 'KH', name: 'Cambodia', key: '855' },
      { code: 'LA', name: 'Laos', key: '856' },
      { code: 'MN', name: 'Mongolia', key: '976' },
      { code: 'CL', name: 'Chile', key: '56' },
      { code: 'CO', name: 'Colombia', key: '57' },
      { code: 'PE', name: 'Peru', key: '51' },
      { code: 'VE', name: 'Venezuela', key: '58' },
      { code: 'EC', name: 'Ecuador', key: '593' },
      { code: 'BO', name: 'Bolivia', key: '591' },
      { code: 'PY', name: 'Paraguay', key: '595' },
      { code: 'UY', name: 'Uruguay', key: '598' },
      { code: 'CR', name: 'Costa Rica', key: '506' },
      { code: 'PA', name: 'Panama', key: '507' },
      { code: 'DO', name: 'Dominican Republic', key: '1' },
      { code: 'CU', name: 'Cuba', key: '53' },
      { code: 'JM', name: 'Jamaica', key: '1' },
      { code: 'TT', name: 'Trinidad and Tobago', key: '1' },
      { code: 'GT', name: 'Guatemala', key: '502' },
      { code: 'HN', name: 'Honduras', key: '504' },
      { code: 'NI', name: 'Nicaragua', key: '505' },
      { code: 'SV', name: 'El Salvador', key: '503' }
    ];

    // Initialize auth on page load
    document.addEventListener('DOMContentLoaded', async () => {
      const userAPI = new SallaUserAPI();
      await userAPI.ensureInitialized();

      const signupForm = document.getElementById('signupForm');
      const signupBtn = document.getElementById('signupBtn');
      const errorDiv = document.querySelector('.error');
      const successDiv = document.querySelector('.success');
      const countrySearch = document.getElementById('countrySearch');
      const countryDropdown = document.getElementById('countryDropdown');
      const countrySelect = document.getElementById('country');

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

      // Populate country dropdown
      function populateCountries(filter = '') {
        countryDropdown.innerHTML = '';
        const filtered = countries.filter(c =>
          c.name.toLowerCase().includes(filter.toLowerCase()) ||
          c.code.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
          countryDropdown.innerHTML = '<div class="p-2 text-muted">No countries found</div>';
          countryDropdown.style.display = 'block';
          return;
        }

        filtered.forEach(country => {
          const div = document.createElement('div');
          div.className = 'p-2 border-bottom cursor-pointer';
          div.style.cursor = 'pointer';
          div.innerHTML = `<strong>${country.name}</strong> <span class="text-muted">(+${country.key})</span>`;
          div.addEventListener('click', () => {
            selectCountry(country);
          });
          div.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f8f9fa';
          });
          div.addEventListener('mouseleave', function () {
            this.style.backgroundColor = 'white';
          });
          countryDropdown.appendChild(div);
        });
        countryDropdown.style.display = 'block';
      }

      // Select country
      function selectCountry(country) {
        countrySearch.value = `${country.name} (+${country.key})`;
        document.getElementById('selectedCountryCode').value = country.code;
        document.getElementById('selectedCountryKey').value = country.key;
        countryDropdown.style.display = 'none';
        countrySelect.value = country.code;
        // Remove any validation error styling
        countrySearch.setCustomValidity('');
        countrySearch.classList.remove('is-invalid');
      }

      // Country search functionality
      countrySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        if (searchTerm.length > 0) {
          populateCountries(searchTerm);
        } else {
          countryDropdown.style.display = 'none';
        }
      });

      countrySearch.addEventListener('focus', () => {
        if (countrySearch.value.length > 0) {
          populateCountries(countrySearch.value);
        } else {
          populateCountries('');
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!countrySearch.contains(e.target) && !countryDropdown.contains(e.target)) {
          countryDropdown.style.display = 'none';
        }
      });

      // Initialize with all countries
      populateCountries('');

      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();

        // Get country selection
        const countryCode = document.getElementById('selectedCountryCode').value;
        const countryKey = document.getElementById('selectedCountryKey').value;

        const formData = {
          first_name: document.getElementById('firstName').value.trim(),
          last_name: document.getElementById('lastName').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          email: document.getElementById('signupEmail').value.trim(),
          country_code: countryCode || 'SA', // Selected country code
          country_key: countryKey || '966'  // Selected country calling code
        };

        // Validate form
        if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email || !countryCode) {
          showError('Please fill in all fields including country');
          if (!countryCode) {
            countrySearch.setCustomValidity('Please select a country');
            countrySearch.classList.add('is-invalid');
            countrySearch.focus();
          } else {
            countrySearch.setCustomValidity('');
            countrySearch.classList.remove('is-invalid');
          }
          return;
        } else {
          countrySearch.setCustomValidity('');
          countrySearch.classList.remove('is-invalid');
        }

        // Store user data in sessionStorage for verification page
        sessionStorage.setItem('signup_user_data', JSON.stringify(formData));

        // Save email to localStorage for verify page
        try {
          localStorage.setItem('salla_auth_email', formData.email);
        } catch (e) {
          console.warn('Failed to save email', e);
        }

        signupBtn.disabled = true;
        signupBtn.textContent = 'Sending...';

        try {
          // Use SallaUserAPI.login() to send verification code
          const result = await userAPI.login({
            type: 'email',
            email: formData.email
          });

          showSuccess('Verification code sent! Please check your email.');

          // Redirect to verify page after 1.5 seconds
          setTimeout(() => {
            window.location.href = 'verify.php';
          }, 1500);
        } catch (error) {
          const errorMessage = error.message || 'Failed to send verification code';
          showError(errorMessage);
          signupBtn.disabled = false;
          signupBtn.textContent = 'Sign up';
        }
      });
    });
  </script>
</body>

</html>