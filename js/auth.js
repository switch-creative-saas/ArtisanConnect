/**
 * ArtisanConnect - Authentication JavaScript
 */

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.querySelector('[data-tab="login"]');
  const registerTab = document.querySelector('[data-tab="register"]');
  const authFooterText = document.getElementById('authFooterText');
  
  if (tab === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    authFooterText.innerHTML = 'Don\'t have an account? <a href="#" onclick="switchTab(\'register\'); return false;">Sign up</a>';
  } else {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    authFooterText.innerHTML = 'Already have an account? <a href="#" onclick="switchTab(\'login\'); return false;">Sign in</a>';
  }
  
  // Clear errors
  clearErrors();
}

// ============================================
// PASSWORD TOGGLE
// ============================================

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

// ============================================
// PASSWORD STRENGTH CHECKER
// ============================================

function checkPasswordStrength() {
  const password = document.getElementById('registerPassword').value;
  const strengthBar = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  const strengthContainer = document.getElementById('passwordStrength');
  
  if (password.length === 0) {
    strengthContainer.style.display = 'none';
    return;
  }
  
  strengthContainer.style.display = 'block';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  // Update UI
  strengthBar.className = 'strength-fill';
  
  if (strength <= 2) {
    strengthBar.classList.add('weak');
    strengthText.textContent = 'Weak password';
    strengthText.style.color = 'var(--error)';
  } else if (strength <= 4) {
    strengthBar.classList.add('medium');
    strengthText.textContent = 'Medium strength';
    strengthText.style.color = 'var(--warning)';
  } else {
    strengthBar.classList.add('strong');
    strengthText.textContent = 'Strong password';
    strengthText.style.color = 'var(--success)';
  }
}

// ============================================
// FORM VALIDATION
// ============================================

function validateLoginForm() {
  const email = document.getElementById('loginEmail');
  const password = document.getElementById('loginPassword');
  let isValid = true;
  
  clearErrors();
  
  if (!email.value.trim()) {
    showError('loginError', 'Please enter your email address');
    isValid = false;
  } else if (!validateEmail(email.value)) {
    showError('loginError', 'Please enter a valid email address');
    isValid = false;
  }
  
  if (!password.value) {
    showError('loginError', 'Please enter your password');
    isValid = false;
  }
  
  return isValid;
}

function validateRegisterForm() {
  const firstName = document.getElementById('registerFirstName');
  const lastName = document.getElementById('registerLastName');
  const email = document.getElementById('registerEmail');
  const password = document.getElementById('registerPassword');
  const confirmPassword = document.getElementById('registerConfirmPassword');
  const agreeTerms = document.getElementById('agreeTerms');
  
  let isValid = true;
  
  clearErrors();
  
  if (!firstName.value.trim()) {
    showError('registerError', 'Please enter your first name');
    isValid = false;
  } else if (!lastName.value.trim()) {
    showError('registerError', 'Please enter your last name');
    isValid = false;
  } else if (!email.value.trim()) {
    showError('registerError', 'Please enter your email address');
    isValid = false;
  } else if (!validateEmail(email.value)) {
    showError('registerError', 'Please enter a valid email address');
    isValid = false;
  } else if (!password.value) {
    showError('registerError', 'Please create a password');
    isValid = false;
  } else if (password.value.length < 8) {
    showError('registerError', 'Password must be at least 8 characters');
    isValid = false;
  } else if (password.value !== confirmPassword.value) {
    showError('registerError', 'Passwords do not match');
    isValid = false;
  } else if (!agreeTerms.checked) {
    showError('registerError', 'Please agree to the Terms of Service');
    isValid = false;
  }
  
  return isValid;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = 'flex';
}

function clearErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================
// LOGIN HANDLER
// ============================================

function handleLogin(event) {
  event.preventDefault();
  
  if (!validateLoginForm()) return;
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const submitBtn = document.getElementById('loginSubmit');
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loader loader-sm"></span> Signing in...';

  const root = typeof getSiteRootPrefix === 'function'
    ? getSiteRootPrefix()
    : (window.location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '');

  const normalizeBackendUser = (u) => {
    if (!u) return null;
    if (u.firstName || u.lastName) return u;
    const fullName = String(u.name || '').trim();
    const parts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
    const firstName = parts[0] || 'User';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    return {
      id: u.id,
      email: u.email || null,
      firstName,
      lastName,
      avatar: u.avatar || u.avatar_url || null,
      name: fullName || (u.email ? u.email : 'User')
    };
  };

  (async () => {
    try {
      const apiBase = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : `${root}backend/api`;
      const res = await fetch(`${apiBase}/auth/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }).toString()
      });

      if (!res.ok) {
        let err = null;
        try { err = await res.json(); } catch (e) {}
        const details = err?.error ? `: ${err.error}` : '';
        showError('loginError', `Login failed${details}.`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        return;
      }

      const data = await res.json();
      const user = normalizeBackendUser(data?.user);
      if (!user) {
        showError('loginError', 'Login failed. Invalid server response.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        return;
      }

      // Store user data
      setStorage('user', user, !rememberMe);
      
      // Show success state
      showSuccessState('Welcome Back!', 'Redirecting you to your dashboard...');
      
      // Redirect to dashboard
      setTimeout(() => {
        try {
          const next = sessionStorage.getItem('postAuthRedirect');
          if (next) {
            sessionStorage.removeItem('postAuthRedirect');
            window.location.href = next;
            return;
          }
        } catch (e) {}
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (e) {
      console.error('Login fetch failed:', e);
      showError('loginError', `Network error. ${e?.message ? e.message : 'Please try again.'}`);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  })();
}

// ============================================
// REGISTER HANDLER
// ============================================

function handleRegister(event) {
  event.preventDefault();
  
  if (!validateRegisterForm()) return;
  
  const firstName = document.getElementById('registerFirstName').value;
  const lastName = document.getElementById('registerLastName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const submitBtn = document.getElementById('registerSubmit');
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loader loader-sm"></span> Creating account...';

  const root = typeof getSiteRootPrefix === 'function'
    ? getSiteRootPrefix()
    : (window.location.pathname.replace(/\\/g, '/').includes('/pages/') ? '../' : '');

  const normalizeBackendUser = (u) => {
    if (!u) return null;
    if (u.firstName || u.lastName) return u;
    const fullName = String(u.name || '').trim();
    const parts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
    const f = parts[0] || 'User';
    const l = parts.length > 1 ? parts.slice(1).join(' ') : '';
    return {
      id: u.id,
      email: u.email || null,
      firstName: f,
      lastName: l,
      avatar: u.avatar || u.avatar_url || null,
      name: fullName || (u.email ? u.email : 'User')
    };
  };

  (async () => {
    try {
      const apiBase = typeof getApiBaseUrl === 'function' ? getApiBaseUrl() : `${root}backend/api`;
      const res = await fetch(`${apiBase}/auth/register.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password
        }).toString()
      });

      if (!res.ok) {
        let err = null;
        try { err = await res.json(); } catch (e) {}
        const details = err?.error ? `: ${err.error}` : '';
        showError('registerError', `Sign up failed${details}.`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        return;
      }

      const data = await res.json();
      const user = normalizeBackendUser(data?.user);
      if (!user) {
        showError('registerError', 'Sign up failed. Invalid server response.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        return;
      }

      // Store user data
      setStorage('user', user);
      
      // Show success state
      showSuccessState('Account Created!', 'Welcome to ArtisanConnect. Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        try {
          const next = sessionStorage.getItem('postAuthRedirect');
          if (next) {
            sessionStorage.removeItem('postAuthRedirect');
            window.location.href = next;
            return;
          }
        } catch (e) {}
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (e) {
      console.error('Register fetch failed:', e);
      showError('registerError', `Network error. ${e?.message ? e.message : 'Please try again.'}`);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  })();
}

// ============================================
// SUCCESS STATE
// ============================================

function showSuccessState(title, message) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const successState = document.getElementById('successState');
  const successTitle = document.getElementById('successTitle');
  const successMessage = document.getElementById('successMessage');
  const authFooter = document.querySelector('.auth-footer');
  
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (authFooter) authFooter.style.display = 'none';
  
  successTitle.textContent = title;
  successMessage.textContent = message;
  successState.style.display = 'block';
}

// ============================================
// STORAGE HELPERS
// ============================================

function setStorage(key, value, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  storage.setItem(key, JSON.stringify(value));
}

// ============================================
// CHECK URL PARAMS FOR REGISTER TAB
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('register') === 'true') {
    switchTab('register');
  }
});
