/**
 * Salla User Authentication API Class
 * Handles user authentication and profile information using Salla Store API:
 *   - /auth/login
 *   - /auth/verify
 *   - /auth/register
 *   - /auth/refresh
 *   - /auth/logout
 *   - /auth/user
 *
 * And custom JWT endpoint:
 *   - https://salla.sa/mukhaura/auth/jwt
 *
 * Documentation: https://docs.salla.dev/849352f0?utm_source=openai
 */

class SallaUserAPI {
  constructor() {
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache for user data
    this.loadingPromises = new Map(); // Track ongoing requests

      // Cookie configuration
    this.cookieConfig = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    };
  }

  /**
   * Basic init flag (no SDK requirement here)
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      console.log('Salla User API initialized for direct API calls');
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Cookie helpers (same cookie names as cart-integration & SallaCartAPI)
  // ---------------------------------------------------------------------------


  /**
   * Set cookie with proper configuration
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration in days
   */
  /**
   * Set cookie with secure defaults.
   * - encodes value
   * - does NOT set domain by default (prevents cross-subdomain deletion issues)
   * - sets Secure when on https
   * - uses SameSite by default
   * Note: HttpOnly cannot be set from JS; use server-side set-cookie for HttpOnly cookies.
   */
  setCookie(name, value, days = 7, options = {}) {
    try {
      const expires = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
      const opts = {
        path: this.cookieConfig.path || '/',
        secure: this.cookieConfig.secure || (window.location.protocol === 'https:'),
        sameSite: this.cookieConfig.sameSite || 'Lax',
        domain: this.cookieConfig.domain || undefined,
        ...options
      };

      let cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=${opts.path}`;
      if (opts.domain) cookieString += `;domain=${opts.domain}`;
      if (opts.secure) cookieString += ';Secure';
      if (opts.sameSite) cookieString += `;SameSite=${opts.sameSite}`;

      document.cookie = cookieString;
    } catch (e) {
      console.warn('setCookie failed:', e);
    }
  }
  getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        // Decode URI component (handles special characters)
        try {
          return decodeURIComponent(value);
        } catch (e) {
          return value; // Return as-is if decode fails
        }
      }
    }
    return null;
  }

  deleteCookie(name, options = {}) {
    try {
      const opts = {
        path: this.cookieConfig.path || '/',
        sameSite: this.cookieConfig.sameSite || 'Lax',
        domain: this.cookieConfig.domain || undefined,
        ...options
      };

      const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
      let cookieString = `${name}=;expires=${expires};path=${opts.path}`;
      if (opts.domain) cookieString += `;domain=${opts.domain}`;
      if (opts.sameSite) cookieString += `;SameSite=${opts.sameSite}`;
      document.cookie = cookieString;

      // Also attempt to clear cookie without domain (some browsers require that)
      let cookieNoDomain = `${name}=;expires=${expires};path=${opts.path}`;
      if (opts.sameSite) cookieNoDomain += `;SameSite=${opts.sameSite}`;
      document.cookie = cookieNoDomain;
    } catch (e) {
      console.warn('deleteCookie failed:', e);
    }
  }

  // Helper: read combined 'salla_tokens' cookie (base64 encoded JSON)
  getTokensFromCookie() {
    try {
      const encoded = this.getCookie('salla_tokens');
      if (!encoded) return null;
      const parsed = JSON.parse(atob(encoded));
      return parsed;
    } catch (e) {
      return null;
    }
  }

  /**
   * Store Salla OAuth tokens into a single combined cookie (`salla_tokens`) and also
   * keep legacy individual cookies for backward compatibility.
   * Combined cookie value is base64(JSON({ access_token, refresh_token, expires_at }))
   */
  storeTokens(tokenData) {
    if (!tokenData) return;

    // Handle different response formats
    const accessToken = tokenData.access_token || tokenData.token || null;
    const refreshToken = tokenData.refresh_token || null;

    // Calculate expiration time in ms (timestamp)
    let expiresAt = null;
    if (tokenData.expires_in) {
      expiresAt = Date.now() + (tokenData.expires_in * 1000);
    } else if (accessToken) {
      // Default to 1 hour if no expires_in provided
      expiresAt = Date.now() + (60 * 60 * 1000);
    }

    // Build combined token object and store as base64 JSON
    const tokenObj = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt
    };

    // Use longer expiration if refresh token exists (30 days) otherwise short (1 day)
    const combinedDays = refreshToken ? 30 : 1;

    try {
      const encoded = btoa(JSON.stringify(tokenObj));
      this.setCookie('salla_tokens', encoded, combinedDays);
    } catch (e) {
      console.warn('SallaUserAPI: Failed to store combined tokens cookie:', e);
    }

    // Also store legacy cookies for compatibility with other modules
    if (accessToken) {
      this.setCookie('salla_access_token', accessToken, combinedDays);
    }
    if (refreshToken) {
      this.setCookie('salla_refresh_token', refreshToken, 30);
    }
    if (expiresAt) {
      this.setCookie('salla_token_expires', expiresAt.toString(), 1);
    }

    console.log('SallaUserAPI: tokens stored in cookies (combined and legacy)');
  }

  /**
   * Store user data securely in cookies
   * Stores non-sensitive user info for quick access
   * Note: first_name and last_name are hashed in API response, so we use 'name' field
   */
  storeUserData(userData) {
    if (!userData) return;

    try {
      // Extract safe user data (avoid storing hashed/encrypted fields)
      // The API returns hashed first_name/last_name, so we use the 'name' field instead
      const safeUserData = {
        id: userData.id,
        name: userData.name, // Use the plain name field (not hashed)
        email: userData.email,
        phone: userData.phone,
        currency: userData.currency || 'SAR',
        isGuest: userData.isGuest !== undefined ? userData.isGuest : false,
        createdAt: userData.created_at
      };

      // Encode user data as base64 for basic obfuscation (not encryption, just obfuscation)
      const encodedData = btoa(JSON.stringify(safeUserData));
      
      // Store in cookie securely (7 days expiration)
      this.setCookie('salla_user_data', encodedData, 7);
      
      console.log('SallaUserAPI: user data stored securely in cookies');
    } catch (error) {
      console.warn('SallaUserAPI: Failed to store user data:', error);
    }
  }

  /**
   * Get stored user data from cookies
   */
  getUserData() {
    try {
      const encodedData = this.getCookie('salla_user_data');
      if (!encodedData) return null;
      
      const decodedData = JSON.parse(atob(encodedData));
      return decodedData;
    } catch (error) {
      console.warn('SallaUserAPI: Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Clear user data from cookies
   */
  clearUserData() {
    this.deleteCookie('salla_user_data');
    this.deleteCookie('salla_auth_case');
    console.log('SallaUserAPI: user data cleared from cookies');
  }

  clearTokens() {
    // Remove combined cookie and legacy individual cookies for compatibility
    this.deleteCookie('salla_tokens');
    this.deleteCookie('salla_access_token');
    this.deleteCookie('salla_refresh_token');
    this.deleteCookie('salla_token_expires');
    this.clearUserData(); // Also clear user data when tokens are cleared
    console.log('SallaUserAPI: tokens and user data cleared from cookies');
  }

  getAccessToken() {
    // Prefer combined cookie if present
    let accessToken = null;
    let expiresAt = null;
    try {
      const encoded = this.getCookie('salla_tokens');
      if (encoded) {
        const parsed = JSON.parse(atob(encoded));
        accessToken = parsed.access_token || parsed.token || null;
        expiresAt = parsed.expires_at || null;
      }
    } catch (e) {
      // ignore and fallback to legacy cookies
    }
    if (!accessToken) accessToken = this.getCookie('salla_access_token');
    if (!expiresAt) expiresAt = this.getCookie('salla_token_expires');

    if (!accessToken || !expiresAt) return null;

    const isExpired = Date.now() > parseInt(expiresAt);
    if (isExpired) {
      // NOTE: Do NOT clear tokens here. Clearing immediately prevents a refresh attempt
      // and causes the user to lose the refresh token. Leave tokens in place so callers
      // can attempt `refresh()`; only clear on explicit logout or when refresh fails.
      console.log('SallaUserAPI: access token expired; awaiting refresh (tokens preserved)');
      return null;
    }

    return accessToken;
  }

  getRefreshToken() {
    const tokens = this.getTokensFromCookie();
    if (tokens && tokens.refresh_token) return tokens.refresh_token;
    const refreshToken = this.getCookie('salla_refresh_token');
    return refreshToken || null;
  }

  // ---------------------------------------------------------------------------
  // Generic cached-fetch helper
  // ---------------------------------------------------------------------------

  async getCachedOrFetch(cacheKey, apiCall, bypassCache = false) {
    if (this.loadingPromises.has(cacheKey)) {
      console.log(`Using ongoing request for ${cacheKey}`);
      return await this.loadingPromises.get(cacheKey);
    }

    if (!bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`Using cached data for ${cacheKey}`);
        return cached.data;
      }
    }

    const loadingPromise = this.makeApiCallWithCache(cacheKey, apiCall);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  async makeApiCallWithCache(cacheKey, apiCall) {
    try {
      console.log(`Making fresh API call for ${cacheKey}`);
      const result = await apiCall();

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`Cached result for ${cacheKey}`);
      return result;
    } catch (error) {
      console.error(`API call failed for ${cacheKey}:`, error);
      throw error;
    }
  }

  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
      console.log(`Cleared cache for ${cacheKey}`);
    } else {
      this.cache.clear();
      console.log('Cleared all cache');
    }
  }

  // ---------------------------------------------------------------------------
  // Core Auth REST endpoints
  // ---------------------------------------------------------------------------

  /**
   * POST /auth/login
   * Example payload:
   *   { type: 'email', email: 'user@example.com' }
   */
  async login(payload) {
    await this.ensureInitialized();

    const response = await fetch('https://api.salla.dev/store/v1/auth/email/send_verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595'
      },
      body: JSON.stringify(payload || {})
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }

    // /auth/login normally sends a verification code (no tokens yet)
    return {
      success: true,
      data,
      message: 'Login request sent successfully'
    };
  }

  /**
   * POST /auth/verify (actually /auth/email/verify)
   * Verifies OTP code and returns tokens + customer data.
   * Response structure:
   *   {
   *     status: 200,
   *     success: true,
   *     case: "authenticated",
   *     token: "...",
   *     refresh_token: "...",
   *     customer: { ... }
   *   }
   * Example payload:
   *   { type: 'email', email: 'user@example.com', code: 123456 }
   */
  async verify(payload) {
    await this.ensureInitialized();

    const response = await fetch('https://api.salla.dev/store/v1/auth/email/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595'
      },
      body: JSON.stringify(payload || {})
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify code');
    }

    // Store tokens securely (response has token, refresh_token at root level)
    if (data.token || data.refresh_token) {
      this.storeTokens({
        token: data.token,
        access_token: data.token, // Also store as access_token for compatibility
        refresh_token: data.refresh_token,
        expires_in: 3600 // Default 1 hour if not provided
      });
    }

    // Store customer/user data securely
    if (data.customer) {
      this.storeUserData(data.customer);
    }

    // Also store the case type for registration flow detection
    if (data.case) {
      try {
        this.setCookie('salla_auth_case', data.case, 1);
      } catch (e) {
        console.warn('Failed to store auth case:', e);
      }
    }

    return {
      success: true,
      data,
      case: data.case,
      message: 'Verification successful'
    };
  }

  /**
   * POST /auth/register (actually /auth/email/register)
   * Registers a new customer using a verified code.
   * Response structure similar to verify:
   *   {
   *     status: 200,
   *     success: true,
   *     token: "...",
   *     refresh_token: "...",
   *     customer: { ... }
   *   }
   */
  async register(payload) {
    await this.ensureInitialized();

    const response = await fetch('https://api.salla.dev/store/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595'
      },
      body: JSON.stringify(payload || {})
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register');
    }

    // Store tokens securely (response has token, refresh_token at root level)
    if (data.token || data.refresh_token) {
      this.storeTokens({
        token: data.token,
        access_token: data.token, // Also store as access_token for compatibility
        refresh_token: data.refresh_token,
        expires_in: 3600 // Default 1 hour if not provided
      });
    }

    // Store customer/user data securely
    if (data.customer) {
      this.storeUserData(data.customer);
    }

    return {
      success: true,
      data,
      message: 'Registration successful'
    };
  }

  /**
   * POST /auth/refresh
   * Uses refresh token from cookies to get a new access token.
   * IMPORTANT: Only clears tokens if refresh token is invalid (401/403), not on network errors
   */
  async refresh() {
    await this.ensureInitialized();

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://api.salla.dev/store/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        'Authorization': `Bearer ${refreshToken}`
      },

    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Only clear tokens if refresh token is invalid (401/403)
      // Don't clear on network errors or temporary server issues
      if (response.status === 401 || response.status === 403) {
        console.log('Refresh token invalid, clearing tokens');
        this.clearTokens();
      } else {
        console.warn('Token refresh failed but keeping tokens (might be temporary):', response.status);
      }
      throw new Error(data.message || 'Failed to refresh token');
    }

    // Store new tokens if refresh was successful
    if (data && data.data) {
      this.storeTokens(data.data);
    } else if (data.token || data.refresh_token) {
      // Handle direct token response format
      this.storeTokens({
        token: data.token,
        access_token: data.token,
        refresh_token: data.refresh_token || refreshToken,
        expires_in: 3600
      });
    }

    return {
      success: true,
      data,
      message: 'Token refreshed successfully'
    };
  }

  /**
   * POST /auth/logout
   * Clears tokens and logs the user out.
   */
  async logout() {
    await this.ensureInitialized();

    const accessToken = this.getAccessToken();

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595'
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('https://api.salla.dev/store/v1/auth/logout', {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });

      const data = await response.json().catch(() => ({}));

      // Clear tokens regardless of API result
      this.clearTokens();
      this.clearCache('current_user');

      if (!response.ok) {
        console.warn('Logout call failed but tokens were cleared');
        return {
          success: true,
          data,
          message: data.message || 'Logged out (tokens cleared)'
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Logged out successfully'
      };
    } catch (error) {
      console.error('Error during logout:', error);
      this.clearTokens();
      this.clearCache('current_user');
      return {
        success: true,
        message: 'Logged out (tokens cleared locally)'
      };
    }
  }

  // ---------------------------------------------------------------------------
  // /auth/user and helpers for UI (used by cart-integration header)
  // ---------------------------------------------------------------------------

  async getCurrentUser(bypassCache = false) {
    await this.ensureInitialized();

    const accessToken = this.getAccessToken();
    if (!accessToken) {
      // Not logged in
      return {
        success: false,
        data: null,
        message: 'No access token'
      };
    }

    return await this.getCachedOrFetch(
      'current_user',
      async () => {
        const response = await fetch('https://api.salla.dev/store/v1/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
            'Currency': 'SAR',
            'S-App-OS': 'browser',
            'S-App-Version': '2.0.0',
            'S-Country': 'EG',
            'S-Ray': '50',
            'S-Source': 'twilight',
            'S-User-ID': 'tGysluEFQDr77hKFtJkVigoJYFvtnczfUMfotyAh',
            'S-Utm-Referrer': '',
            'S-Utm-Source': 'dashboard',
            'S-Version-Id': '1679309439',
            'Store-Identifier': '229278595',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP ${response.status}: ${errorData.message || 'Failed to get user information'}`
          );
        }

        const responseData = await response.json();

        return {
          success: true,
          data: responseData,
          message: 'User information retrieved successfully'
        };
      },
      bypassCache
    );
  }

  async isLoggedIn(bypassCache = false) {
    try {
      // First check if we have a token in cookies (fast check)
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        // Also check refresh token - if we have refresh token, consider logged in
        const refreshToken = this.getRefreshToken();
        return !!refreshToken;
      }

      // If we have access token, try to validate it with API
      // But don't fail if API call fails - token might still be valid
      try {
        const result = await this.getCurrentUser(bypassCache);
        return !!(result.success && result.data && result.data.id);
      } catch (error) {
        // If API call fails but we have a token, assume logged in
        // (might be network issue or API temporarily down)
        console.warn('API check failed but token exists, assuming logged in:', error);
        return true;
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      // If we have tokens, assume logged in even on error
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      return !!(accessToken || refreshToken);
    }
  }

  async getUserDisplayName(bypassCache = false) {
    try {
      const result = await this.getCurrentUser(bypassCache);
      if (result.success && result.data) {
        const user = result.data;
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';

        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        } else if (firstName) {
          return firstName;
        } else {
          return 'User';
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting user display name:', error);
      return null;
    }
  }

  async getUserAvatar(bypassCache = false) {
    try {
      const result = await this.getCurrentUser(bypassCache);
      if (result.success && result.data) {
        return (
          result.data.avatar ||
          'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png'
        );
      }
      return 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png';
    } catch (error) {
      console.error('Error getting user avatar:', error);
      return 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png';
    }
  }

  async getUserEmail(bypassCache = false) {
    try {
      const result = await this.getCurrentUser(bypassCache);
      if (result.success && result.data) {
        return result.data.email || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  async getUserPhone(bypassCache = false) {
    try {
      const result = await this.getCurrentUser(bypassCache);
      if (result.success && result.data && result.data.phone) {
        const phone = result.data.phone;
        return `${phone.code} ${phone.number}`;
      }
      return null;
    } catch (error) {
      console.error('Error getting user phone:', error);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Custom JWT endpoint for backend integration
  // ---------------------------------------------------------------------------

  /**
   * Get store JWT from custom endpoint using current access token
   *   GET https://salla.sa/mukhaura/auth/jwt
   */
  async getStoreJwt() {
    await this.ensureInitialized();

    const accessToken = this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available for JWT request');
    }

    const response = await fetch('https://salla.sa/mukhaura/auth/jwt', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get store JWT');
    }

    return {
      success: true,
      data,
      message: 'Store JWT retrieved successfully'
    };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SallaUserAPI };
}
