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
  const user = getStorage('user');
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
  const user = getStorage('user');
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
// RECENT ACTIVITY
// ============================================

function loadRecentActivity() {
  // Mock activity data - in real app, this would come from API
  const activities = [
    {
      type: 'request',
      title: 'New service request sent',
      meta: 'To David Chen - Electrical Repair',
      time: '2h ago',
      icon: 'request'
    },
    {
      type: 'completed',
      title: 'Order completed',
      meta: 'Robert Williams - Furniture Assembly',
      time: '1d ago',
      icon: 'completed'
    },
    {
      type: 'review',
      title: 'Left a review',
      meta: '5 stars for Robert Williams',
      time: '1d ago',
      icon: 'review'
    }
  ];
  
  const activityList = document.querySelector('.activity-list');
  if (!activityList) return;
  
  // Activity is already in HTML, but we could dynamically load it here
}

// ============================================
// RECOMMENDED ARTISANS
// ============================================

function loadRecommendedArtisans() {
  // Mock recommended artisans - in real app, this would be based on user preferences
  const recommended = [
    {
      name: 'James Miller',
      service: 'HVAC Technician',
      rating: 4.9,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
    },
    {
      name: 'Maria Garcia',
      service: 'Painter',
      rating: 4.8,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    {
      name: 'Tom Wilson',
      service: 'Gardener',
      rating: 4.7,
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop'
    }
  ];
  
  // Recommended artisans are already in HTML, but we could dynamically load them here
}

// ============================================
// QUICK ACTIONS
// ============================================

function initQuickActions() {
  // Hire actions are handled globally via [data-auth="hire"] in main.js.
  // Keep this hook for any legacy buttons that don't use the shared guard.
  document.querySelectorAll('.recommended-btn:not([data-auth="hire"])').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const artisanName = e.target.closest('.recommended-item')?.querySelector('.recommended-name')?.textContent || 'artisan';
      showToast(`Request sent to ${artisanName}!`, 'success');
    });
  });
}

// ============================================
// REAL-TIME UPDATES (SIMULATED)
// ============================================

function simulateRealTimeUpdates() {
  // Simulate new message notification
  setTimeout(() => {
    const messageBadge = document.querySelector('.sidebar-nav-badge');
    if (messageBadge) {
      let count = parseInt(messageBadge.textContent);
      messageBadge.textContent = count + 1;
      showToast('New message received!', 'info');
    }
  }, 30000); // After 30 seconds
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
  
  // Animate stats
  setTimeout(animateStats, 300);
  
  // Initialize quick actions
  initQuickActions();
  
  // Simulate real-time updates
  simulateRealTimeUpdates();
});
