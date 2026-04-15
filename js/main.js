/**
 * ArtisanConnect - Main JavaScript
 * Shared functionality across all pages
 */

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  const titleMap = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  };

  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type]}</div>
    <div class="toast-content">
      <div class="toast-title">${titleMap[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

function updateNavForAuth() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const root = getSiteRootPrefix();
  // On public headers: show Sign In / Get Started ONLY when logged out.
  // Once logged in, hide these actions (until logout).
  if (isLoggedIn()) {
    navActions.innerHTML = `<a href="${root}pages/dashboard.html" class="btn btn-ghost">Back to Dashboard</a>`;
  } else {
    navActions.innerHTML = `
      <a href="${root}pages/login.html" class="btn btn-ghost">Sign In</a>
      <a href="${root}pages/login.html?register=true" class="btn btn-primary">Get Started</a>
    `;
  }

  // Remove "Messages" from public navbars (keep it on authenticated dashboard screens)
  const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
  const isDashboardArea =
    path.includes('/pages/dashboard.html') ||
    path.includes('/pages/messages.html') ||
    path.includes('/pages/orders.html') ||
    path.includes('/pages/track-order.html') ||
    path.includes('/pages/order-history.html') ||
    path.includes('/pages/favourites.html') ||
    path.includes('/pages/profile.html') ||
    path.includes('/pages/settings.html');

  if (!isDashboardArea) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(a => {
      if ((a.textContent || '').trim().toLowerCase() === 'messages') {
        a.closest('li')?.remove();
      }
    });
  }
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================

function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });
}

// ============================================
// MODAL SYSTEM
// ============================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
function initModals() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

// ============================================
// FORM VALIDATION
// ============================================

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

function showFieldError(input, message) {
  input.classList.add('error');
  
  // Remove existing error message
  const existingError = input.parentElement.querySelector('.field-error');
  if (existingError) existingError.remove();
  
  // Add error message
  const error = document.createElement('span');
  error.className = 'field-error';
  error.style.cssText = 'color: var(--error); font-size: 0.75rem; margin-top: 4px; display: block;';
  error.textContent = message;
  input.parentElement.appendChild(error);
}

function clearFieldError(input) {
  input.classList.remove('error');
  const error = input.parentElement.querySelector('.field-error');
  if (error) error.remove();
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function setStorage(key, value, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  storage.setItem(key, JSON.stringify(value));
}

function getStorage(key, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  const item = storage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function removeStorage(key, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  storage.removeItem(key);
}

function clearAuthStorage() {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('postAuthRedirect');
    sessionStorage.removeItem('postAuthAction');
  } catch (e) {
    // ignore storage errors (private mode / blocked)
  }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

function isLoggedIn() {
  return !!getStorage('user');
}

function getCurrentUser() {
  return getStorage('user');
}

function logout() {
  clearAuthStorage();
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = '../index.html';
  }, 1000);
}

function getSiteRootPrefix() {
  // Pages live at /pages/*.html. From /pages/* we need "../", from root we need "".
  const path = window.location.pathname.replace(/\\/g, '/');
  return path.includes('/pages/') ? '../' : '';
}

function ensureAuthModal() {
  if (document.getElementById('authGateModal')) return;

  const root = getSiteRootPrefix();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'authGateModal';
  modal.innerHTML = `
    <div class="modal modal-md">
      <button class="modal-close" onclick="closeModal('authGateModal')" aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="modal-header">
        <h3 class="modal-title" id="authGateTitle">Sign in to continue</h3>
        <p class="modal-subtitle" id="authGateSubtitle">Create an account in seconds to hire verified artisans.</p>
      </div>

      <div class="modal-body">
        <div class="auth-gate-tabs">
          <button class="auth-gate-tab active" id="authGateTabLogin" type="button">Sign In</button>
          <button class="auth-gate-tab" id="authGateTabSignup" type="button">Sign Up</button>
        </div>

        <div class="auth-gate-error" id="authGateError" style="display:none;"></div>

        <form id="authGateLoginForm" class="auth-gate-form">
          <div class="input-group">
            <label>Email</label>
            <input id="authGateLoginEmail" type="email" placeholder="you@example.com" autocomplete="email" required>
          </div>
          <div class="input-group">
            <label>Password</label>
            <input id="authGateLoginPassword" type="password" placeholder="Your password" autocomplete="current-password" required>
          </div>
          <button class="btn btn-primary btn-full" type="submit">Sign In</button>
          <div class="auth-gate-alt">
            Prefer the full page? <a href="${root}pages/login.html" id="authGateFullLoginLink">Open login</a>
          </div>
        </form>

        <form id="authGateSignupForm" class="auth-gate-form" style="display:none;">
          <div class="grid-2">
            <div class="input-group">
              <label>First name</label>
              <input id="authGateFirstName" type="text" placeholder="First name" autocomplete="given-name" required>
            </div>
            <div class="input-group">
              <label>Last name</label>
              <input id="authGateLastName" type="text" placeholder="Last name" autocomplete="family-name" required>
            </div>
          </div>
          <div class="input-group">
            <label>Email</label>
            <input id="authGateSignupEmail" type="email" placeholder="you@example.com" autocomplete="email" required>
          </div>
          <div class="input-group">
            <label>Password</label>
            <input id="authGateSignupPassword" type="password" placeholder="Create a password" autocomplete="new-password" minlength="8" required>
          </div>
          <button class="btn btn-primary btn-full" type="submit">Create account</button>
          <div class="auth-gate-alt">
            Prefer the full page? <a href="${root}pages/login.html?register=true" id="authGateFullSignupLink">Open sign up</a>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Minimal styles (keeps glassmorphism + responsive)
  const style = document.createElement('style');
  style.textContent = `
    .modal.modal-md{width:min(520px,calc(100vw - 32px));}
    .modal-header{margin-bottom:var(--space-md);}
    .modal-subtitle{margin:8px 0 0;color:var(--text-secondary);font-size:.95rem;line-height:1.4;}
    .auth-gate-tabs{display:flex;gap:8px;margin-bottom:var(--space-md);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:6px;}
    .auth-gate-tab{flex:1;border:0;background:transparent;color:var(--text-secondary);padding:10px 12px;border-radius:12px;font-weight:600;cursor:pointer;transition:all .2s ease;}
    .auth-gate-tab.active{background:rgba(255,255,255,.12);color:var(--text);box-shadow:0 10px 30px rgba(0,0,0,.12);}
    .auth-gate-error{margin-bottom:var(--space-md);padding:10px 12px;border-radius:12px;background:rgba(255,59,48,.10);border:1px solid rgba(255,59,48,.25);color:var(--text);font-size:.9rem;}
    .auth-gate-form .input-group{display:flex;flex-direction:column;gap:6px;margin-bottom:var(--space-md);}
    .auth-gate-form label{font-size:.85rem;color:var(--text-secondary);font-weight:600;}
    .auth-gate-form input{width:100%;}
    .auth-gate-alt{margin-top:10px;color:var(--text-secondary);font-size:.85rem;}
    .auth-gate-alt a{color:var(--primary);text-decoration:none;}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    @media (max-width:480px){.grid-2{grid-template-columns:1fr;}}
  `;
  document.head.appendChild(style);

  const tabLogin = modal.querySelector('#authGateTabLogin');
  const tabSignup = modal.querySelector('#authGateTabSignup');
  const loginForm = modal.querySelector('#authGateLoginForm');
  const signupForm = modal.querySelector('#authGateSignupForm');
  const errorEl = modal.querySelector('#authGateError');

  function setMode(mode) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    if (mode === 'signup') {
      tabLogin.classList.remove('active');
      tabSignup.classList.add('active');
      loginForm.style.display = 'none';
      signupForm.style.display = 'block';
    } else {
      tabSignup.classList.remove('active');
      tabLogin.classList.add('active');
      signupForm.style.display = 'none';
      loginForm.style.display = 'block';
    }
  }

  tabLogin.addEventListener('click', () => setMode('login'));
  tabSignup.addEventListener('click', () => setMode('signup'));

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = modal.querySelector('#authGateLoginEmail').value.trim();
    const password = modal.querySelector('#authGateLoginPassword').value;
    if (!email || !validateEmail(email) || !password) {
      errorEl.textContent = 'Please enter a valid email and password.';
      errorEl.style.display = 'block';
      return;
    }
    const user = {
      id: 'u-' + Date.now(),
      email,
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    };
    setStorage('user', user);
    setStorage('token', 'mock-jwt-' + Date.now());
    closeModal('authGateModal');
    showToast('Signed in successfully', 'success');
    runPostAuthActionOrRedirect();
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = modal.querySelector('#authGateFirstName').value.trim();
    const lastName = modal.querySelector('#authGateLastName').value.trim();
    const email = modal.querySelector('#authGateSignupEmail').value.trim();
    const password = modal.querySelector('#authGateSignupPassword').value;
    if (!firstName || !lastName || !email || !validateEmail(email) || !password || password.length < 8) {
      errorEl.textContent = 'Please complete all fields. Password must be at least 8 characters.';
      errorEl.style.display = 'block';
      return;
    }
    const user = {
      id: 'u-' + Date.now(),
      email,
      firstName,
      lastName,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    };
    setStorage('user', user);
    setStorage('token', 'mock-jwt-' + Date.now());
    closeModal('authGateModal');
    showToast('Account created', 'success');
    runPostAuthActionOrRedirect();
  });
}

function setPostAuthRedirect(url) {
  try {
    sessionStorage.setItem('postAuthRedirect', url);
  } catch (e) {
    // ignore
  }
}

function setPostAuthAction(action, payload = {}) {
  try {
    sessionStorage.setItem('postAuthAction', JSON.stringify({ action, payload }));
  } catch (e) {
    // ignore
  }
}

function takePostAuthAction() {
  try {
    const raw = sessionStorage.getItem('postAuthAction');
    if (!raw) return null;
    sessionStorage.removeItem('postAuthAction');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function takePostAuthRedirect() {
  try {
    const url = sessionStorage.getItem('postAuthRedirect');
    sessionStorage.removeItem('postAuthRedirect');
    return url;
  } catch (e) {
    return null;
  }
}

function runPostAuthActionOrRedirect() {
  const nextAction = takePostAuthAction();
  if (nextAction?.action === 'hire') {
    const { artisanId, artisanName } = nextAction.payload || {};
    showToast(`Request sent${artisanName ? ` to ${artisanName}` : ''}!`, 'success');
    return;
  }
  const nextUrl = takePostAuthRedirect();
  if (nextUrl) {
    window.location.href = nextUrl;
    return;
  }
}

function requireAuth({ mode = 'login', redirectTo = null, action = null, payload = null } = {}) {
  if (isLoggedIn()) return true;
  ensureAuthModal();
  if (redirectTo) setPostAuthRedirect(redirectTo);
  if (action) setPostAuthAction(action, payload || {});
  openModal('authGateModal');
  // set initial tab
  const tabSignup = document.getElementById('authGateTabSignup');
  const tabLogin = document.getElementById('authGateTabLogin');
  if (mode === 'signup') tabSignup?.click();
  else tabLogin?.click();
  return false;
}

function initHireGuards() {
  // Any element with [data-auth="hire"] will be guarded.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-auth="hire"]');
    if (!el) return;

    // allow normal behavior when logged in
    if (isLoggedIn()) {
      // If it's a link with an href, let navigation happen (consistent flow to checkout/profile pages).
      if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') {
        return;
      }
      e.preventDefault();
      const name = el.getAttribute('data-artisan-name') || '';
      showToast(`Request sent${name ? ` to ${name}` : ''}!`, 'success');
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const artisanId = el.getAttribute('data-artisan-id');
    const artisanName = el.getAttribute('data-artisan-name');
    requireAuth({
      mode: 'login',
      action: 'hire',
      payload: { artisanId, artisanName }
    });
  });
}

function initProtectedPageGuard() {
  const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
  const protectedPages = [
    '/pages/dashboard.html',
    '/pages/messages.html',
    '/pages/payment.html',
    '/pages/hire-step-1.html',
    '/pages/hire-step-2.html',
    '/pages/hire-step-3.html',
    '/pages/hire-summary.html',
    '/pages/hire-payment.html',
    '/pages/tracking.html',
    '/pages/orders.html',
    '/pages/track-order.html',
    '/pages/order-history.html',
    '/pages/favourites.html',
    '/pages/profile.html',
    '/pages/settings.html'
  ];

  const isProtected = protectedPages.some(p => path.endsWith(p));
  if (!isProtected) return;

  if (!isLoggedIn()) {
    const root = getSiteRootPrefix();
    setPostAuthRedirect(window.location.href);
    window.location.href = `${root}pages/login.html`;
  }
}

// ============================================
// ANIMATION HELPERS
// ============================================

function animateOnScroll() {
  const elements = document.querySelectorAll('[data-animate]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const animation = entry.target.dataset.animate;
        entry.target.classList.add(`animate-${animation}`);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `₦${amount}`;
  // Use a simple Naira display (consistent with UI mock data).
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDate(date, options = {}) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  });
}

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// ============================================
// RIPPLE EFFECT FOR BUTTONS
// ============================================

function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.btn');
    if (!button) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
}

// Add ripple animation keyframes
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initProtectedPageGuard();
  initNavbar();
  initMobileMenu();
  initModals();
  animateOnScroll();
  initRippleEffect();
  updateNavForAuth();
  initHireGuards();
});
