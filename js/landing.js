/**
 * ArtisanConnect - Landing Page JavaScript
 */

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================

let carouselPosition = 0;
const carouselSlidesToShow = window.innerWidth < 768 ? 1 : window.innerWidth < 992 ? 2 : 3;

function moveCarousel(direction) {
  const track = document.getElementById('featuredCarousel');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const maxPosition = slides.length - carouselSlidesToShow;
  
  carouselPosition += direction;
  
  if (carouselPosition < 0) carouselPosition = 0;
  if (carouselPosition > maxPosition) carouselPosition = maxPosition;
  
  const slideWidth = slides[0].offsetWidth + 24; // Including gap
  track.style.transform = `translateX(-${carouselPosition * slideWidth}px)`;
}

// Auto-scroll carousel
function initAutoCarousel() {
  setInterval(() => {
    const track = document.getElementById('featuredCarousel');
    if (!track) return;
    
    const slides = track.querySelectorAll('.carousel-slide');
    const maxPosition = slides.length - carouselSlidesToShow;
    
    if (carouselPosition < maxPosition) {
      moveCarousel(1);
    } else {
      carouselPosition = -1;
      moveCarousel(1);
    }
  }, 5000);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function handleSearch(event) {
  event.preventDefault();
  
  const searchInput = document.getElementById('heroSearchInput');
  const locationInput = document.getElementById('heroLocationInput');
  
  const searchTerm = searchInput?.value?.trim() || '';
  const location = locationInput?.value?.trim() || '';
  
  // Build search URL
  let url = 'pages/search.html';
  const params = [];
  
  params.push('public=true');
  if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
  if (location) params.push(`location=${encodeURIComponent(location)}`);
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  window.location.href = url;
}

function filterByCategory(category) {
  window.location.href = `pages/search.html?public=true&category=${category}`;
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fadeInUp');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll('.category-card, .step-card, .testimonial-card, .artisan-card');
  animateElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${index * 0.1}s`;
    observer.observe(el);
  });
}

// ============================================
// STATS COUNTER ANIMATION
// ============================================

function animateCounters() {
  const counters = document.querySelectorAll('.hero-stat-value');
  
  counters.forEach(counter => {
    const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
    const suffix = counter.textContent.replace(/[0-9]/g, '');
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString() + suffix;
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target.toLocaleString() + suffix;
      }
    };
    
    updateCounter();
  });
}

// ============================================
// PARALLAX EFFECT FOR BLOBS
// ============================================

function initParallax() {
  const blobs = document.querySelectorAll('.hero-blob');
  
  document.addEventListener('mousemove', throttle((e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    blobs.forEach((blob, index) => {
      const speed = (index + 1) * 20;
      const xOffset = (0.5 - x) * speed;
      const yOffset = (0.5 - y) * speed;
      blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
  }, 50));
}

// ============================================
// THROTTLE HELPER
// ============================================

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
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initAutoCarousel();
  initScrollAnimations();
  initParallax();
  
  // Trigger counter animation when stats section is visible
  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(statsSection);
  }
  
  // Handle URL params for search
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const locationParam = urlParams.get('location');
  
  if (searchParam) {
    const searchInput = document.getElementById('heroSearchInput');
    if (searchInput) searchInput.value = searchParam;
  }
  
  if (locationParam) {
    const locationInput = document.getElementById('heroLocationInput');
    if (locationInput) locationInput.value = locationParam;
  }
});
