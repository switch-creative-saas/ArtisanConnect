function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function clampRatingStars(rating) {
  const r = Number(rating);
  const full = Math.max(0, Math.min(5, Math.floor(r)));
  const half = r - full >= 0.5 ? 1 : 0;
  return { full, half };
}

function renderStars(rating) {
  const { full, half } = clampRatingStars(rating);
  let stars = '★'.repeat(full);
  if (half) stars += '½';
  return stars || '—';
}

function formatReviewDate(createdAt) {
  if (!createdAt) return '';
  const dt = new Date(createdAt);
  if (!Number.isFinite(dt.getTime())) return '';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function initArtisanProfile() {
  const artisanIdRaw = getQueryParam('artisan') || getQueryParam('id');
  const artisanId = Number(artisanIdRaw);
  if (!Number.isFinite(artisanId)) return;

  const apiBase = typeof getApiBaseUrl === 'function'
    ? getApiBaseUrl()
    : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;

  async function fetchJson(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return null;
    return await res.json();
  }

  let artisan = null;
  let works = [];
  let reviews = [];

  // Primary path: single endpoint with artisan + works + reviews.
  const profile = await fetchJson(`${apiBase}/artisans/profile.php?id=${encodeURIComponent(artisanId)}`);
  if (profile?.ok && profile?.artisan) {
    artisan = profile.artisan;
    works = Array.isArray(profile.artisan.works) ? profile.artisan.works : [];
    reviews = Array.isArray(profile.artisan.reviews) ? profile.artisan.reviews : [];
  } else if (Array.isArray(window.artisansData)) {
    // Frontend fallback when backend is unavailable.
    artisan = window.artisansData.find(a => Number(a.id) === artisanId) || null;
  }
  if (!artisan) return;

  const cover = document.getElementById('artisanProfileCover');
  const avatar = document.getElementById('artisanProfileAvatar');
  const name = document.getElementById('artisanProfileName');
  const service = document.getElementById('artisanProfileService');
  const ratingEl = document.getElementById('artisanProfileRating');
  const locationEl = document.getElementById('artisanProfileLocation');
  const tagsEl = document.getElementById('artisanProfileTags');
  const worksGrid = document.getElementById('worksGrid');
  const reviewsGrid = document.getElementById('reviewsGrid');
  const hireBtn = document.getElementById('artisanProfileHireBtn');
  const messageBtn = document.getElementById('artisanProfileMessageBtn');

  if (cover) cover.src = artisan.image || artisan.avatar || '';
  if (avatar) avatar.src = artisan.avatar || '';
  if (name) name.textContent = artisan.name || '';
  if (service) service.textContent = artisan.service || '';
  if (ratingEl) ratingEl.textContent = `${artisan.rating || 0} ★`;
  if (locationEl) locationEl.textContent = `${artisan.city || ''}${artisan.state ? `, ${artisan.state}` : ''}`.trim();

  if (tagsEl) {
    const tags = Array.isArray(artisan.tags) ? artisan.tags : [];
    tagsEl.innerHTML = tags.map(t => `<span class="artisan-tag">${t}</span>`).join('');
  }

  if (hireBtn) {
    hireBtn.href = `hire-step-1.html?artisan=${artisan.id}`;
    hireBtn.setAttribute('data-auth', 'hire');
    hireBtn.setAttribute('data-artisan-id', String(artisan.id));
    hireBtn.setAttribute('data-artisan-name', artisan.name || 'Artisan');
  }

  // Works
  if (worksGrid) {
    if ((!works || works.length === 0) && artisan.image) {
      works = [
        { title: `${artisan.name || 'Artisan'} - Featured Work`, image: artisan.image },
        { title: `${artisan.service || 'Service'} Sample Project`, image: artisan.image }
      ];
    }
    worksGrid.innerHTML = (works || [])
      .map(w => `
        <div class="works-card">
          <img src="${w.image || ''}" alt="${w.title || 'Work'}">
          <div class="works-card-body">
            <div class="works-card-title">${w.title || ''}</div>
            <div class="works-card-desc"></div>
          </div>
        </div>
      `).join('');

    if (!worksGrid.innerHTML.trim()) {
      worksGrid.innerHTML = `
        <div class="works-card">
          <img src="${artisan.image || artisan.avatar || ''}" alt="Work placeholder">
          <div class="works-card-body">
            <div class="works-card-title">Work gallery coming soon</div>
            <div class="works-card-desc"></div>
          </div>
        </div>
      `;
    }
  }

  // Reviews
  if (reviewsGrid) {
    let normalizedReviews = (reviews || []).map(r => ({
      name: r.name || r.reviewerName || 'Anonymous',
      rating: Number(r.rating || 0),
      text: r.text || '',
      date: r.date || formatReviewDate(r.createdAt)
    }));

    if (!normalizedReviews || normalizedReviews.length === 0) {
      normalizedReviews = [
        {
          name: 'ArtisanConnect',
          rating: artisan.rating || 5,
          text: 'This artisan profile is ready. Customer reviews will appear here after completed jobs.',
          date: 'Today'
        }
      ];
    }

    reviewsGrid.innerHTML = normalizedReviews.map(r => `
      <div class="review-card">
        <div class="review-head">
          <div class="review-name">${r.name || ''}</div>
          <div class="review-stars">${renderStars(r.rating || 0)}</div>
        </div>
        <div class="review-text">${r.text || ''}</div>
        <div class="review-date">${r.date || ''}</div>
      </div>
    `).join('');
  }

  // Messaging: ensure a conversation exists, then open it.
  if (messageBtn) {
    messageBtn.addEventListener('click', async () => {
      if (!isLoggedIn()) {
        requireAuth({
          mode: 'login',
          redirectTo: window.location.href
        });
        return;
      }

      try {
        const res = await fetch(`${apiBase}/conversations/start.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artisanId: artisan.id })
        });
        
        if (!res.ok) {
          showToast && showToast('Could not open chat. Please try again.', 'warning');
          return;
        }
        
        const data = await res.json();
        if (data?.ok && data?.conversationId) {
          window.location.href = `messages.html?chat=${encodeURIComponent(data.conversationId)}`;
          return;
        } else {
          showToast && showToast('Failed to start conversation', 'error');
        }
      } catch (e) {
        console.error('Error starting conversation:', e);
        showToast && showToast('Network error. Please try again.', 'error');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initArtisanProfile();
});

