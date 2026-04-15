/**
 * ArtisanConnect - Order Tracking JavaScript
 */

// ============================================
// UPDATE PROGRESS
// ============================================

function updateProgress(percentage) {
  const progressFill = document.getElementById('progressFill');
  const progressPercentage = document.getElementById('progressPercentage');
  
  if (progressFill && progressPercentage) {
    progressFill.style.width = percentage + '%';
    progressPercentage.textContent = percentage + '%';
  }
}

// ============================================
// ANIMATE PROGRESS ON LOAD
// ============================================

function animateProgress() {
  let currentProgress = 0;
  const targetProgress = 50;
  const duration = 1500;
  const step = targetProgress / (duration / 16);
  
  const updateProgressBar = () => {
    currentProgress += step;
    if (currentProgress < targetProgress) {
      updateProgress(Math.floor(currentProgress));
      requestAnimationFrame(updateProgressBar);
    } else {
      updateProgress(targetProgress);
    }
  };
  
  updateProgressBar();
}

// ============================================
// SIMULATE STATUS UPDATE
// ============================================

function simulateStatusUpdate() {
  // Simulate status update after 10 seconds
  setTimeout(() => {
    showToast('Status Update: Artisan is on the way!', 'info');
    
    // Update timeline
    const timeline = document.getElementById('trackingTimeline');
    const activeItem = timeline.querySelector('.timeline-item.active');
    
    if (activeItem) {
      activeItem.classList.remove('active');
      activeItem.classList.add('completed');
      activeItem.querySelector('.timeline-dot').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    }
    
    // Update progress
    updateProgress(75);
  }, 10000);
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Animate progress bar
  setTimeout(animateProgress, 500);
  
  // Simulate status updates
  simulateStatusUpdate();
});
