/**
 * Salla Auth Configuration
 * Centralized configuration for Salla authentication
 */
const AuthConfig = {
  store: {
    id: 229278595,
    url: 'https://api.salla.dev/store/v1'
  },
  sdk: {
    debug: true,
    language_code: 'ar'
  },
  defaultCountry: {
    code: 'SA', // Saudi Arabia
    key: '966'  // Country calling code
  },
  storage: {
    emailKey: 'salla_auth_email',
    userDataKey: 'salla_user_data'
  },
  routes: {
    home: 'index.html',
    signIn: 'sign-in.php',
    signUp: 'sign-up.php',
    verify: 'verify.php'
  }
};

