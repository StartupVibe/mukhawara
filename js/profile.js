document.addEventListener('DOMContentLoaded', async () => {
  // Helper to populate UI
  function populate(userState) {
    if (!userState) return;

    const avatar = userState.avatar || (userState.userInfo && userState.userInfo.data && userState.userInfo.data.avatar) || '';
    const name = userState.displayName || (userState.userInfo && userState.userInfo.data && ((userState.userInfo.data.first_name || '') + ' ' + (userState.userInfo.data.last_name || '')).trim()) || 'User';
    const email = (userState.userInfo && userState.userInfo.data && userState.userInfo.data.email) || userState.email || '';
    const phoneData = userState.userInfo && userState.userInfo.data && userState.userInfo.data.phone;
    const phone = phoneData ? `${phoneData.code} ${phoneData.number}` : (userState.phone || '');

    const avatarEl = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const emailEl = document.getElementById('profile-email');
    const phoneEl = document.getElementById('profile-phone');

    if (avatarEl && avatar) avatarEl.src = avatar;
    if (nameEl) nameEl.textContent = name;
    if (roleEl) roleEl.textContent = (window.currentLang === 'ar') ? 'عميل' : 'Customer';
    if (emailEl) emailEl.textContent = email || '-';
    if (phoneEl) phoneEl.textContent = phone || '-';
  }

  // Try to read cached userState
  try {
    const stored = localStorage.getItem('userState');
    if (stored) {
      const parsed = JSON.parse(stored);
      // If cache is still recent, use it
      if (parsed && parsed.lastUpdated && (Date.now() - parsed.lastUpdated) < (30 * 60 * 1000)) {
        populate(parsed);
      } else {
        // stale - try refreshing from API
        if (window.cartIntegration && typeof window.cartIntegration.getCurrentUser === 'function') {
          const remote = await window.cartIntegration.getCurrentUser(true);
          if (remote && remote.success && remote.data) {
            // Build a userState shape similar to stored one
            const newState = {
              isLoggedIn: true,
              userInfo: { data: remote.data },
              displayName: (remote.data.first_name || '') + (remote.data.last_name ? ' ' + remote.data.last_name : ''),
              avatar: remote.data.avatar || '',
              email: remote.data.email || null,
              lastUpdated: Date.now()
            };
            localStorage.setItem('userState', JSON.stringify(newState));
            populate(newState);
          }
        }
      }
    } else if (window.cartIntegration && typeof window.cartIntegration.getCurrentUser === 'function') {
      // No cached state, try fetching
      const remote = await window.cartIntegration.getCurrentUser(true);
      if (remote && remote.success && remote.data) {
        const newState = {
          isLoggedIn: true,
          userInfo: { data: remote.data },
          displayName: (remote.data.first_name || '') + (remote.data.last_name ? ' ' + remote.data.last_name : ''),
          avatar: remote.data.avatar || '',
          email: remote.data.email || null,
          lastUpdated: Date.now()
        };
        localStorage.setItem('userState', JSON.stringify(newState));
        populate(newState);
      }
    }
  } catch (e) {
    console.error('Failed to populate profile from userState:', e);
  }

  // Update UI when userState in localStorage changes (cross-tab) or when app dispatches user:updated
  window.addEventListener('storage', (e) => {
    if (e.key === 'userState') {
      try {
        const parsed = JSON.parse(e.newValue);
        populate(parsed);
      } catch (err) {
        console.warn('Invalid userState in storage event', err);
      }
    }
  });

  document.addEventListener('user:updated', (e) => {
    const newState = e.detail || null;
    if (newState) populate(newState);
  });

});