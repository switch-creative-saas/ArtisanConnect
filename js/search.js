/**
 * ArtisanConnect - Search Page JavaScript
 */

// ============================================
// MOCK ARTISAN DATA
// ============================================

const artisansData = [
  {
    id: 1,
    name: 'Mike Johnson',
    service: 'Plumber',
    category: 'plumbing',
    rating: 4.9,
    reviews: 128,
    price: 45,
    priceRange: '30-50',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    tags: ['Emergency', 'Residential', 'Commercial'],
    description: 'Expert plumber with 10+ years experience',
    city: 'Lagos',
    state: 'Lagos',
    lat: 6.5244,
    lng: 3.3792
  },
  {
    id: 2,
    name: 'David Chen',
    service: 'Electrician',
    category: 'electrical',
    rating: 5.0,
    reviews: 96,
    price: 55,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
    tags: ['Licensed', '24/7', 'Commercial'],
    description: 'Licensed electrician specializing in repairs',
    city: 'Ikeja',
    state: 'Lagos',
    lat: 6.6018,
    lng: 3.3515
  },
  {
    id: 3,
    name: 'Robert Williams',
    service: 'Carpenter',
    category: 'carpentry',
    rating: 4.8,
    reviews: 84,
    price: 50,
    priceRange: '30-50',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    tags: ['Custom', 'Furniture', 'Repairs'],
    description: 'Master carpenter for custom furniture',
    city: 'Ibadan',
    state: 'Oyo',
    lat: 7.3775,
    lng: 3.9470
  },
  {
    id: 4,
    name: 'Lisa Anderson',
    service: 'Cleaner',
    category: 'cleaning',
    rating: 4.7,
    reviews: 156,
    price: 35,
    priceRange: '0-30',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    tags: ['Deep Clean', 'Move-in/out', 'Weekly'],
    description: 'Professional cleaning services',
    city: 'Abuja',
    state: 'FCT',
    lat: 9.0765,
    lng: 7.3986
  },
  {
    id: 5,
    name: 'Sarah Johnson',
    service: 'Plumber',
    category: 'plumbing',
    rating: 5.0,
    reviews: 72,
    price: 60,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    tags: ['Emergency', 'Installation', 'Repairs'],
    description: 'Expert in all plumbing services',
    city: 'Port Harcourt',
    state: 'Rivers',
    lat: 4.8156,
    lng: 7.0498
  },
  {
    id: 6,
    name: 'James Miller',
    service: 'HVAC Technician',
    category: 'hvac',
    rating: 4.9,
    reviews: 112,
    price: 75,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ae?w=400&h=300&fit=crop',
    tags: ['Repair', 'Installation', 'Maintenance'],
    description: 'HVAC specialist for all systems',
    city: 'Lekki',
    state: 'Lagos',
    lat: 6.4698,
    lng: 3.5852
  },
  {
    id: 7,
    name: 'Maria Garcia',
    service: 'Painter',
    category: 'painting',
    rating: 4.8,
    reviews: 89,
    price: 40,
    priceRange: '30-50',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
    tags: ['Interior', 'Exterior', 'Commercial'],
    description: 'Professional painting services',
    city: 'Enugu',
    state: 'Enugu',
    lat: 6.5244,
    lng: 7.5086
  },
  {
    id: 8,
    name: 'Tom Wilson',
    service: 'Gardener',
    category: 'gardening',
    rating: 4.7,
    reviews: 64,
    price: 30,
    priceRange: '0-30',
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1558905540-21290109218f?w=400&h=300&fit=crop',
    tags: ['Landscaping', 'Maintenance', 'Design'],
    description: 'Expert gardener and landscaper',
    city: 'Jos',
    state: 'Plateau',
    lat: 9.8965,
    lng: 8.8583
  },
  {
    id: 9,
    name: 'Chinedu Okafor',
    service: 'Generator Technician',
    category: 'electrical',
    rating: 4.9,
    reviews: 211,
    price: 50,
    priceRange: '30-50',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
    tags: ['I-better-pass-my-neighbour', 'Maintenance', 'Emergency'],
    description: 'Generator servicing, rewiring, and load balancing',
    city: 'Surulere',
    state: 'Lagos',
    lat: 6.4969,
    lng: 3.3496
  },
  {
    id: 10,
    name: 'Amina Bello',
    service: 'Borehole & Water Pump Technician',
    category: 'plumbing',
    rating: 4.8,
    reviews: 143,
    price: 65,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    tags: ['Pump Repair', 'Installation', 'Fast Response'],
    description: 'Borehole troubleshooting, pump replacement, and plumbing fixes',
    city: 'Kubwa',
    state: 'FCT',
    lat: 9.1498,
    lng: 7.3305
  },
  {
    id: 11,
    name: 'Kelechi Nwosu',
    service: 'Tiler (Floors & Bathrooms)',
    category: 'carpentry',
    rating: 4.7,
    reviews: 97,
    price: 55,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    tags: ['Bathrooms', 'Kitchen', 'Neat Finish'],
    description: 'Wall/floor tiling, waterproofing, and grout repairs',
    city: 'Aba',
    state: 'Abia',
    lat: 5.1066,
    lng: 7.3667
  },
  {
    id: 12,
    name: 'Seyi Adeyemi',
    service: 'AC Installer & Repair',
    category: 'hvac',
    rating: 4.9,
    reviews: 188,
    price: 80,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ae?w=400&h=300&fit=crop',
    tags: ['Split Unit', 'Gas Refill', 'Maintenance'],
    description: 'AC installation, gas refill, and troubleshooting',
    city: 'Yaba',
    state: 'Lagos',
    lat: 6.5158,
    lng: 3.3711
  },
  {
    id: 13,
    name: 'Hadiza Musa',
    service: 'Laundry & Home Cleaning',
    category: 'cleaning',
    rating: 4.6,
    reviews: 76,
    price: 28,
    priceRange: '0-30',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    tags: ['Laundry', 'Deep Clean', 'Trusted'],
    description: 'Laundry pickup, deep cleaning, and move-in/out cleanup',
    city: 'Kaduna',
    state: 'Kaduna',
    lat: 10.5105,
    lng: 7.4165
  },
  {
    id: 14,
    name: 'Ibrahim Sani',
    service: 'DSTV / CCTV Installer',
    category: 'electrical',
    rating: 4.8,
    reviews: 121,
    price: 35,
    priceRange: '30-50',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop',
    tags: ['DSTV', 'CCTV', 'Same Day'],
    description: 'DSTV alignment, CCTV setup, and cable routing',
    city: 'Kano',
    state: 'Kano',
    lat: 12.0022,
    lng: 8.5919
  },
  {
    id: 15,
    name: 'Ngozi Eze',
    service: 'Hair Stylist (Home Service)',
    category: 'tailoring',
    rating: 4.7,
    reviews: 58,
    price: 25,
    priceRange: '0-30',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
    tags: ['Braids', 'Fixing', 'Home Service'],
    description: 'Braids, wig fixing, and event styling',
    city: 'Owerri',
    state: 'Imo',
    lat: 5.4763,
    lng: 7.0259
  },
  {
    id: 16,
    name: 'Tunde Salami',
    service: 'POP Ceiling & Screeding',
    category: 'painting',
    rating: 4.8,
    reviews: 102,
    price: 70,
    priceRange: '50-100',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    tags: ['POP', 'Finishing', 'Neat'],
    description: 'POP ceilings, screeding, and finishing work',
    city: 'Ilorin',
    state: 'Kwara',
    lat: 8.4799,
    lng: 4.5418
  }
];

let userCoords = null; // { lat, lng }
let filteredArtisans = [...artisansData];
let currentPage = 1;
const pageSize = 8;

// ============================================
// INITIALIZE SEARCH PAGE
// ============================================

function initSearchPage() {
  // Check for URL params
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const locationParam = urlParams.get('location');
  const categoryParam = urlParams.get('category');
  
  if (searchParam) {
    document.getElementById('searchInput').value = searchParam;
  }
  
  if (locationParam) {
    document.getElementById('locationInput').value = locationParam;
  }
  
  if (categoryParam) {
    document.getElementById('categoryFilter').value = categoryParam;
  }
  
  // Initial filter
  filterArtisans();
}

// ============================================
// GEOLOCATION (OPTIONAL)
// ============================================

function useMyLocation() {
  const btn = document.querySelector('.use-location-btn');
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported on this device', 'warning');
    return;
  }

  if (btn) btn.disabled = true;
  showToast('Getting your location...', 'info', 1500);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const input = document.getElementById('locationInput');
      if (input) input.value = 'Near me';
      showToast('Location enabled. Showing artisans near you.', 'success');
      filterArtisans();
      if (btn) btn.disabled = false;
    },
    () => {
      showToast('Could not access your location. Please allow location permission.', 'warning');
      if (btn) btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
  );
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function milesFromKm(km) {
  return km * 0.621371;
}

function getArtisanDistanceMiles(artisan) {
  if (!userCoords || !artisan.lat || !artisan.lng) return null;
  const km = haversineKm(userCoords, { lat: artisan.lat, lng: artisan.lng });
  return milesFromKm(km);
}

// ============================================
// FILTER ARTISANS
// ============================================

function filterArtisans() {
  const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
  const location = document.getElementById('locationInput')?.value?.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  const rating = document.getElementById('ratingFilter')?.value || '';
  const price = document.getElementById('priceFilter')?.value || '';
  const distance = document.getElementById('distanceFilter')?.value || '';
  
  filteredArtisans = artisansData.filter(artisan => {
    // Search term filter
    if (searchTerm && !artisan.name.toLowerCase().includes(searchTerm) && 
        !artisan.service.toLowerCase().includes(searchTerm) &&
        !artisan.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return false;
    }

    // Location filter (text match on city/state) OR "Near me" with geolocation
    if (location && location !== 'near me') {
      const city = (artisan.city || '').toLowerCase();
      const state = (artisan.state || '').toLowerCase();
      if (!city.includes(location) && !state.includes(location)) {
        return false;
      }
    }
    
    // Category filter
    if (category && artisan.category !== category) {
      return false;
    }
    
    // Rating filter
    if (rating && artisan.rating < parseFloat(rating)) {
      return false;
    }
    
    // Price filter
    if (price && artisan.priceRange !== price) {
      return false;
    }
    
    // Distance filter
    if (distance) {
      const maxMiles = parseFloat(distance);
      const dMiles = getArtisanDistanceMiles(artisan);
      // If we can't compute distance (no permission), don't hide results; just ignore distance filter.
      if (dMiles != null && dMiles > maxMiles) return false;
    }
    
    return true;
  });

  // Reset pagination on any filter change
  currentPage = 1;
  
  // Update UI
  renderArtisans();
  updateFilterChips();
  updateResultsCount();
  renderPagination();
}

// ============================================
// RENDER ARTISAN CARDS
// ============================================

function renderArtisans() {
  const grid = document.getElementById('resultsGrid');
  const noResults = document.getElementById('noResults');
  
  if (!grid) return;
  
  if (filteredArtisans.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  noResults.style.display = 'none';
  
  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredArtisans.slice(start, start + pageSize);

  grid.innerHTML = pageItems.map((artisan, index) => {
    const dMiles = getArtisanDistanceMiles(artisan);
    const distanceLabel = dMiles == null ? `${artisan.city || 'Nearby'}${artisan.state ? `, ${artisan.state}` : ''}` : `${dMiles.toFixed(1)} miles`;
    return `
    <div class="artisan-card" style="animation-delay: ${index * 0.1}s">
      <div class="artisan-card-image">
        <img src="${artisan.image}" alt="${artisan.service}">
        <div class="artisan-card-overlay">
          <span class="artisan-card-badge">${artisan.tags[0]}</span>
          <button class="artisan-card-favorite" onclick="toggleFavorite(this)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="artisan-card-body">
        <div class="artisan-card-header">
          <img src="${artisan.avatar}" alt="${artisan.name}" class="artisan-card-avatar">
          <div class="artisan-card-info">
            <h3 class="artisan-card-name">${artisan.name}</h3>
            <p class="artisan-card-service">${artisan.service}</p>
          </div>
        </div>
        <div class="artisan-card-rating">
          <span class="stars">${'★'.repeat(Math.floor(artisan.rating))}${artisan.rating % 1 >= 0.5 ? '½' : ''}</span>
          <span class="value">${artisan.rating}</span>
          <span class="count">(${artisan.reviews} reviews)</span>
        </div>
        <div class="artisan-card-details">
          <span class="artisan-card-detail">
            <svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${distanceLabel}
          </span>
        </div>
        <div class="artisan-card-tags">
          ${artisan.tags.map(tag => `<span class="artisan-card-tag">${tag}</span>`).join('')}
        </div>
        <div class="artisan-card-footer">
          <div class="artisan-card-price">${formatCurrency(artisan.price * 1000)}<span>/hr</span></div>
          <a href="hire-step-1.html?artisan=${artisan.id}" class="artisan-card-btn" onclick="handleHireClick(event, ${artisan.id})">Hire</a>
          <a href="artisan-profile.html?artisan=${artisan.id}" class="artisan-card-btn artisan-card-btn-secondary">View Profile</a>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function handleHireClick(event, artisanId) {
  event.preventDefault();
  const targetUrl = `hire-step-1.html?artisan=${artisanId}`;
  if (typeof isLoggedIn === 'function' && isLoggedIn()) {
    window.location.href = targetUrl;
    return;
  }

  // Force full auth page flow for Find Artisans
  try {
    if (typeof setPostAuthRedirect === 'function') setPostAuthRedirect(targetUrl);
    else sessionStorage.setItem('postAuthRedirect', targetUrl);
  } catch (e) {
    // ignore
  }
  window.location.href = 'login.html';
}

// ============================================
// UPDATE FILTER CHIPS
// ============================================

function updateFilterChips() {
  const chipsContainer = document.getElementById('filterChips');
  if (!chipsContainer) return;
  
  const chips = [];
  
  const category = document.getElementById('categoryFilter')?.value;
  if (category) {
    const categoryName = document.querySelector(`#categoryFilter option[value="${category}"]`).text;
    chips.push({ type: 'category', label: categoryName });
  }
  
  const rating = document.getElementById('ratingFilter')?.value;
  if (rating) {
    chips.push({ type: 'rating', label: `${rating}+ stars` });
  }
  
  const price = document.getElementById('priceFilter')?.value;
  if (price) {
    const priceLabel = document.querySelector(`#priceFilter option[value="${price}"]`).text;
    chips.push({ type: 'price', label: priceLabel });
  }
  
  const distance = document.getElementById('distanceFilter')?.value;
  if (distance) {
    chips.push({ type: 'distance', label: `Within ${distance} miles` });
  }
  
  chipsContainer.innerHTML = chips.map(chip => `
    <span class="filter-chip">
      ${chip.label}
      <span class="remove" onclick="removeFilter('${chip.type}')">×</span>
    </span>
  `).join('');
}

// ============================================
// REMOVE FILTER
// ============================================

function removeFilter(type) {
  const filterMap = {
    'category': 'categoryFilter',
    'rating': 'ratingFilter',
    'price': 'priceFilter',
    'distance': 'distanceFilter'
  };
  
  const filterId = filterMap[type];
  if (filterId) {
    document.getElementById(filterId).value = '';
    filterArtisans();
  }
}

// ============================================
// PAGINATION (WORKING + SWIPE)
// ============================================

function totalPages() {
  return Math.max(1, Math.ceil(filteredArtisans.length / pageSize));
}

function goToPage(page) {
  const t = totalPages();
  currentPage = Math.min(t, Math.max(1, page));
  renderArtisans();
  renderPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;

  const t = totalPages();
  if (t <= 1) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  // Simple pagination: prev, 1..t (max 5), next
  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(t, start + (maxButtons - 1));
  start = Math.max(1, end - (maxButtons - 1));
  for (let p = start; p <= end; p++) pages.push(p);

  container.innerHTML = `
    <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" aria-label="Previous page">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6"></path>
      </svg>
    </button>
    ${start > 1 ? `<button class="pagination-btn" data-page="1">1</button><span style="opacity:.6;padding:0 6px;">…</span>` : ''}
    ${pages.map(p => `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`).join('')}
    ${end < t ? `<span style="opacity:.6;padding:0 6px;">…</span><button class="pagination-btn" data-page="${t}">${t}</button>` : ''}
    <button class="pagination-btn" ${currentPage === t ? 'disabled' : ''} data-page="${currentPage + 1}" aria-label="Next page">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6"></path>
      </svg>
    </button>
  `;

  container.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.getAttribute('data-page'), 10);
      if (Number.isFinite(p)) goToPage(p);
    });
  });
}

function initSwipePagination() {
  const grid = document.getElementById('resultsGrid');
  if (!grid) return;

  let startX = 0;
  let startY = 0;
  let tracking = false;

  grid.addEventListener('touchstart', (e) => {
    if (!e.touches?.length) return;
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goToPage(currentPage + 1);
    else goToPage(currentPage - 1);
  }, { passive: true });
}

// ============================================
// CLEAR ALL FILTERS
// ============================================

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('locationInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('ratingFilter').value = '';
  document.getElementById('priceFilter').value = '';
  document.getElementById('distanceFilter').value = '';
  
  filterArtisans();
}

// ============================================
// UPDATE RESULTS COUNT
// ============================================

function updateResultsCount() {
  const countElement = document.getElementById('resultsCount');
  if (countElement) {
    countElement.textContent = filteredArtisans.length;
  }
}

// ============================================
// SORT ARTISANS
// ============================================

function sortArtisans() {
  const sortValue = document.getElementById('sortSelect').value;
  
  switch (sortValue) {
    case 'rating':
      filteredArtisans.sort((a, b) => b.rating - a.rating);
      break;
    case 'price-low':
      filteredArtisans.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredArtisans.sort((a, b) => b.price - a.price);
      break;
    case 'distance':
      // If user allowed location, sort by computed distance; otherwise keep original order.
      filteredArtisans.sort((a, b) => {
        const da = getArtisanDistanceMiles(a);
        const db = getArtisanDistanceMiles(b);
        if (da == null && db == null) return 0;
        if (da == null) return 1;
        if (db == null) return -1;
        return da - db;
      });
      break;
    default:
      // Relevance - reset to original order
      filterArtisans();
      return;
  }
  
  renderArtisans();
  renderPagination();
}

// ============================================
// TOGGLE FAVORITE
// ============================================

function toggleFavorite(btn) {
  btn.classList.toggle('active');
  const isFavorite = btn.classList.contains('active');
  showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites', 'success');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Only initialize search UI when the page actually contains the search elements.
  // This allows reusing `artisansData` on other dashboard pages (ex: artisan profile).
  const hasSearch = !!document.getElementById('searchInput');
  const hasGrid = !!document.getElementById('resultsGrid');
  if (hasSearch && hasGrid) {
    initSearchPage();
    initSwipePagination();
  }
});
