import { cartService } from './api/cart/cartService.js';

class CartManager {
    constructor() {
        this.cartItems = [];
        this.cartIcon = document.querySelector('.icon.cart');
        this.cartBadge = null;
        this.init();
    }

    async init() {
        try {
            // Load cart from localStorage or API
            this.loadCartFromStorage();
            this.setupEventListeners();
            this.updateCartBadge();

            // Listen for global openCart events (from other code or dispatch)
            window.addEventListener('openCart', (e) => this.openCartDrawer(e.detail?.items || this.cartItems));

            // Reposition drawer when language changes
            window.addEventListener('lang:changed', () => {
                const drawer = document.querySelector('.Shopping-cart');
                if (drawer) {
                    // If drawer is visible, re-open to apply side changes
                    const overlay = document.getElementById('drawer-overlay');
                    const isVisible = overlay && overlay.style.display === 'block';
                    if (isVisible) {
                        this.openCartDrawer(this.cartItems);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to initialize cart manager:', error);
        }
    }

    loadCartFromStorage() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                this.cartItems = JSON.parse(storedCart);
            } catch (error) {
                console.error('Error parsing cart from storage:', error);
                this.cartItems = [];
            }
        }
    }

    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    setupEventListeners() {
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => this.openCart());
        }

        // Also support header icon with explicit id
        const headerCart = document.getElementById('cart-open');
        if (headerCart && headerCart !== this.cartIcon) {
            headerCart.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }

        // Listen for profile open events from other components
        window.addEventListener('openProfile', (e) => {
            // Navigate to profile page (allows components to trigger profile navigation)
            window.location.href = 'profile.php';
        });
    }

    async addToCart(product) {
        try {
            // Check if product already exists in cart
            const existingItem = this.cartItems.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
            } else {
                this.cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    thumbnail: product.thumbnail,
                    quantity: product.quantity || 1
                });
            }

            this.saveCartToStorage();
            this.updateCartBadge();
            
            // Try to sync with API if available
            try {
                await cartService.addToCart({
                    id: product.id,
                    quantity: product.quantity || 1
                });
            } catch (apiError) {
                console.warn('Could not sync with API:', apiError);
                // Continue with local storage
            }

            this.showNotification('Product added to cart!', 'success');
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Failed to add product to cart', 'error');
            return false;
        }
    }

    async removeFromCart(productId) {
        try {
            this.cartItems = this.cartItems.filter(item => item.id !== productId);
            this.saveCartToStorage();
            this.updateCartBadge();
            
            // Try to sync with API if available
            try {
                await cartService.removeFromCart(productId);
            } catch (apiError) {
                console.warn('Could not sync with API:', apiError);
            }

            this.showNotification('Product removed from cart', 'success');
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Failed to remove product from cart', 'error');
            return false;
        }
    }

    async updateCartItemQuantity(productId, quantity) {
        try {
            const item = this.cartItems.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    return this.removeFromCart(productId);
                }
                item.quantity = quantity;
                this.saveCartToStorage();
                this.updateCartBadge();
                
                // Try to sync with API if available
                try {
                    await cartService.updateCartItem(productId, quantity);
                } catch (apiError) {
                    console.warn('Could not sync with API:', apiError);
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating cart item:', error);
            this.showNotification('Failed to update cart item', 'error');
            return false;
        }
    }

    getCartItems() {
        return this.cartItems;
    }

    getCartTotal() {
        return this.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getCartCount() {
        return this.cartItems.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    }

    updateCartBadge() {
        const count = this.getCartCount();
        
        // Remove existing badge if present
        if (this.cartBadge) {
            this.cartBadge.remove();
        }

        // Create new badge if count > 0
        if (count > 0) {
            this.cartBadge = document.createElement('span');
            this.cartBadge.className = 'cart-badge';
            this.cartBadge.textContent = count;
            this.cartBadge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #ff4444;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            `;
            
            if (this.cartIcon) {
                this.cartIcon.style.position = 'relative';
                this.cartIcon.appendChild(this.cartBadge);
            }
        }
    }

    async clearCart() {
        try {
            this.cartItems = [];
            this.saveCartToStorage();
            this.updateCartBadge();
            
            // Try to sync with API if available
            try {
                await cartService.clearCart();
            } catch (apiError) {
                console.warn('Could not sync with API:', apiError);
            }

            this.showNotification('Cart cleared', 'success');
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showNotification('Failed to clear cart', 'error');
            return false;
        }
    }

    openCart() {
        // Dispatch custom event that other parts of the app can listen to
        window.dispatchEvent(new CustomEvent('openCart', { detail: { items: this.cartItems } }));
        // Also open the drawer directly
        this.openCartDrawer(this.cartItems);
    }

    // ----------------------
    // Drawer UI for shopping cart
    // ----------------------
    ensureCartDrawer() {
        let drawer = document.querySelector('.Shopping-cart');
        if (!drawer) {
            drawer = document.createElement('aside');
            drawer.className = 'Shopping-cart';
            drawer.innerHTML = `
                <button class="cart-close" aria-label="Close">&times;</button>
                <div class="cart-contents"><div class="empty">Your cart is empty</div></div>
            `;
            document.body.appendChild(drawer);
        }

        // Ensure close button
        const closeBtn = drawer.querySelector('.cart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCartDrawer());
        }

        // Listen for global close event
        document.addEventListener('closeCartDrawer', () => this.closeCartDrawer());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeCartDrawer();
        });

        return drawer;
    }

    renderCartDrawer(items = []) {
        const drawer = this.ensureCartDrawer();
        const contents = drawer.querySelector('.cart-contents');
        if (!contents) return;

        if (!items || items.length === 0) {
            contents.innerHTML = '<div class="empty">Your cart is empty</div>';
            return;
        }

        const html = items.map(item => `
            <div class="card">
                <img src="${item.thumbnail || ''}" alt="${(item.name||'').replace(/"/g,'')}">
                <div class="text">
                    <h3>${item.name}</h3>
                    <div class="price">${item.price} x ${item.quantity}</div>
                </div>
            </div>
        `).join('');

        contents.innerHTML = html + `
            <div class="total-box">Total: ${this.getCartTotal().toFixed(2)}</div>
        `;
    }

    openCartDrawer(items = []) {
        const drawer = this.ensureCartDrawer();

        // Position based on language direction
        if (document.body.dir === 'rtl') {
            // Ensure the drawer sits on the left for RTL and keep right:0 for stability
            drawer.style.left = '0';
            drawer.style.right = '0';
            drawer.classList.remove('open');
            drawer.classList.add('left');
            // Start off-screen on the left then slide in
            drawer.style.transform = 'translateX(-100%)';
            setTimeout(() => drawer.style.transform = 'translateX(0)', 10);
        } else {
            drawer.style.right = '0';
            drawer.style.left = 'auto';
            drawer.classList.remove('left');
            // Start off-screen on the right then slide in
            drawer.style.transform = 'translateX(100%)';
            setTimeout(() => drawer.style.transform = 'translateX(0)', 10);
        }

        // Render contents and show overlay
        this.renderCartDrawer(items);
        const overlay = document.getElementById('drawer-overlay') || (() => {
            const ov = document.createElement('div'); ov.id = 'drawer-overlay'; ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99990;'; document.body.appendChild(ov); ov.addEventListener('click', () => this.closeCartDrawer()); return ov;
        })();
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Emit event for listeners
        window.dispatchEvent(new CustomEvent('cart:drawer:opened', { detail: { items } }));
    }

    closeCartDrawer() {
        const drawer = document.querySelector('.Shopping-cart');
        if (!drawer) return;
        // Hide overlay
        const overlay = document.getElementById('drawer-overlay');
        if (overlay) overlay.style.display = 'none';
        // Slide out based on dir
        if (document.body.dir === 'rtl') {
            drawer.style.transform = 'translateX(-100%)';
        } else {
            drawer.style.transform = 'translateX(100%)';
        }
        document.body.style.overflow = 'auto';
        window.dispatchEvent(new CustomEvent('cart:drawer:closed'));
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            z-index: 9999;
            animation: slideIn 0.3s ease-in-out;
        `;

        document.body.appendChild(notification);

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        if (!document.querySelector('style[data-notification]')) {
            style.setAttribute('data-notification', 'true');
            document.head.appendChild(style);
        }

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-in-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Create global cart manager instance
export const cartManager = new CartManager();

// Export the CartManager class
export { CartManager };

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Cart manager is already initialized
});
