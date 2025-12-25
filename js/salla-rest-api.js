// Salla REST API Integration for External Websites
// This replaces the Twilight SDK with direct API calls

class SallaRestAPI {
    constructor() {
        // You'll need to get these from Salla Developer Portal
        this.accessToken = null;
        this.storeDomain = 'mukhaura.salla.sa';
        this.apiBase = 'https://api.salla.dev';
    }

    // Set access token (you'll get this from OAuth)
    setAccessToken(token) {
        this.accessToken = token;
        console.log('Access token set');
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        if (!this.accessToken) {
            throw new Error('Access token required. Please authenticate first.');
        }

        const url = `${this.apiBase}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Cart operations
    async getCart() {
        return await this.request('/cart/latest');
    }

    async addToCart(productId, quantity = 1) {
        return await this.request('/cart/item', {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });
    }

    async removeFromCart(itemId) {
        return await this.request(`/cart/item/${itemId}`, {
            method: 'DELETE'
        });
    }

    // Product operations
    async getProducts(limit = 20) {
        return await this.request(`/products?limit=${limit}`);
    }

    async getProductDetails(productId) {
        return await this.request(`/products/${productId}`);
    }

    async searchProducts(query) {
        return await this.request(`/products/search?keyword=${encodeURIComponent(query)}`);
    }

    // Categories
    async getCategories() {
        return await this.request('/categories');
    }

    // Authentication (OAuth flow)
    async getOAuthUrl(redirectUri) {
        // You need to create an OAuth app at salla.partners
        const clientId = 'e8e262c6-6485-4c46-b92a-fb6757d6608a'; // Replace with your client ID
        const scope = 'read_products write_cart read_cart';
        
        return `https://accounts.salla.sa/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
    }

    async exchangeCodeForToken(code, redirectUri) {
        const clientId = 'YOUR_CLIENT_ID'; // Replace with your client ID
        const clientSecret = 'YOUR_CLIENT_SECRET'; // Replace with your client secret

        const response = await fetch('https://accounts.salla.sa/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Token exchange failed');
        }

        const tokenData = await response.json();
        this.setAccessToken(tokenData.access_token);
        return tokenData;
    }

    // Store information
    async getStoreInfo() {
        return await this.request('/store/info');
    }
}

// Initialize the API client
const sallaAPI = new SallaRestAPI();

// Helper functions for UI integration
window.SallaIntegration = {
    // Initialize with stored token
    init() {
        const storedToken = localStorage.getItem('salla_access_token');
        if (storedToken) {
            sallaAPI.setAccessToken(storedToken);
            console.log('Salla API initialized with stored token');
        } else {
            console.log('No access token found - authentication required');
        }
    },

    // Start OAuth flow
    authenticate() {
        const redirectUri = window.location.origin + '/salla/salla-callback.html';
        const authUrl = sallaAPI.getOAuthUrl(redirectUri);
        window.location.href = authUrl;
    },

    // Handle OAuth callback
    async handleCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            try {
                const tokenData = await sallaAPI.exchangeCodeForToken(code, window.location.origin + '/salla/salla-callback.html');
                localStorage.setItem('salla_access_token', tokenData.access_token);
                window.location.href = '/salla/'; // Redirect back to salla directory
            } catch (error) {
                console.error('Authentication failed:', error);
            }
        }
    },

    // Cart functions
    async addToCart(productId, quantity = 1) {
        try {
            const result = await sallaAPI.addToCart(productId, quantity);
            console.log('Added to cart:', result);
            return result;
        } catch (error) {
            console.error('Add to cart failed:', error);
            throw error;
        }
    },

    async getCart() {
        try {
            const cart = await sallaAPI.getCart();
            console.log('Cart data:', cart);
            return cart;
        } catch (error) {
            console.error('Get cart failed:', error);
            throw error;
        }
    },

    // Product functions
    async getProducts() {
        try {
            const products = await sallaAPI.getProducts();
            console.log('Products:', products);
            return products;
        } catch (error) {
            console.error('Get products failed:', error);
            throw error;
        }
    },

    async searchProducts(query) {
        try {
            const results = await sallaAPI.searchProducts(query);
            console.log('Search results:', results);
            return results;
        } catch (error) {
            console.error('Search failed:', error);
            throw error;
        }
    },

    // Store information
    async getStoreInfo() {
        try {
            const storeInfo = await sallaAPI.getStoreInfo();
            console.log('Store info:', storeInfo);
            return storeInfo;
        } catch (error) {
            console.error('Get store info failed:', error);
            throw error;
        }
    },

    // Categories
    async getCategories() {
        try {
            const categories = await sallaAPI.getCategories();
            console.log('Categories:', categories);
            return categories;
        } catch (error) {
            console.error('Get categories failed:', error);
            throw error;
        }
    },

    // Product details
    async getProductDetails(productId) {
        try {
            const product = await sallaAPI.getProductDetails(productId);
            console.log('Product details:', product);
            return product;
        } catch (error) {
            console.error('Get product details failed:', error);
            throw error;
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SallaIntegration.init());
} else {
    SallaIntegration.init();
}
