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

function initArtisanProfile() {
  const artisanIdRaw = getQueryParam('artisan');
  const artisanId = Number(artisanIdRaw);
  if (!Number.isFinite(artisanId) || typeof artisansData === 'undefined') return;

  const artisan = artisansData.find(a => a.id === artisanId);
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
  if (name) name.textContent = artisan.name;
  if (service) service.textContent = artisan.service;
  if (ratingEl) ratingEl.textContent = `${artisan.rating} ★`;
  if (locationEl) locationEl.textContent = `${artisan.city || ''}${artisan.state ? `, ${artisan.state}` : ''}`.trim();

  if (tagsEl) {
    tagsEl.innerHTML = artisan.tags
      .map(t => `<span class="artisan-tag">${t}</span>`)
      .join('');
  }

  if (hireBtn) {
    hireBtn.href = `hire-step-1.html?artisan=${artisan.id}`;
    hireBtn.onclick = (e) => {
      // Let the existing hire guard in hire-flow handle auth redirects
      e.stopPropagation();
    };
  }

  // Works (mock)
  if (worksGrid) {
    const works = [
      { title: `${artisan.service} Project`, desc: 'Completed with high-quality finishing', img: artisan.image },
      { title: `Before & After`, desc: 'Improved condition and performance', img: artisan.image },
      { title: 'Repairs & Upgrades', desc: 'Diagnostics, repair, and refinement', img: artisan.image }
    ];
    worksGrid.innerHTML = works
      .map(w => `
        <div class="works-card">
          <img src="${w.img}" alt="${w.title}">
          <div class="works-card-body">
            <div class="works-card-title">${w.title}</div>
            <div class="works-card-desc">${w.desc}</div>
          </div>
        </div>
      `).join('');
  }

  // Reviews (mock; tailored to artisan)
  if (reviewsGrid) {
    const baseName = artisan.name.split(' ')[0];
    const reviews = [
      { name: `Kemi (${artisan.city || 'Nigeria'})`, rating: Math.min(5, artisan.rating + 0.1), text: `Working with ${baseName} was smooth. They communicated well and delivered on time.`, date: 'Just now' },
      { name: `Tolu (${artisan.state || 'Lagos'})`, rating: artisan.rating, text: `Great job on the ${artisan.service.toLowerCase()}. The results look clean and professional.`, date: 'Yesterday' },
      { name: `Chisom (${artisan.city || 'Enugu'})`, rating: Math.max(3.5, artisan.rating - 0.2), text: `Very professional. Some minor delays, but the final work was worth it.`, date: '2 days ago' }
    ];

    reviewsGrid.innerHTML = reviews
      .map(r => `
        <div class="review-card">
          <div class="review-head">
            <div class="review-name">${r.name}</div>
            <div class="review-stars">${renderStars(r.rating)}</div>
          </div>
          <div class="review-text">${r.text}</div>
          <div class="review-date">${r.date}</div>
        </div>
      `).join('');
  }

  if (messageBtn) {
    messageBtn.addEventListener('click', () => {
      const chatId = artisan.id; // reuse artisan id as mock chat id
      window.location.href = `messages.html?chat=${chatId}`;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // `search.js` exposes `artisansData` on window; we intentionally guard to avoid crashing.
  if (typeof artisansData === 'undefined') return;
  initArtisanProfile();
});

