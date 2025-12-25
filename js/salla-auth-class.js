/**
 * Salla Authentication Class
 * Clean architecture for handling Salla authentication
 */
class SallaAuth {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
    this.currentEmail = null;
    this.callbacks = {
      onLoginSuccess: null,
      onLogout: null,
      onRegisterSuccess: null,
      onError: null
    };
  }

  /**
   * Initialize Salla SDK
   */
  async init() {
    if (this.isInitialized) {
      return true;
    }

    return new Promise((resolve, reject) => {
      const checkSalla = () => {
        if (typeof salla !== 'undefined') {
          try {
            salla.init({
              debug: this.config.sdk.debug,
              language_code: this.config.sdk.language_code,
              store: {
                id: this.config.store.id,
                url: this.config.store.url
              }
            });

            this.setupEventListeners();
            this.isInitialized = true;
            resolve(true);
          } catch (error) {
            reject(error);
          }
        } else {
          setTimeout(checkSalla, 500);
        }
      };
      checkSalla();
    });
  }

  /**
   * Setup Salla event listeners
   */
  setupEventListeners() {
    if (!salla.event || !salla.event.auth) {
      return;
    }

    if (typeof salla.event.auth.onLoginSuccess === 'function') {
      salla.event.auth.onLoginSuccess((res) => {
        this.handleLoginSuccess(res);
      });
    }

    if (typeof salla.event.auth.onLogout === 'function') {
      salla.event.auth.onLogout(() => {
        this.handleLogout();
      });
    }

    if (typeof salla.event.auth.onRegistered === 'function') {
      salla.event.auth.onRegistered((response) => {
        this.handleRegisterSuccess(response);
      });
    }

    if (typeof salla.event.auth.onRegistrationFailed === 'function') {
      salla.event.auth.onRegistrationFailed((errorMessage) => {
        this.handleError('Registration failed: ' + errorMessage);
      });
    }
  }

  /**
   * Send verification code to email
   * @param {string} email - User email
   * @param {string} type - Verification type (email/sms)
   * @returns {Promise}
   */
  async sendVerificationCode(email, type = 'email') {
    await this.ensureInitialized();

    if (!email) {
      throw new Error('Email is required');
    }

    this.currentEmail = email;
    this.saveEmail(email);

    const payload = {
      email: email,
      type: type
    };

    try {
      const response = await salla.auth.login(payload);
      return {
        success: true,
        message: 'Verification code sent successfully',
        data: response
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Resend verification code
   * @param {string} email - User email
   * @param {string} type - Verification type
   * @returns {Promise}
   */
  async resendVerificationCode(email, type = 'email') {
    await this.ensureInitialized();

    const payload = {
      email: email,
      type: type
    };

    try {
      const response = await salla.auth.resend(payload);
      return {
        success: true,
        message: 'Verification code resent successfully',
        data: response
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Verify code and handle registration/authentication automatically
   * @param {string} code - Verification code
   * @param {string} email - User email
   * @param {string} type - Verification type
   * @returns {Promise}
   */
  async verifyCode(code, email = null, type = 'email') {
    await this.ensureInitialized();

    if (!code) {
      throw new Error('Verification code is required');
    }

    const userEmail = email || this.getSavedEmail() || this.currentEmail;
    if (!userEmail) {
      throw new Error('Email is required for verification');
    }

    const payload = {
      type: type,
      code: code,
      email: userEmail
    };

    try {
      const response = await salla.auth.verify(payload);
      const caseType = response?.data?.case || 'unknown';

      // If new_customer, automatically register
      if (caseType === 'new_customer') {
        return {
          success: true,
          case: 'new_customer',
          message: 'New customer detected. Registration required.',
          data: response,
          requiresRegistration: true
        };
      } else {
        // Existing customer - already authenticated
        return {
          success: true,
          case: 'existing_customer',
          message: 'Authentication successful',
          data: response,
          requiresRegistration: false
        };
      }
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} code - Verification code
   * @returns {Promise}
   */
  async register(userData, code) {
    await this.ensureInitialized();

    if (!code) {
      throw new Error('Verification code is required');
    }

    const email = userData.email || this.getSavedEmail() || this.currentEmail;
    if (!email) {
      throw new Error('Email is required for registration');
    }

    const payload = {
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      phone: userData.phone || '',
      country_code: userData.country_code || this.config.defaultCountry.code,
      country_key: userData.country_key || this.config.defaultCountry.key,
      verified_by: 'email',
      email: email,
      code: parseInt(code)
    };

    try {
      const response = await salla.auth.register(payload);
      this.saveUserData(response?.data);
      return {
        success: true,
        message: 'Registration successful',
        data: response
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Complete verification and registration flow
   * @param {string} code - Verification code
   * @param {Object} userData - User data for registration (if new customer)
   * @returns {Promise}
   */
  async verifyAndComplete(code, userData = null) {
    try {
      // Step 1: Verify the code
      const verifyResult = await this.verifyCode(code);

      // Step 2: If new customer, register
      if (verifyResult.requiresRegistration) {
        if (!userData) {
          // Return a special response indicating registration is needed
          return {
            success: false,
            requiresRegistration: true,
            message: 'New customer detected. Please complete registration.',
            data: verifyResult.data
          };
        }
        const registerResult = await this.register(userData, code);
        return {
          success: true,
          message: 'Registration completed successfully',
          registered: true,
          data: registerResult.data
        };
      } else {
        // Existing customer - already authenticated
        return {
          success: true,
          message: 'Authentication completed successfully',
          registered: false,
          data: verifyResult.data
        };
      }
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Check authentication status
   * @returns {Promise}
   */
  async checkAuthStatus() {
    await this.ensureInitialized();

    try {
      const res = await salla.auth.refresh();
      if (res?.data?.access_token) {
        
        return {
          isAuthenticated: true,
          data: res.data
        };
      } else {
        return {
          isAuthenticated: false,
          data: null
        };
      }
    } catch (error) {
      return {
        isAuthenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise}
   */
  async logout() {
    await this.ensureInitialized();

    try {
      await salla.auth.logout();
      this.clearUserData();
      this.clearEmail();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Set callback for events
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * Handle login success
   */
  handleLoginSuccess(res) {
    if (this.callbacks.onLoginSuccess) {
      this.callbacks.onLoginSuccess(res);
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    if (this.callbacks.onLogout) {
      this.callbacks.onLogout();
    }
  }

  /**
   * Handle register success
   */
  handleRegisterSuccess(response) {
    if (this.callbacks.onRegisterSuccess) {
      this.callbacks.onRegisterSuccess(response);
    }
  }

  /**
   * Handle errors
   */
  handleError(message) {
    if (this.callbacks.onError) {
      this.callbacks.onError(message);
    }
  }

  /**
   * Ensure SDK is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!salla || !salla.auth) {
      throw new Error('Salla SDK not available');
    }
  }

  /**
   * Handle API errors
   */
  handleApiError(error) {
    if (error.response?.data?.error?.fields) {
      return {
        message: error.message || 'API Error',
        fields: error.response.data.error.fields,
        fullError: error
      };
    }
    return {
      message: error.message || 'Unknown error occurred',
      fullError: error
    };
  }

  /**
   * Save email to localStorage
   */
  saveEmail(email) {
    try {
      localStorage.setItem(this.config.storage.emailKey, email);
    } catch (e) {
      console.warn('Failed to save email to localStorage', e);
    }
  }

  /**
   * Get saved email from localStorage
   */
  getSavedEmail() {
    try {
      return localStorage.getItem(this.config.storage.emailKey);
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear saved email
   */
  clearEmail() {
    try {
      localStorage.removeItem(this.config.storage.emailKey);
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Save user data to localStorage
   */
  saveUserData(userData) {
    try {
      localStorage.setItem(this.config.storage.userDataKey, JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to save user data to localStorage', e);
    }
  }

  /**
   * Get saved user data from localStorage
   */
  getSavedUserData() {
    try {
      const data = localStorage.getItem(this.config.storage.userDataKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clear user data from localStorage
   */
  clearUserData() {
    try {
      localStorage.removeItem(this.config.storage.userDataKey);
    } catch (e) {
      // Ignore
    }
  }
}

// Create global instance
let sallaAuthInstance = null;

/**
 * Get or create SallaAuth instance
 */
function getSallaAuth() {
  if (!sallaAuthInstance) {
    sallaAuthInstance = new SallaAuth(AuthConfig);
  }
  return sallaAuthInstance;
}

