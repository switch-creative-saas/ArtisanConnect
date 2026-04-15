/**
 * ArtisanConnect - Reviews & Ratings JavaScript
 */

// ============================================
// RATING SELECTION
// ============================================

let selectedRating = 0;

function setRating(rating) {
  selectedRating = rating;
  const stars = document.querySelectorAll('.rating-input-star');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// ============================================
// SUBMIT REVIEW
// ============================================

function submitReview(event) {
  event.preventDefault();
  
  if (selectedRating === 0) {
    showToast('Please select a rating', 'warning');
    return;
  }
  
  const reviewText = document.getElementById('reviewText').value.trim();
  if (!reviewText) {
    showToast('Please write a review', 'warning');
    return;
  }
  
  // Show success
  showToast('Thank you for your review!', 'success');
  
  // Reset form
  document.getElementById('reviewText').value = '';
  setRating(0);
  
  // In a real app, this would send the review to the server
  // and then refresh the reviews list
}

// ============================================
// TOGGLE HELPFUL
// ============================================

function toggleHelpful(button) {
  button.classList.toggle('active');
  
  const isHelpful = button.classList.contains('active');
  const match = button.textContent.match(/\((\d+)\)/);
  let count = match ? parseInt(match[1]) : 0;
  
  if (isHelpful) {
    count++;
    showToast('Marked as helpful', 'success');
  } else {
    count--;
  }
  
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
    Helpful (${count})
  `;
}

// ============================================
// SORT REVIEWS
// ============================================

function sortReviews() {
  const sortValue = document.getElementById('reviewSort').value;
  showToast(`Sorted by: ${sortValue}`, 'info');
  
  // In a real app, this would re-sort the reviews
  // For now, we just show a toast
}

// ============================================
// ANIMATE RATING BARS
// ============================================

function animateRatingBars() {
  const bars = document.querySelectorAll('.rating-breakdown-fill');
  
  bars.forEach((bar, index) => {
    const width = bar.style.width;
    bar.style.width = '0';
    
    setTimeout(() => {
      bar.style.width = width;
    }, index * 100);
  });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Animate rating bars
  setTimeout(animateRatingBars, 500);
  
  // Add hover effect for rating stars
  const stars = document.querySelectorAll('.rating-input-star');
  stars.forEach((star, index) => {
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => {
        if (i <= index) {
          s.style.color = 'var(--warning)';
        } else {
          s.style.color = 'var(--text-muted)';
        }
      });
    });
    
    star.addEventListener('mouseleave', () => {
      stars.forEach((s, i) => {
        if (i < selectedRating) {
          s.style.color = 'var(--warning)';
        } else {
          s.style.color = 'var(--text-muted)';
        }
      });
    });
  });
});
