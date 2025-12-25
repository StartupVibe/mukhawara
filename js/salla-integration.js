// Salla Twilight SDK Integration
function initializeSallaSDK() {
    // Initialize Salla SDK with proper store configuration
    if (typeof salla !== 'undefined') {
        try {
            // Initialize with your mukhaura store settings
            salla.init({
                debug: true, // disable in production
                language_code: 'ar', // Arabic for Saudi store
                store: {
                    id: 229278595, // Your store ID from the URL
                    url: "https://mukhaura.salla.sa"
                }
            });
            
            console.log('Salla SDK initialized successfully for mukhaura store');
            
            // Set up event listeners
            setupEventListeners();
            
            // Initialize UI elements
            updateCartCount();
            updateUserUI();
            
        } catch (error) {
            console.error('Error initializing Salla SDK:', error);
            // Retry with minimal config
            try {
                salla.init();
                console.log('Salla SDK initialized with minimal config');
                setupEventListeners();
            } catch (retryError) {
                console.error('Minimal init also failed:', retryError);
            }
        }
        
    } else {
        console.error('Salla SDK not loaded yet, retrying...');
        // Retry after a short delay
        setTimeout(initializeSallaSDK, 500);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSallaSDK);
} else {
    initializeSallaSDK();
}

// Function to set up event listeners
function setupEventListeners() {
    // Cart events
    salla.cart.event.onItemAdded((response, product_id) => {
        console.log('Item added to cart:', response, product_id);
        updateCartCount();
    });
    
    salla.cart.event.onItemDeleted((response, product_id) => {
        console.log('Item removed from cart:', response, product_id);
        updateCartCount();
    });
    
    // Wishlist events
    salla.event.wishlist.onAdded((response, product_id) => {
        console.log('Item added to wishlist:', response, product_id);
    });
    
    salla.event.wishlist.onRemoved((response, product_id) => {
        console.log('Item removed from wishlist:', response, product_id);
    });
    
    // Authentication events
    salla.event.auth.onLoginSuccess((response) => {
        console.log('User logged in:', response);
        updateUserUI();
    });
    
    salla.event.auth.onLogout(() => {
        console.log('User logged out');
        updateUserUI();
    });
}

// Helper function to update cart count
function updateCartCount() {
    if (typeof salla !== 'undefined' && salla.cart) {
        salla.cart.latest().then(response => {
            const cartCount = response.data.items ? response.data.items.length : 0;
            const cartElement = document.querySelector('#cart');
            if (cartElement) {
                // Update cart display with count
                cartElement.textContent = `cart (${cartCount})`;
            }
        }).catch(error => {
            console.error('Error fetching cart:', error);
        });
    }
}

// Helper function to update user UI
function updateUserUI() {
    if (typeof salla !== 'undefined' && salla.config) {
        try {
            const userId = salla.config.get('user.id');
            const signInElement = document.querySelector('#Sign-in');
            if (signInElement) {
                if (userId) {
                    // User is logged in
                    signInElement.textContent = 'Profile';
                } else {
                    // User is not logged in
                    signInElement.textContent = 'Sign in';
                }
            }
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    }
}

// Example function to add product to cart
function addProductToCart(productId, quantity = 1, options = {}) {
    if (typeof salla !== 'undefined' && salla.cart) {
        const cartItem = {
            id: productId,
            quantity: quantity
        };
        
        // Add options if provided
        if (Object.keys(options).length > 0) {
            cartItem.options = options;
        }
        
        salla.cart.addItem(cartItem).then(response => {
            console.log('Product added to cart:', response);
            updateCartCount();
        }).catch(error => {
            console.error('Error adding product to cart:', error);
        });
    } else {
        console.error('Salla SDK or cart API not available');
    }
}

// Example function to add product to wishlist
function addProductToWishlist(productId) {
    if (typeof salla !== 'undefined' && salla.wishlist) {
        salla.wishlist.add(productId).then(response => {
            console.log('Product added to wishlist:', response);
        }).catch(error => {
            console.error('Error adding product to wishlist:', error);
        });
    } else {
        console.error('Salla SDK or wishlist API not available');
    }
}

// Initialize cart count on page load
setTimeout(() => {
    updateCartCount();
    updateUserUI();
}, 1000);
