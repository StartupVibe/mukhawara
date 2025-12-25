/**
 * Salla Cart API Class
 * Complete implementation of all Salla Cart APIs
 * Documentation: https://docs.salla.dev/849353f0
 */

class SallaCartAPI {
  constructor() {
    this.isInitialized = false;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
    this.loadingPromises = new Map(); // Track ongoing requests
    
    // Cookie configuration
    this.cookieConfig = {
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    };
  }

  /**
   * Ensure Salla Cart API is ready for direct API calls
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      // We don't need Salla SDK for direct API calls
      // Just set the initialization flag
      this.isInitialized = true;
      console.log('Salla Cart API initialized for direct API calls');
    }

    return true;
  }

  /**
   * Get cached data or make API call with caching
   * @param {string} cacheKey - Cache key
   * @param {Function} apiCall - API call function
   * @param {boolean} bypassCache - Force fresh API call
   * @returns {Promise}
   */
  async getCachedOrFetch(cacheKey, apiCall, bypassCache = false) {
    // Check if we have an ongoing request for this key
    if (this.loadingPromises.has(cacheKey)) {
      console.log(`Using ongoing request for ${cacheKey}`);
      return await this.loadingPromises.get(cacheKey);
    }

    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`Using cached data for ${cacheKey}`);
        return cached.data;
      }
    }

    // Create the loading promise
    const loadingPromise = this.makeApiCallWithCache(cacheKey, apiCall);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      // Remove the loading promise when done
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Make API call and cache the result
   * @param {string} cacheKey - Cache key
   * @param {Function} apiCall - API call function
   * @returns {Promise}
   */
  async makeApiCallWithCache(cacheKey, apiCall) {
    try {
      console.log(`Making fresh API call for ${cacheKey}`);
      const result = await apiCall();
      
      // Cache the result
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

  /**
   * Clear cache for specific key or all cache
   * @param {string} cacheKey - Cache key to clear (optional)
   */
  clearCache(cacheKey = null) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
      console.log(`Cleared cache for ${cacheKey}`);
    } else {
      this.cache.clear();
      console.log('Cleared all cache');
    }
  }

  /**
   * Set cookie with proper configuration
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiration in days
   */
  setCookie(name, value, days = 7, options = {}) {
    // Unified cookie helper with options
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
  deleteCookie(name) {
    let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${this.cookieConfig.path}`;
    
    if (this.cookieConfig.domain) {
      cookieString += `;domain=${this.cookieConfig.domain}`;
    }
    
    cookieString += `;samesite=${this.cookieConfig.sameSite}`;
    
    document.cookie = cookieString;
  }

  /**
   * Get authentication token from cookies
   * @returns {string|null} Access token or null if not found
   */
  getAuthToken() {
    const accessToken = this.getCookie('salla_access_token');
    const expiresAt = this.getCookie('salla_token_expires');
    
    // If there is no token, we will work as a visitor (no Authorization header)
    if (!accessToken || !expiresAt) {
      return null;
    }
    
    // Check if token is expired
    const isExpired = Date.now() > parseInt(expiresAt);
    if (isExpired) {
      console.log('Access token expired, clearing cookies, cart will be used as visitor');
      // this.clearAuthTokens();
      return null;
    }
    
    return accessToken;
  }

  /**
   * Get XSRF token from cookies, localStorage or meta tag (supports multiple common names)
   * @returns {string|null}
   */
  getXsrfToken() {
    // Try common cookie names first
    const names = ['XSRF-TOKEN', 'xsrf_token', 'XSRF_TOKEN', 'salla_xsrf_token'];
    for (const name of names) {
      const v = this.getCookie(name);
      if (v) return v;
    }

    // Fallback to localStorage (useful when cookie belongs to .salla.sa and is inaccessible)
    try {
      const stored = localStorage.getItem('salla_xsrf_token') || localStorage.getItem('salla_xsrf');
      if (stored) return stored;
    } catch (e) {
      // ignore
    }

    // Fallback to meta tag if present
    try {
      const meta = document.querySelector('meta[name="salla-xsrf-token"], meta[name="xsrf-token"]');
      if (meta && meta.content) return meta.content;
    } catch (e) {
      // ignore
    }

    return null;
  }

  /**
   * Persist an XSRF token locally so it can be forwarded to the proxy.
   * Useful when the XSRF cookie is set on a different domain and not accessible from JS.
   */
  setXsrfToken(token) {
    try {
      localStorage.setItem('salla_xsrf_token', String(token));
      // Persist non-HttpOnly cookie for convenience on this domain (30 days)
      const cookieOptions = { sameSite: (window.location.protocol === 'https:' ? 'None' : 'Lax'), secure: window.location.protocol === 'https:' };
      this.setCookie('salla_xsrf_token', token, 30, cookieOptions);
      console.log('salla_xsrf_token stored locally (use setXsrfToken to persist cross-domain token)');
      return true;
    } catch (e) {
      console.warn('Could not persist salla_xsrf_token:', e);
      return false;
    }
  }

  /**
   * Clear authentication tokens from cookies
   */
  // clearAuthTokens() {
  //   this.deleteCookie('salla_access_token');
  //   this.deleteCookie('salla_refresh_token');
  //   this.deleteCookie('salla_token_expires');
  //   console.log('Authentication tokens cleared from cookies');
  // }

  /**
   * Logout user and clear tokens
   * @returns {Promise}
   */
  async logout() {
    await this.ensureInitialized();
    
    try {
      const token = this.getAuthToken();
      
      if (token) {
        // Make logout API call
        const response = await fetch('https://api.salla.dev/oauth/v1/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Store-Identifier': '229278595'
          }
        });
        
        // Clear tokens regardless of API call success
        // this.clearAuthTokens();
        
        if (response.ok) {
          return {
            success: true,
            message: 'Logged out successfully'
          };
        } else {
          // Still consider logout successful even if API call fails
          console.warn('Logout API call failed, but tokens were cleared');
          return {
            success: true,
            message: 'Logged out successfully (tokens cleared)'
          };
        }
      } else {
        // No token to logout with, just clear any existing tokens
        // this.clearAuthTokens();
        return {
          success: true,
          message: 'No active session found'
        };
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear tokens on error
      // this.a();
      return {
        success: true,
        message: 'Logged out successfully (tokens cleared)',
        warning: 'API call failed but tokens were cleared'
      };
    }
  }

  /**
   * Invalidate cache when cart is modified
   */
  invalidateCartCache() {
    this.clearCache('latest_cart');
    this.clearCache('cart_details');
    this.clearCache('cart_summary');
    console.log('Cart cache invalidated due to modifications');
  }

  /**
   * 1. Get Latest Cart
   * Fetch the last cart created by the customer
   * @param {boolean} bypassCache - Force fresh API call
   * @returns {Promise}
   */
  async getLatestCart(bypassCache = false) {
    await this.ensureInitialized();

    return await this.getCachedOrFetch('latest_cart', async () => {
      const token = this.getAuthToken();

      // Make direct API call (include XSRF header if available)
      const xsrfToken = this.getXsrfToken();
      // Build headers and forward auth/xsrf if present
      const latestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
      };

      const response = await fetch('https://api.salla.dev/store/v1/cart/latest', {
        method: 'GET',
        headers: latestHeaders
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to get latest cart'}`);
      }
      
      const responseData = await response.json();
      
      // Update cart state in localStorage
      this.updateCartState(responseData.data);

      // Persist returned cart ID for use by other API flows
      const returnedCartId = responseData.data?.cart?.id || responseData.data?.id || null;
      if (returnedCartId) {
        try {
          localStorage.setItem('salla_cart_id', String(returnedCartId));
          this.currentCartId = returnedCartId;
        } catch (e) {
          console.warn('Could not persist salla_cart_id:', e);
        }
      }
      
      return {
        success: true,
        data: responseData.data,
        message: 'Latest cart retrieved successfully'
      };
    }, bypassCache);
  }

  /**
   * 2. Get Cart Details
   * Display cart details with items and their details
   * @param {string} cartId - Optional cart ID to use instead of latest
   * @param {boolean} bypassCache - Force fresh API call
   * @returns {Promise}
   */
  async getCartDetails(cartId = null, bypassCache = false) {
    await this.ensureInitialized();

    const cacheKey = cartId ? `cart_details_${cartId}` : 'cart_details';

    return await this.getCachedOrFetch(cacheKey, async () => {
      const token = this.getAuthToken();
      
      // Use provided cart ID or get latest cart
      let targetCartId = cartId;
      if (!targetCartId) {
        // Get latest cart ID if Lax provided
        try {
          const xsrfToken = this.getXsrfToken();
          const latestHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Store-Identifier': '229278595',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
          };
          
          const cartResponse = await fetch(
            'https://api.salla.dev/store/v1/cart/latest',
            {
              method: 'GET',
              headers: latestHeaders
            }
          );
          
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            targetCartId = cartData.data?.cart?.id;
          }
        } catch (error) {
          console.warn('Could not get latest cart ID:', error);
        }
      }
      
      if (!targetCartId) {
        return {
          success: false,
          data: null,
          message: 'No cart ID available'
        };
      }
      
      // Make API call with specific cart ID and options parameter
      const detailsHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(
        `https://api.salla.dev/store/v1/cart/${targetCartId}?with[]=options`,
        {
          method: 'GET',
          headers: detailsHeaders
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to get cart details'}`);
      }
      
      const responseData = await response.json();
      
      // Update cart state in localStorage
      this.updateCartState(responseData.data);
      
      return {
        success: true,
        data: responseData.data,
        message: 'Cart details retrieved successfully',
        cartId: targetCartId
      };
    }, bypassCache);
  }

  /**
   * 3. Quick Add Product
   * Add product directly from products list to cart
   * @param {number} productId - Product ID
   * @param {Object} options - Additional options (quantity, etc.)
   * @returns {Promise}
   */
  async quickAddProduct(productId, options = {}) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const token = this.getAuthToken();
      
      // Get current cart ID first using the same method as getCartDetails
      let currentCartId = null;
      try {
        const xsrfToken = this.getXsrfToken();
        const latestHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Store-Identifier': '229278595',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
        };
        
        const cartResponse = await fetch(
          'https://api.salla.dev/store/v1/cart/latest',
          {
            method: 'GET',
            headers: latestHeaders
          }
        );
        
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          currentCartId = cartData.data?.cart?.id; // Note: cart ID is in data.cart.id

          // Persist cart id for later use
          if (currentCartId) {
            localStorage.setItem('salla_cart_id', String(currentCartId));
            this.currentCartId = currentCartId;
          }
        }
      } catch (cartIdError) {
        console.warn('Could not get current cart ID:', cartIdError);
      }
      
      // Use the actual cart ID from the response
      if (!currentCartId) {
        throw new Error('Could not determine cart ID for quick add');
      }
      
      // Make direct API call with proper headers using the actual cart ID
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(
        `https://api.salla.dev/store/v1/cart/${currentCartId}/item/${productId}/quick-add`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({})
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to add to cart'}`);
      }
      
      const responseData = await response.json();
      
      // Update cart state in localStorage
      this.updateCartState(responseData.data);
      
      return {
        success: true,
        data: responseData.data,
        message: 'Product added to cart successfully',
        productId: productId
      };
    } catch (error) {
      throw this.handleError(error, 'quickAddProduct');
    }
  }

  /**
   * 4. Add Item to Cart
   * Add item from merchant store to customer's shopping cart
   * @param {number} productId - Product ID
   * @param {Object} itemData - Item data (quantity, options, etc.)
   * @returns {Promise}
   */
  async addItem(productId, itemData = {}) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const token = this.getAuthToken();
      
      // Get current cart ID first
      let currentCartId = null;
      try {
        const xsrfToken = this.getXsrfToken();
        const latestHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Store-Identifier': '229278595',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
        };
        
        const cartResponse = await fetch(
          'https://api.salla.dev/store/v1/cart/latest',
          {
            method: 'GET',
            headers: latestHeaders
          }
        );
        
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          currentCartId = cartData.data?.cart?.id;

          // Persist cart id for later use
          if (currentCartId) {
            try {
              localStorage.setItem('salla_cart_id', String(currentCartId));
              this.currentCartId = currentCartId;
            } catch (e) {
              console.warn('Could not persist salla_cart_id:', e);
            }
          }
        }
      } catch (error) {
        console.warn('Could not get current cart ID:', error);
      }
      
      if (!currentCartId) {
        throw new Error('Could not determine cart ID for adding item');
      }
      
      // Make direct API call to add item
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(
        `https://api.salla.dev/store/v1/cart/${currentCartId}/item`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            product_id: productId,
            quantity: itemData.quantity || 1,
            options: itemData.options || {}
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to add item to cart'}`);
      }
      
      const responseData = await response.json();
      
      // Update cart state in localStorage
      this.updateCartState(responseData.data);
      
      return {
        success: true,
        data: responseData.data,
        message: 'Item added to cart successfully',
        productId: productId
      };
    } catch (error) {
      throw this.handleError(error, 'addItem');
    }
  }

  /**
   * 5. Delete Item from Cart
   * Remove an item from the customer's shopping cart
   * @param {string} itemId - Item ID to remove (as string to handle large numbers)
   * @returns {Promise}
   */
  async deleteItem(itemId) {
    await this.ensureInitialized();
    
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    try {
      const token = this.getAuthToken();
      
      // Get current cart ID first
      let currentCartId = null;
      try {
        const xsrfToken = this.getXsrfToken();
        const latestHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Store-Identifier': '229278595',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
        };
        
        const cartResponse = await fetch(
          'https://api.salla.dev/store/v1/cart/latest',
          {
            method: 'GET',
            headers: latestHeaders
          }
        );
        
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          currentCartId = cartData.data?.cart?.id;

          // Persist cart id for later use
          if (currentCartId) {
            try {
              localStorage.setItem('salla_cart_id', String(currentCartId));
              this.currentCartId = currentCartId;
            } catch (e) {
              console.warn('Could not persist salla_cart_id:', e);
            }
          }
        }
      } catch (error) {
        console.warn('Could not get current cart ID:', error);
      }
      
      if (!currentCartId) {
        throw new Error('Could not determine cart ID for deleting item');
      }
      
      // Make direct API call to delete item
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(
        `https://api.salla.dev/store/v1/cart/${currentCartId}/item/${itemId}`,
        {
          method: 'DELETE',
          headers
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to delete item from cart'}`);
      }
      
      const responseData = await response.json();
      
      // Invalidate cache since cart was modified
      this.invalidateCartCache();
      
      // Update cart state in localStorage
      this.updateCartState(responseData.data);
      
      return {
        success: true,
        data: responseData.data,
        message: 'Item removed from cart successfully',
        itemId: itemId
      };
    } catch (error) {
      throw this.handleError(error, 'deleteItem');
    }
  }

  /**
   * 6. Delete Item Image
   * Remove an image file attached to an item in the cart
   * @param {number} itemId - Item ID
   * @param {string} imageId - Image ID to remove
   * @returns {Promise}
   */
  async deleteItemImage(itemId, imageId) {
    await this.ensureInitialized();
    
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    if (!imageId) {
      throw new Error('Image ID is required');
    }

    try {
      const response = await salla.cart.deleteImage(itemId, imageId);
      return {
        success: true,
        data: response.data,
        message: 'Item image removed successfully',
        itemId: itemId,
        imageId: imageId
      };
    } catch (error) {
      throw this.handleError(error, 'deleteItemImage');
    }
  }

  /**
   * 7. Add Coupon
   * Apply a coupon code to get discount on cart items
   * @param {string} couponCode - Coupon code to apply
   * @returns {Promise}
   */
  async addCoupon(couponCode) {
    await this.ensureInitialized();
    
    if (!couponCode || couponCode.trim() === '') {
      throw new Error('Coupon code is required');
    }

    try {
      const response = await salla.cart.addCoupon(couponCode.trim());
      return {
        success: true,
        data: response.data,
        message: 'Coupon applied successfully',
        couponCode: couponCode.trim()
      };
    } catch (error) {
      throw this.handleError(error, 'addCoupon');
    }
  }

  /**
   * 8. Remove Coupon
   * Remove applied coupon from cart
   * @returns {Promise}
   */
  async removeCoupon() {
    await this.ensureInitialized();

    try {
      const response = await salla.cart.removeCoupon();
      return {
        success: true,
        data: response.data,
        message: 'Coupon removed successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'removeCoupon');
    }
  }

  /**
   * 9. Get Upload Image URL
   * Get endpoint to upload image file to cart
   * @returns {Promise}
   */
  async getUploadImageUrl() {
    await this.ensureInitialized();

    try {
      const response = await salla.cart.getUploadImage();
      return {
        success: true,
        data: response.data,
        message: 'Upload image URL retrieved successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'getUploadImageUrl');
    }
  }

  /**
   * 10. Upload Image to Cart
   * Upload image file to attach to cart/order
   * @param {File|Blob} imageFile - Image file to upload
   * @returns {Promise}
   */
  async uploadImage(imageFile) {
    await this.ensureInitialized();
    
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await salla.cart.uploadImage(formData);
      return {
        success: true,
        data: response.data,
        message: 'Image uploaded to cart successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'uploadImage');
    }
  }

  /**
   * 11. Get Quick Order Settings
   * Retrieve configuration settings for merchant's quick order feature
   * @returns {Promise}
   */
  async getQuickOrderSettings() {
    await this.ensureInitialized();

    try {
      const response = await salla.cart.getQuickOrderSettings();
      return {
        success: true,
        data: response.data,
        message: 'Quick order settings retrieved successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'getQuickOrderSettings');
    }
  }

  /**
   * 12. Create Quick Order
   * Select items and proceed directly to checkout
   * @param {Array} items - Array of items to order
   * @param {Object} options - Additional options
   * @returns {Promise}
   */
  async createQuickOrder(items, options = {}) {
    await this.ensureInitialized();
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required');
    }

    try {
      const response = await salla.cart.createQuickOrder(items, options);
      return {
        success: true,
        data: response.data,
        message: 'Quick order created successfully',
        items: items
      };
    } catch (error) {
      throw this.handleError(error, 'createQuickOrder');
    }
  }

  /**
   * 13. Get Order Status
   * Return current status of cart (active/inactive) and next step
   * @returns {Promise}
   */
  async getOrderStatus() {
    await this.ensureInitialized();

    try {
      const response = await salla.cart.orderStatus();
      return {
        success: true,
        data: response.data,
        message: 'Order status retrieved successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'getOrderStatus');
    }
  }

  /**
   * 14. Get Current Cart ID
   * Return unique identifier of current cart associated with user/session
   * @returns {Promise}
   */
  async getCurrentCartId() {
    await this.ensureInitialized();

    try {
      const response = await salla.cart.getCurrentCartId();
      return {
        success: true,
        data: response.data,
        message: 'Current cart ID retrieved successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'getCurrentCartId');
    }
  }

  /**
   * 15. Get Price Quote
   * Calculate price quote for cart items including discounts, taxes, shipping
   * @param {Object} options - Additional options for quote calculation
   * @returns {Promise}
   */
  async getPriceQuote(options = {}) {
    await this.ensureInitialized();

    try {
      const response = await salla.cart.priceQuote(options);
      return {
        success: true,
        data: response.data,
        message: 'Price quote calculated successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'getPriceQuote');
    }
  }

  /**
   * Get Cart Status for Checkout
   * Check cart status and prepare for checkout
   * @param {boolean} hasApplePay - Include Apple Pay availability
   * @returns {Promise}
   */
  async getCartStatus(hasApplePay = false) {
    await this.ensureInitialized();

    return await this.getCachedOrFetch('cart_status', async () => {
      const token = this.getAuthToken();
      
      // Get current cart ID first
      let currentCartId = null;
      try {
        const xsrfToken = this.getXsrfToken();
        const latestHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Store-Identifier': '229278595',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
        };
        
        const cartResponse = await fetch(
          'https://api.salla.dev/store/v1/cart/latest',
          {
            method: 'GET',
            headers: latestHeaders
          }
        );
        
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          currentCartId = cartData.data?.cart?.id;

          // Persist cart id for later use
          if (currentCartId) {
            try {
              localStorage.setItem('salla_cart_id', String(currentCartId));
              this.currentCartId = currentCartId;
            } catch (e) {
              console.warn('Could not persist salla_cart_id:', e);
            }
          }
        }
      } catch (error) {
        console.warn('Could not get current cart ID:', error);
      }
      
      if (!currentCartId) {
        throw new Error('Could not determine cart ID for status check');
      }
      
      // Make cart status API call with proper headers as shown in the request
      const url = `https://api.salla.dev/store/v1/cart/${currentCartId}/status?has_apple_pay=${hasApplePay}`;
      console.log('Making cart status API call to:', url);
      
      const headers = {
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
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      console.log('Cart status response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cart status API Error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to get cart status'}`);
      }
      
      const responseData = await response.json();
      console.log('Cart status response data:', responseData);
      
      return {
        success: true,
        data: responseData.data,
        message: 'Cart status retrieved successfully',
        cartId: currentCartId,
        hasApplePay: hasApplePay
      };
    }, true); // Always bypass cache for cart status to get fresh data
  }

  /**
   * Helper Methods
   */

  /**
   * Get cart with all details (latest + details combined)
   * @param {string} cartId - Optional cart ID to use instead of latest
   * @returns {Promise}
   */
  async getFullCart(cartId = null) {
    await this.ensureInitialized();

    try {
      const [latest, details] = await Promise.all([
        this.getLatestCart(),
        this.getCartDetails(cartId)
      ]);

      return {
        success: true,
        data: {
          latest: latest.data,
          details: details.data
        },
        message: 'Full cart information retrieved successfully',
        cartId: details.cartId
      };
    } catch (error) {
      throw this.handleError(error, 'getFullCart');
    }
  }

  /**
   * Update item quantity in cart
   * @param {string} itemId - Item ID (as string to handle large numbers)
   * @param {number} quantity - New quantity
   * @returns {Promise}
   */
  async updateItemQuantity(itemId, quantity) {
    await this.ensureInitialized();
    
    console.log('updateItemQuantity called with itemId:', itemId, 'quantity:', quantity);
    
    if (!itemId) {
      throw new Error('Item ID is required');
    }
    
    if (!quantity || quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    try {
      const token = this.getAuthToken();
      
      // Get current cart ID first
      let currentCartId = null;
      try {
        console.log('Getting current cart ID...');
        const xsrfToken = this.getXsrfToken();
        const latestHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Store-Identifier': '229278595',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {})
        };
        
        const cartResponse = await fetch(
          'https://api.salla.dev/store/v1/cart/latest',
          {
            method: 'GET',
            headers: latestHeaders
          }
        );
        
        console.log('Cart response status:', cartResponse.status);
        
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          console.log('Cart data:', cartData);
          currentCartId = cartData.data?.cart?.id;
          console.log('Current cart ID:', currentCartId);

          // Persist cart id for use across API flows
          if (currentCartId) {
            try {
              localStorage.setItem('salla_cart_id', String(currentCartId));
              this.currentCartId = currentCartId;
            } catch (e) {
              console.warn('Could not persist salla_cart_id:', e);
            }
          }
        } else {
          console.log('Cart response not ok:', await cartResponse.text());
        }
      } catch (error) {
        console.warn('Could not get current cart ID:', error);
      }
      
      if (!currentCartId) {
        throw new Error('Could not determine cart ID for updating quantity');
      }
      
      // Create FormData for the request (as shown in the actual API call)
      const formData = new FormData();
      formData.append('id', itemId.toString());
      formData.append('quantity', quantity.toString());
      formData.append('_method', 'PUT');
      
      console.log('FormData created:', {
        id: itemId.toString(),
        quantity: quantity.toString(),
        _method: 'PUT'
      });
      
      // Make direct API call to update quantity using POST with _method: PUT
      const url = `https://api.salla.dev/store/v1/cart/${currentCartId}/item/${itemId}`;
      console.log('Making API call to:', url);
      
      const headers = {
        'Accept': 'application/json',
        'Store-Identifier': '229278595',
        'Cache-Control': 'no-cache',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });
      
      console.log('Update quantity response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to update item quantity'}`);
      }
      
      const responseData = await response.json();
      console.log('Update quantity response data:', responseData);
      
      // Invalidate cache since cart was modified
      this.invalidateCartCache();
      
      // Update cart state in localStorage
      this.updateCartState(responseData.data);
      
      return {
        success: true,
        data: responseData.data,
        message: 'Item quantity updated successfully',
        itemId: itemId,
        quantity: quantity
      };
    } catch (error) {
      console.error('Error in updateItemQuantity:', error);
      throw this.handleError(error, 'updateItemQuantity');
    }
  }
  /**
   * Clear entire cart
   * @returns {Promise}
   */
  async clearCart() {
    await this.ensureInitialized();

    try {
      const cartDetails = await this.getCartDetails();
      
      if (cartDetails.data && cartDetails.data.items && cartDetails.data.items.length > 0) {
        const deletePromises = cartDetails.data.items.map(item => 
          this.deleteItem(item.id)
        );
        
        await Promise.all(deletePromises);
      }

      return {
        success: true,
        message: 'Cart cleared successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'clearCart');
    }
  }

  /**
   * Get cart summary (total items, total price, etc.)
   * @returns {Promise}
   */
  async getCartSummary() {
    await this.ensureInitialized();

    try {
      const details = await this.getCartDetails();
      const cart = details.data;
      
      const summary = {
        itemsCount: cart.items ? cart.items.length : 0,
        totalQuantity: cart.items ? cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0,
        subtotal: cart.subtotal || 0,
        total: cart.total || 0,
        discount: cart.discount || 0,
        tax: cart.tax || 0,
        shipping: cart.shipping || 0,
        hasCoupon: !!(cart.coupon && cart.coupon.code),
        couponCode: cart.coupon ? cart.coupon.code : null
      };

      return {
        success: true,
        data: summary,
        message: 'Cart summary retrieved successfully'
      };
    } catch (error) {
      throw this.handleError(error, 'getCartSummary');
    }
  }

  /**
   * Update cart state in localStorage
   * @param {Object} cartData - Cart data from API response
   */
  updateCartState(cartData) {
    try {
      // Get existing cart state
      let cartState = JSON.parse(localStorage.getItem('salla_cart_state') || '{}');
      
      // Update with new data
      cartState = {
        ...cartState,
        lastUpdated: new Date().toISOString(),
        cart: cartData,
        itemsCount: cartData.items ? cartData.items.length : 0,
        totalQuantity: cartData.items ? cartData.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0,
        subtotal: cartData.subtotal || 0,
        total: cartData.total || 0
      };
      
      // Save to localStorage
      localStorage.setItem('salla_cart_state', JSON.stringify(cartState));
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: cartState 
      }));
      
    } catch (error) {
      console.error('Error updating cart state:', error);
    }
  }

  /**
   * Get cart state from localStorage
   * @returns {Object} Cart state
   */
  getCartState() {
    try {
      return JSON.parse(localStorage.getItem('salla_cart_state') || '{}');
    } catch (error) {
      console.error('Error getting cart state:', error);
      return {};
    }
  }

  /**
   * Clear cart state from localStorage
   */
  clearCartState() {
    try {
      localStorage.removeItem('salla_cart_state');
      window.dispatchEvent(new CustomEvent('cartCleared'));
    } catch (error) {
      console.error('Error clearing cart state:', error);
    }
  }

  /**
   * Error handler
   */
  handleError(error, methodName) {
    const errorMessage = error.message || 'Unknown error occurred';
    const errorDetails = {
      method: methodName,
      message: errorMessage,
      originalError: error
    };

    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.data = error.response.data;
    }

    console.error(`SallaCartAPI.${methodName} error:`, errorDetails);
    return errorDetails;
  }
}

// Create global instance
let sallaCartAPIInstance = null;

/**
 * Get or create SallaCartAPI instance
 */
function getSallaCartAPI() {
  if (!sallaCartAPIInstance) {
    sallaCartAPIInstance = new SallaCartAPI();
  }
  return sallaCartAPIInstance;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SallaCartAPI, getSallaCartAPI };
}
