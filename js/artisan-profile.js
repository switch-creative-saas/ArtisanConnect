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

async function initArtisanProfile() {
  const artisanIdRaw = getQueryParam('artisan');
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

  const show = await fetchJson(`${apiBase}/artisans/show.php?id=${encodeURIComponent(artisanId)}`);
  if (!show?.ok || !show?.artisan) return;
  const artisan = show.artisan;

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
    hireBtn.onclick = (e) => {
      // Let the existing hire guard handle auth redirects.
      e.stopPropagation();
    };
  }

  // Works (from API)
  if (worksGrid) {
    const worksRes = await fetchJson(`${apiBase}/artisans/works.php?id=${encodeURIComponent(artisanId)}`);
    const works = worksRes?.ok ? worksRes.works : [];
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
  }

  // Reviews (from API)
  if (reviewsGrid) {
    const reviewsRes = await fetchJson(`${apiBase}/artisans/reviews.php?id=${encodeURIComponent(artisanId)}`);
    const reviews = reviewsRes?.ok ? reviewsRes.reviews : [];

    reviewsGrid.innerHTML = (reviews || []).map(r => `
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

  // Messaging: keep existing URL behavior for now.
  if (messageBtn) {
    messageBtn.addEventListener('click', () => {
      window.location.href = `messages.html?chat=${artisan.id}`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initArtisanProfile();
});

