function logEvent(message) {
  const box = document.getElementById('event-log');
  const ts = new Date().toLocaleTimeString();
  const p = document.createElement('p');
  p.innerHTML = `<strong>[${ts}]</strong> ${message}`;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}

function setStatus(html, cls) {
  const el = document.getElementById('auth-status');
  el.className = 'alert ' + cls;
  el.innerHTML = html;
}

async function initSalla() {
  if (typeof salla === 'undefined') {
    // logEvent('Twilight SDK not loaded yet, retrying...');
    setTimeout(initSalla, 500);
    return;
  }

  try {
    salla.init({
      debug: true,
      language_code: 'ar',
      store: {
        id: 229278595,
        url: 'https://api.salla.dev/store/v1'
      }
    });
    // const storeSettings = await getStoreSettings(229278595);
    logEvent('salla.init() called for mukhaura.salla.sa');

    // Attach auth events if available
    if (salla.event && salla.event.auth) {
      if (typeof salla.event.auth.onLoginSuccess === 'function') {
        salla.event.auth.onLoginSuccess((res) => {
          logEvent('onLoginSuccess');
          checkAuthStatus();
        });
      }
      
      if (typeof salla.event.auth.onLogout === 'function') {
        salla.event.auth.onLogout(() => {
          logEvent('onLogout');
          checkAuthStatus();
        });
      }
      
      if (typeof salla.event.auth.onCodeSent === 'function') {
        salla.event.auth.onCodeSent((response) => {
          logEvent('onCodeSent: Verification code sent successfully');
          logEvent('Response: ' + JSON.stringify(response));
        });
      }
      
      if (typeof salla.event.auth.onCodeNotSent === 'function') {
        salla.event.auth.onCodeNotSent((error, type) => {
          logEvent('onCodeNotSent: ' + (error?.message || error) + ' [' + type + ']');
        });
      }
      
      if (typeof salla.event.auth.onRegistered === 'function') {
        salla.event.auth.onRegistered((response) => {
          logEvent('onRegistered: registration completed');
          checkAuthStatus();
        });
      }
      
      if (typeof salla.event.auth.onRegistrationFailed === 'function') {
        salla.event.auth.onRegistrationFailed((errorMessage) => {
          logEvent('onRegistrationFailed: ' + errorMessage);
        });
      }
      
      if (typeof salla.event.auth.onRefreshFailed === 'function') {
        salla.event.auth.onRefreshFailed((response) => {
          logEvent('onRefreshFailed: ' + JSON.stringify(response));
        });
      }
    } else {
      logEvent('salla.event.auth not available - event listeners not attached');
    }

    checkAuthStatus();
  } catch (e) {
    logEvent('init error: ' + e.message);
    setStatus('Init error: ' + e.message, 'alert-danger');
  }
}

async function checkAuthStatus() {
  if (!salla || !salla.auth) {
    setStatus('salla.auth not available', 'alert-danger');
    logEvent('salla.auth not available');
    return;
  }
  setStatus('Checking...', 'alert-info');
  try {
    const res = await salla.auth.refresh();
    if (res?.data?.access_token) {
      setStatus('User is <strong>logged in</strong>', 'alert-success');
      logEvent('User is logged in');
    } else {
      setStatus('User is <strong>not logged in</strong>', 'alert-warning');
      logEvent('User is NOT logged in');
    }
  } catch (e) {
    setStatus('Error: ' + e.message, 'alert-danger');
    logEvent('checkAuthStatus error: ' + e.message);
  }
}

// Demo login: in real usage you normally use Salla built-in forms/components
async function loginDemo() {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }
  logEvent('Calling salla.auth.login() demo');
  try {
    // This will only work if called from a proper Salla storefront context
    await salla.auth.login();
    logEvent('login() promise resolved');
  } catch (e) {
    logEvent('login() error: ' + e.message);
  }
}

// Send verification code first
async function sendVerificationCode() {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }

  const payload = {
    email: 'meidmasoud@gmail.com',
    type: 'email'
  };
  
  logEvent('Sending verification code to email...');
  try {
    const response = await salla.auth.resend(payload);
    logEvent('Verification code sent successfully');
    logEvent('Check your email for the code, then click Verify Code');
  } catch (e) {
    logEvent('sendVerificationCode error: ' + e.message);
    if (e.response?.data?.error?.fields) {
      logEvent('Validation errors: ' + JSON.stringify(e.response.data.error.fields));
    }
  }
}

// Fetch store settings using the Salla Store API
async function getStoreSettings(usernameOrId) {
  const response = await fetch('https://api.salla.dev/store/v1/store/settings', {
    headers: {
      // Accepts store ID, domain, or username (e.g., salla.sa/username)
      store: 'salla.sa/mukhaura'
    }
  });

  return response.json();
}

// Verify the received code - automatically handles registration or authentication
async function verifyCode() {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }

  const code = prompt('Enter verification code received on email:');
  if (!code) {
    logEvent('No verification code provided');
    return;
  }

  const payload = {
    type: 'email',
    code: code,
    email: 'meidmasoud@gmail.com'
  };
  
  logEvent('Verifying code...');
  try {
    const response = await salla.auth.verify(payload);
    const caseType = response?.data?.case || 'unknown';
    
    logEvent('verify() resolved, case: ' + caseType);
    
    // If new_customer, proceed with registration
    if (caseType === 'new_customer') {
      logEvent('New customer detected - proceeding with registration...');
      await registerUser(code);
    } else {
      // Existing customer - already authenticated via verify
      logEvent('Existing customer - authentication successful');
      setStatus('User is <strong>authenticated</strong>', 'alert-success');
      checkAuthStatus();
    }
  } catch (e) {
    logEvent('verify() error: ' + e.message);
    
    if (e.response?.data?.error?.fields) {
      logEvent('Validation errors: ' + JSON.stringify(e.response.data.error.fields));
    }
  }
}

// Register user with verification code
async function registerUser(code) {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }

  // In a real UI you would collect these from a form; here we use sample data
  const payload = {
    first_name: 'Mohammed',
    last_name: 'Ahmed',
    phone: '1093262844',
    country_code: 'EG',
    country_key: '20',
    verified_by: 'email',
    email: 'meidmasoud@gmail.com',
    code: parseInt(code)
  };
  
  logEvent('Calling salla.auth.register() with verification code');
  try {
    const response = await salla.auth.register(payload);
    logEvent('register() resolved, case: ' + (response?.data?.case || 'unknown'));
    setStatus('User <strong>registered and authenticated</strong>', 'alert-success');
    checkAuthStatus();
  } catch (e) {
    logEvent('register() error: ' + e.message);
    logEvent('Error details: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)));
    
    // Check for specific SDK context errors
    if (e.message.includes('blockedByProxy') || e.message.includes('proxy')) {
      logEvent('⚠️ SDK Context Error: This page may need to run within Salla storefront context');
      logEvent('Try accessing this page through your Salla store or check SDK configuration');
    }
    
    // Log detailed error if available
    if (e.response?.data?.error?.fields) {
      logEvent('Validation errors: ' + JSON.stringify(e.response.data.error.fields));
    }
  }
}

// Login using Salla Auth API
async function loginUser() {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }

  const payload = {
    type: 'email',
    email: 'meidmasoud@gmail.com'
  };
  
  logEvent('Calling salla.auth.login() with email...');
  try {
    const response = await salla.auth.login(payload);
    logEvent('login() resolved - verification code sent');
    logEvent('Check your email for the verification code, then click Verify Code');
  } catch (e) {
    logEvent('login() error: ' + e.message);
    if (e.response?.data?.error?.fields) {
      logEvent('Validation errors: ' + JSON.stringify(e.response.data.error.fields));
    }
  }
}

// Demo registration based on docs: https://docs.salla.dev/422610m0 (auth.register)
async function registerDemo() {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }

  // Prompt user for verification code
  const code = prompt('Enter verification code received on email:');
  if (!code) {
    logEvent('No verification code provided');
    return;
  }

  await registerUser(code);
}

async function logoutUser() {
  if (!salla || !salla.auth) {
    logEvent('salla.auth not available');
    return;
  }
  logEvent('Calling salla.auth.logout()');
  try {
    await salla.auth.logout();
    logEvent('logout() done');
    checkAuthStatus();
  } catch (e) {
    logEvent('logout() error: ' + e.message);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSalla);
} else {
  initSalla();
}

