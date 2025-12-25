# Salla SDK Troubleshooting Guide

## Current Issues & Solutions

### ❌ **Problem**: API calls going to wrong endpoints
**Error**: `GET http://localhost:8000/mukhawara/cart/latest 404 (Not Found)`

**Root Cause**: The Salla Twilight SDK is designed to work **inside Salla store themes**, not as a standalone integration on external websites.

### 🔍 **Understanding Salla SDK Architecture**

The Salla Twilight SDK works in two contexts:

1. **Inside Salla Store Themes** ✅
   - SDK has access to store APIs
   - Pre-configured with store data
   - Full functionality available

2. **External Websites** ❌ (Current setup)
   - No direct API access
   - Needs OAuth authentication
   - Limited functionality

### 🛠️ **Solutions**

#### Option 1: Use Salla REST API (Recommended for external sites)

Instead of the Twilight SDK, use the Salla REST API:

```javascript
// Example: Get cart using REST API
async function getCartData() {
    const response = await fetch('https://api.salla.dev/cart/latest', {
        headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}
```

#### Option 2: Deploy as Salla Theme

Move your code to a Salla theme:
1. Create a Salla developer account
2. Build a custom theme
3. Deploy to your mukhaura store
4. SDK will work fully

#### Option 3: Use Salla Web Components

For basic integration, use Salla web components:
```html
<!-- Add buy button -->
<salla-buy-button product-id="12345"></salla-buy-button>

<!-- Add product display -->
<salla-product-display product-id="12345"></salla-product-display>
```

### 📋 **Current Status**

| Feature | Status | Notes |
|---------|--------|-------|
| SDK Loading | ✅ Working | SDK loads successfully |
| Store Configuration | ⚠️ Limited | Config sets but no effect |
| Cart API | ❌ No Access | 404 errors to localhost |
| Auth API | ❌ No Access | Cannot authenticate |
| Product API | ❌ No Access | Cannot fetch products |

### 🚀 **Next Steps**

1. **For Quick Integration**:
   - Apply for Salla API credentials
   - Use REST API instead of SDK
   - Implement OAuth flow

2. **For Full Integration**:
   - Convert to Salla theme
   - Deploy within Salla platform
   - Use full SDK capabilities

3. **For Hybrid Approach**:
   - Keep your website separate
   - Use Salla for checkout only
   - Redirect to Salla for cart operations

### 🔑 **Required for REST API**

1. **Salla Developer Account**: Register at [salla.partners](https://salla.partners/)
2. **OAuth App**: Create app to get client credentials
3. **Access Token**: Authenticate store to get API access
4. **API Documentation**: [Salla API Docs](https://docs.salla.dev/)

### 💡 **Alternative: Iframe Integration**

Simple solution - embed your Salla store:
```html
<iframe src="https://mukhaura.salla.sa" 
        width="100%" 
        height="600px"
        frameborder="0">
</iframe>
```

---

**Note**: The Twilight SDK is powerful but designed specifically for Salla's ecosystem. For external websites, the REST API approach is more suitable.
