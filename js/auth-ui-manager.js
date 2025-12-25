/**
 * Authentication UI Manager
 * Handles showing/hiding sign-in buttons and user info based on authentication status
 */

class AuthUIManager {
  constructor() {
    this.userContainerSelector = '.user-info-container';
    this.signInBtnId = 'sign-in-btn';
    this.userMenuId = 'user-menu';
    this.isInitialized = false;
  }

  /**
   * Initialize the auth UI manager
   */
  async init() {
    if (this.isInitialized) return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupUI());
    } else {
      this.setupUI();
    }

    this.isInitialized = true;
  }

  /**
   * Setup the UI based on current authentication status
   */
  setupUI() {
    const userContainer = document.querySelector(this.userContainerSelector);
    if (!userContainer) {
      console.warn('User container not found');
      return;
    }

    // Check authentication status from cookies
    const isAuthenticated = this.checkAuthStatus();
    
    if (isAuthenticated) {
      this.showUserInfo(userContainer);
    } else {
      this.showSignInButton(userContainer);
    }
  }

  /**
   * Check if user is authenticated via cookies
   * @returns {boolean}
   */
  checkAuthStatus() {
    // Get access token from cookies
    const accessToken = this.getCookie('salla_access_token');
    const expiresAt = this.getCookie('salla_token_expires');
    
    // Check if token exists and is not expired
    if (accessToken && expiresAt) {
      const isExpired = Date.now() > parseInt(expiresAt);
      return !isExpired;
    }
    
    return false;
  }

  /**
   * Get cookie value
   * @param {string} name - Cookie name
   * @returns {string|null}
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
   * Show sign-in button
   * @param {HTMLElement} container - Container element
   */
  showSignInButton(container) {
    const signInText = (typeof window.currentLang !== 'undefined' && window.currentLang === "ar") 
      ? ((typeof window.translations !== 'undefined' && window.translations["sign-in"]) ? window.translations["sign-in"] : "تسجيل الدخول")
      : ((typeof window.translations !== 'undefined' && window.translations["sign-in"]) ? window.translations["sign-in"] : "Sign In");
    container.innerHTML = `
      <a href="sign-in.php" class="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" id="${this.signInBtnId}">
        <i class="fa-solid fa-sign-in-alt"></i>
        <span class="d-none d-md-inline">${signInText}</span>
      </a>
    `;
  }

  /**
   * Show user info and menu
   * @param {HTMLElement} container - Container element
   */
  showUserInfo(container) {
    // Get user info from localStorage if available
    const userInfo = this.getUserInfo();
    let displayName = userInfo?.userInfo.data.first_name + " " + userInfo?.userInfo.data.last_name;
    
    // If no displayName, try to get from cartIntegration
    if (!displayName && typeof window.cartIntegration !== 'undefined') {
      const cartIntegration = window.cartIntegration;
      console.log('cartIntegration.userState:', cartIntegration.userState);
      if (cartIntegration.userState && cartIntegration.userState.displayName) {
        displayName = cartIntegration.userState.displayName;
      }
    }
    
    // Fallback to 'User' if still no name
    if (!displayName) {
      displayName = 'User';
    }
    
    const avatar = userInfo?.avatar || 'https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png';
    const logoutText = (typeof window.currentLang !== 'undefined' && window.currentLang === "ar") 
      ? ((typeof window.translations !== 'undefined' && window.translations["logout"]) ? window.translations["logout"] : "تسجيل الخروج")
      : ((typeof window.translations !== 'undefined' && window.translations["logout"]) ? window.translations["logout"] : "Logout");

    // Get translations for menu items
    const myProfileText = (typeof window.translations !== 'undefined' && window.translations["my-profile"]) ? window.translations["my-profile"] : "My Profile";
    const myOrdersText = (typeof window.translations !== 'undefined' && window.translations["my-orders"]) ? window.translations["my-orders"] : "My Orders";
    const wishlistText = (typeof window.translations !== 'undefined' && window.translations["wishlist"]) ? window.translations["wishlist"] : "Wishlist";
    
    container.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2" 
                type="button" id="${this.userMenuId}" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="${avatar}" alt="${displayName}" class="rounded-circle" width="24" height="24">
          <span class="user-name">${displayName}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="${this.userMenuId}">
          <li><a class="dropdown-item" href="profile.html" id="my-profile-link"><i class="fa-solid fa-user me-2"></i>${myProfileText}</a></li>
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-box me-2"></i>${myOrdersText}</a></li>
          <li><a class="dropdown-item" href="#"><i class="fa-solid fa-heart me-2"></i>${wishlistText}</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logout-btn"><i class="fa-solid fa-sign-out-alt me-2"></i>${logoutText}</a></li>
        </ul>
      </div>
    `;

    // Hook profile link to dispatch an event
    const myProfileLink = document.getElementById('my-profile-link');
    if (myProfileLink) {
      myProfileLink.addEventListener('click', (e) => {
        window.dispatchEvent(new CustomEvent('openProfile', { detail: { source: 'auth-ui' } }));
        // Allow natural navigation
      });
    }

    // Add logout event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
  }

  /**
   * Get user info from localStorage
   * @returns {Object|null}
   */
  getUserInfo() {
    try {
      const userState = localStorage.getItem('userState');
      if (userState) {
        const state = JSON.parse(userState);
        // Check if cache is still valid
        if (state.lastUpdated && (Date.now() - state.lastUpdated) < (30 * 60 * 1000)) { // 30 minutes
          return state;
        }
      }
    } catch (error) {
      console.warn('Failed to get user info from localStorage:', error);
    }
    return null;
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    try {
      // Use cart integration logout if available
      if (typeof window.cartIntegration !== 'undefined') {
        await window.cartIntegration.handleLogout();
      } else {
        // Fallback: clear cookies and update UI
        this.clearAuthCookies();
        this.updateUI();
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still update UI even if logout fails
      this.updateUI();
    }
  }

  /**
   * Clear authentication cookies
   */
  clearAuthCookies() {
    const cookies = ['salla_access_token', 'salla_refresh_token', 'salla_token_expires'];
    
    cookies.forEach(cookieName => {
      let cookieString = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
      
      if (window.location.hostname !== 'localhost') {
        cookieString += `;domain=${window.location.hostname}`;
      }
      
      cookieString += ';samesite=None';
      document.cookie = cookieString;
    });
    
    // Clear user state from localStorage
    localStorage.removeItem('userState');
    
    console.log('Authentication cookies and state cleared');
  }

  /**
   * Update UI based on current auth status
   */
  updateUI() {
    const userContainer = document.querySelector(this.userContainerSelector);
    if (userContainer) {
      this.setupUI();
    }
  }

  /**
   * Force UI refresh (call after login/logout)
   */
  refresh() {
    this.updateUI();
  }
}

// Create global instance
window.authUIManager = new AuthUIManager();

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  window.authUIManager.init();
}
