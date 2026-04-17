const HIRE_FLOW_STORAGE_KEY = 'hireDraft';
const HIRE_CATEGORY_PRICING = {
  plumbing: { platformFee: 6000, taxRate: 0.075 },
  electrical: { platformFee: 7000, taxRate: 0.085 },
  carpentry: { platformFee: 5500, taxRate: 0.07 },
  cleaning: { platformFee: 3000, taxRate: 0.05 },
  hvac: { platformFee: 7500, taxRate: 0.09 },
  painting: { platformFee: 5000, taxRate: 0.065 },
  gardening: { platformFee: 3500, taxRate: 0.05 },
  tailoring: { platformFee: 3000, taxRate: 0.04 }
};
const HIRE_DEFAULT_PRICING = { platformFee: 5000, taxRate: 0.08 };

const HIRE_ARTISANS = {
  1: { name: 'Mike Johnson', service: 'Plumber', category: 'plumbing', hourlyRate: 45000, materialsFee: 45000, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', chatId: 1 },
  2: { name: 'David Chen', service: 'Electrician', category: 'electrical', hourlyRate: 55000, materialsFee: 45000, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', chatId: 2 },
  3: { name: 'Robert Williams', service: 'Carpenter', category: 'carpentry', hourlyRate: 50000, materialsFee: 38000, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', chatId: 3 },
  4: { name: 'Lisa Anderson', service: 'Cleaner', category: 'cleaning', hourlyRate: 35000, materialsFee: 15000, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', chatId: 4 }
};

function formatNaira(value) {
  if (typeof formatCurrency === 'function') return formatCurrency(value);
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`;
}

function getDraft() {
  const raw = sessionStorage.getItem(HIRE_FLOW_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setDraft(draft) {
  sessionStorage.setItem(HIRE_FLOW_STORAGE_KEY, JSON.stringify(draft));
}

function buildInitialDraft() {
  const params = new URLSearchParams(window.location.search);
  const artisanId = Number(params.get('artisan')) || 2;
  const artisan = HIRE_ARTISANS[artisanId] || HIRE_ARTISANS[2];
  return {
    artisanId,
    artisan,
    needs: '',
    address: '',
    hours: 2,
    materialsEstimate: artisan.materialsFee,
    paymentMethod: 'card'
  };
}

function ensureDraft() {
  let draft = getDraft();
  if (!draft || !draft.artisan) {
    draft = buildInitialDraft();
    setDraft(draft);
  }
  return draft;
}

function getPricing(draft) {
  const pricing = HIRE_CATEGORY_PRICING[draft.artisan.category] || HIRE_DEFAULT_PRICING;
  const serviceFee = draft.hours * draft.artisan.hourlyRate;
  const materialsFee = Math.max(0, Number(draft.materialsEstimate || 0));
  const taxable = serviceFee + materialsFee + pricing.platformFee;
  const taxFee = Math.round(taxable * pricing.taxRate);
  return {
    serviceFee,
    materialsFee,
    platformFee: pricing.platformFee,
    taxRate: pricing.taxRate,
    taxFee,
    total: taxable + taxFee
  };
}

function fillArtisanSummary(draft) {
  const avatar = document.getElementById('artisanAvatar');
  const name = document.getElementById('artisanName');
  const service = document.getElementById('artisanService');
  if (avatar) avatar.src = draft.artisan.avatar;
  if (name) name.textContent = draft.artisan.name;
  if (service) service.textContent = `${draft.artisan.service} · ${formatNaira(draft.artisan.hourlyRate)}/hr`;
}

function initStep1() {
  const draft = ensureDraft();
  fillArtisanSummary(draft);
  const needs = document.getElementById('jobNeeds');
  const address = document.getElementById('jobAddress');
  if (needs) needs.value = draft.needs || '';
  if (address) address.value = draft.address || '';

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const updated = { ...draft, needs: needs.value.trim(), address: address.value.trim() };
      if (!updated.needs) {
        showToast('Please describe your needs first', 'warning');
        return;
      }
      setDraft(updated);
      window.location.href = 'hire-step-2.html';
    });
  }
}

function initStep2() {
  const draft = ensureDraft();
  fillArtisanSummary(draft);

  const hours = document.getElementById('hoursInput');
  const materials = document.getElementById('materialsEstimateInput');
  const preview = document.getElementById('step2Preview');
  hours.value = draft.hours || 2;
  materials.value = draft.materialsEstimate || draft.artisan.materialsFee;

  function refreshPreview() {
    const temp = {
      ...draft,
      hours: Math.max(1, Math.min(24, Number(hours.value || 1))),
      materialsEstimate: Math.max(0, Number(materials.value || 0))
    };
    const p = getPricing(temp);
    preview.textContent = `Estimated total: ${formatNaira(p.total)}`;
  }
  refreshPreview();

  hours.addEventListener('input', refreshPreview);
  materials.addEventListener('input', refreshPreview);

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const updated = {
        ...draft,
        hours: Math.max(1, Math.min(24, Number(hours.value || 1))),
        materialsEstimate: Math.max(0, Number(materials.value || 0))
      };
      setDraft(updated);
      window.location.href = 'hire-step-3.html';
    });
  }
}

function initStep3() {
  const draft = ensureDraft();
  fillArtisanSummary(draft);

  const paymentMethod = document.getElementById('paymentMethod');
  if (paymentMethod) paymentMethod.value = draft.paymentMethod || 'card';

  const enquiryBtn = document.getElementById('enquiryBtn');
  enquiryBtn?.addEventListener('click', () => {
    window.location.href = `messages.html?chat=${draft.artisan.chatId || draft.artisanId}`;
  });

  const nextBtn = document.getElementById('nextBtn');
  nextBtn?.addEventListener('click', () => {
    const updated = { ...draft, paymentMethod: paymentMethod.value };
    setDraft(updated);
    window.location.href = 'hire-summary.html';
  });
}

function initSummary() {
  const draft = ensureDraft();
  fillArtisanSummary(draft);
  const pricing = getPricing(draft);

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('sumNeeds', draft.needs || 'N/A');
  setText('sumAddress', draft.address || 'N/A');
  setText('sumHours', `${draft.hours} hour(s)`);
  setText('sumHourly', formatNaira(draft.artisan.hourlyRate));
  setText('sumService', formatNaira(pricing.serviceFee));
  setText('sumMaterials', formatNaira(pricing.materialsFee));
  setText('sumPlatform', formatNaira(pricing.platformFee));
  setText('sumTaxLabel', `Tax (${(pricing.taxRate * 100).toFixed(1)}%)`);
  setText('sumTax', formatNaira(pricing.taxFee));
  setText('sumTotal', formatNaira(pricing.total));

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn?.addEventListener('click', () => {
    // Move to payment options step
    window.location.href = 'hire-payment.html';
  });
}

function formatCardNumberInput(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiryInput(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidExpiry(mmYY) {
  const m = String(mmYY || '').match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const mm = Number(m[1]);
  const yy = Number(m[2]);
  if (mm < 1 || mm > 12) return false;
  // Loose "not in the past" check
  const now = new Date();
  const currentYY = Number(String(now.getFullYear()).slice(-2));
  const currentMM = now.getMonth() + 1;
  if (yy < currentYY) return false;
  if (yy === currentYY && mm < currentMM) return false;
  return true;
}

function initPayment() {
  const draft = ensureDraft();
  fillArtisanSummary(draft);
  const pricing = getPricing(draft);

  const method = document.getElementById('paymentMethod');
  if (method) method.value = draft.paymentMethod || 'card';

  const payTotal = document.getElementById('payTotal');
  if (payTotal) payTotal.textContent = formatNaira(pricing.total);

  const cardSection = document.getElementById('cardSection');
  const transferSection = document.getElementById('transferSection');
  const payBtn = document.getElementById('payBtn');
  const confirmTransferBtn = document.getElementById('confirmTransferBtn');
  const payBtnText = document.getElementById('payBtnText');
  if (payBtnText) payBtnText.textContent = `Pay ${formatNaira(pricing.total)}`;

  // Mock bank details (demo)
  const bankNameEl = document.getElementById('bankName');
  const accountNameEl = document.getElementById('accountName');
  const accountNumberEl = document.getElementById('accountNumber');
  const transferRefEl = document.getElementById('transferRef');
  const ref = `AC-${draft.artisanId}-${Date.now().toString().slice(-6)}`;
  if (bankNameEl) bankNameEl.textContent = 'GTBank';
  if (accountNameEl) accountNameEl.textContent = `${draft.artisan.name} (ArtisanConnect)`;
  if (accountNumberEl) accountNumberEl.textContent = `0${String(700000000 + (draft.artisanId * 9317)).slice(0, 9)}`;
  if (transferRefEl) transferRefEl.textContent = ref;

  const cardNumber = document.getElementById('cardNumber');
  const cardName = document.getElementById('cardName');
  const cardExpiry = document.getElementById('cardExpiry');
  const cardCvv = document.getElementById('cardCvv');

  if (cardNumber) {
    cardNumber.addEventListener('input', () => {
      cardNumber.value = formatCardNumberInput(cardNumber.value);
    });
  }
  if (cardExpiry) {
    cardExpiry.addEventListener('input', () => {
      cardExpiry.value = formatExpiryInput(cardExpiry.value);
    });
  }

  function applyMode() {
    const m = method?.value || 'card';
    const isTransfer = m === 'transfer';
    if (cardSection) cardSection.style.display = isTransfer ? 'none' : 'block';
    if (transferSection) transferSection.style.display = isTransfer ? 'block' : 'none';
    if (payBtn) payBtn.style.display = isTransfer ? 'none' : 'inline-flex';
    if (confirmTransferBtn) confirmTransferBtn.style.display = isTransfer ? 'inline-flex' : 'none';
  }
  applyMode();
  method?.addEventListener('change', () => {
    const updated = { ...draft, paymentMethod: method.value };
    setDraft(updated);
    applyMode();
  });

  function saveOrderAndNotify(updatedDraft, finalPricing, noteText, redirectToChat = true) {
    // Legacy path retained for backwards compatibility. The real payment step now calls the backend.
    console.warn('saveOrderAndNotify is legacy; use backend hire/create instead.');
  }

  payBtn?.addEventListener('click', () => {
    const updated = { ...ensureDraft(), paymentMethod: method.value || 'card' };
    setDraft(updated);

    // Basic card validation (demo)
    const cardDigits = String(cardNumber?.value || '').replace(/\D/g, '');
    if (cardDigits.length !== 16) {
      showToast('Please enter a valid 16-digit card number', 'warning');
      return;
    }
    if (!String(cardName?.value || '').trim()) {
      showToast('Please enter the name on the card', 'warning');
      return;
    }
    if (!isValidExpiry(cardExpiry?.value)) {
      showToast('Please enter a valid expiry date (MM/YY)', 'warning');
      return;
    }
    const cvvDigits = String(cardCvv?.value || '').replace(/\D/g, '');
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      showToast('Please enter a valid CVV', 'warning');
      return;
    }

    payBtn.disabled = true;
    if (payBtnText) payBtnText.textContent = 'Processing...';

    (async () => {
      try {
        const finalPricing = getPricing(updated);
        // Prefer backend pricing (source of truth), but keep UI calculation for immediate feedback.
        showToast('Payment successful. Notifying artisan…', 'success');

        const apiBase = typeof getApiBaseUrl === 'function'
          ? getApiBaseUrl()
          : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;
        const res = await fetch(`${apiBase}/hire/create.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artisanId: updated.artisanId,
            needs: updated.needs,
            address: updated.address,
            hours: updated.hours,
            materialsEstimate: updated.materialsEstimate,
            paymentMethod: updated.paymentMethod
          })
        });

        if (!res.ok) {
          let err = null;
          try { err = await res.json(); } catch (e) {}
          showToast(err?.error || 'Checkout failed. Please try again.', 'error');
          payBtn.disabled = false;
          if (payBtnText) payBtnText.textContent = `Pay ${formatNaira(finalPricing.total)}`;
          return;
        }

        const data = await res.json();
        if (!data?.ok || !data?.conversationId) {
          showToast('Checkout succeeded but redirect failed. Please try again.', 'warning');
          payBtn.disabled = false;
          if (payBtnText) payBtnText.textContent = `Pay ${formatNaira(finalPricing.total)}`;
          return;
        }

        sessionStorage.removeItem(HIRE_FLOW_STORAGE_KEY);
        window.location.href = `messages.html?chat=${encodeURIComponent(data.conversationId)}`;
      } catch (e) {
        showToast('Network error. Please try again.', 'error');
        payBtn.disabled = false;
      }
    })();
  });

  confirmTransferBtn?.addEventListener('click', () => {
    const updated = { ...ensureDraft(), paymentMethod: 'transfer' };
    setDraft(updated);
    const finalPricing = getPricing(updated);
    const note = `Hi ${updated.artisan.name}, I’ve made a bank transfer for ${formatNaira(finalPricing.total)}. Reference: ${ref}. Please confirm when received.`;
    showToast('Transfer noted. Opening Messages…', 'success');
    (async () => {
      try {
        showToast('Transfer noted. Notifying artisan…', 'success');

        const apiBase = typeof getApiBaseUrl === 'function'
          ? getApiBaseUrl()
          : `${typeof getSiteRootPrefix === 'function' ? getSiteRootPrefix() : ''}backend/api`;
        const res = await fetch(`${apiBase}/hire/create.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artisanId: updated.artisanId,
            needs: updated.needs,
            address: updated.address,
            hours: updated.hours,
            materialsEstimate: updated.materialsEstimate,
            paymentMethod: 'transfer'
          })
        });

        if (!res.ok) {
          let err = null;
          try { err = await res.json(); } catch (e) {}
          showToast(err?.error || 'Checkout failed. Please try again.', 'error');
          return;
        }

        const data = await res.json();
        if (!data?.ok || !data?.conversationId) {
          showToast('Checkout succeeded but redirect failed. Please try again.', 'warning');
          return;
        }

        sessionStorage.removeItem(HIRE_FLOW_STORAGE_KEY);
        window.location.href = `messages.html?chat=${encodeURIComponent(data.conversationId)}`;
      } catch (e) {
        showToast('Network error. Please try again.', 'error');
      }
    })();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const step = document.body.getAttribute('data-step');
  if (step === '1') initStep1();
  else if (step === '2') initStep2();
  else if (step === '3') initStep3();
  else if (step === 'summary') initSummary();
  else if (step === 'payment') initPayment();
});
