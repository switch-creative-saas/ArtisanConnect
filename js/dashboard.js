/**
 * ArtisanConnect - Dashboard JavaScript
 */

// ============================================
// SIDEBAR TOGGLE
// ============================================

function toggleSidebar() {
  const sidebar = document.getElementById('dashboardSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('dashboardSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return;
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

function initSidebarReveal() {
  const sidebar = document.getElementById('dashboardSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggleBtn = document.getElementById('sidebarToggle');
  const topbarRight = document.querySelector('.dashboard-topbar-right');
  if (!sidebar || !overlay) return;

  // Close on overlay click
  overlay.addEventListener('click', closeSidebar);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Close after clicking nav link
  sidebar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => closeSidebar());
  });

  // Hover edge-reveal zone (desktop & hybrid)
  const zone = document.createElement('div');
  zone.className = 'nav-hover-zone';
  document.body.appendChild(zone);

  let closeTimer = null;
  const open = () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  };
  const scheduleClose = () => {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => closeSidebar(), 280);
  };

  zone.addEventListener('mouseenter', open);
  // Mobile/touch: allow tap/click on the edge zone to open
  zone.addEventListener('click', open);
  zone.addEventListener('touchstart', open, { passive: true });
  sidebar.addEventListener('mouseenter', () => {
    if (closeTimer) clearTimeout(closeTimer);
  });
  sidebar.addEventListener('mouseleave', scheduleClose);

  // Ensure toggle button always works
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  }

  if (topbarRight && !document.getElementById('topbarNavToggle')) {
    const btn = document.createElement('button');
    btn.id = 'topbarNavToggle';
    btn.className = 'topbar-nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    btn.addEventListener('click', toggleSidebar);
    topbarRight.appendChild(btn);
  }
}

// ============================================
// STATS ANIMATION
// ============================================

function animateStats() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach(stat => {
    const target = parseInt(stat.textContent);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateStat = () => {
      current += step;
      if (current < target) {
        stat.textContent = Math.floor(current);
        requestAnimationFrame(updateStat);
      } else {
        stat.textContent = target;
      }
    };
    
    updateStat();
  });
}

// ============================================
// CHECK AUTHENTICATION
// ============================================

function checkAuth() {
  // Backend login hydrates `user` into localStorage OR sessionStorage depending on "remember me".
  const user = getStorage('user') || getStorage('user', true);
  if (!user) {
    showToast('Please sign in to access the dashboard', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return false;
  }
  return true;
}

// ============================================
// LOAD USER DATA
// ============================================

function loadUserData() {
  const user = getStorage('user') || getStorage('user', true);
  if (!user) return;
  
  // Update user name in sidebar
  const sidebarUserName = document.querySelector('.sidebar-user-info h4');
  const sidebarUserAvatar = document.querySelector('.sidebar-user-avatar');
  
  if (sidebarUserName) {
    sidebarUserName.textContent = `${user.firstName} ${user.lastName}`;
  }
  
  if (sidebarUserAvatar && user.avatar) {
    sidebarUserAvatar.src = user.avatar;
  }
  
  // Update dashboard title
  const dashboardTitle = document.querySelector('.dashboard-title h1');
  if (dashboardTitle) {
    dashboardTitle.textContent = `Welcome back, ${user.firstName}! 👋`;
  }
}

// ============================================
// DASHBOARD DATA (NO MOCK DATA)
// ============================================

let dashboardOrders = [];
let dashboardConversations = [];

function getDashboardApiBase() {
  if (typeof getApiBaseUrl === 'function') return getApiBaseUrl();
  const path = window.location.pathname.replace(/\\/g, '/');
  const first = path.split('/').filter(Boolean)[0] || '';
  return `/${first}/backend/api`;
}

function formatRelative(dateLike) {
  if (!dateLike) return 'Just now';
  const ts = new Date(dateLike).getTime();
  if (!Number.isFinite(ts)) return String(dateLike);
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function statusClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'accepted' || s === 'in_progress' || s === 'in-progress') return 'in-progress';
  if (s === 'completed' || s === 'paid') return 'completed';
  return 'pending';
}

function statusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'in_progress' || s === 'in-progress') return 'In Progress';
  if (s === 'accepted') return 'Accepted';
  if (s === 'completed') return 'Completed';
  if (s === 'paid') return 'Paid';
  return 'Pending';
}

function renderOrders() {
  const tbody = document.getElementById('recentOrdersBody');
  if (!tbody) return;

  if (!dashboardOrders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="dashboard-empty-state dashboard-empty-state-inline">
            <div class="dashboard-empty-icon">📦</div>
            <p>You have no orders yet. Hire an artisan to get started.</p>
            <a href="search.html" class="btn btn-primary btn-sm">Find Artisan</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = dashboardOrders.slice(0, 5).map(order => `
    <tr>
      <td>
        <div class="order-artisan">
          <img src="${order.artisanAvatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'}" alt="${order.artisanName || 'Artisan'}" class="order-artisan-avatar">
          <span class="order-artisan-name">${order.artisanName || 'Artisan'}</span>
        </div>
      </td>
      <td><div class="order-service">${order.service || 'Service'}</div></td>
      <td><span class="order-status ${statusClass(order.status)}">${statusLabel(order.status)}</span></td>
      <td class="order-amount">${typeof formatCurrency === 'function' ? formatCurrency(order.amount || 0) : `₦${order.amount || 0}`}</td>
    </tr>
  `).join('');
}

function renderConversations() {
  const list = document.getElementById('recentMessagesList');
  if (!list) return;

  if (!dashboardConversations.length) {
    list.innerHTML = `
      <div class="dashboard-empty-state">
        <div class="dashboard-empty-icon">💬</div>
        <p>No conversations yet. Your chats will appear here.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = dashboardConversations.slice(0, 4).map(chat => `
    <a href="messages.html?chat=${chat.id}" class="recommended-item">
      <img src="${chat.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'}" alt="${chat.name}" class="recommended-avatar">
      <div class="recommended-info">
        <div class="recommended-name">${chat.name || 'Artisan'}</div>
        <div class="recommended-service">${chat.lastMessage || 'No messages yet'}</div>
      </div>
      <div class="activity-time">${chat.lastMessageTime || '—'}</div>
    </a>
  `).join('');
}

function renderActivity() {
  const list = document.getElementById('recentActivityList');
  if (!list) return;

  const activities = [];
  dashboardOrders.slice(0, 4).forEach(o => {
    activities.push({
      type: o.status === 'completed' ? 'completed' : 'request',
      title: `Order ${statusLabel(o.status)}`,
      meta: `${o.artisanName || 'Artisan'} - ${o.service || 'Service'}`,
      time: formatRelative(o.createdAt)
    });
  });
  dashboardConversations.slice(0, 3).forEach(c => {
    activities.push({
      type: 'review',
      title: 'New message',
      meta: `${c.name || 'Artisan'}: ${c.lastMessage || 'No preview'}`,
      time: c.lastMessageTime || 'Just now'
    });
  });

  if (!activities.length) {
    list.innerHTML = `
      <div class="dashboard-empty-state">
        <div class="dashboard-empty-icon">🕒</div>
        <p>No recent activity.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = activities.slice(0, 6).map(a => `
    <div class="activity-item">
      <div class="activity-icon ${a.type}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v4l3 2"></path>
        </svg>
      </div>
      <div class="activity-content">
        <div class="activity-title">${a.title}</div>
        <div class="activity-meta">${a.meta}</div>
      </div>
      <div class="activity-time">${a.time}</div>
    </div>
  `).join('');
}

function renderStats() {
  const total = dashboardOrders.length;
  const completed = dashboardOrders.filter(o => statusClass(o.status) === 'completed').length;
  const progress = dashboardOrders.filter(o => statusClass(o.status) === 'in-progress').length;
  const messages = dashboardConversations.length;

  const setNum = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  };
  setNum('statTotalOrders', total);
  setNum('statCompletedOrders', completed);
  setNum('statInProgressOrders', progress);
  setNum('statNewMessages', messages);

  const badge = document.getElementById('sidebarMessagesBadge');
  if (badge) {
    badge.textContent = String(messages);
    badge.style.display = messages > 0 ? 'inline-flex' : 'none';
  }
}

async function reloadOrders() {
  try {
    const res = await fetch(`${getDashboardApiBase()}/orders/index.php`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load orders');
    const data = await res.json();
    dashboardOrders = Array.isArray(data?.orders) ? data.orders : [];
  } catch (e) {
    dashboardOrders = [];
  }
  renderOrders();
  renderActivity();
  renderStats();
}

async function reloadConversations() {
  try {
    const res = await fetch(`${getDashboardApiBase()}/conversations/index.php`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load conversations');
    const data = await res.json();
    dashboardConversations = Array.isArray(data?.conversations) ? data.conversations : [];
  } catch (e) {
    dashboardConversations = [];
  }
  renderConversations();
  renderActivity();
  renderStats();
}

async function loadDashboardData() {
  await Promise.all([reloadOrders(), reloadConversations()]);
}

// ============================================
// STORAGE HELPERS
// ============================================

function getStorage(key, useSession = false) {
  const storage = useSession ? sessionStorage : localStorage;
  const item = storage.getItem(key);
  return item ? JSON.parse(item) : null;
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (!checkAuth()) return;
  
  initSidebarReveal();

  // Load user data
  loadUserData();
  
  loadDashboardData().then(() => setTimeout(animateStats, 180));

  // Keep dashboard live when user returns from hire/chat pages.
  window.addEventListener('focus', () => loadDashboardData());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') loadDashboardData();
  });
  window.addEventListener('orders:changed', () => reloadOrders());
  window.addEventListener('conversations:changed', () => reloadConversations());

  // Expose refresh methods for action pages.
  window.reloadOrders = reloadOrders;
  window.reloadConversations = reloadConversations;
});
