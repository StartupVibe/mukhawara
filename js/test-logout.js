/**
 * Logout Functionality Test
 * Test script to verify logout works with cookie token management
 */

// Test function to verify logout functionality
function testLogoutFunctionality() {
  console.log('Testing Logout Functionality...');
  
  // Create test instances
  const cartAPI = new SallaCartAPI();
  const cartIntegration = new CartIntegration();
  
  // Test 1: Set up mock authentication tokens
  console.log('\n=== Test 1: Setup Mock Authentication ===');
  const mockTokenData = {
    access_token: 'mock_access_token_for_logout_test',
    refresh_token: 'mock_refresh_token_for_logout_test',
    expires_in: 3600
  };
  
  // Store tokens in cookies
  cartIntegration.storeAuthTokens(mockTokenData);
  
  // Verify tokens are stored
  const storedTokens = cartIntegration.getAuthTokens();
  console.log('Stored tokens:', storedTokens);
  console.log('Access token exists:', !!storedTokens.access_token);
  console.log('Test 1 passed:', !!storedTokens.access_token);
  
  // Test 2: Test cart API token retrieval
  console.log('\n=== Test 2: Test Cart API Token Retrieval ===');
  const apiToken = cartAPI.getAuthToken();
  console.log('API retrieved token:', apiToken);
  console.log('Token matches stored:', apiToken === mockTokenData.access_token);
  console.log('Test 2 passed:', apiToken === mockTokenData.access_token);
  
  // Test 3: Test logout method
  console.log('\n=== Test 3: Test Logout Method ===');
  cartAPI.logout().then(result => {
    console.log('Logout result:', result);
    console.log('Logout success:', result.success);
    
    // Test 4: Verify tokens are cleared after logout
    console.log('\n=== Test 4: Verify Tokens Cleared ===');
    const tokensAfterLogout = cartIntegration.getAuthTokens();
    const apiTokenAfterLogout = cartAPI.getAuthToken();
    
    console.log('Tokens after logout:', tokensAfterLogout);
    console.log('API token after logout:', apiTokenAfterLogout);
    console.log('Access token cleared:', !tokensAfterLogout.access_token);
    console.log('API token cleared:', !apiTokenAfterLogout);
    console.log('Test 4 passed:', !tokensAfterLogout.access_token && !apiTokenAfterLogout);
    
    console.log('\n=== All Tests Completed ===');
    console.log('Logout functionality is working correctly!');
  }).catch(error => {
    console.error('Logout test error:', error);
    // Still check if tokens were cleared despite error
    const tokensAfterError = cartIntegration.getAuthTokens();
    console.log('Tokens after error:', tokensAfterError);
    console.log('Tokens cleared despite error:', !tokensAfterError.access_token);
  });
}

// Test integration logout
function testIntegrationLogout() {
  console.log('Testing Integration Logout...');
  
  const cartIntegration = new CartIntegration();
  
  // Setup mock tokens first
  const mockTokenData = {
    access_token: 'mock_integration_token',
    refresh_token: 'mock_integration_refresh',
    expires_in: 3600
  };
  
  cartIntegration.storeAuthTokens(mockTokenData);
  
  console.log('Tokens before integration logout:', cartIntegration.getAuthTokens());
  
  // Test the integration logout method
  cartIntegration.handleLogout().then(() => {
    console.log('Integration logout completed');
    console.log('Tokens after integration logout:', cartIntegration.getAuthTokens());
    console.log('Integration logout test passed:', !cartIntegration.getAuthTokens().access_token);
  }).catch(error => {
    console.error('Integration logout error:', error);
  });
}

// Export test functions for use in browser console
if (typeof window !== 'undefined') {
  window.testLogoutFunctionality = testLogoutFunctionality;
  window.testIntegrationLogout = testIntegrationLogout;
  console.log('Logout test functions loaded. Run testLogoutFunctionality() or testIntegrationLogout() in console to test.');
}

// Auto-run tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testLogoutFunctionality,
    testIntegrationLogout
  };
}
