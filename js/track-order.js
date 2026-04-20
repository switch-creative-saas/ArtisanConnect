/**
 * ArtisanConnect - Track Order JavaScript
 * Real-time order tracking with status updates and timeline
 */

let currentOrder = null;
let pollingInterval = null;
let recentOrders = [];

// ============================================
// INITIALIZATION
// ============================================

async function initTrackOrderPage() {
  // Check if order ID is in URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');
  
  if (orderId) {
    // Extract numeric ID from ORD-XXXXX format
    const numericId = extractOrderId(orderId);
    if (numericId) {
      await loadOrder(numericId);
    } else {
      showError('Invalid order ID format');
    }
  }
  
  await loadRecentOrders();
  setupEventListeners();
  setupAutoSearch();
}

// ============================================
// ORDER LOADING
// ============================================

async function loadOrder(orderId) {
  try {
    showLoading(true);
    
    const apiBase = typeof getApiBaseUrl === 'function' 
      ? getApiBaseUrl() 
      : '../backend/api';
    
    const response = await fetch(`${apiBase}/orders/show.php?id=${orderId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        showError('Order not found');
      } else {
        throw new Error('Failed to load order');
      }
      return;
    }
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to load order');
    }
    
    currentOrder = data.order;
    renderOrderDetails();
    startRealTimeUpdates();
    showLoading(false);
    
  } catch (error) {
    console.error('Error loading order:', error);
    showToast('Failed to load order. Please try again.', 'error');
    showLoading(false);
    showError('Failed to load order');
  }
}

async function loadRecentOrders() {
  try {
    const apiBase = typeof getApiBaseUrl === 'function' 
      ? getApiBaseUrl() 
      : '../backend/api';
    
    const response = await fetch(`${apiBase}/orders/index.php`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.ok) {
        recentOrders = data.orders || [];
        renderRecentOrders();
      }
    }
  } catch (error) {
    console.error('Error loading recent orders:', error);
  }
}

// ============================================
// RENDERING
// ============================================

function renderOrderDetails() {
  if (!currentOrder) return;
  
  const detailsContainer = document.getElementById('orderDetails');
  const emptyState = document.getElementById('emptyState');
  
  if (detailsContainer) {
    detailsContainer.innerHTML = createOrderDetailsHTML();
    detailsContainer.style.display = 'block';
  }
  
  if (emptyState) {
    emptyState.style.display = 'none';
  }

  // Map is rendered after HTML exists
  initOrderLocationMap();
}

function createOrderDetailsHTML() {
  const progress = getProgressPercentage(currentOrder.statusKey);
  const timeline = getTimelineEvents(currentOrder.statusKey);
  
  return `
    <div class="tracking-order-card">
      <div class="tracking-header">
        <div class="tracking-order-info">
          <h3>#ORD-${String(currentOrder.id).padStart(6, '0')}</h3>
          <p>Placed on ${currentOrder.createdAt}</p>
        </div>
        <div class="tracking-status">
          <span class="status-badge" style="background: ${currentOrder.status.color};">
            ${currentOrder.status.icon} ${currentOrder.status.text}
          </span>
        </div>
      </div>

      <div class="tracking-progress">
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%;"></div>
          </div>
          <div class="progress-text">
            <span class="progress-percentage">${progress}%</span>
            <span class="progress-label">Complete</span>
          </div>
        </div>
      </div>

      <div class="tracking-timeline" id="trackingTimeline">
        ${timeline.map(event => createTimelineEvent(event)).join('')}
      </div>

      <div class="artisan-info-card">
        <div class="artisan-info-avatar">
          <img src="${currentOrder.artisanAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}" 
               alt="${escapeHtml(currentOrder.artisanName)}">
          <span class="artisan-info-status" style="background: ${currentOrder.status.color};"></span>
        </div>
        <div class="artisan-info-details">
          <h4>${escapeHtml(currentOrder.artisanName)}</h4>
          <p>${escapeHtml(currentOrder.artisanService)} • ${escapeHtml(currentOrder.artisanLocation || 'Nearby')}</p>
          <div class="artisan-info-rating">
            <span>★</span> ${Number.isFinite(Number(currentOrder.artisanRating)) ? Number(currentOrder.artisanRating).toFixed(1) : '—'}
          </div>
        </div>
        <div class="artisan-info-actions">
          ${currentOrder.conversationId ? 
            `<a href="messages.html?chat=${currentOrder.conversationId}" class="artisan-info-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Message
            </a>` : 
            `<button class="artisan-info-btn" onclick="showToast('Chat available after order confirmation', 'info')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Message
            </button>`
          }
          <button class="artisan-info-btn" onclick="showToast('Calling artisan...', 'info')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Call
          </button>
        </div>
      </div>

      <div class="order-summary">
        <h4>Order Summary</h4>
        <div class="summary-item">
          <span class="summary-label">Service:</span>
          <span class="summary-value">${escapeHtml(currentOrder.needs)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Duration:</span>
          <span class="summary-value">${currentOrder.hours} hours</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Location:</span>
          <span class="summary-value">${escapeHtml(currentOrder.address)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Payment:</span>
          <span class="summary-value">${currentOrder.paymentStatus.text}</span>
        </div>
        <div class="summary-total">
          <span class="summary-label">Total:</span>
          <span class="summary-value">${formatCurrency(currentOrder.totalAmount)}</span>
        </div>
      </div>

      <div class="order-location-card">
        <div class="order-location-header">
          <h4>Map</h4>
          <a class="order-location-link" id="openInMapsLink" href="#" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
        </div>
        <div class="order-map" id="orderMap"></div>
        <div class="order-map-fallback" id="orderMapFallback" style="display:none;"></div>
      </div>
    </div>
  `;
}

function initOrderLocationMap() {
  if (!currentOrder) return;

  const mapEl = document.getElementById('orderMap');
  const fallbackEl = document.getElementById('orderMapFallback');
  const openLink = document.getElementById('openInMapsLink');

  if (!mapEl || !fallbackEl) return;

  const address = String(currentOrder.address || '').trim();
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : 'https://www.google.com/maps';

  if (openLink) openLink.href = mapsUrl;

  const hasKey = typeof window.hasGoogleMapsKey === 'function'
    ? window.hasGoogleMapsKey()
    : !!String(window.GOOGLE_MAPS_API_KEY || '').trim();

  if (!hasKey || typeof window.loadGoogleMaps !== 'function') {
    mapEl.style.display = 'none';
    fallbackEl.style.display = 'block';
    fallbackEl.innerHTML = address
      ? `Map preview unavailable. <a class="order-location-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Open this address in Google Maps</a>.`
      : `No address available for this order.`;
    return;
  }

  if (!address) {
    mapEl.style.display = 'none';
    fallbackEl.style.display = 'block';
    fallbackEl.textContent = 'No address available for this order.';
    return;
  }

  window.loadGoogleMaps()
    .then(() => {
      const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos fallback
      const map = new google.maps.Map(mapEl, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const marker = new google.maps.Marker({ map, position: defaultCenter });
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address }, (results, status) => {
        if (status !== 'OK' || !results?.length) {
          mapEl.style.display = 'none';
          fallbackEl.style.display = 'block';
          fallbackEl.innerHTML = `Couldn’t locate this address on the map. <a class="order-location-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>.`;
          return;
        }

        const loc = results[0].geometry.location;
        const latLng = { lat: loc.lat(), lng: loc.lng() };
        marker.setPosition(latLng);
        map.setCenter(latLng);
        map.setZoom(15);
        fallbackEl.style.display = 'none';
        mapEl.style.display = 'block';
      });
    })
    .catch(() => {
      mapEl.style.display = 'none';
      fallbackEl.style.display = 'block';
      fallbackEl.innerHTML = `Map failed to load. <a class="order-location-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>.`;
    });
}

function renderRecentOrders() {
  const container = document.getElementById('recentOrdersList');
  if (!container) return;
  
  if (recentOrders.length === 0) {
    container.innerHTML = '<p class="no-recent-orders">No recent orders</p>';
    return;
  }
  
  container.innerHTML = recentOrders.slice(0, 5).map(order => `
    <div class="recent-order-item" onclick="loadOrder(${order.id})">
      <div class="recent-order-info">
        <h4>#ORD-${String(order.id).padStart(6, '0')}</h4>
        <p>${escapeHtml(order.needs || 'Service Request')}</p>
      </div>
      <div class="recent-order-status">
        <span class="status-badge" style="background: ${getStatusColor(order.statusKey)}; font-size: 0.8rem;">
          ${getStatusIcon(order.statusKey)} ${order.status}
        </span>
      </div>
    </div>
  `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractOrderId(orderId) {
  // Extract numeric ID from ORD-XXXXX format or return as-is
  const match = orderId.match(/ORD-(\d+)/);
  return match ? parseInt(match[1]) : parseInt(orderId);
}

function getProgressPercentage(status) {
  const progress = {
    'created': 10,
    'pending': 25,
    'paid': 40,
    'accepted': 60,
    'in_progress': 75,
    'completed': 100,
    'cancelled': 0
  };
  return progress[status] || 0;
}

function getTimelineEvents(status) {
  const allEvents = [
    { status: 'created', title: 'Order Created', time: 'Just now', completed: true },
    { status: 'pending', title: 'Payment Pending', time: 'Processing', completed: ['pending', 'paid', 'accepted', 'in_progress', 'completed'].includes(status) },
    { status: 'paid', title: 'Payment Confirmed', time: 'Confirmed', completed: ['paid', 'accepted', 'in_progress', 'completed'].includes(status) },
    { status: 'accepted', title: 'Artisan Assigned', time: 'Assigned', completed: ['accepted', 'in_progress', 'completed'].includes(status) },
    { status: 'in_progress', title: 'Work in Progress', time: 'In Progress', completed: ['in_progress', 'completed'].includes(status) },
    { status: 'completed', title: 'Order Completed', time: 'Completed', completed: status === 'completed' }
  ];
  
  return allEvents.filter(event => event.completed);
}

function createTimelineEvent(event) {
  return `
    <div class="timeline-event ${event.completed ? 'completed' : 'pending'}">
      <div class="timeline-marker">
        <div class="timeline-dot ${event.completed ? 'completed' : 'pending'}"></div>
      </div>
      <div class="timeline-content">
        <h5>${event.title}</h5>
        <p>${event.time}</p>
      </div>
    </div>
  `;
}

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
  // Prefer shared formatter from `js/main.js` (if present).
  if (typeof window.formatCurrency === 'function' && window.formatCurrency !== formatCurrency) {
    return window.formatCurrency(amount);
  }
  const value = Number(amount);
  if (!Number.isFinite(value)) return `₦${amount}`;
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`;
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
  const searchInput = document.getElementById('orderSearchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchOrder();
      }
    });
  }
}

function setupAutoSearch() {
  // Auto-load first recent order if no order ID specified
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get('id') && recentOrders.length > 0) {
    loadOrder(recentOrders[0].id);
  }
}

// ============================================
// UI FUNCTIONS
// ============================================

function searchOrder() {
  const input = document.getElementById('orderSearchInput');
  const orderId = input?.value?.trim();
  
  if (!orderId) {
    showToast('Please enter an order ID', 'warning');
    return;
  }
  
  // Update URL without page reload
  const newUrl = `track-order.html?id=${encodeURIComponent(orderId)}`;
  window.history.pushState({}, '', newUrl);
  
  const numericId = extractOrderId(orderId);
  if (numericId) {
    loadOrder(numericId);
  } else {
    showError('Invalid order ID format. Use format: ORD-123456');
  }
}

function showLoading(show) {
  const spinner = document.getElementById('loadingSpinner');
  const details = document.getElementById('orderDetails');
  
  if (spinner) {
    spinner.style.display = show ? 'block' : 'none';
  }
  if (details) {
    details.style.display = show ? 'none' : 'block';
  }
}

function showError(message) {
  const details = document.getElementById('orderDetails');
  const emptyState = document.getElementById('emptyState');
  
  if (details) details.style.display = 'none';
  if (emptyState) {
    emptyState.style.display = 'block';
    emptyState.querySelector('h3').textContent = message;
  }
}

// ============================================
// REAL-TIME UPDATES
// ============================================

function startRealTimeUpdates() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Poll for order updates every 5 seconds
  pollingInterval = setInterval(async () => {
    if (currentOrder) {
      await loadOrder(currentOrder.id);
    }
  }, 5000);
}

function stopRealTimeUpdates() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
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
    if (currentOrder) {
      startRealTimeUpdates();
    }
  }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTrackOrderPage();
});
