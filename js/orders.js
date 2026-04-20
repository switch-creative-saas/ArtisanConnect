/**
 * ArtisanConnect - Orders JavaScript
 * Real-time order management with filtering and status updates
 */

let ordersData = [];
let currentFilter = 'all';
let pollingInterval = null;

// ============================================
// INITIALIZATION
// ============================================

async function initOrdersPage() {
  await loadOrders();
  setupEventListeners();
  startRealTimeUpdates();
}

// ============================================
// LOAD ORDERS
// ============================================

async function loadOrders() {
  try {
    showLoading(true);
    
    const apiBase = typeof getApiBaseUrl === 'function' 
      ? getApiBaseUrl() 
      : '../backend/api';
    
    const response = await fetch(`${apiBase}/orders/index.php`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load orders');
    }
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to load orders');
    }
    
    ordersData = data.orders || [];
    renderOrders();
    showLoading(false);
    
  } catch (error) {
    console.error('Error loading orders:', error);
    showToast('Failed to load orders. Please try again.', 'error');
    showLoading(false);
    showErrorState();
  }
}

// ============================================
// RENDER ORDERS
// ============================================

function renderOrders() {
  const grid = document.getElementById('ordersGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!grid) return;
  
  // Filter orders based on current filter
  const filteredOrders = filterOrders(ordersData, currentFilter);
  
  if (filteredOrders.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  grid.innerHTML = filteredOrders.map(order => createOrderCard(order)).join('');
}

function createOrderCard(order) {
  const statusColor = getStatusColor(order.statusKey);
  const statusIcon = getStatusIcon(order.statusKey);
  
  return `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-info">
          <h3 class="order-title">${escapeHtml(order.needs || 'Service Request')}</h3>
          <p class="order-id">#ORD-${String(order.id).padStart(6, '0')}</p>
        </div>
        <div class="order-status">
          <span class="status-badge" style="background: ${statusColor};">
            ${statusIcon} ${order.status}
          </span>
        </div>
      </div>
      
      <div class="order-body">
        <div class="order-artisan">
          <img src="${order.artisanAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'}" 
               alt="${escapeHtml(order.artisanName)}" class="artisan-avatar">
          <div class="artisan-details">
            <h4>${escapeHtml(order.artisanName)}</h4>
            <p>${escapeHtml(order.artisanService)}</p>
          </div>
        </div>
        
        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">Hours:</span>
            <span class="detail-value">${order.hours}h</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Payment:</span>
            <span class="detail-value">${order.paymentStatus}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${order.createdAt}</span>
          </div>
        </div>
      </div>
      
      <div class="order-footer">
        <div class="order-amount">
          <span class="amount-label">Total:</span>
          <span class="amount-value">${formatCurrency(order.totalAmount)}</span>
        </div>
        <div class="order-actions">
          <a href="track-order.html?id=${order.id}" class="btn btn-primary btn-sm">Track Order</a>
          ${order.conversationId ? `<a href="messages.html?chat=${order.conversationId}" class="btn btn-secondary btn-sm">Chat</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================
// FILTERING
// ============================================

function filterOrders(orders, filter) {
  if (filter === 'all') return orders;
  
  return orders.filter(order => {
    const status = order.statusKey || order.status;
    return status === filter;
  });
}

function setupEventListeners() {
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      currentFilter = btn.dataset.filter;
      renderOrders();
    });
  });
}

// ============================================
// REAL-TIME UPDATES
// ============================================

function startRealTimeUpdates() {
  // Poll for order updates every 10 seconds
  pollingInterval = setInterval(async () => {
    await loadOrders();
  }, 10000);
}

function stopRealTimeUpdates() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getStatusColor(status) {
  const colors = {
    'created': '#6b7280',
    'pending': '#f59e0b',
    'paid': '#10b981',
    'accepted': '#3b82f6',
    'in_progress': '#8b5cf6',
    'completed': '#059669',
    'cancelled': '#ef4444'
  };
  return colors[status] || '#6b7280';
}

function getStatusIcon(status) {
  const icons = {
    'created': '📝',
    'pending': '⏳',
    'paid': '✅',
    'accepted': '👷',
    'in_progress': '🔧',
    'completed': '🎉',
    'cancelled': '❌'
  };
  return icons[status] || '📝';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatCurrency(amount) {
  if (typeof window.formatCurrency === 'function' && window.formatCurrency !== formatCurrency) {
    return window.formatCurrency(amount);
  }
  const value = Number(amount);
  if (!Number.isFinite(value)) return `₦${amount}`;
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`;
}

function showLoading(show) {
  const spinner = document.getElementById('loadingSpinner');
  const grid = document.getElementById('ordersGrid');
  
  if (spinner) {
    spinner.style.display = show ? 'block' : 'none';
  }
  if (grid) {
    grid.style.display = show ? 'none' : 'grid';
  }
}

function showErrorState() {
  const grid = document.getElementById('ordersGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (grid) grid.style.display = 'none';
  if (emptyState) {
    emptyState.style.display = 'block';
    emptyState.innerHTML = `
      <div class="empty-state-icon">⚠️</div>
      <h3>Failed to load orders</h3>
      <p>There was an error loading your orders. Please try again.</p>
      <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
    `;
  }
}

// ============================================
// CLEANUP
// ============================================

// Stop polling when page is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopRealTimeUpdates();
  } else {
    startRealTimeUpdates();
  }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initOrdersPage();
});
