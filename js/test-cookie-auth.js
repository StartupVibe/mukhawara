/**
 * Cookie Token Management Test
 * Test script to verify cookie-based authentication functionality
 */

// Test function to verify cookie operations
function testCookieTokenManagement() {
  console.log('Testing Cookie Token Management...');
  
  // Create a test cart integration instance
  const cartIntegration = new CartIntegration();
  
  // Test 1: Set and get cookies
  console.log('\n=== Test 1: Set and Get Cookies ===');
  cartIntegration.setCookie('test_cookie', 'test_value', 1);
  const retrievedValue = cartIntegration.getCookie('test_cookie');
  console.log('Set cookie value: test_value');
  console.log('Retrieved cookie value:', retrievedValue);
  console.log('Test 1 passed:', retrievedValue === 'test_value');
  
  // Test 2: Store and retrieve auth tokens
  console.log('\n=== Test 2: Store and Retrieve Auth Tokens ===');
  const mockTokenData = {
    access_token: 'mock_access_token_12345',
    refresh_token: 'mock_refresh_token_67890',
    expires_in: 3600
  };
  
  cartIntegration.storeAuthTokens(mockTokenData);
  const retrievedTokens = cartIntegration.getAuthTokens();
  
  console.log('Stored tokens:', mockTokenData);
  console.log('Retrieved tokens:', retrievedTokens);
  console.log('Access token matches:', retrievedTokens.access_token === mockTokenData.access_token);
  console.log('Refresh token matches:', retrievedTokens.refresh_token === mockTokenData.refresh_token);
  console.log('Test 2 passed:', 
    retrievedTokens.access_token === mockTokenData.access_token &&
    retrievedTokens.refresh_token === mockTokenData.refresh_token
  );
  
  // Test 3: Check authentication status
  console.log('\n=== Test 3: Check Authentication Status ===');
  const isAuthenticated = cartIntegration.isAuthenticatedViaCookies();
  console.log('Is authenticated via cookies:', isAuthenticated);
  console.log('Test 3 passed:', isAuthenticated === true);
  
  // Test 4: Clear tokens
  console.log('\n=== Test 4: Clear Auth Tokens ===');
  cartIntegration.clearAuthTokens();
  const tokensAfterClear = cartIntegration.getAuthTokens();
  const isAuthAfterClear = cartIntegration.isAuthenticatedViaCookies();
  
  console.log('Tokens after clear:', tokensAfterClear);
  console.log('Is authenticated after clear:', isAuthAfterClear);
  console.log('Test 4 passed:', 
    !tokensAfterClear.access_token && 
    !tokensAfterClear.refresh_token && 
    isAuthAfterClear === false
  );
  
  // Test 5: Clean up test cookie
  console.log('\n=== Test 5: Clean Up ===');
  cartIntegration.deleteCookie('test_cookie');
  const testCookieAfterDelete = cartIntegration.getCookie('test_cookie');
  console.log('Test cookie after delete:', testCookieAfterDelete);
  console.log('Test 5 passed:', testCookieAfterDelete === null);
  
  console.log('\n=== All Tests Completed ===');
  console.log('Cookie token management functionality is working correctly!');
}

// Export test function for use in browser console
if (typeof window !== 'undefined') {
  window.testCookieTokenManagement = testCookieTokenManagement;
  console.log('Test function loaded. Run testCookieTokenManagement() in console to test.');
}

// Auto-run test if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testCookieTokenManagement;
}
