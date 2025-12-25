# Salla Product API - Complete Implementation

Complete implementation of all Salla Product APIs based on [Salla Documentation](https://docs.salla.dev/849354f0).

## Files

- **`product-api.js`** - Main API class with all product endpoints
- **`index.html`** - Demo page to test all APIs

## Available APIs

### 1. Get Price
Get the price of a product by ID.

```javascript
const productAPI = getSallaProductAPI();
const result = await productAPI.getPrice(productId);
```

### 2. Product Availability
Subscribe to product availability notifications.

```javascript
await productAPI.subscribeToAvailability(productId, email);
```

### 3. Get Category Products
List all products within a given category.

```javascript
await productAPI.getCategoryProducts(categoryId, {
  page: 1,
  limit: 20
});
```

### 4. Get Offer Details
Fetch offered items related to the product.

```javascript
await productAPI.getOfferDetails(productId);
```

### 5. Search Products
Search products by keywords or phrases.

```javascript
await productAPI.searchProducts('cotton fabric', {
  page: 1,
  limit: 20,
  sort: 'relevance'
});
```

### 6. Get Gift Details
Get details of a gifted product.

```javascript
await productAPI.getGiftDetails(giftId);
```

### 7. Add Gift To Cart
Add a gifted product to the shopping cart.

```javascript
await productAPI.addGiftToCart(giftId);
```

### 8. Upload Gift Image
Upload a product image associated with the gifted product.

```javascript
const imageFile = document.getElementById('fileInput').files[0];
await productAPI.uploadGiftImage(giftId, imageFile);
```

### 9. Get Product Details
Get detailed information about a particular product.

```javascript
await productAPI.getProductDetails(productId, {
  include: 'reviews,ratings,categories'
});
```

### 10. Fetch Products
Fetch product lists from a Merchant Store.

```javascript
await productAPI.fetchProducts({
  source: 'latest', // or 'featured', 'popular'
  page: 1,
  limit: 20,
  sort: 'created_at'
});
```

### 11. Fetch Options
Fetch related data (reviews, ratings, categories, etc.).

```javascript
await productAPI.fetchOptions(productId, {
  include: ['reviews', 'ratings', 'categories', 'related']
});
```

### 12. Get Size Guide
Fetch the size guide for a specific product.

```javascript
await productAPI.getSizeGuide(productId);
```

## Helper Methods

### Get Latest Products
```javascript
await productAPI.getLatestProducts(limit);
```

### Get Featured Products
```javascript
await productAPI.getFeaturedProducts(limit);
```

### Get Popular Products
```javascript
await productAPI.getPopularProducts(limit);
```

### Get Multiple Products
```javascript
await productAPI.getMultipleProducts([productId1, productId2, productId3]);
```

### Get Products By Category
```javascript
await productAPI.getProductsByCategory(categoryId, page, limit);
```

## Usage Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.salla.network/js/twilight/latest/twilight.js"></script>
  <script src="product-api.js"></script>
</head>
<body>
  <script>
    // Initialize Salla SDK
    salla.init({
      debug: true,
      language_code: 'ar',
      store: {
        id: 229278595,
        url: 'https://api.salla.dev/store/v1'
      }
    });

    // Get Product API instance
    const productAPI = getSallaProductAPI();

    // Use any API method
    async function loadProducts() {
      try {
        const result = await productAPI.getLatestProducts(10);
        console.log('Products:', result.data);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    loadProducts();
  </script>
</body>
</html>
```

## Error Handling

All methods throw errors that can be caught:

```javascript
try {
  const result = await productAPI.getProductDetails(productId);
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Details:', error);
}
```

## Testing

Open `index.html` in your browser to test all APIs with a user-friendly interface.

## Documentation

Full documentation: https://docs.salla.dev/849354f0




