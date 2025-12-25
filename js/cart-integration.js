/**
 * Cart Integration Class
 * Handles cart functionality integration with Salla API
 */

class CartIntegration {
  constructor() {
    this.cartAPI = null;
    this.userAPI = null;
    this.sallaAuth = null;
    this.currentCartId = null; // Store current cart ID
    this.isInitialized = false;
    this.debounceTimers = new Map(); // For debouncing
    this.debounceDelay = 300; // 300ms debounce delay
    
    // Cookie configuration
    this.cookieConfig = {
      
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    };
    
    // State management optimizations
    this.cartState = {
      items: null,
      summary: null,
      count: 0,
      lastUpdated: null
    };
    this.userState = {
      isLoggedIn: false,
      userInfo: null,
      displayName: null,
      avatar: null,
      email: null,
      lastUpdated: null
    };
    this.loadingPromises = new Map(); // Track ongoing requests
    this.stateCacheTimeout = 2 * 60 * 1000; // 2 minutes cache
    this.userCacheTimeout = 10 * 60 * 1000; // 10 minutes cache for user data
    }

  /**
   * Debounce function to prevent multiple rapid calls
   * @param {string} key - Debounce key
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Promise}
   */
  debounce(key, func, delay = this.debounceDelay) {
    // Clear existing timer for this key
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    // Create new promise that resolves when debounced function executes
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await func();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.debounceTimers.delete(key);
        }
      }, delay);

      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * Clear all debounce timers
   */
  clearDebounceTimers() {
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  /**
   * Check if cached state is valid
   * @returns {boolean}
   */
  isStateValid() {
    return this.cartState.lastUpdated && 
           (Date.now() - this.cartState.lastUpdated) < this.stateCacheTimeout;
  }

  /**
   * Get deduplicated request promise
   * @param {string} key - Request key
   * @param {Function} requestFunc - Request function
   * @returns {Promise}
   */
  async getDeduplicatedRequest(key, requestFunc) {
    // Return existing promise if request is ongoing
    if (this.loadingPromises.has(key)) {
      console.log(`Using ongoing request for ${key}`);
      return await this.loadingPromises.get(key);
    }

    // Create new request promise
    const promise = requestFunc();
    this.loadingPromises.set(key, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up promise when done
      this.loadingPromises.delete(key);
    }
  }

  /**
   * Update cart state from API response
   * @param {Object} cartData - Cart data from API
   */
  updateCartState(cartData) {
    this.cartState.items = cartData.items || null;
    this.cartState.summary = cartData.summary || null;
    this.cartState.count = cartData.items ? cartData.items.length : 0;
    this.cartState.lastUpdated = Date.now();
    
    // Persist to localStorage
    this.saveStateToStorage();

    // Notify other parts of the app in the same tab
    const detail = {
      count: this.cartState.count,
      items: this.cartState.items,
      summary: this.cartState.summary,
      lastUpdated: this.cartState.lastUpdated
    };
    try {
      document.dispatchEvent(new CustomEvent('cart:updated', { detail }));
    } catch (err) {
      console.warn('Failed to dispatch cart:updated event:', err);
    }

    // Notify other tabs/windows via localStorage (triggers storage event there)
    try {
      localStorage.setItem('cartUpdate', JSON.stringify({ ts: Date.now(), count: this.cartState.count }));
    } catch (err) {
      console.warn('Failed to write cartUpdate to localStorage:', err);
    }
  }

  /**
   * Save cart state to localStorage
   */
  saveStateToStorage() {
    try {
      localStorage.setItem('cartState', JSON.stringify(this.cartState));
    } catch (error) {
      console.warn('Failed to save cart state to localStorage:', error);
    }
  }

  /**
   * Load cart state from localStorage
   */
  loadStateFromStorage() {
    try {
      const saved = localStorage.getItem('cartState');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if cache is still valid
        if (state.lastUpdated && (Date.now() - state.lastUpdated) < this.stateCacheTimeout) {
          this.cartState = state;
          console.log('Cart state restored from localStorage');
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load cart state from localStorage:', error);
    }
    return false;
  }

  /**
   * Clear cart state cache
   */
  clearCartState() {
    this.cartState = {
      items: null,
      summary: null,
      count: 0,
      lastUpdated: null
    };
    localStorage.removeItem('cartState');
  }

  /**
   * Check if user state is valid
   * @returns {boolean}
   */
  isUserStateValid() {
    return this.userState.lastUpdated && 
           (Date.now() - this.userState.lastUpdated) < this.userCacheTimeout;
  }

  /**
   * Update user state from API response
   * @param {Object} userData - User data from API
   */
  updateUserState(userData) {
    this.userState.isLoggedIn = true;
    this.userState.userInfo = userData;
    this.userState.displayName = userData.first_name ? 
      (userData.last_name ? `${userData.first_name} ${userData.last_name}` : userData.first_name) : 'User';
    this.userState.avatar = userData.avatar || 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png';
    this.userState.email = userData.email || null;
    this.userState.lastUpdated = Date.now();
    
    // Persist to localStorage
    this.saveUserStateToStorage();

    // Persist to cookie so user stays logged-in across navigations and pages
    try {
      const safeUser = {
        displayName: this.userState.displayName,
        avatar: this.userState.avatar,
        email: this.userState.email,
        userInfo: this.userState.userInfo
      };
      // Store as encoded JSON to avoid cookie value issues
      this.setCookie('mukhawara_user', encodeURIComponent(JSON.stringify(safeUser)), 30);
    } catch (err) {
      console.warn('Failed to set user cookie:', err);
    }

    // Notify other parts of the app (same tab) and other tabs/windows
    try {
      document.dispatchEvent(new CustomEvent('user:updated', { detail: this.userState }));
    } catch (err) {
      console.warn('Failed to dispatch user:updated event:', err);
    }
    try {
      localStorage.setItem('userUpdate', JSON.stringify({ ts: Date.now(), displayName: this.userState.displayName }));
    } catch (err) {
      console.warn('Failed to write userUpdate to localStorage:', err);
    }
  }

  /**
   * Save user state to localStorage
   */
  saveUserStateToStorage() {
    try {
      localStorage.setItem('userState', JSON.stringify(this.userState));
    } catch (error) {
      console.warn('Failed to save user state to localStorage:', error);
    }
  }

  /**
   * Load user state from localStorage
   */
  loadUserStateFromStorage() {
    try {
      const saved = localStorage.getItem('userState');
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if cache is still valid
        if (state.lastUpdated && (Date.now() - state.lastUpdated) < this.userCacheTimeout) {
          this.userState = state;

          // Normalize displayName if missing or generic 'User' and we have real name in nested data
          try {
            const nestedFirst = this.userState?.userInfo?.data?.first_name ?? this.userState?.userInfo?.first_name ?? this.userState?.first_name;
            const nestedLast = this.userState?.userInfo?.data?.last_name ?? this.userState?.userInfo?.last_name ?? this.userState?.last_name;
            if ((!this.userState.displayName || this.userState.displayName === 'User' || (this.userState.displayName && this.userState.displayName.trim() === '')) && (nestedFirst || nestedLast)) {
              this.userState.displayName = `${nestedFirst || ''} ${nestedLast || ''}`.trim();
              this.saveUserStateToStorage();
            }
          } catch (err) {
            console.warn('Failed to normalize restored userState displayName:', err);
          }

          // Notify UI in same tab and other tabs
          try {
            document.dispatchEvent(new CustomEvent('user:updated', { detail: this.userState }));
          } catch (err) {
            console.warn('Failed to dispatch user:updated after restoring state:', err);
          }
          try {
            localStorage.setItem('userUpdate', JSON.stringify({ ts: Date.now(), displayName: this.userState.displayName }));
          } catch (err) {
            console.warn('Failed to write userUpdate after restoring state:', err);
          }

          console.log('User state restored from localStorage');
          return true;
        }
      }

      // If not restored from localStorage (missing or expired), try cookie fallback
      const cookieVal = this.getCookie('mukhawara_user');
      if (cookieVal) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookieVal));
          // Build a userState object from cookie
          this.userState.displayName = parsed.displayName || (parsed.userInfo?.data ? `${parsed.userInfo.data.first_name || ''} ${parsed.userInfo.data.last_name || ''}`.trim() : null) || null;
          this.userState.avatar = parsed.avatar || this.userState.avatar;
          this.userState.email = parsed.email || this.userState.email;
          this.userState.userInfo = parsed.userInfo || this.userState.userInfo;
          this.userState.isLoggedIn = true;
          this.userState.lastUpdated = Date.now();

          // Persist normalized state to localStorage
          this.saveUserStateToStorage();

          // Notify UI
          try {
            document.dispatchEvent(new CustomEvent('user:updated', { detail: this.userState }));
          } catch (err) {
            console.warn('Failed to dispatch user:updated after restoring from cookie:', err);
          }
          try {
            localStorage.setItem('userUpdate', JSON.stringify({ ts: Date.now(), displayName: this.userState.displayName }));
          } catch (err) {
            console.warn('Failed to write userUpdate after restoring from cookie:', err);
          }

          console.log('User state restored from cookie');
          return true;
        } catch (err) {
          console.warn('Failed to parse user cookie:', err);
        }
      }

    } catch (error) {
      console.warn('Failed to load user state from localStorage:', error);
    }
    return false;
  }

  /**
   * Clear user state cache
   */
  clearUserState() {
    this.userState = {
      isLoggedIn: false,
      userInfo: null,
      displayName: null,
      avatar: null,
      email: null,
      lastUpdated: null
    };
    localStorage.removeItem('userState');

    // Remove persisted user cookie on logout
    try {
      this.deleteCookie('mukhawara_user');
    } catch (err) {
      console.warn('Failed to delete user cookie:', err);
    }
  }

  /**
   * Set cookie with proper configuration
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration in days
   */
  /**
   * Set cookie with secure defaults and encoded value.
   * Avoid setting domain by default.
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

  /**
   * Get cookie value
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  /**
   * Delete cookie
   * @param {string} name - Cookie name
   */
  /**
   * Delete cookie by attempting with and without domain. Ensures encoded value removal.
   */
  deleteCookie(name) {
    try {
      const path = this.cookieConfig.path || '/';
      // expire without domain
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
      // also try with domain if set
      if (this.cookieConfig.domain) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${this.cookieConfig.domain}`;
      }
      // additional attempt using encoded name
      document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
    } catch (e) {
      console.warn('deleteCookie failed:', e);
    }
  }

  /**
   * Store authentication tokens in cookies
   * @param {Object} tokenData - Token data containing access_token, refresh_token, etc.
   */
  storeAuthTokens(tokenData) {
    const cookieOptions = { sameSite: (window.location.protocol === 'https:' ? 'None' : (this.cookieConfig.sameSite || 'Lax')), secure: window.location.protocol === 'https:' };

    const accessToken = tokenData.access_token || null;
    const refreshToken = tokenData.refresh_token || null;
    const expiresAt = tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null;

    // Store combined tokens cookie (base64 JSON)
    const combinedDays = refreshToken ? 30 : 1;
    try {
      const encoded = btoa(JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt }));
      this.setCookie('salla_tokens', encoded, combinedDays, cookieOptions);
    } catch (e) {
      console.warn('Failed to store combined salla_tokens cookie', e);
    }

    if (accessToken) {
      // Store access token with shorter expiration (typically 1 hour)
      this.setCookie('salla_access_token', accessToken, combinedDays, cookieOptions);
    }
    
    if (refreshToken) {
      // Store refresh token with longer expiration (typically 30 days)
      this.setCookie('salla_refresh_token', refreshToken, 30, cookieOptions);
    }
    
    if (expiresAt) {
      // Store token expiration time
      this.setCookie('salla_token_expires', expiresAt.toString(), 1, cookieOptions);
    }
    
    console.log('Authentication tokens stored in cookies (combined and legacy)');
  }

  /**
   * Get authentication tokens from cookies
   * @returns {Object} Token data object
   */
  getAuthTokens() {
    // Prefer combined cookie if present
    try {
      const encoded = this.getCookie('salla_tokens');
      if (encoded) {
        const parsed = JSON.parse(atob(encoded));
        return {
          access_token: parsed.access_token || null,
          refresh_token: parsed.refresh_token || null,
          expires_at: parsed.expires_at ? parseInt(parsed.expires_at) : null,
          isExpired: parsed.expires_at ? Date.now() > parseInt(parsed.expires_at) : true
        };
      }
    } catch (e) {
      // ignore and fallback to legacy cookies
    }

    const accessToken = this.getCookie('salla_access_token');
    const refreshToken = this.getCookie('salla_refresh_token');
    const expiresAt = this.getCookie('salla_token_expires');
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt ? parseInt(expiresAt) : null,
      isExpired: expiresAt ? Date.now() > parseInt(expiresAt) : true
    };
  }

  /**
   * Clear authentication tokens from cookies
   */
  clearAuthTokens() {
    this.deleteCookie('salla_tokens');
    this.deleteCookie('salla_access_token');
    this.deleteCookie('salla_refresh_token');
    this.deleteCookie('salla_token_expires');
    console.log('Authentication tokens cleared from cookies');
  }

  /**
   * Check if user is authenticated via cookies
   * @returns {boolean} Authentication status
   */
  isAuthenticatedViaCookies() {
    const tokens = this.getAuthTokens();
    return tokens.access_token && !tokens.isExpired;
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<boolean>} Success status
   */
  async refreshAccessToken() {
    const tokens = this.getAuthTokens();
    
    if (!tokens.refresh_token) {
      console.log('No refresh token available');
      return false;
    }
    
    try {
      // Use SallaUserAPI to refresh token
      if (this.userAPI) {
        const result = await this.userAPI.refresh();
        if (result.success) {
          // Tokens are automatically stored by userAPI.refresh()
          console.log('Access token refreshed successfully');
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      // Don't clear tokens here - userAPI.refresh() handles clearing only on 401/403
      // Network errors or temporary issues shouldn't clear user session
    }
    
    return false;
  }

  /**
   * Check authentication status and restore from cookies
   * IMPORTANT: Never clears tokens unless explicitly logged out
   */
  async checkAndRestoreAuth() {
    try {
      // First check if user has tokens in cookies
      const tokens = this.getAuthTokens();
      
      if (tokens.access_token && !tokens.isExpired) {
        console.log('User has valid access token in cookies');
        
        // Try to update user state from API (don't fail if this errors)
        try {
          await this.updateUserFromAPI();
        } catch (error) {
          console.warn('Failed to update user from API, but keeping tokens:', error);
          // Don't clear tokens on API errors - user might just be offline
        }
        
        // Try to refresh token in background (non-blocking)
        this.refreshAccessToken().catch(err => {
          console.warn('Token refresh failed, but keeping existing token:', err);
        });
        
        return;
      }
      
      // If access token expired but refresh token exists, try to refresh
      if (tokens.refresh_token && tokens.isExpired) {
        console.log('Access token expired, attempting refresh...');
        try {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            await this.updateUserFromAPI();
            return;
          }
        } catch (error) {
          console.warn('Token refresh failed:', error);
          // Don't clear tokens yet - might be temporary network issue
        }
      }
      
      // If no tokens at all, check if userAPI says we're logged in
      if (!tokens.access_token && !tokens.refresh_token && this.userAPI) {
        try {
          const isLoggedIn = await this.userAPI.isLoggedIn();
          if (isLoggedIn) {
            // Update user state
            await this.updateUserFromAPI();
            console.log('Authentication restored via User API');
          } else {
            // Only clear if we're certain there are no tokens anywhere
            console.log('No authentication found');
            // Don't clear - might be visitor mode
          }
        } catch (error) {
          console.warn('API check failed, but not clearing tokens:', error);
          // Don't clear on API errors
        }
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      // Don't clear tokens on errors - preserve user session
    }
  }

  /**
   * Update user state from API
   */
  async updateUserFromAPI() {
    try {
      if (this.userAPI) {
        const result = await this.userAPI.getCurrentUser();
        if (result.success && result.data) {
          // SallaUserAPI.getCurrentUser() returns { success, data, message }
          // where data is the user object directly
          this.updateUserState(result.data);
          console.log('User state updated from API');
        }
      }
    } catch (error) {
      console.error('Error updating user state from API:', error);
    }
  }

  /**
   * Handle login success event
   * @param {Object} response - Login response
   */
  handleLoginSuccess(response) {
    console.log('Login success:', response);
    
    // Store tokens in cookies
    if (response.data) {
      this.storeAuthTokens(response.data);
    }
    
    // Update user state
    if (response.data?.customer) {
      this.updateUserState(response.data.customer);
    } else {
      // Try to get user data from API
      this.updateUserFromAPI();
    }
    
    // Update cart UI to reflect logged-in state
    this.updateCartUI(true);
    
    // Update auth UI to show user info
    if (typeof window.authUIManager !== 'undefined') {
      window.authUIManager.refresh();
    }
  }

  /**
   * Handle logout event
   */
  async handleLogout() {
    console.log('User logged out');
    
    try {
      // Use cart API logout method
      if (this.cartAPI) {
        const logoutResult = await this.cartAPI.logout();
        console.log('Logout result:', logoutResult);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API call fails
    }
    
    // Clear local tokens and user state
    // this.clearAuthTokens();
    this.clearUserState();
    
    // Update cart UI to reflect logged-out state
    this.updateCartUI(true);
    
    // Update auth UI to show sign-in button
    if (typeof window.authUIManager !== 'undefined') {
      window.authUIManager.refresh();
    }
  }

  /**
   * Handle register success event
   * @param {Object} response - Registration response
   */
  handleRegisterSuccess(response) {
    console.log('Registration success:', response);
    
    // Handle similar to login success
    this.handleLoginSuccess(response);
  }

  /**
   * Initialize cart integration
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Import and initialize Salla User API (primary auth method)
      if (typeof SallaUserAPI !== 'undefined') {
        this.userAPI = new SallaUserAPI();
        await this.userAPI.ensureInitialized();
      } else {
        console.error('SallaUserAPI class not found');
      }

      // Import and initialize Salla Cart API
      if (typeof SallaCartAPI !== 'undefined') {
        this.cartAPI = new SallaCartAPI();
      } else {
        console.error('SallaCartAPI class not found');
        return;
      }

      // Check authentication status and restore tokens from cookies
      await this.checkAndRestoreAuth();

      // Try to load states from localStorage
      this.loadStateFromStorage();
      this.loadUserStateFromStorage();

      // Render any cached cart count immediately
      try {
        this.renderCartCount(this.cartState.count);
      } catch (err) {
        console.warn('Failed to render cached cart count on init:', err);
      }

      // Listen for cart updates in the same tab
      document.addEventListener('cart:updated', (e) => {
        try {
          const count = e.detail?.count ?? this.cartState.count;
          this.renderCartCount(count);
        } catch (err) {
          console.warn('Error handling cart:updated event:', err);
        }
      });

      // Listen for storage events from other tabs/windows to update cart count in real-time
      window.addEventListener('storage', (e) => {
        if (e.key === 'cartUpdate' && e.newValue) {
          try {
            const d = JSON.parse(e.newValue);
            const count = d.count ?? 0;
            this.renderCartCount(count);
          } catch (err) {
            console.warn('Failed to parse cartUpdate storage event:', err);
          }
        }
      });

      this.isInitialized = true;
      console.log('Cart integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cart integration:', error);
    }
  }

  /**
   * Load and display cart items
   * @param {string} containerSelector - Container element selector
   * @param {boolean} forceRefresh - Force API call even if cached
   */
  async loadCartItems(containerSelector, forceRefresh = false) {
    await this.init();
    if (!this.cartAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Check if we have valid cached state and can use it
    if (!forceRefresh && this.isStateValid() && this.cartState.items) {
      console.log('Using cached cart items');
      this.renderCartItems(container, this.cartState.items);
      return;
    }

    try {
      // Use deduplicated request to prevent multiple simultaneous calls
      const result = await this.getDeduplicatedRequest('loadCartItems', async () => {
        return await this.cartAPI.getFullCart(this.currentCartId);
      });
      
      // Debug: Log the result structure
      console.log('Cart API result:', result);
      
      // Store the cart ID from the response
      if (result.success && result.data) {
        // Handle the actual API response structure
        let cartData = null;
        let cartItems = [];
        
        // Check if result.data.details is an array (from getCartDetails)
        if (Array.isArray(result.data.details) && result.data.details.length > 0) {
          cartData = result.data.details[0]; // First item contains cart info
          cartItems = result.data.details[0].items || []; // Items are in the first element's items array
        }
        // Check if result.data.details is an object (from getFullCart)
        else if (result.data.details && typeof result.data.details === 'object') {
          if (result.data.details.cart) {
            cartData = result.data.details.cart;
          }
          if (result.data.latest && result.data.latest.items) {
            cartItems = result.data.latest.items;
          }
        }
        
        if (cartData) {
          this.currentCartId = cartData.id || cartData.cart_id;
        }
        
        // Debug: Log the parsed cart data
        console.log('Parsed cart data:', cartData);
        console.log('Parsed cart items:', cartItems);
        
        // Check if cart data exists and has items
        if (!cartData || !cartItems || cartItems.length === 0) {
          console.log('No cart data or items found, showing empty cart');
          container.innerHTML = '<div class="text-center py-5"><p>Your cart is empty</p></div>';
          return;
        }
        
        // Build item blocks for the sidebar cart (using shared template builder)
        const itemBlocks = cartItems.map(item => this.buildItemBlock(item));

        // Compute grand total
        const grandTotal = cartItems.reduce((sum, item) => {
          const price = item.price?.amount || item.price || 0;
          const qty = item.quantity || 1;
          return sum + (price * qty);
        }, 0).toFixed(2);

        // Wrap sidebar markup
        const cartHtml = `
          <div id="Shopping-cart" class="Shopping-cart">
            <div class="close-icon d-flex justify-content-between align-items-center">
              <h3>Shopping cart</h3>
              <i id="close-cart" class="fa-solid fa-xmark"></i>
            </div>
            <div id="item-card">
              ${itemBlocks.join('')}
            </div>
            <div class="price">
              <span>Total: ${grandTotal} SAR</span>
            </div>
        `;

        // Add checkout button at the end
        const checkoutHtml = `
          <div class="chech-cart d-flex justify-content-center align-items-center my-2 gap-3">
            <button id="checkout-btn" class="btn w-100" style="background-color: var(--first-color); color: white;">Checkout</button>
            <button class="btn w-100" id="go-to-cart-btn" style="background-color: #1aceba; color: white;">Go to cart</button>
          </div>
        </div>
        `;

        container.innerHTML = cartHtml + checkoutHtml;
        this.attachCartEventListeners();
        
        // Add checkout button event listener
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
          checkoutBtn.addEventListener('click', () => {
            this.proceedToCheckout();
          });
        }

        // Add "Go to cart" button handler
        const goToCartBtn = document.getElementById('go-to-cart-btn');
        if (goToCartBtn) {
          goToCartBtn.addEventListener('click', () => {
            window.location.href = 'cart.php';
          });
        }
        
        // Update cart state
        this.updateCartState({
          items: cartItems,
          summary: cartData
        });
      } else {
        console.log('No cart details found, showing empty cart');
        container.innerHTML = '<div class="text-center py-5"><p>Your cart is empty</p></div>';
        
        // Update cart state to empty
        this.updateCartState({
          items: [],
          summary: null
        });
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      container.innerHTML = '<div class="text-center py-5 text-danger"><p>Error loading cart items</p></div>';
    }
  }

  /**
   * Build HTML for a single cart item (shared between sidebar and page)
   * @param {Object} item - Cart item object
   * @returns {string} HTML string
   */
  buildItemBlock(item) {
    const productName = item.name || 'Product';
    const productImage = item.image || 'assets/bb.webp';
    const quantity = item.quantity || 1;
    const price = item.price?.amount || item.price || 0;
    const totalPrice = (price * quantity).toFixed(2);
    const itemId = item.id || item.item_id;

    // Extract product options if available
    let optionsHtml = '';
    if (item.options && item.options.length > 0) {
      optionsHtml = item.options.map(option => {
        const optionName = option.name || 'Option';
        const optionValue = option.value || option.display_value || 'Selected';
        return `<small class="text-muted d-block">${optionName}: ${optionValue}</small>`;
      }).join('');
    }

    return `
      <div class="card p-3 mb-2 cart-item" data-item-id="${itemId}">
        <div class="d-flex align-items-center">
          <img src="${productImage}" alt="${productName}" class="me-3" style="width:60px;height:60px;object-fit:cover;" />
          <div class="flex-grow-1">
            <h5 class="mb-1">${productName}</h5>
            ${optionsHtml}
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted">${price} SAR</span>
              </div>
              <div class="text-end">
                <strong>${totalPrice} SAR</strong>
              </div>
            </div>
            <div class="inc-add mt-2">
              <div class="inc-dec">
                <button data-item-id="${itemId}" class="btn dec"><i class="fa-solid fa-minus" style="color: #3c466b;"></i></button>
                <span data-item-id="${itemId}" class="quantity">${quantity}</span>
                <button data-item-id="${itemId}" class="btn inc"><i class="fa-solid fa-plus" style="color: #3c466b;"></i></button>
              </div>
              <div class="price" style="color: var(--first-color); margin-top: 1rem;">
                <p class="m-0">Total item : <span class="item-total">${totalPrice} SAR</span></p>
              </div>
              <button data-item-id="${itemId}" class="delete btn btn-sm btn-danger mt-2">Delete product</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render cart items to container
   * @param {HTMLElement} container - Container element
   * @param {Array} cartItems - Cart items array
   */
  renderCartItems(container, cartItems) {
    if (!cartItems || cartItems.length === 0) {
      container.innerHTML = '<div class="text-center py-5"><p>Your cart is empty</p></div>';
      return;
    }

    // Build item blocks using shared template builder
    const itemBlocks = cartItems.map(item => this.buildItemBlock(item));

    // Compute grand total
    const grandTotal = cartItems.reduce((sum, item) => {
      const price = item.price?.amount || item.price || 0;
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0).toFixed(2);

    // Wrap page cart markup
    const cartHtml = `
      <div class="cart-page-items">
        ${itemBlocks.join('')}
        <div class="cart-page-total mt-3">
          <div class="d-flex justify-content-between align-items-center">
            <strong>Grand Total</strong>
            <strong>${grandTotal} SAR</strong>
          </div>
           <div class="chech-cart d-flex justify-content-center align-items-center my-2 gap-3">
            <button id="checkout-btn" class="btn w-100" style="background-color: var(--first-color); color: white;">Checkout</button>
            <button class="btn w-100" id="go-to-cart-btn" style="background-color: #1aceba; color: white;">Go to cart</button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = cartHtml;
    this.attachCartEventListeners();

    // Add checkout button event listener
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.proceedToCheckout();
      });
    }

  }

  /**
   * Load cart summary (total, subtotal, etc.)
   * @param {string} containerSelector - Container element selector
   * @param {boolean} forceRefresh - Force API call even if cached
   */
  async loadCartSummary(containerSelector, forceRefresh = false) {
    await this.init();
    if (!this.cartAPI) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Check if we have valid cached state and can use it
    if (!forceRefresh && this.isStateValid() && this.cartState.summary) {
      console.log('Using cached cart summary');
      this.renderCartSummary(container, this.cartState.summary);
      return;
    }

    try {
      // Use deduplicated request to prevent multiple simultaneous calls
      const result = await this.getDeduplicatedRequest('loadCartSummary', async () => {
        return await this.cartAPI.getLatestCart();
      });
      
      // Debug: Log the result structure
      console.log('Cart summary API result:', result);
      
      // Handle the actual API response structure - data is an array
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        const cartData = result.data[0]; // First item contains cart info
        
        // Debug: Log cart data structure
        console.log('Cart summary data:', cartData);
        
        // Check if cart data exists
        if (!cartData) {
          console.log('No cart data found for summary');
          container.innerHTML = `
            <div class="cart-summary">
              <div class="summary-row total">
                <span>Total:</span>
                <span class="total-amount">0.00 SAR</span>
              </div>
              <div class="summary-row items-count">
                <span>Items:</span>
                <span>0 item(s)</span>
              </div>
            </div>
          `;
          return;
        }
        
        // Update the cart total span if it exists
        const totalSpan = document.querySelector('#cart-total');
        if (totalSpan) {
          totalSpan.textContent = cartData.total || cartData.cart_total?.amount || '0.00';
        }
        
        const summaryHtml = `
          <div class="cart-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span class="subtotal">${cartData.sub_total?.amount || cartData.subtotal || 0} SAR</span>
            </div>
            ${cartData.total_discount?.amount > 0 ? `
              <div class="summary-row discount">
                <span>Discount:</span>
                <span class="discount-amount">-${cartData.total_discount.amount} SAR</span>
              </div>
            ` : ''}
            ${cartData.tax_amount?.amount > 0 ? `
              <div class="summary-row">
                <span>Tax:</span>
                <span class="tax">${cartData.tax_amount.amount} SAR</span>
              </div>
            ` : ''}
            <div class="summary-row total">
              <span>Total:</span>
              <span class="total-amount">${cartData.total?.amount || cartData.total || 0} SAR</span>
            </div>
            <div class="summary-row items-count">
              <span>Items:</span>
              <span>${cartData.items?.length || 0} item(s)</span>
            </div>
          </div>
        `;

        container.innerHTML = summaryHtml;
      } else {
        // Empty cart summary
        container.innerHTML = `
          <div class="cart-summary">
            <div class="summary-row total">
              <span>Total:</span>
              <span class="total-amount">0.00 SAR</span>
            </div>
            <div class="summary-row items-count">
              <span>Items:</span>
              <span>0 item(s)</span>
            </div>
          </div>
        `;
        
        // Update cart total span
        const totalSpan = document.querySelector('#cart-total');
        if (totalSpan) {
          totalSpan.textContent = '0.00';
        }
      }
    } catch (error) {
      console.error('Error loading cart summary:', error);
      container.innerHTML = '<div class="error"><p>Error loading cart summary</p></div>';
    }
  }

  /**
   * Render cart summary to container
   * @param {HTMLElement} container - Container element
   * @param {Object} cartData - Cart summary data
   */
  renderCartSummary(container, cartData) {
    if (!cartData) {
      container.innerHTML = `
        <div class="cart-summary">
          <div class="summary-row total">
            <span>Total:</span>
            <span class="total-amount">0.00 SAR</span>
          </div>
          <div class="summary-row items-count">
            <span>Items:</span>
            <span>0 item(s)</span>
          </div>
        </div>
      `;
      return;
    }

    // Update the cart total span if it exists
    const totalSpan = document.querySelector('#cart-total');
    if (totalSpan) {
      totalSpan.textContent = cartData.total || cartData.cart_total?.amount || '0.00';
    }
    
    const summaryHtml = `
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span class="subtotal">${cartData.sub_total?.amount || cartData.subtotal || 0} SAR</span>
        </div>
        ${cartData.total_discount?.amount > 0 ? `
          <div class="summary-row discount">
            <span>Discount:</span>
            <span class="discount-amount">-${cartData.total_discount.amount} SAR</span>
          </div>
        ` : ''}
        ${cartData.tax_amount?.amount > 0 ? `
          <div class="summary-row">
            <span>Tax:</span>
            <span class="tax">${cartData.tax_amount.amount} SAR</span>
          </div>
        ` : ''}
        <div class="summary-row total">
          <span>Total:</span>
          <span class="total-amount">${cartData.total?.amount || cartData.total || 0} SAR</span>
        </div>
        <div class="summary-row items-count">
          <span>Items:</span>
          <span>${cartData.items?.length || 0} item(s)</span>
        </div>
      </div>
    `;

    container.innerHTML = summaryHtml;
  }

  /**
   * Add product to cart
   * @param {number} productId - Product ID
   * @param {Object} options - Additional options (quantity, etc.)
   */
  async addToCart(productId, options = {}) {
    await this.init();
    if (!this.cartAPI) return;

    try {
      const result = await this.cartAPI.addItem(productId, options);
      
      // Clear cache since cart was modified
      this.clearCartState();
      
      // Show success message
      this.showNotification('Product added to cart successfully!', 'success');
      
      // Update cart UI with fresh data
      await this.updateCartUI(true);
      
      return result;
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Failed to add product to cart', 'error');
      throw error;
    }
  }

  /**
   * Quick add product to cart
   * @param {number} productId - Product ID
   * @param {Object} options - Additional options
   */
  async quickAddToCart(productId, options = {}) {
    await this.init();
    if (!this.cartAPI) return;

    try {
      const result = await this.cartAPI.quickAddProduct(productId, options);
      
      // Clear cache since cart was modified
      this.clearCartState();
      
      // Show success message
      this.showNotification('Product added to cart successfully!', 'success');
      
      // Update cart UI with fresh data
      await this.updateCartUI(true);
      
      return result;
    } catch (error) {
      console.error('Error quick adding to cart:', error);
      this.showNotification('Failed to add product to cart', 'error');
      throw error;
    }
  }

  /**
   * Remove item from cart
   * @param {string} itemId - Item ID
   */
  async removeFromCart(itemId) {
    await this.init();
    if (!this.cartAPI) return;

    try {
      const result = await this.cartAPI.deleteItem(itemId);
      
      // Clear cache since cart was modified
      this.clearCartState();
      
      // Show success message
      this.showNotification('Item removed from cart', 'success');
      
      // Update cart UI with fresh data
      await this.updateCartUI(true);
      
      return result;
    } catch (error) {
      console.error('Error removing from cart:', error);
      this.showNotification('Failed to remove item from cart', 'error');
      throw error;
    }
  }

  
  /**
   * Update item quantity
   * @param {string} itemId - Item ID (as string to handle large numbers)
   * @param {number} quantity - New quantity
   */
  async updateQuantity(itemId, quantity) {
    await this.init();
    if (!this.cartAPI) return;

    try {
      const result = await this.cartAPI.updateItemQuantity(itemId, quantity);
      
      // Clear cache since cart was modified
      this.clearCartState();
      
      // Update cart UI with fresh data
      await this.updateCartUI(true);
      
      return result;
    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showNotification('Failed to update quantity', 'error');
      throw error;
    }
  }

  /**
   * Apply coupon code
   * @param {string} couponCode - Coupon code
   */
  async applyCoupon(couponCode) {
    await this.init();
    if (!this.cartAPI) return;

    try {
      const result = await this.cartAPI.addCoupon(couponCode);
      
      // Show success message
      this.showNotification('Coupon applied successfully!', 'success');
      
      // Update cart UI
      await this.updateCartUI();
      
      return result;
    } catch (error) {
      console.error('Error applying coupon:', error);
      this.showNotification('Failed to apply coupon', 'error');
      throw error;
    }
  }

  /**
   * Remove coupon
   */
  async removeCoupon() {
    await this.init();
    if (!this.cartAPI) return;

    try {
      const result = await this.cartAPI.removeCoupon();
      
      // Show success message
      this.showNotification('Coupon removed', 'success');
      
      // Update cart UI
      await this.updateCartUI();
      
      return result;
    } catch (error) {
      console.error('Error removing coupon:', error);
      this.showNotification('Failed to remove coupon', 'error');
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    await this.init();
    if (!this.cartAPI) return;

    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      const result = await this.cartAPI.clearCart();
      
      // Show success message
      this.showNotification('Cart cleared successfully', 'success');
      
      // Update cart UI
      await this.updateCartUI();
      
      return result;
    } catch (error) {
      console.error('Error clearing cart:', error);
      this.showNotification('Failed to clear cart', 'error');
      throw error;
    }
  }

  /**
   * Update cart UI elements
   * @param {boolean} forceRefresh - Force API calls even if cached
   */
  async updateCartUI(forceRefresh = false) {
    // Batch all UI updates together to reduce API calls
    const promises = [];
    
    // Update cart items if container exists
    const cartContainer = document.querySelector('.cart-items-container');
    if (cartContainer) {
      promises.push(this.loadCartItems('.cart-items-container', forceRefresh));
    }

    // Update cart summary if container exists
    const summaryContainer = document.querySelector('.cart-summary-container');
    if (summaryContainer) {
      promises.push(this.loadCartSummary('.cart-summary-container', forceRefresh));
    }

    // Update cart count in header/navigation
    promises.push(this.updateCartCount(forceRefresh));

    // Wait for all updates to complete
    await Promise.all(promises);
  }

  /**
   * Update cart count in UI
   * @param {boolean} forceRefresh - Force API call even if cached
   */
  async updateCartCount(forceRefresh = false) {
    // Check if we have valid cached state and can use it
    if (!forceRefresh && this.isStateValid()) {
      console.log('Using cached cart count');
      this.renderCartCount(this.cartState.count);
      return;
    }

    try {
      // Use deduplicated request to prevent multiple simultaneous calls
      const result = await this.getDeduplicatedRequest('updateCartCount', async () => {
        return await this.cartAPI.getLatestCart();
      });
      
      // Debug: Log the result structure
      console.log('Cart count API result:', result);
      
      let count = 0;
      
      // Handle the actual API response structure - data is an array
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        const cartData = result.data[0]; // First item contains cart info
        
        // Check if cart data exists
        if (cartData) {
          count = cartData.items?.length || 0;
        }
      }
      
      // Update cached state
      this.cartState.count = count;
      
      // Render count
      this.renderCartCount(count);

      // Broadcast the change to same tab and other tabs
      try {
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { count, lastUpdated: this.cartState.lastUpdated } }));
      } catch (err) {
        console.warn('Failed to dispatch cart:updated event:', err);
      }
      try {
        localStorage.setItem('cartUpdate', JSON.stringify({ ts: Date.now(), count }));
      } catch (err) {
        console.warn('Failed to write cartUpdate to localStorage:', err);
      }
      
    } catch (error) {
      console.error('Error updating cart count:', error);
      // Set count to 0 on error
      this.renderCartCount(0);

      // Notify zero count on error as well
      try {
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: 0 } }));
      } catch (err) {
        console.warn('Failed to dispatch cart:updated event:', err);
      }
      try {
        localStorage.setItem('cartUpdate', JSON.stringify({ ts: Date.now(), count: 0 }));
      } catch (err) {
        console.warn('Failed to write cartUpdate to localStorage:', err);
      }
    }
  }

  /*
  **   GET COUNT OF CART 
  */
  getCartCount() {
    return this.cartState.count || 0;

  }
  /**
   * Render cart count to UI elements
   * @param {number} count - Cart item count
   */
  renderCartCount(count) {
    // Update cart count elements
    const countElements = document.querySelectorAll('.cart-count, .cart-items-count, .header-cart-count');
    countElements.forEach(element => {
      element.textContent = count;
      element.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  /**
   * Get current user information
   * @param {boolean} forceRefresh - Force API call even if cached
   * @returns {Promise}
   */
  async getCurrentUser(forceRefresh = false) {
    await this.init();
    if (!this.userAPI) return null;

    // Check if we have valid cached state and can use it
    if (!forceRefresh && this.isUserStateValid() && this.userState.userInfo) {
      console.log('Using cached user information');
      return this.userState.userInfo;
    }

    try {
      // Use deduplicated request to prevent multiple simultaneous calls
      const result = await this.getDeduplicatedRequest('getCurrentUser', async () => {
        return await this.userAPI.getCurrentUser();
      });
      
      if (result.success && result.data) {
        this.updateUserState(result.data);
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user information:', error);
      return null;
    }
  }

  /**
   * Check if user is logged in
   * @param {boolean} forceRefresh - Force API call even if cached
   * @returns {Promise}
   */
  async isLoggedIn(forceRefresh = false) {
    await this.init();
    if (!this.userAPI) return false;

    // Check if we have valid cached state and can use it
    if (!forceRefresh && this.isUserStateValid()) {
      console.log('Using cached login status');
      return this.userState.isLoggedIn;
    }

    try {
      const userInfo = await this.getCurrentUser(forceRefresh);
      return userInfo !== null;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Get user display name
   * @param {boolean} forceRefresh - Force API call even if cached
   * @returns {Promise}
   */
  async getUserDisplayName(forceRefresh = false) {
    await this.init();
    if (!this.userAPI) return null;

    // Use cached displayName if available
    if (!forceRefresh && this.isUserStateValid() && this.userState.displayName) {
      console.log('Using cached user display name');
      return this.userState.displayName;
    }

    try {
      const userInfo = await this.getCurrentUser(forceRefresh);
      // userInfo is the raw response.data object; prefer nested data fields
      const first = userInfo?.data?.first_name || userInfo?.first_name || this.userState.displayName;
      const last = userInfo?.data?.last_name || userInfo?.last_name || '';
      if (first) return `${first} ${last}`.trim();
      return this.userState.displayName || null;
    } catch (error) {
      console.error('Error getting user display name:', error);
      return this.userState.displayName || null;
    }
  }

  /**
   * Get user avatar URL
   * @param {boolean} forceRefresh - Force API call even if cached
   * @returns {Promise}
   */
  async getUserAvatar(forceRefresh = false) {
    await this.init();
    if (!this.userAPI) return null;

    // Check if we have valid cached state and can use it
    if (!forceRefresh && this.isUserStateValid() && this.userState.avatar) {
      console.log('Using cached user avatar');
      return this.userState.avatar;
    }

    try {
      const userInfo = await this.getCurrentUser(forceRefresh);
      return userInfo ? this.userState.avatar : null;
    } catch (error) {
      console.error('Error getting user avatar:', error);
      return null;
    }
  }

  /**
   * Logout user
   * @returns {Promise}
   */
  async logout() {
    await this.init();
    if (!this.userAPI) return false;

    try {
      // Call user API logout
      const result = await this.userAPI.logout();
      
      if (result.success) {
        // Clear user state
        this.clearUserState();
        
        // Show notification
        this.showNotification('Logged out successfully', 'success');
        
        // Re-render user info to show login link
        await this.renderUserInfo('.user-info-container');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during logout:', error);
      this.showNotification('Failed to logout', 'error');
      return false;
    }
  }

  /**
   * Handle logout button click
   */
  async handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      await this.logout();
    }
  }

  /**
   * Render user information in UI with retry mechanism
   * @param {string} containerSelector - Container element selector
   * @param {number} retryCount - Number of retries attempted
   * @param {number} maxRetries - Maximum number of retries
   */
  async renderUserInfo(containerSelector, retryCount = 0, maxRetries = 10) {
    console.log('renderUserInfo called with selector:', containerSelector, 'retry:', retryCount);
    const container = document.querySelector(containerSelector);
    console.log('Container found:', container);
    
    if (!container) {
      if (retryCount < maxRetries) {
        console.log(`Container not found, retrying in 500ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          this.renderUserInfo(containerSelector, retryCount + 1, maxRetries);
        }, 500);
        return;
      } else {
        console.error('User info container not found after', maxRetries, 'attempts:', containerSelector);
        return;
      }
    }

    try {
      console.log('Checking login status...');
      const isLoggedIn = await this.isLoggedIn();
      console.log('User logged in:', isLoggedIn);
      
      if (isLoggedIn) {
        // Prefer normalized userState (already loaded from cookie/localStorage) to avoid extra API calls
        const userInfo = this.userState.userInfo || (await this.getCurrentUser(true)) || {};

        // Build display name from nested data if available
        const first = userInfo?.data?.first_name || userInfo?.first_name || this.userState.displayName || '';
        const last = userInfo?.data?.last_name || userInfo?.last_name || '';
        const userName = (first || last) ? `${first} ${last}`.trim() : (this.userState.displayName || 'User');

        // Get user avatar
        const avatar = this.userState?.avatar || userInfo?.avatar || 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png';

        // Get translation for logout button
        const logoutText = (typeof window.currentLang !== 'undefined' && window.currentLang === "ar") 
          ? ((typeof window.translations !== 'undefined' && window.translations["logout"]) ? window.translations["logout"] : "تسجيل الخروج")
          : ((typeof window.translations !== 'undefined' && window.translations["logout"]) ? window.translations["logout"] : "Logout");
        
        // Generate unique ID for dropdown
        const dropdownId = 'user-menu-' + Date.now();
        
        // Get translations for menu items
        const myProfileText = (typeof window.translations !== 'undefined' && window.translations["my-profile"]) ? window.translations["my-profile"] : "My Profile";
        const myOrdersText = (typeof window.translations !== 'undefined' && window.translations["my-orders"]) ? window.translations["my-orders"] : "My Orders";
        const wishlistText = (typeof window.translations !== 'undefined' && window.translations["wishlist"]) ? window.translations["wishlist"] : "Wishlist";
        
        const userHtml = `
          <div class="dropdown">
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2" 
                    type="button" id="${dropdownId}" data-bs-toggle="dropdown" aria-expanded="false">
              <img src="${avatar}" alt="${userName}" class="rounded-circle" width="24" height="24">
              <span class="user-name">${userName}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${dropdownId}">
              <li><a class="dropdown-item" href="profile.php" id="profile-link-${dropdownId}"><i class="fa-solid fa-user me-2"></i>${myProfileText}</a></li>
              <!-- <li><a class="dropdown-item" href="#"><i class="fa-solid fa-box me-2"></i>${myOrdersText}</a></li>
              <li><a class="dropdown-item" href="#"><i class="fa-solid fa-heart me-2"></i>${wishlistText}</a></li> -->
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" id="logout-btn-${dropdownId}"><i class="fa-solid fa-sign-out-alt me-2"></i>${logoutText}</a></li>
            </ul>
          </div>
        `;
        container.innerHTML = userHtml;
        console.log('Setting user HTML with name:', userName);
        
        // Add logout event listener
        const logoutBtn = document.getElementById(`logout-btn-${dropdownId}`);
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
          });
        }

        // Hook profile link to dispatch an event and navigate
        const profileLink = document.getElementById(`profile-link-${dropdownId}`);
        if (profileLink) {
          profileLink.addEventListener('click', (e) => {
            // allow normal navigation but also dispatch an event for other listeners
            window.dispatchEvent(new CustomEvent('openProfile', { detail: { source: 'user-menu' } }));
            // navigation handled by the link's href
          });
        }
      } else {
        console.log('User not logged in, showing login link');
        const signInText = (typeof window.currentLang !== 'undefined' && window.currentLang === "ar") 
          ? ((typeof window.translations !== 'undefined' && window.translations["sign-in"]) ? window.translations["sign-in"] : "تسجيل الدخول")
          : ((typeof window.translations !== 'undefined' && window.translations["sign-in"]) ? window.translations["sign-in"] : "Sign in");
        container.innerHTML = `
          <div class="user-info">
            <a href="sign-in.php" class="login-link d-flex align-items-center gap-2">
              <i class="fa-solid fa-user"></i>
              <span class="d-Lax d-md-inline">${signInText}</span>
            </a>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error rendering user info:', error);
      const signInText = typeof currentLang !== 'undefined' && currentLang === "ar" 
        ? (typeof translations !== 'undefined' && translations["sign-in"] ? translations["sign-in"] : "تسجيل الدخول")
        : (typeof translations !== 'undefined' && translations["sign-in"] ? translations["sign-in"] : "Sign in");
      container.innerHTML = `
        <div class="user-info">
          <a href="sign-in.php" class="login-link d-flex align-items-center gap-2">
            <i class="fa-solid fa-user"></i>
            <span class="d-Lax d-md-inline">${signInText}</span>
          </a>
        </div>
      `;
    }
  }

  /**
   * Attach event listeners for cart interactions
   */
  attachCartEventListeners() {
    console.log('Attaching cart event listeners...');
    
    // Quantity increase/decrease buttons
    document.querySelectorAll('.inc, .dec').forEach(button => {
      console.log('Found inc/dec button:', button);
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Inc/dec button clicked:', button);

        const itemId = button.dataset.itemId;
        const isIncrease = button.classList.contains('inc');

        // Scope search to the item card to avoid selecting wrong element on the page
        const itemCard = button.closest('.cart-item');
        const quantitySpan = itemCard ? itemCard.querySelector(`.quantity[data-item-id="${itemId}"]`) : null;

        console.log('Item ID:', itemId, 'Is increase:', isIncrease, 'Quantity span:', quantitySpan);

        if (!quantitySpan) {
          console.warn('Quantity element not found for item:', itemId);
          return;
        }

        const currentQty = parseInt(quantitySpan.textContent, 10) || 1;
        const newQty = isIncrease ? currentQty + 1 : Math.max(1, currentQty - 1);

        if (newQty === currentQty) return;

        // Optimistic UI update
        quantitySpan.textContent = newQty;
        button.disabled = true;

        // Update per-item total display if present
        const itemObj = (this.cartState.items || []).find(it => String(it.id || it.item_id) === String(itemId));
        const unitPrice = itemObj ? (itemObj.price?.amount || itemObj.price || 0) : (() => {
          const priceEl = itemCard.querySelector('.text-muted');
          return priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.\-]/g, '')) || 0 : 0;
        })();

        const totalSpan = itemCard.querySelector('.item-total');
        if (totalSpan) totalSpan.textContent = (unitPrice * newQty).toFixed(2) + ' SAR';

        // Debounce API update to avoid spamming while user clicks fast
        try {
          await this.debounce(`updateQty:${itemId}`, async () => {
            await this.updateQuantity(itemId, newQty);
          }, 400);
        } catch (err) {
          console.error('Failed to update quantity for', itemId, err);
          // Revert UI on failure
          quantitySpan.textContent = currentQty;
          if (totalSpan) totalSpan.textContent = (unitPrice * currentQty).toFixed(2) + ' SAR';
          this.showNotification('Failed to update quantity', 'error');
        } finally {
          button.disabled = false;
        }
      });
    });

    // Delete item buttons
    document.querySelectorAll('.delete').forEach(button => {
      console.log('Found delete button:', button);
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Delete button clicked:', button);
        
        // Use string item ID to avoid precision issues
        const itemId = button.dataset.itemId;
        console.log('Item ID to delete:', itemId);
        
        if (confirm('Are you sure you want to remove this item?')) {
          // Disable button and show loading state
          button.disabled = true;
          button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
          
          // Find the cart item element for optimistic removal
          const cartItemElement = button.closest('.cart-item');
          
          try {
            console.log('Removing item...');
            await this.removeFromCart(itemId);
            console.log('Item removed successfully');
            
            // Optimistic UI update - remove item immediately
            if (cartItemElement) {
              cartItemElement.style.opacity = '0.5';
              cartItemElement.style.transition = 'opacity 0.3s';

              // Remove element after animation then refresh cart UI
              setTimeout(async () => {
                if (cartItemElement) cartItemElement.remove();
                await this.updateCartUI(true);
              }, 300);
            }
            
          } catch (error) {
            console.error('Error removing item:', error);
            this.showNotification('Failed to remove item', 'error');
            
            // Restore button state on error
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
            
            if (cartItemElement) {
              cartItemElement.style.opacity = '1';
            }
          }
        }
      });
    });
    
    console.log('Cart event listeners attached.');
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    try {
      console.log('Starting checkout process...');
      
      // Check cart status first
      const statusResult = await this.cartAPI.getCartStatus(false);
      
      if (!statusResult.success) {
        this.showNotification('Unable to check cart status', 'error');
        return;
      }
      
      console.log('Cart status result:', statusResult);
      
      // Check if cart is ready for checkout
      const cartStatus = statusResult.data;
      if (!cartStatus || cartStatus.items_count === 0) {
        this.showNotification('Your cart is empty', 'error');
        return;
      }
      
      // Show loading state
      this.showNotification('Proceeding to checkout...', 'info');
      
      // Redirect to Salla checkout page with cart ID
      const checkoutUrl = `${cartStatus.next_step.url}`;
      
      console.log('Redirecting to checkout:', checkoutUrl);
      
      // Redirect to checkout
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 1000);
      
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      this.showNotification('Error proceeding to checkout', 'error');
    }
  }

  /**
   * Show notification message
   * @param {string message - Message to display}
   * @param {string type - Message type (success, error, info)}
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide and remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Create global instance
let cartIntegrationInstance = null;

/**
 * Get or create CartIntegration instance
 */
function getCartIntegration() {
  if (!cartIntegrationInstance) {
    cartIntegrationInstance = new CartIntegration();
  }
  // Make it globally accessible
  window.cartIntegration = cartIntegrationInstance;
  return cartIntegrationInstance;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const cartIntegration = getCartIntegration();
  
  // Initialize cart integration (will load from cache if available)
  cartIntegration.init().then(() => {
    // Only update cart count if we don't have valid cached state
    if (!cartIntegration.isStateValid()) {
      console.log('No valid cached state, updating cart count from API');
      setTimeout(() => {
        cartIntegration.updateCartCount();
      }, 500);
    } else {
      console.log('Using cached state, rendering cart count');
      cartIntegration.renderCartCount(cartIntegration.cartState.count);
    }
    
    // Initialize user info display with delay for dynamic header loading
    // Try multiple times to ensure header is loaded
    setTimeout(() => {
      cartIntegration.renderUserInfo('.user-info-container');
    }, 500);
    
    // Also try after a longer delay as backup
    setTimeout(() => {
      cartIntegration.renderUserInfo('.user-info-container');
    }, 2000);
  });
});

// Debug function - call from console: testUserAuth()
window.testUserAuth = async function() {
  const cartIntegration = getCartIntegration();
  console.log('Testing user authentication...');
  
  try {
    await cartIntegration.init();
    console.log('Cart integration initialized');
    
    const userInfo = await cartIntegration.getCurrentUser(true);
    console.log('User info:', userInfo);
    
    const isLoggedIn = await cartIntegration.isLoggedIn(true);
    console.log('Is logged in:', isLoggedIn);
    
    const displayName = await cartIntegration.getUserDisplayName(true);
    console.log('Display name:', displayName);
    
    const avatar = await cartIntegration.getUserAvatar(true);
    console.log('Avatar:', avatar);
    
    await cartIntegration.renderUserInfo('.user-info-container');
    console.log('User info rendered');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CartIntegration, getCartIntegration };
}
   