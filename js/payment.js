/**
 * ArtisanConnect - Payment Page JavaScript
 */

const ARTISAN_CATALOG = {
  1: { name: 'Mike Johnson', service: 'Plumber', category: 'plumbing', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', hourlyRate: 45000, materialsFee: 45000, messageChatId: 1 },
  2: { name: 'David Chen', service: 'Electrician', category: 'electrical', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', hourlyRate: 55000, materialsFee: 45000, messageChatId: 2 },
  3: { name: 'Robert Williams', service: 'Carpenter', category: 'carpentry', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', hourlyRate: 50000, materialsFee: 38000, messageChatId: 3 },
  4: { name: 'Lisa Anderson', service: 'Cleaner', category: 'cleaning', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', hourlyRate: 35000, materialsFee: 15000, messageChatId: 4 },
  5: { name: 'Sarah Johnson', service: 'Plumber', category: 'plumbing', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', hourlyRate: 60000, materialsFee: 50000, messageChatId: 1 },
  6: { name: 'James Miller', service: 'HVAC Technician', category: 'hvac', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', hourlyRate: 75000, materialsFee: 55000, messageChatId: 2 },
  7: { name: 'Maria Garcia', service: 'Painter', category: 'painting', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', hourlyRate: 40000, materialsFee: 32000, messageChatId: 3 },
  8: { name: 'Tom Wilson', service: 'Gardener', category: 'gardening', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop', hourlyRate: 30000, materialsFee: 18000, messageChatId: 4 },
  9: { name: 'Chinedu Okafor', service: 'Generator Technician', category: 'electrical', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', hourlyRate: 50000, materialsFee: 35000, messageChatId: 2 },
  10: { name: 'Amina Bello', service: 'Borehole & Water Pump Technician', category: 'plumbing', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', hourlyRate: 65000, materialsFee: 55000, messageChatId: 1 },
  11: { name: 'Kelechi Nwosu', service: 'Tiler (Floors & Bathrooms)', category: 'carpentry', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', hourlyRate: 55000, materialsFee: 45000, messageChatId: 3 },
  12: { name: 'Seyi Adeyemi', service: 'AC Installer & Repair', category: 'hvac', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', hourlyRate: 80000, materialsFee: 60000, messageChatId: 2 },
  13: { name: 'Hadiza Musa', service: 'Laundry & Home Cleaning', category: 'cleaning', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', hourlyRate: 28000, materialsFee: 12000, messageChatId: 4 },
  14: { name: 'Ibrahim Sani', service: 'DSTV / CCTV Installer', category: 'electrical', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', hourlyRate: 35000, materialsFee: 20000, messageChatId: 2 },
  15: { name: 'Ngozi Eze', service: 'Hair Stylist (Home Service)', category: 'tailoring', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', hourlyRate: 25000, materialsFee: 8000, messageChatId: 3 },
  16: { name: 'Tunde Salami', service: 'POP Ceiling & Screeding', category: 'painting', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', hourlyRate: 70000, materialsFee: 50000, messageChatId: 3 }
};

const CATEGORY_PRICING = {
  plumbing: { platformFee: 6000, taxRate: 0.075 },
  electrical: { platformFee: 7000, taxRate: 0.085 },
  carpentry: { platformFee: 5500, taxRate: 0.07 },
  cleaning: { platformFee: 3000, taxRate: 0.05 },
  hvac: { platformFee: 7500, taxRate: 0.09 },
  painting: { platformFee: 5000, taxRate: 0.065 },
  gardening: { platformFee: 3500, taxRate: 0.05 },
  tailoring: { platformFee: 3000, taxRate: 0.04 }
};
const DEFAULT_PRICING = { platformFee: 5000, taxRate: 0.08 };

let selectedArtisanId = 2;
let selectedArtisan = ARTISAN_CATALOG[selectedArtisanId];

// ============================================
// PAYMENT METHOD SELECTION
// ============================================

function selectPaymentMethod(element, method) {
  // Remove selected class from all items
  document.querySelectorAll('.payment-method-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Add selected class to clicked item
  element.classList.add('selected');
  
  // Show/hide card form based on selection
  const cardForm = document.getElementById('cardForm');
  if (method === 'card') {
    cardForm.classList.add('active');
  } else {
    cardForm.classList.remove('active');
  }
}

// ============================================
// CARD NUMBER FORMATTING
// ============================================

function formatCardNumber(input) {
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
  let formattedValue = '';
  
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formattedValue += ' ';
    }
    formattedValue += value[i];
  }
  
  input.value = formattedValue;
}

// ============================================
// EXPIRY DATE FORMATTING
// ============================================

function formatExpiry(input) {
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  
  input.value = value;
}

function getHoursValue() {
  const raw = Number(document.getElementById('hoursInput')?.value || 1);
  return Math.max(1, Math.min(24, raw));
}

function getMaterialsEstimateValue() {
  const raw = Number(document.getElementById('materialsEstimateInput')?.value ?? selectedArtisan.materialsFee);
  return Math.max(0, raw);
}

function getCategoryPricing() {
  return CATEGORY_PRICING[selectedArtisan.category] || DEFAULT_PRICING;
}

function calculateTotals() {
  const pricing = getCategoryPricing();
  const hours = getHoursValue();
  const serviceFee = selectedArtisan.hourlyRate * hours;
  const materialsFee = getMaterialsEstimateValue();
  const taxable = serviceFee + materialsFee + pricing.platformFee;
  const taxFee = Math.round(taxable * pricing.taxRate);
  const total = taxable + taxFee;
  return { hours, serviceFee, materialsFee, platformFee: pricing.platformFee, taxRate: pricing.taxRate, taxFee, total };
}

function formatNaira(value) {
  if (typeof formatCurrency === 'function') return formatCurrency(value);
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`;
}

function updateSummaryUI() {
  const info = selectedArtisan;
  const totals = calculateTotals();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const avatar = document.getElementById('summaryArtisanAvatar');
  if (avatar) avatar.src = info.avatar;
  setText('summaryArtisanName', info.name);
  setText('summaryArtisanService', info.service);
  setText('summaryServiceValue', `${info.service} (${totals.hours} hour${totals.hours > 1 ? 's' : ''})`);
  setText('hourlyRateDisplay', `${formatNaira(info.hourlyRate)} / hr`);
  setText('platformFeeLabel', `Platform Fee (${info.category || 'general'})`);
  setText('taxFeeLabel', `Tax (${(totals.taxRate * 100).toFixed(1)}%)`);

  setText('serviceFeeValue', formatNaira(totals.serviceFee));
  setText('materialsFeeValue', formatNaira(totals.materialsFee));
  setText('platformFeeValue', formatNaira(totals.platformFee));
  setText('taxFeeValue', formatNaira(totals.taxFee));
  setText('orderTotalValue', formatNaira(totals.total));
  setText('payBtnText', `Pay ${formatNaira(totals.total)}`);
  setText('successAmountPaid', formatNaira(totals.total));
}

function initArtisanFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const artisanParam = Number(params.get('artisan'));
  if (artisanParam && ARTISAN_CATALOG[artisanParam]) {
    selectedArtisanId = artisanParam;
  }
  selectedArtisan = ARTISAN_CATALOG[selectedArtisanId] || ARTISAN_CATALOG[2];
  const materialsInput = document.getElementById('materialsEstimateInput');
  if (materialsInput) materialsInput.value = String(selectedArtisan.materialsFee);
}

function initNegotiationButton() {
  const btn = document.getElementById('negotiateBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const chatId = selectedArtisan.messageChatId || selectedArtisanId;
    window.location.href = `messages.html?chat=${chatId}`;
  });
}

// ============================================
// VALIDATE CARD
// ============================================

function validateCard() {
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const cardName = document.getElementById('cardName').value.trim();
  const cardExpiry = document.getElementById('cardExpiry').value;
  const cardCvv = document.getElementById('cardCvv').value;
  
  if (!cardNumber || cardNumber.length < 13) {
    showToast('Please enter a valid card number', 'error');
    return false;
  }
  
  if (!cardName) {
    showToast('Please enter the cardholder name', 'error');
    return false;
  }
  
  if (!cardExpiry || cardExpiry.length < 5) {
    showToast('Please enter a valid expiry date', 'error');
    return false;
  }
  
  if (!cardCvv || cardCvv.length < 3) {
    showToast('Please enter a valid CVV', 'error');
    return false;
  }
  
  return true;
}

function validateRequestDetails() {
  const needs = document.getElementById('jobNeeds')?.value?.trim() || '';
  const hours = getHoursValue();
  if (!needs) {
    showToast('Please describe your needs before proceeding', 'warning');
    return false;
  }
  if (hours < 1) {
    showToast('Please choose at least 1 hour', 'warning');
    return false;
  }
  return true;
}

// ============================================
// PROCESS PAYMENT
// ============================================

function processPayment() {
  const payBtn = document.getElementById('payBtn');
  const payBtnText = document.getElementById('payBtnText');

  if (!validateRequestDetails()) return;
  
  // Validate if card is selected
  const cardMethodSelected = document.querySelector('.payment-method-item.selected').textContent.includes('Card');
  if (cardMethodSelected && !validateCard()) {
    return;
  }
  
  // Show loading state
  payBtn.disabled = true;
  payBtnText.innerHTML = '<span class="loader loader-sm"></span> Processing...';
  
  // Simulate payment processing
  setTimeout(() => {
    // Show success
    showPaymentSuccess();
  }, 2000);
}

// ============================================
// SHOW PAYMENT SUCCESS
// ============================================

function showPaymentSuccess() {
  const paymentForm = document.getElementById('paymentForm');
  const paymentSuccess = document.getElementById('paymentSuccess');
  const paymentDate = document.getElementById('paymentDate');
  
  // Set current date
  const now = new Date();
  paymentDate.textContent = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
  
  // Hide form, show success
  paymentForm.style.display = 'none';
  paymentSuccess.style.display = 'block';
  
  // Show toast
  showToast('Payment completed successfully!', 'success');
  
  // Save order to localStorage
  saveOrder();
}

// ============================================
// SAVE ORDER
// ============================================

function saveOrder() {
  const totals = calculateTotals();
  const needs = document.getElementById('jobNeeds')?.value?.trim() || '';
  const hours = getHoursValue();
  const order = {
    id: 'ORD-' + Date.now(),
    artisanId: selectedArtisanId,
    artisanName: selectedArtisan.name,
    service: selectedArtisan.service,
    needs,
    hours,
    hourlyRate: selectedArtisan.hourlyRate,
    materialsEstimate: totals.materialsFee,
    platformFee: totals.platformFee,
    taxRate: totals.taxRate,
    amount: totals.total,
    status: 'pending',
    date: new Date().toISOString(),
    timeline: [
      {
        status: 'request-sent',
        title: 'Request Sent',
        description: `Your service request has been sent to ${selectedArtisan.name}`,
        time: new Date().toISOString(),
        completed: true
      }
    ]
  };
  
  // Get existing orders
  const orders = getStorage('orders') || [];
  orders.push(order);
  setStorage('orders', orders);
}

// ============================================
// STORAGE HELPERS
// ============================================

function getStorage(key) {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initArtisanFromQuery();
  updateSummaryUI();
  initNegotiationButton();

  const hoursInput = document.getElementById('hoursInput');
  if (hoursInput) {
    hoursInput.addEventListener('input', () => {
      hoursInput.value = String(getHoursValue());
      updateSummaryUI();
    });
  }

  const materialsInput = document.getElementById('materialsEstimateInput');
  if (materialsInput) {
    materialsInput.addEventListener('input', () => {
      const clean = Math.max(0, Number(materialsInput.value || 0));
      materialsInput.value = String(clean);
      updateSummaryUI();
    });
  }

  // Pre-fill card number for demo
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.value = '4532 1234 5678 9012';
  }
  
  const cardName = document.getElementById('cardName');
  if (cardName) {
    cardName.value = 'John Doe';
  }
  
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.value = '12/25';
  }
  
  const cardCvv = document.getElementById('cardCvv');
  if (cardCvv) {
    cardCvv.value = '123';
  }
});
