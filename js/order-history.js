/**
 * ArtisanConnect - Order History JavaScript
 * Real-time order history with filtering, search, and export
 */

let orderHistory = [];
let filteredHistory = [];
let currentFilters = {
  search: '',
  status: '',
  dateRange: ''
};

// ============================================
// INITIALIZATION
// ============================================

async function initOrderHistoryPage() {
  await loadOrderHistory();
  setupEventListeners();
  updateStats();
}

// ============================================
// LOAD ORDER HISTORY
// ============================================

async function loadOrderHistory() {
  try {
    showLoading(true);
    
    const apiBase = typeof getApiBaseUrl === 'function' 
      ? getApiBaseUrl() 
      : '../backend/api';
    
    const response = await fetch(`${apiBase}/orders/index.php`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load order history');
    }
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to load order history');
    }
    
    orderHistory = data.orders || [];
    applyFilters();
    showLoading(false);
    
  } catch (error) {
    console.error('Error loading order history:', error);
    showToast('Failed to load order history. Please try again.', 'error');
    showLoading(false);
    showErrorState();
  }
}

// ============================================
// FILTERING AND SEARCH
// ============================================

function applyFilters() {
  filteredHistory = [...orderHistory];
  
  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filteredHistory = filteredHistory.filter(order => 
      order.needs.toLowerCase().includes(searchTerm) ||
      order.artisanName.toLowerCase().includes(searchTerm) ||
      `#${String(order.id).padStart(6, '0')}`.includes(searchTerm)
    );
  }
  
  // Apply status filter
  if (currentFilters.status) {
    filteredHistory = filteredHistory.filter(order => 
      order.statusKey === currentFilters.status
    );
  }
  
  // Apply date range filter
  if (currentFilters.dateRange) {
    const days = parseInt(currentFilters.dateRange);
    if (!isNaN(days)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filteredHistory = filteredHistory.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= cutoffDate;
      });
    }
  }
  
  renderOrderHistory();
  updateStats();
}

function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      applyFilters();
    });
  }
  
  // Status filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentFilters.status = e.target.value;
      applyFilters();
    });
  }
  
  // Date filter
  const dateFilter = document.getElementById('dateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', (e) => {
      currentFilters.dateRange = e.target.value;
      applyFilters();
    });
  }
}

// ============================================
// RENDERING
// ============================================

function renderOrderHistory() {
  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const historyTable = document.getElementById('historyTable');
  
  if (!tableBody) return;
  
  if (filteredHistory.length === 0) {
    tableBody.innerHTML = '';
    historyTable.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  historyTable.style.display = 'block';
  emptyState.style.display = 'none';
  
  tableBody.innerHTML = filteredHistory.map(order => createOrderRow(order)).join('');
}

function createOrderRow(order) {
  return `
    <div class="table-row">
      <div class="table-cell order-id">
        <a href="track-order.html?id=${order.id}" class="order-link">
          #ORD-${String(order.id).padStart(6, '0')}
        </a>
      </div>
      <div class="table-cell artisan-info">
        <div class="artisan-cell">
          <img src="${order.artisanAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop'}" 
               alt="${escapeHtml(order.artisanName)}" class="artisan-avatar-small">
          <div class="artisan-details-small">
            <h5>${escapeHtml(order.artisanName)}</h5>
            <p>${escapeHtml(order.artisanService)}</p>
          </div>
        </div>
      </div>
      <div class="table-cell service-info">
        <h6>${escapeHtml(order.needs || 'Service Request')}</h6>
        <p class="service-meta">${order.hours}h • ${formatCurrency(order.totalAmount)}</p>
      </div>
      <div class="table-cell amount-cell">
        <span class="amount-value">${formatCurrency(order.totalAmount)}</span>
      </div>
      <div class="table-cell status-cell">
        <span class="status-badge" style="background: ${getStatusColor(order.statusKey)}; font-size: 0.8rem;">
          ${getStatusIcon(order.statusKey)} ${order.status}
        </span>
      </div>
      <div class="table-cell date-cell">
        <span class="date-value">${formatDate(order.createdAt)}</span>
      </div>
      <div class="table-cell actions-cell">
        <a href="track-order.html?id=${order.id}" class="btn btn-ghost btn-sm">View Details</a>
        ${order.conversationId ? 
          `<a href="messages.html?chat=${order.conversationId}" class="btn btn-secondary btn-sm">Chat</a>` : 
          `<button class="btn btn-ghost btn-sm" onclick="showToast('Chat available after order confirmation', 'info')">Chat</button>`
        }
      </div>
    </div>
  `;
}

// ============================================
// STATISTICS
// ============================================

function updateStats() {
  const totalOrdersEl = document.getElementById('totalOrders');
  const totalSpentEl = document.getElementById('totalSpent');
  const completedOrdersEl = document.getElementById('completedOrders');
  
  if (totalOrdersEl) {
    totalOrdersEl.textContent = orderHistory.length;
  }
  
  if (totalSpentEl) {
    const totalSpent = orderHistory.reduce((sum, order) => sum + order.totalAmount, 0);
    totalSpentEl.textContent = formatCurrency(totalSpent);
  }
  
  if (completedOrdersEl) {
    const completedCount = orderHistory.filter(order => order.statusKey === 'completed').length;
    completedOrdersEl.textContent = completedCount;
  }
}

// ============================================
// EXPORT FUNCTIONALITY
// ============================================

function exportHistory() {
  if (filteredHistory.length === 0) {
    showToast('No orders to export', 'warning');
    return;
  }
  
  try {
    const csvContent = generateCSV();
    downloadCSV(csvContent);
    showToast('Order history exported successfully', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showToast('Failed to export order history', 'error');
  }
}

function generateCSV() {
  const headers = ['Order ID', 'Artisan', 'Service', 'Amount', 'Status', 'Date'];
  const rows = filteredHistory.map(order => [
    `ORD-${String(order.id).padStart(6, '0')}`,
    `"${order.artisanName}"`,
    `"${order.needs || 'Service Request'}"`,
    order.totalAmount,
    order.status,
    order.createdAt
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => Array.isArray(row) ? row.join(',') : row)
    .join('\n');
  
  return csvContent;
}

function downloadCSV(content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `order-history-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
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

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLoading(show) {
  const spinner = document.getElementById('loadingSpinner');
  const historyTable = document.getElementById('historyTable');
  
  if (spinner) {
    spinner.style.display = show ? 'block' : 'none';
  }
  if (historyTable) {
    historyTable.style.display = show ? 'none' : 'block';
  }
}

function showErrorState() {
  const historyTable = document.getElementById('historyTable');
  const emptyState = document.getElementById('emptyState');
  
  if (historyTable) historyTable.style.display = 'none';
  if (emptyState) {
    emptyState.style.display = 'block';
    emptyState.querySelector('h3').textContent = 'Failed to load order history';
    emptyState.querySelector('p').textContent = 'There was an error loading your order history. Please try again.';
    emptyState.querySelector('a').textContent = 'Try Again';
    emptyState.querySelector('a').onclick = () => location.reload();
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initOrderHistoryPage();
});
