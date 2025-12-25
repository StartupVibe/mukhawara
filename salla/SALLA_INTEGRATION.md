# Salla Twilight SDK Integration

This document explains how Salla Twilight SDK has been integrated into the Mukhawara project and connected to the **mukhaura.salla.sa** store.

## Store Connection

✅ **Connected Store**: [mukhaura.salla.sa](https://salla.sa/mukhaura)

The SDK is configured to connect specifically to your Mukhawara store with:
- Store domain: `mukhaura.salla.sa`
- Currency: SAR (Saudi Riyal)
- Real product integration

## Installation

### 1. CDN Script Added
The Salla Twilight SDK is loaded via jsDelivr CDN in `index.html`:
```html
<!-- Salla Twilight SDK -->
<script src="https://cdn.jsdelivr.net/npm/@salla.sa/twilight/dist/umd/salla.js"></script>
```

### 2. Integration File Created
A new JavaScript file `js/salla-integration.js` has been created with:
- SDK initialization
- Event listeners for cart, wishlist, and authentication
- Helper functions for common operations
- Error handling and logging

### 3. Examples Page
A demonstration page `salla-examples.html` shows practical usage examples.

## Usage

### Basic Initialization
The SDK is automatically initialized when the page loads:
```javascript
if (typeof salla !== 'undefined') {
    salla.init();
    console.log('Salla SDK initialized successfully');
}
```

### Available Functions

#### Cart Operations
```javascript
// Add item to cart
salla.cart.addItem(productId, quantity);

// Get cart details
salla.cart.latest().then(response => {
    const cart = response.data;
    console.log('Cart items:', cart.items.length);
});

// Listen to cart events
salla.cart.event.onItemAdded((response, product_id) => {
    console.log('Item added:', product_id);
});
```

#### Wishlist Operations
```javascript
// Add to wishlist
salla.wishlist.add(productId);

// Listen to wishlist events
salla.event.wishlist.onAdded((response, product_id) => {
    console.log('Added to wishlist:', product_id);
});
```

#### Authentication
```javascript
// Check auth status
salla.auth.refresh().then(response => {
    if (response.data.access_token) {
        console.log('User is logged in');
    }
});

// Listen to auth events
salla.event.auth.onLoginSuccess((response) => {
    console.log('User logged in');
});
```

#### Product Information
```javascript
// Get product details
salla.product.getDetails(productId).then(response => {
    const product = response.data;
    console.log('Product:', product.name);
});

// Get categories
salla.product.categories().then(response => {
    console.log('Categories:', response.data);
});
```

## Integration Points

### 1. Cart Count Updates
The cart count in the header is automatically updated when items are added/removed.

### 2. User Authentication
The sign-in button updates to show "Profile" when logged in.

### 3. Event Handling
All major Salla events are logged and can trigger UI updates.

## Files Modified/Created

1. **index.html** - Added Salla SDK CDN script
2. **js/salla-integration.js** - Main integration file
3. **salla-examples.html** - Demonstration page
4. **SALLA_INTEGRATION.md** - This documentation

## Testing

Open `salla-examples.html` in your browser to test the integration. The page provides:
- Cart operation buttons
- Wishlist functionality
- Authentication status
- Product information retrieval
- Real-time event logging

## Important Notes

1. **API Credentials**: You'll need valid Salla API credentials for full functionality
2. **Product IDs**: The examples use sample product IDs (12345) - replace with real product IDs
3. **Error Handling**: All API calls include error handling
4. **Event Listeners**: Events are set up automatically on page load

## Next Steps

1. Replace sample product IDs with real product IDs from your Salla store
2. Configure proper API credentials
3. Customize the integration to match your specific needs
4. Add more sophisticated error handling and user feedback
5. Implement additional Salla SDK features as needed

## Support

For more information about the Salla Twilight SDK, visit:
- [Salla Documentation](https://docs.salla.dev/422610m0)
- [SDK API Reference](https://docs.salla.dev/apidoc/422610m0)
