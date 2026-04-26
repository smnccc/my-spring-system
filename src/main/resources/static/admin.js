/* ═══════════════════════════════════════════════════════════════
   FurReal Admin — admin.js (WITH PAYMENTS TAB - FULL VERSION)
   Backend URL: http://localhost:6060/admin
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ==================== CONFIGURATION ====================
const ADMIN_API_BASE_URL = 'http://localhost:6060/admin';
const API_BASE_URL = 'http://localhost:6060';

const LOCATIONS = [
  'Metro Manila, Philippines','Quezon City, Philippines','Makati City, Philippines',
  'Taguig City, Philippines','Pasig City, Philippines','Mandaluyong City, Philippines',
  'Manila City, Philippines','Caloocan City, Philippines','Cebu City, Philippines',
  'Davao City, Philippines','Baguio City, Philippines','Iloilo City, Philippines',
  'Bacolod City, Philippines','Cagayan de Oro City, Philippines','General Santos City, Philippines',
  'Batangas City, Philippines','Lipa City, Philippines','Laguna, Philippines',
  'Cavite, Philippines','Bulacan, Philippines','Pampanga, Philippines'
];

const BREED_IMAGES = {
  dog: [
    { name: 'Askal (Asong Pinoy / Mixed Breed)', image: 'images/askal.jpg', description: 'Loyal, resilient, intelligent — the beloved native Filipino dog', chips: ['Native Breed','Resilient','Loyal'] },
    { name: 'Golden Retriever', image: 'images/golden-retriever.jpg', description: 'Friendly, intelligent, and devoted', chips: ['Family-friendly','Medium-Large','Active'] },
    { name: 'Labrador Retriever', image: 'images/labrador.jpg', description: 'Playful, loyal, and energetic', chips: ['Family-friendly','Large','Energetic'] },
    { name: 'Beagle', image: 'images/beagle.jpg', description: 'Curious, friendly, and merry', chips: ['Small-Medium','Curious','Outdoor'] },
    { name: 'Siberian Husky', image: 'images/husky.jpg', description: 'Active, adventurous, and outgoing', chips: ['Large','Active','Cold-weather'] },
    { name: 'German Shepherd', image: 'images/german-shepherd.jpg', description: 'Confident, courageous, and smart', chips: ['Large','Protective','Smart'] },
    { name: 'Poodle', image: 'images/poodle.jpg', description: 'Intelligent, active, and alert', chips: ['Medium','Hypoallergenic','Smart'] },
    { name: 'French Bulldog', image: 'images/french-bulldog.jpg', description: 'Adaptable, playful, and smart', chips: ['Small','Indoor','Playful'] },
    { name: 'Corgi', image: 'images/corgi.jpg', description: 'Affectionate, smart, and active', chips: ['Small-Medium','Smart','Active'] },
    { name: 'Shih Tzu', image: 'images/shih-tzu.jpg', description: 'Affectionate, playful, and outgoing', chips: ['Small','Indoor','Gentle'] },
    { name: 'Chow Chow', image: 'images/chow-chow.jpg', description: 'Loyal, independent, and protective', chips: ['Large','Independent','Protective'] }
  ],
  cat: [
    { name: 'Puspin (Pusang Pinoy / Mixed Breed)', image: 'images/puspin.jpg', description: 'Resilient, independent, and loving native Filipino cat', chips: ['Native Breed','Resilient','Independent'] },
    { name: 'Persian', image: 'images/persian.jpg', description: 'Calm, gentle, and affectionate', chips: ['Indoor','Low energy','Quiet'] },
    { name: 'Siamese', image: 'images/siamese.jpg', description: 'Vocal, social, and intelligent', chips: ['Social','Vocal','Active'] },
    { name: 'Maine Coon', image: 'images/maine-coon.jpg', description: 'Friendly, gentle, and intelligent', chips: ['Large','Gentle','Friendly'] },
    { name: 'Ragdoll', image: 'images/ragdoll.jpg', description: 'Relaxed, affectionate, and floppy', chips: ['Indoor','Calm','Cuddly'] },
    { name: 'British Shorthair', image: 'images/british-shorthair.jpg', description: 'Calm, dignified, and loyal', chips: ['Medium','Calm','Independent'] },
    { name: 'Bengal', image: 'images/bengal.jpg', description: 'Energetic, curious, and playful', chips: ['Active','Curious','Playful'] },
    { name: 'Scottish Fold', image: 'images/scottish-fold.jpg', description: 'Sweet, calm, and adaptable', chips: ['Small-Medium','Calm','Adaptable'] },
    { name: 'Sphynx', image: 'images/sphynx.jpg', description: 'Loving, energetic, and social', chips: ['Hairless','Social','Warm-loving'] },
    { name: 'American Shorthair', image: 'images/american-shorthair.jpg', description: 'Easygoing, affectionate, and adaptable', chips: ['Medium','Easygoing','Family-friendly'] }
  ]
};

// ==================== GLOBAL STATE ====================
let pets = [];
let users = [];
let adoptions = [];
let payments = [];
const _preloadCache = [];

// ==================== API SERVICE ====================
const AdminApiService = {
  async _fetch(url, options = {}) {
    try {
      const res = await fetch(url, options);
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, data: [], message: err.message };
    }
  },
  getStats() { return this._fetch(`${ADMIN_API_BASE_URL}/stats`); },
  getAllPets(type = 'all', status = 'all', search = '') {
    const p = new URLSearchParams();
    if (type !== 'all') p.append('type', type);
    if (status !== 'all') p.append('status', status);
    if (search) p.append('search', search);
    const qs = p.toString();
    return this._fetch(`${ADMIN_API_BASE_URL}/pets${qs ? '?' + qs : ''}`);
  },
  approvePet(id) { return this._fetch(`${ADMIN_API_BASE_URL}/pets/${id}/approve`, { method: 'PUT' }); },
  rejectPet(id, reason) { return this._fetch(`${ADMIN_API_BASE_URL}/pets/${id}/reject`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ reason: reason || 'No reason provided' }) }); },
  createPet(data) { return this._fetch(`${ADMIN_API_BASE_URL}/pets`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }); },
  updatePet(id, data) { return this._fetch(`${ADMIN_API_BASE_URL}/pets/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }); },
  deletePet(id) { return this._fetch(`${ADMIN_API_BASE_URL}/pets/${id}`, { method: 'DELETE' }); },
  getAllUsers(role = 'all', search = '') {
    const p = new URLSearchParams();
    if (role !== 'all') p.append('role', role);
    if (search) p.append('search', search);
    const qs = p.toString();
    return this._fetch(`${ADMIN_API_BASE_URL}/users${qs ? '?' + qs : ''}`);
  },
  createUser(data) { return this._fetch(`${ADMIN_API_BASE_URL}/users`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }); },
  updateUserRole(id, role) { return this._fetch(`${ADMIN_API_BASE_URL}/users/${id}/role`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ role }) }); },
  deleteUser(id) { return this._fetch(`${ADMIN_API_BASE_URL}/users/${id}`, { method: 'DELETE' }); },
  getAllAdoptions(status = 'all') { return this._fetch(`${ADMIN_API_BASE_URL}/adoptions${status !== 'all' ? '?status=' + status : ''}`); },
  approveAdoption(id) { return this._fetch(`${ADMIN_API_BASE_URL}/adoptions/${id}/approve`, { method: 'PUT' }); },
  rejectAdoption(id, reason) { return this._fetch(`${ADMIN_API_BASE_URL}/adoptions/${id}/reject`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ reason: reason || 'Rejected by admin' }) }); },
  completeAdoption(id) { return this._fetch(`${ADMIN_API_BASE_URL}/adoptions/${id}/complete`, { method: 'PUT' }); },
  clearAllPets() { return this._fetch(`${ADMIN_API_BASE_URL}/danger/clear-pets`, { method: 'DELETE' }); },
  deleteAllUsers() { return this._fetch(`${ADMIN_API_BASE_URL}/danger/delete-users`, { method: 'DELETE' }); },
  resetDatabase() { return this._fetch(`${ADMIN_API_BASE_URL}/danger/reset-db`, { method: 'POST' }); },
  
  // ========== PAYMENT API ==========
  getAllPayments() { 
    return this._fetch(`${API_BASE_URL}/payments`);
  },
  verifyPayment(id) { 
    return this._fetch(`${API_BASE_URL}/payments/${id}/verify`, { method: 'PUT' }); 
  },
  declinePayment(id, reason) { 
    return this._fetch(`${API_BASE_URL}/payments/${id}/decline`, { 
      method: 'PUT', 
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ reason: reason || 'No reason provided' })
    }); 
  },
  completeDelivery(id) { 
    return this._fetch(`${API_BASE_URL}/payments/${id}/deliver`, { method: 'PUT' }); 
  }
};

// ==================== UTILITIES ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

function animateCount(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const duration = 800;
  const start = performance.now();
  const from = parseInt(el.textContent) || 0;
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * ease);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function updateSidebarBadges() {
  const map = { 
    'sb-pets-count': pets.length, 
    'sb-users-count': users.length, 
    'sb-adoptions-count': adoptions.length,
    'sb-payments-count': payments.length 
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    return '&#39;';
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

// ==================== POPULATE DROPDOWNS ====================
function populateLocationDropdowns() {
  const locationsSelect = document.getElementById('ap-location');
  if (locationsSelect) {
    const opts = LOCATIONS.map(function(loc) {
      return '<option value="' + loc + '">' + loc + '</option>';
    }).join('');
    locationsSelect.innerHTML = '<option value="">— Select Location —</option>' + opts;
  }
  
  const editLocationSelect = document.getElementById('ep-location');
  if (editLocationSelect) {
    const opts = LOCATIONS.map(function(loc) {
      return '<option value="' + loc + '">' + loc + '</option>';
    }).join('');
    editLocationSelect.innerHTML = '<option value="">— Select Location —</option>' + opts;
  }
}

// ==================== PRELOAD BREED IMAGES ====================
let _imagesPreloaded = false;
function preloadBreedImages() {
  if (_imagesPreloaded) return;
  _imagesPreloaded = true;
  const allBreeds = BREED_IMAGES.dog.concat(BREED_IMAGES.cat);
  for (var i = 0; i < allBreeds.length; i++) {
    var img = new Image();
    _preloadCache.push(img);
    img.src = allBreeds[i].image;
  }
}

// ==================== BREED SELECTOR ====================
function openBreedSelector() {
  var typeSelect = document.getElementById('ap-type');
  var petType = typeSelect ? typeSelect.value : 'dog';
  var breeds = BREED_IMAGES[petType] || BREED_IMAGES.dog;

  var modal = document.getElementById('breedImageModal');
  var grid = document.getElementById('breedImagesGrid');
  var title = document.getElementById('breedModalTitle');
  var sub = document.getElementById('breedModalSub');
  if (!modal || !grid || !title) return;

  title.textContent = 'Select a ' + (petType === 'dog' ? '🐕 Dog' : '🐈 Cat') + ' Breed';
  if (sub) sub.textContent = 'Click any card to select breed and photo';

  var html = '';
  for (var i = 0; i < breeds.length; i++) {
    var breed = breeds[i];
    html += '<div class="breed-image-card" onclick="selectBreedAdmin(\'' + breed.name.replace(/'/g, "\\'") + '\',\'' + breed.image + '\')">';
    html += '<img src="' + breed.image + '" alt="' + breed.name + '" loading="eager" decoding="async"';
    html += ' onerror="this.src=\'https://placehold.co/300x200/1c2333/5A6170?text=' + encodeURIComponent(breed.name) + '\'" />';
    html += '<div class="breed-card-info">';
    html += '<div class="breed-card-name">' + breed.name + '</div>';
    html += '<div class="breed-card-desc">' + breed.description + '</div>';
    html += '</div></div>';
  }
  grid.innerHTML = html;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectBreedAdmin(breedName, imageUrl) {
  var breedInput = document.getElementById('ap-breed');
  var imageHidden = document.getElementById('ap-image');
  if (breedInput) breedInput.value = breedName;
  if (imageHidden) imageHidden.value = imageUrl;

  var allBreeds = BREED_IMAGES.dog.concat(BREED_IMAGES.cat);
  var breedData = null;
  for (var i = 0; i < allBreeds.length; i++) {
    if (allBreeds[i].name === breedName) {
      breedData = allBreeds[i];
      break;
    }
  }

  var catBreeds = ['persian','siamese','maine coon','ragdoll','british shorthair',
    'bengal','scottish fold','sphynx','american shorthair','puspin'];
  var isCat = false;
  for (var j = 0; j < catBreeds.length; j++) {
    if (breedName.toLowerCase().includes(catBreeds[j])) {
      isCat = true;
      break;
    }
  }

  var bscWrap = document.getElementById('ap-bsc-wrap');
  if (bscWrap && breedData) {
    bscWrap.style.display = 'block';
    var badgeStyle = isCat
      ? 'background:#3b1828;color:#f4a0c0;border:1px solid #6b2840;'
      : 'background:#0e3020;color:#6EE7B7;border:1px solid #1a5a3a;';
    var typeLabel = isCat ? '🐈 Cat' : '🐕 Dog';
    var chipsHtml = '';
    var chips = breedData.chips || [];
    for (var k = 0; k < chips.length; k++) {
      chipsHtml += '<span class="bsc-chip">' + chips[k] + '</span>';
    }

    var imgElement = document.getElementById('ap-bsc-img');
    var nameElement = document.getElementById('ap-bsc-name');
    var descElement = document.getElementById('ap-bsc-desc');
    var chipsElement = document.getElementById('ap-bsc-chips');
    var badgesElement = document.getElementById('ap-bsc-badges');
    
    if (imgElement) imgElement.src = imageUrl;
    if (nameElement) nameElement.textContent = breedName;
    if (descElement) descElement.textContent = breedData.description;
    if (chipsElement) chipsElement.innerHTML = chipsHtml;
    if (badgesElement) {
      badgesElement.innerHTML = '<span class="bsc-badge" style="' + badgeStyle + '">' + typeLabel + '</span>' +
        '<span class="bsc-badge bsc-badge-ok">✓ Selected</span>';
    }
  }

  closeBreedModal();
  showToast('Selected: ' + breedName, 'success');
}

function closeBreedModal() {
  var modal = document.getElementById('breedImageModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function resetBreedSelection() {
  var breedInput = document.getElementById('ap-breed');
  var imageHidden = document.getElementById('ap-image');
  var bscWrap = document.getElementById('ap-bsc-wrap');
  if (breedInput) breedInput.value = '';
  if (imageHidden) imageHidden.value = '';
  if (bscWrap) bscWrap.style.display = 'none';
}

// ==================== CHARTS ====================
function renderBarChart(elementId, labels, data) {
  var el = document.getElementById(elementId);
  if (!el) return;
  var max = Math.max.apply(Math, data);
  if (max === 0) max = 1;
  var allZero = true;
  for (var i = 0; i < data.length; i++) {
    if (data[i] > 0) {
      allZero = false;
      break;
    }
  }
  if (allZero) {
    el.innerHTML = '<div class="empty-chart"><span>📊</span><p>No data available yet</p></div>';
    return;
  }
  var html = '<div class="bar-chart-inner">';
  for (var j = 0; j < data.length; j++) {
    var val = data[j];
    var height = Math.max((val / max) * 110, val > 0 ? 6 : 0);
    html += '<div class="bar-group">';
    html += '<div class="bar-value">' + (val > 0 ? val : '') + '</div>';
    html += '<div class="bar" style="height:' + height + 'px"></div>';
    html += '<span class="bar-label">' + labels[j] + '</span>';
    html += '</div>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderDonutChart() {
  var canvas = document.getElementById('donutChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dogs = 0, cats = 0;
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].type === 'dog') dogs++;
    else if (pets[i].type === 'cat') cats++;
  }
  var total = dogs + cats || 1;
  var cx = 80, cy = 80, r = 62, innerR = 40;
  ctx.clearRect(0, 0, 160, 160);
  var startAngle = -Math.PI / 2;
  var dogSlice = (dogs / total) * 2 * Math.PI;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, startAngle, startAngle + dogSlice);
  ctx.closePath();
  ctx.fillStyle = '#6EE7B7';
  ctx.fill();
  startAngle += dogSlice;
  var catSlice = (cats / total) * 2 * Math.PI;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, startAngle, startAngle + catSlice);
  ctx.closePath();
  ctx.fillStyle = '#FCA5A5';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = '#12161F';
  ctx.fill();
  ctx.fillStyle = '#E8EAF0';
  ctx.font = 'bold 18px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dogs + cats, cx, cy - 7);
  ctx.font = '11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = '#5A6170';
  ctx.fillText('pets', cx, cy + 10);

  var legend = document.getElementById('donutLegend');
  if (legend) {
    legend.innerHTML = '<div class="legend-item"><span class="legend-dot" style="background:#6EE7B7"></span><span>Dogs</span><strong>' + dogs + '</strong></div>' +
      '<div class="legend-item"><span class="legend-dot" style="background:#FCA5A5"></span><span>Cats</span><strong>' + cats + '</strong></div>';
  }
}

// ==================== LOAD ALL DATA ====================
async function loadAllData() {
  try {
    var petsResult = await AdminApiService.getAllPets();
    var usersResult = await AdminApiService.getAllUsers();
    var adoptionsResult = await AdminApiService.getAllAdoptions();
    var paymentsResult = await AdminApiService.getAllPayments();
    
    if (petsResult && petsResult.success) pets = petsResult.data || [];
    if (usersResult && usersResult.success) users = usersResult.data || [];
    if (adoptionsResult && adoptionsResult.success) adoptions = adoptionsResult.data || [];
    if (paymentsResult && paymentsResult.success) payments = paymentsResult.data || [];
    
    updateSidebarBadges();
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

// ==================== DASHBOARD ====================
async function renderDashboard() {
  var stats = await AdminApiService.getStats();
  if (stats && stats.success && stats.data) {
    animateCount('stat-total-pets', stats.data.totalPets || pets.length);
    animateCount('stat-adoptions', stats.data.totalAdoptions || adoptions.length);
    animateCount('stat-users', stats.data.totalUsers || users.length);
    animateCount('stat-pending', stats.data.pendingReviews || 0);
  } else {
    animateCount('stat-total-pets', pets.length);
    animateCount('stat-adoptions', adoptions.length);
    animateCount('stat-users', users.length);
    var pendingCount = 0;
    for (var i = 0; i < pets.length; i++) {
      if (pets[i].status === 'pending') pendingCount++;
    }
    for (var j = 0; j < adoptions.length; j++) {
      if (adoptions[j].status === 'pending') pendingCount++;
    }
    animateCount('stat-pending', pendingCount);
  }
  
  var weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var weeklyData = [0, 0, 0, 0, 0, 0, 0];
  for (var k = 0; k < adoptions.length; k++) {
    var adoption = adoptions[k];
    if (adoption.createdAt) {
      var date = new Date(adoption.createdAt);
      var dayIndex = date.getDay();
      var mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      if (mappedIndex >= 0 && mappedIndex < 7) weeklyData[mappedIndex]++;
    }
  }
  renderBarChart('barChart', weekDays, weeklyData);
  renderDonutChart();
  renderRecentAdoptions();
  renderLatestPets();
}

function renderRecentAdoptions() {
  var container = document.getElementById('recent-adoptions-list');
  if (!container) return;
  var recent = [];
  for (var i = adoptions.length - 1; i >= 0 && recent.length < 5; i--) {
    recent.push(adoptions[i]);
  }
  if (recent.length === 0) {
    container.innerHTML = '<p class="empty-panel">No adoptions yet.</p>';
    return;
  }
  var html = '';
  for (var j = 0; j < recent.length; j++) {
    var a = recent[j];
    html += '<div class="panel-row">';
    html += '<img src="' + (a.petImg || 'https://placehold.co/40x40/1c2333/5A6170?text=🐾') + '" class="panel-thumb" alt="' + escapeHtml(a.petName || 'Pet') + '">';
    html += '<div class="panel-row-body">';
    html += '<div class="panel-row-title">' + escapeHtml(a.petName || 'Unknown Pet') + '</div>';
    html += '<div class="panel-row-sub">by ' + escapeHtml(a.adopterName || a.adopter || 'Unknown') + '</div>';
    html += '</div>';
    html += '<div class="panel-row-right">';
    html += '<span class="badge badge-' + (a.status || 'pending') + '">' + (a.status || 'pending') + '</span>';
    html += '<div class="panel-row-date">' + formatDate(a.createdAt || a.date) + '</div>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

function renderLatestPets() {
  var container = document.getElementById('latest-pets-list');
  if (!container) return;
  var latest = [];
  for (var i = pets.length - 1; i >= 0 && latest.length < 5; i--) {
    latest.push(pets[i]);
  }
  if (latest.length === 0) {
    container.innerHTML = '<p class="empty-panel">No pets listed yet.</p>';
    return;
  }
  var html = '';
  for (var j = 0; j < latest.length; j++) {
    var p = latest[j];
    var statusClass = p.status === 'pending' ? 'warning' : (p.adopted ? 'adopted' : 'available');
    var statusText = p.status === 'pending' ? 'Pending' : (p.adopted ? 'Adopted' : 'Available');
    html += '<div class="panel-row">';
    html += '<img src="' + (p.image || 'https://placehold.co/40x40/1c2333/5A6170?text=🐾') + '" class="panel-thumb" alt="' + escapeHtml(p.name) + '">';
    html += '<div class="panel-row-body">';
    html += '<div class="panel-row-title">' + escapeHtml(p.name || '') + '</div>';
    html += '<div class="panel-row-sub">' + escapeHtml(p.breed || '') + ' · ' + escapeHtml(p.location || '') + '</div>';
    html += '</div>';
    html += '<div class="panel-row-right">';
    html += '<span class="badge badge-' + statusClass + '">' + statusText + '</span>';
    html += '<div class="panel-row-date">' + formatDate(p.postedDate || p.createdAt) + '</div>';
    html += '</div></div>';
  }
  container.innerHTML = html;
}

// ==================== PETS TABLE ====================
async function renderPetsTable() {
  var search = document.getElementById('petTableSearch') ? document.getElementById('petTableSearch').value : '';
  var type = document.getElementById('petTableFilter') ? document.getElementById('petTableFilter').value : 'all';
  var status = document.getElementById('petStatusFilter') ? document.getElementById('petStatusFilter').value : 'all';
  var result = await AdminApiService.getAllPets(type, status, search);
  if (result && result.success) pets = result.data || [];
  updateSidebarBadges();

  var tbody = document.getElementById('petsTableBody');
  var countSpan = document.getElementById('pets-table-count');
  if (countSpan) countSpan.textContent = pets.length + ' pet' + (pets.length !== 1 ? 's' : '') + ' found';
  if (!tbody) return;

  if (pets.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-row">No pets found</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < pets.length; i++) {
    var p = pets[i];
    var isPending = p.status === 'pending';
    var statusBadge = isPending
      ? '<span class="badge badge-warning">⏳ Pending</span>'
      : '<span class="badge badge-' + (p.adopted ? 'adopted' : 'available') + '">' + (p.adopted ? '✓ Adopted' : '● Available') + '</span>';
    var actions = isPending
      ? '<div class="td-actions">' +
        '<button class="btn-act btn-approve" onclick="approvePet(' + p.id + ')" title="Approve">✓ Approve</button>' +
        '<button class="btn-act btn-reject" onclick="rejectPet(' + p.id + ')" title="Reject">✗ Reject</button>' +
        '<button class="btn-act btn-icon-act" onclick="openEditPetModal(' + p.id + ')" title="Edit">✏️</button>' +
        '</div>'
      : '<div class="td-actions">' +
        '<button class="btn-act btn-icon-act" onclick="openEditPetModal(' + p.id + ')" title="Edit">✏️</button>' +
        '<button class="btn-act btn-icon-act" onclick="toggleAdopted(' + p.id + ')" title="Toggle status">🔄</button>' +
        '<button class="btn-act btn-icon-act btn-del" onclick="deletePet(' + p.id + ')" title="Delete">🗑</button>' +
        '</div>';
    html += '<tr>';
    html += '<td><div class="td-pet">';
    html += '<img src="' + (p.image || 'https://placehold.co/42x42/1c2333/5A6170?text=🐾') + '" class="td-pet-img" alt="' + escapeHtml(p.name) + '">';
    html += '<div><div class="td-pet-name">' + escapeHtml(p.name || '') + '</div>';
    html += '<div class="td-pet-id">#' + String(p.id || '').padStart(4, '0') + '</div></div></div></td>';
    html += '<td><span class="badge badge-' + p.type + '">' + (p.type === 'dog' ? '🐕 Dog' : '🐈 Cat') + '</span></td>';
    html += '<td class="td-muted">' + escapeHtml(p.breed || '—') + '</td>';
    html += '<td class="td-muted">' + escapeHtml(p.age || '—') + '</td>';
    html += '<td class="td-muted td-loc">' + escapeHtml(p.location || '—') + '</td>';
    html += '<td class="td-muted">' + formatDate(p.postedDate || p.createdAt) + '</td>';
    html += '<td class="td-muted">' + escapeHtml(p.postedBy || 'Admin') + '</td>';
    html += '<td>' + statusBadge + '</td>';
    html += '<td>' + actions + '</td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

// ==================== USERS TABLE ====================
async function renderUsersTable() {
  var search = document.getElementById('userTableSearch') ? document.getElementById('userTableSearch').value : '';
  var role = document.getElementById('userRoleFilter') ? document.getElementById('userRoleFilter').value : 'all';
  var result = await AdminApiService.getAllUsers(role, search);
  if (result && result.success) users = result.data || [];
  updateSidebarBadges();

  var tbody = document.getElementById('usersTableBody');
  var countSpan = document.getElementById('users-table-count');
  if (countSpan) countSpan.textContent = users.length + ' user' + (users.length !== 1 ? 's' : '') + ' found';
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">No users found</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var initials = (u.name || '?').split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
    html += '<tr>';
    html += '<td><div class="td-user">';
    html += '<div class="td-avatar">' + initials + '</div>';
    html += '<div class="td-user-name">' + escapeHtml(u.name || '') + '</div></div></td>';
    html += '<td class="td-muted">' + escapeHtml(u.email || '') + '</td>';
    html += '<td class="td-muted">' + escapeHtml(u.phone || '—') + '</td>';
    html += '<td><span class="badge badge-' + (u.role || 'user') + '">' + (u.role || 'user') + '</span></td>';
    html += '<td class="td-muted">' + (u.petsPosted || 0) + '</td>';
    html += '<td class="td-muted">' + formatDate(u.joinedAt) + '</td>';
    html += '<td><div class="td-actions">';
    html += '<button class="btn-act btn-icon-act" onclick="promoteUser(' + u.id + ')" title="' + (u.role === 'admin' ? 'Demote to user' : 'Promote to admin') + '">' + (u.role === 'admin' ? '⬇️' : '⬆️') + '</button>';
    html += '<button class="btn-act btn-icon-act btn-del" onclick="deleteUser(' + u.id + ')" title="Delete">🗑</button>';
    html += '</div></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

// ==================== ADOPTIONS TABLE ====================
async function renderAdoptionsTable() {
  var status = document.getElementById('adoptionStatusFilter') ? document.getElementById('adoptionStatusFilter').value : 'all';
  var result = await AdminApiService.getAllAdoptions(status);
  if (result && result.success) adoptions = result.data || [];
  updateSidebarBadges();

  var tbody = document.getElementById('adoptionsTableBody');
  var countSpan = document.getElementById('adoptions-table-count');
  if (countSpan) countSpan.textContent = adoptions.length + ' request' + (adoptions.length !== 1 ? 's' : '') + ' found';
  if (!tbody) return;

  if (adoptions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-row">No adoption records found</td></tr>';
    return;
  }

  var html = '';
  for (var i = 0; i < adoptions.length; i++) {
    var a = adoptions[i];
    var adopterInitials = (a.adopterName || a.adopter || '?').split(' ').map(function(n) { return n[0]; }).join('').slice(0, 2).toUpperCase();
    html += '<tr>';
    html += '<td><div class="td-pet">';
    html += '<img src="' + (a.petImg || 'https://placehold.co/42x42/1c2333/5A6170?text=🐾') + '" class="td-pet-img" alt="' + escapeHtml(a.petName) + '">';
    html += '<span class="td-pet-name">' + escapeHtml(a.petName || 'Unknown') + '</span></div></td>';
    html += '<td><div class="td-user">';
    html += '<div class="td-avatar td-avatar-sm">' + adopterInitials + '</div>';
    html += '<span class="td-muted">' + escapeHtml(a.adopterName || a.adopter || '') + '</span></div></td>';
    html += '<td class="td-muted">' + escapeHtml(a.email || '') + (a.phone ? '<br><small>' + escapeHtml(a.phone) + '</small>' : '') + '</td>';
    html += '<td class="td-muted">' + formatDate(a.createdAt || a.date) + '</td>';
    html += '<td><span class="badge badge-' + (a.status || 'pending') + '">' + (a.status || 'pending') + '</span></td>';
    html += '<td><div class="td-actions">';
    if (a.status === 'pending') {
      html += '<button class="btn-act btn-approve" onclick="updateAdoptionStatus(' + a.id + ',\'approved\')">Approve</button>';
      html += '<button class="btn-act btn-reject" onclick="updateAdoptionStatus(' + a.id + ',\'rejected\')">Reject</button>';
    }
    if (a.status === 'approved') {
      html += '<button class="btn-act btn-outline-act" onclick="updateAdoptionStatus(' + a.id + ',\'completed\')">Complete</button>';
    }
    html += '</div></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
}

// ==================== PAYMENTS TABLE (WITH PROOF VIEW) ====================
// ==================== PAYMENTS TABLE (WITH PROOF VIEW) ====================
async function renderPaymentsTable() {
  console.log('🔄 Fetching payments...');
  
  var result = await AdminApiService.getAllPayments();
  console.log('📦 Payments API Response:', result);
  
  if (result && result.success) {
    payments = result.data || [];
    console.log('✅ Payments loaded:', payments.length);
  } else {
    payments = [];
  }
  
  updateSidebarBadges();

  var tbody = document.getElementById('paymentsTableBody');
  var countSpan = document.getElementById('payments-table-count');
  
  if (!tbody) {
    console.error('❌ paymentsTableBody not found!');
    return;
  }
  
  if (countSpan) {
    countSpan.textContent = payments.length + ' payment' + (payments.length !== 1 ? 's' : '') + ' found';
  }

  if (payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">No payment records found</td></tr>`;
    return;
  }

  var html = '';
  for (var i = 0; i < payments.length; i++) {
    var p = payments[i];
    var methodDisplay = p.method === 'cod' ? '🚚 Cash on Delivery' : '📱 GCash';
    var statusBadge = '';
    
    if (p.status === 'pending_verification') {
      statusBadge = '<span class="badge badge-warning">⏳ Pending Verification</span>';
    } else if (p.status === 'completed') {
      statusBadge = '<span class="badge badge-success">✓ Completed</span>';
    } else if (p.status === 'cod_pending') {
      statusBadge = '<span class="badge badge-info">🚚 COD - Pending Delivery</span>';
    } else if (p.status === 'delivered') {
      statusBadge = '<span class="badge badge-success">✓ Delivered</span>';
    } else if (p.status === 'declined') {
      statusBadge = '<span class="badge badge-danger">✗ Declined</span>';
    } else {
      statusBadge = '<span class="badge badge-default">' + (p.status || 'pending') + '</span>';
    }
    
    // ✅ PROOF OF PAYMENT - ITO ANG IMPORTANTE
    var proofHtml = '—';
    if (p.proofUrl) {
      proofHtml = `<button class="btn-proof" onclick="viewProofImage('${p.proofUrl}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">📸 View Proof</button>`;
    } else if (p.proofFileName) {
      proofHtml = `<button class="btn-proof" onclick="viewProofImage('/uploads/proofs/${p.proofFileName}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">📸 View Proof</button>`;
    }
    
    html += '<tr>';
    html += '<td class="td-muted">#' + (p.id || '?') + '</td>';
    html += '<td class="td-muted">Adoption #' + (p.adoptionId || '?') + '</td>';
    html += '<td class="td-muted">₱' + (p.amount || 100) + '</td>';
    html += '<td class="td-muted">' + methodDisplay + '</td>';
    html += '<td class="td-muted">' + escapeHtml(p.referenceNumber || '-') + '</td>';
    html += '<td class="td-muted">' + proofHtml + '</td>';
    html += '<td>' + statusBadge + '</td>';
    html += '<td class="td-muted">' + formatDate(p.createdAt) + '</td>';
    html += '<td><div class="td-actions">';
    
    if (p.status === 'pending_verification') {
      html += '<button class="btn-act btn-approve" onclick="verifyPayment(' + p.id + ')">✓ Verify</button>';
      html += '<button class="btn-act btn-reject" onclick="declinePayment(' + p.id + ')">✗ Decline</button>';
    }
    if (p.status === 'cod_pending') {
      html += '<button class="btn-act btn-primary" onclick="markDeliveryComplete(' + p.id + ')">📦 Mark Delivered</button>';
    }
    
    html += '</div></td>';
    html += '</tr>';
  }
  tbody.innerHTML = html;
  console.log('✅ Payments table rendered');
}

// ✅ PAYMENT ACTION FUNCTIONS
async function verifyPayment(paymentId) {
  if (!confirm('Verify this payment? This will mark the adoption as completed.')) return;
  showToast('Verifying payment...', 'info');
  var result = await AdminApiService.verifyPayment(paymentId);
  if (result && result.success) {
    showToast('Payment verified and adoption completed!', 'success');
    await loadAllData();
    await renderPaymentsTable();
    await renderDashboard();
  } else {
    showToast(result?.message || 'Failed to verify payment', 'error');
  }
}

async function declinePayment(paymentId) {
  var reason = prompt('Reason for declining this payment (optional):');
  if (reason === null) return;
  showToast('Declining payment...', 'info');
  var result = await AdminApiService.declinePayment(paymentId, reason);
  if (result && result.success) {
    showToast('Payment declined', 'warning');
    await loadAllData();
    await renderPaymentsTable();
    await renderDashboard();
  } else {
    showToast(result?.message || 'Failed to decline payment', 'error');
  }
}

async function markDeliveryComplete(paymentId) {
  if (!confirm('Mark this as delivered? The adoption will be completed.')) return;
  showToast('Updating delivery status...', 'info');
  var result = await AdminApiService.completeDelivery(paymentId);
  if (result && result.success) {
    showToast('Delivery completed and adoption finalized!', 'success');
    await loadAllData();
    await renderPaymentsTable();
    await renderDashboard();
  } else {
    showToast(result?.message || 'Failed to update delivery', 'error');
  }
}

// ✅ FUNCTION TO VIEW PROOF OF PAYMENT IMAGE (ONLY ONE VERSION)
// ✅ FUNCTION TO VIEW PROOF OF PAYMENT
function viewProofImage(imageUrl) {
  console.log('Viewing proof:', imageUrl);
  
  var modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
  modal.style.zIndex = '10000';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.cursor = 'pointer';
  
  var img = document.createElement('img');
  img.src = imageUrl;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.borderRadius = '8px';
  img.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
  
  img.onerror = function() {
    console.error('Failed to load image:', imageUrl);
    img.src = 'https://placehold.co/400x300/ff0000/ffffff?text=Image+Not+Found';
  };
  
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '20px';
  closeBtn.style.right = '30px';
  closeBtn.style.fontSize = '40px';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'white';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.zIndex = '10001';
  
  modal.appendChild(img);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  closeBtn.addEventListener('click', function() {
    document.body.removeChild(modal);
  });
}

// ==================== REPORTS ====================
function renderReports() {
  var monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < adoptions.length; i++) {
    if (adoptions[i].createdAt) {
      var date = new Date(adoptions[i].createdAt);
      var month = date.getMonth();
      monthlyData[month]++;
    }
  }
  renderBarChart('monthlyChart', monthlyLabels, monthlyData);
  
  var locationCount = {};
  for (var j = 0; j < pets.length; j++) {
    var loc = pets[j].location;
    if (loc) {
      locationCount[loc] = (locationCount[loc] || 0) + 1;
    }
  }
  var sortedLocations = [];
  for (var locName in locationCount) {
    sortedLocations.push({ name: locName, count: locationCount[locName] });
  }
  sortedLocations.sort(function(a, b) { return b.count - a.count; });
  sortedLocations = sortedLocations.slice(0, 5);
  
  var container = document.getElementById('topLocations');
  if (container) {
    if (sortedLocations.length === 0) {
      container.innerHTML = '<p class="empty-panel">No location data available yet.</p>';
    } else {
      var locHtml = '';
      for (var k = 0; k < sortedLocations.length; k++) {
        var percent = (sortedLocations[k].count / (pets.length || 1)) * 100;
        locHtml += '<div class="location-row">';
        locHtml += '<span class="location-name">' + escapeHtml(sortedLocations[k].name) + '</span>';
        locHtml += '<div class="location-bar-wrap"><div class="location-bar" style="width: ' + Math.min(percent, 100) + '%"></div></div>';
        locHtml += '<span class="location-count">' + sortedLocations[k].count + ' pet' + (sortedLocations[k].count !== 1 ? 's' : '') + '</span>';
        locHtml += '</div>';
      }
      container.innerHTML = locHtml;
    }
  }
  
  var adoptionRate = pets.length > 0 ? Math.round((adoptions.length / pets.length) * 100) : 0;
  var rateEl = document.getElementById('report-adoption-rate');
  var satEl = document.getElementById('report-satisfaction');
  var avgEl = document.getElementById('report-avg-time');
  var relistEl = document.getElementById('report-relisting-rate');
  if (rateEl) rateEl.textContent = adoptionRate + '%';
  if (satEl) satEl.textContent = '4.8 ★';
  if (avgEl) avgEl.textContent = '12 days';
  if (relistEl) relistEl.textContent = '8%';
}

// ==================== ACTION FUNCTIONS ====================
async function approvePet(petId) {
  if (!confirm('Approve this pet listing? It will become visible to all users.')) return;
  var result = await AdminApiService.approvePet(petId);
  if (result && result.success) {
    showToast('Pet approved and published!', 'success');
    await loadAllData();
    await renderPetsTable();
    await renderDashboard();
  } else {
    showToast('Failed to approve pet', 'error');
  }
}

async function rejectPet(petId) {
  var reason = prompt('Reason for rejection (optional):');
  if (reason === null) return;
  var result = await AdminApiService.rejectPet(petId, reason);
  if (result && result.success) {
    showToast('Pet listing rejected', 'info');
    await loadAllData();
    await renderPetsTable();
    await renderDashboard();
  } else {
    showToast('Failed to reject pet', 'error');
  }
}

async function toggleAdopted(petId) {
  var pet = null;
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id === petId) {
      pet = pets[i];
      break;
    }
  }
  if (!pet) return;
  var result = await AdminApiService.updatePet(petId, { adopted: !pet.adopted });
  if (result && result.success) {
    pet.adopted = !pet.adopted;
    await renderPetsTable();
    showToast(pet.name + ' marked as ' + (pet.adopted ? 'Adopted' : 'Available'), 'info');
  } else {
    showToast('Failed to update status', 'error');
  }
}

async function deletePet(petId) {
  var pet = null;
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id === petId) {
      pet = pets[i];
      break;
    }
  }
  if (!confirm('Delete "' + (pet ? pet.name : 'this pet') + '"? This cannot be undone.')) return;
  var result = await AdminApiService.deletePet(petId);
  if (result && result.success) {
    var newPets = [];
    for (var j = 0; j < pets.length; j++) {
      if (pets[j].id !== petId) newPets.push(pets[j]);
    }
    pets = newPets;
    await renderPetsTable();
    showToast('Pet deleted', 'success');
  } else {
    showToast('Failed to delete pet', 'error');
  }
}

async function promoteUser(userId) {
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      user = users[i];
      break;
    }
  }
  if (!user) return;
  var newRole = user.role === 'admin' ? 'user' : 'admin';
  if (!confirm((newRole === 'admin' ? 'Promote' : 'Demote') + ' ' + user.name + ' to ' + newRole + '?')) return;
  var result = await AdminApiService.updateUserRole(userId, newRole);
  if (result && result.success) {
    user.role = newRole;
    await renderUsersTable();
    showToast(user.name + ' is now ' + newRole, 'info');
  } else {
    showToast('Failed to update role', 'error');
  }
}

async function deleteUser(userId) {
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === userId) {
      user = users[i];
      break;
    }
  }
  if (!confirm('Delete user "' + (user ? user.name : 'this user') + '"? This cannot be undone.')) return;
  var result = await AdminApiService.deleteUser(userId);
  if (result && result.success) {
    var newUsers = [];
    for (var j = 0; j < users.length; j++) {
      if (users[j].id !== userId) newUsers.push(users[j]);
    }
    users = newUsers;
    await renderUsersTable();
    showToast('User deleted', 'success');
  } else {
    showToast('Failed to delete user', 'error');
  }
}

async function updateAdoptionStatus(adoptionId, newStatus) {
  var result;
  if (newStatus === 'approved') {
    result = await AdminApiService.approveAdoption(adoptionId);
  } else if (newStatus === 'completed') {
    result = await AdminApiService.completeAdoption(adoptionId);
  } else {
    result = await AdminApiService.rejectAdoption(adoptionId, 'Rejected by admin');
  }
  if (result && result.success) {
    await loadAllData();
    await renderAdoptionsTable();
    showToast('Adoption ' + newStatus, 'success');
  } else {
    showToast('Failed to update status', 'error');
  }
}

function openEditPetModal(petId) {
  var pet = null;
  for (var i = 0; i < pets.length; i++) {
    if (pets[i].id === petId) {
      pet = pets[i];
      break;
    }
  }
  if (!pet) return;
  var idInput = document.getElementById('ep-id');
  var nameInput = document.getElementById('ep-name');
  var ageInput = document.getElementById('ep-age');
  var typeSelect = document.getElementById('ep-type');
  var breedInput = document.getElementById('ep-breed');
  var locationSelect = document.getElementById('ep-location');
  var statusSelect = document.getElementById('ep-status');
  if (idInput) idInput.value = pet.id;
  if (nameInput) nameInput.value = pet.name || '';
  if (ageInput) ageInput.value = pet.age || '';
  if (typeSelect) typeSelect.value = pet.type || 'dog';
  if (breedInput) breedInput.value = pet.breed || '';
  if (locationSelect) locationSelect.value = pet.location || '';
  if (statusSelect) statusSelect.value = String(pet.adopted || false);
  openModal('editPetModal');
}

// ==================== MODAL HELPERS ====================
function openModal(id) {
  var m = document.getElementById(id);
  if (m) {
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  var m = document.getElementById(id);
  if (m) {
    m.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ==================== FORM HANDLERS ====================
async function handleAddPet(e) {
  e.preventDefault();
  var name = document.getElementById('ap-name') ? document.getElementById('ap-name').value.trim() : '';
  var age = document.getElementById('ap-age') ? document.getElementById('ap-age').value.trim() : '';
  var type = document.getElementById('ap-type') ? document.getElementById('ap-type').value : '';
  var breed = document.getElementById('ap-breed') ? document.getElementById('ap-breed').value.trim() : '';
  var location = document.getElementById('ap-location') ? document.getElementById('ap-location').value : '';
  var contact = document.getElementById('ap-contact') ? document.getElementById('ap-contact').value.trim() : '';
  var description = document.getElementById('ap-desc') ? document.getElementById('ap-desc').value.trim() : '';
  var imageUrl = document.getElementById('ap-image') ? document.getElementById('ap-image').value : '';

  if (!name || !age || !breed || !location || !contact) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  var digits = contact.replace(/\D/g, '');
  if (digits.length !== 11) {
    showToast('Contact number must be exactly 11 digits', 'error');
    return;
  }

  var today = new Date();
  var postedDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  var result = await AdminApiService.createPet({ name: name, age: age, type: type, breed: breed, location: location, contact: digits, description: description, imageUrl: imageUrl || '', postedDate: postedDate });
  if (result && result.success) {
    closeModal('addPetModal');
    var form = document.getElementById('adminAddPetForm');
    if (form) form.reset();
    resetBreedSelection();
    await loadAllData();
    await renderPetsTable();
    await renderDashboard();
    showToast(name + ' added successfully!', 'success');
  } else {
    showToast(result ? (result.message || 'Failed to add pet') : 'Failed to add pet', 'error');
  }
}

async function handleAddUser(e) {
  e.preventDefault();
  var name = document.getElementById('au-name') ? document.getElementById('au-name').value.trim() : '';
  var email = document.getElementById('au-email') ? document.getElementById('au-email').value.trim() : '';
  var phone = document.getElementById('au-phone') ? document.getElementById('au-phone').value.trim() : '';
  var role = document.getElementById('au-role') ? document.getElementById('au-role').value : '';
  var password = document.getElementById('au-password') ? document.getElementById('au-password').value : '';

  if (!name || !email || !password) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  var result = await AdminApiService.createUser({ name: name, email: email, phone: phone, role: role, password: password });
  if (result && result.success) {
    closeModal('addUserModal');
    var form = document.getElementById('adminAddUserForm');
    if (form) form.reset();
    await loadAllData();
    await renderUsersTable();
    await renderDashboard();
    showToast('User ' + name + ' added!', 'success');
  } else {
    showToast(result ? (result.message || 'Failed to add user') : 'Failed to add user', 'error');
  }
}

async function handleEditPet(e) {
  e.preventDefault();
  var id = parseInt(document.getElementById('ep-id') ? document.getElementById('ep-id').value : '0');
  var petData = {
    name: document.getElementById('ep-name') ? document.getElementById('ep-name').value.trim() : '',
    age: document.getElementById('ep-age') ? document.getElementById('ep-age').value.trim() : '',
    type: document.getElementById('ep-type') ? document.getElementById('ep-type').value : '',
    breed: document.getElementById('ep-breed') ? document.getElementById('ep-breed').value.trim() : '',
    location: document.getElementById('ep-location') ? document.getElementById('ep-location').value.trim() : '',
    adopted: (document.getElementById('ep-status') ? document.getElementById('ep-status').value : 'false') === 'true'
  };
  var result = await AdminApiService.updatePet(id, petData);
  if (result && result.success) {
    closeModal('editPetModal');
    await loadAllData();
    await renderPetsTable();
    showToast('Pet updated!', 'success');
  } else {
    showToast('Failed to update pet', 'error');
  }
}

// ==================== SETTINGS HANDLERS ====================
function handleSaveAdminProfile(e) {
  e.preventDefault();
  var name = document.getElementById('adminName') ? document.getElementById('adminName').value.trim() : '';
  var email = document.getElementById('adminEmail') ? document.getElementById('adminEmail').value.trim() : '';
  if (!name || !email) {
    showToast('Please fill in all fields', 'error');
    return;
  }
  var adminNameEl = document.querySelector('.admin-name');
  var adminRoleEl = document.querySelector('.admin-role');
  var avatarEl = document.querySelector('.admin-avatar');
  var topbarAvatarEl = document.querySelector('.topbar-avatar');
  if (adminNameEl) adminNameEl.textContent = name;
  if (adminRoleEl) adminRoleEl.textContent = email;
  var initials = name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
  if (avatarEl) avatarEl.textContent = initials;
  if (topbarAvatarEl) topbarAvatarEl.textContent = initials;
  localStorage.setItem('adminName', name);
  localStorage.setItem('adminEmail', email);
  showToast('Profile saved!', 'success');
}

// ==================== VIEW NAVIGATION ====================
async function showView(viewId) {
  var views = document.querySelectorAll('.view');
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove('active');
  }
  var navItems = document.querySelectorAll('.nav-item');
  for (var j = 0; j < navItems.length; j++) {
    navItems[j].classList.remove('active');
  }
  var targetView = document.getElementById('view-' + viewId);
  if (targetView) targetView.classList.add('active');
  var targetNav = document.querySelector('[data-view="' + viewId + '"]');
  if (targetNav) targetNav.classList.add('active');

  var titles = { 
    dashboard: 'Overview', 
    pets: 'Manage Pets', 
    users: 'Users', 
    adoptions: 'Adoptions', 
    payments: 'Payments',
    reports: 'Reports', 
    settings: 'Settings' 
  };
  var breadcrumb = document.getElementById('breadcrumb-text');
  if (breadcrumb) breadcrumb.textContent = titles[viewId] || viewId;

  if (viewId === 'dashboard') await renderDashboard();
  if (viewId === 'pets') await renderPetsTable();
  if (viewId === 'users') await renderUsersTable();
  if (viewId === 'adoptions') await renderAdoptionsTable();
  if (viewId === 'payments') await renderPaymentsTable();
  if (viewId === 'reports') renderReports();
}

// ==================== ADMIN LOGOUT ====================
async function handleAdminLogout() {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminName');
  showToast('Logged out successfully', 'success');
  setTimeout(function() {
    window.location.href = 'admin-login.html';
  }, 900);
}

function checkAdminSession() {
  if (localStorage.getItem('adminLoggedIn') !== 'true' && window.location.pathname.includes('admin.html')) {
    window.location.href = 'admin-login.html';
  }
  var savedName = localStorage.getItem('adminName');
  var savedEmail = localStorage.getItem('adminEmail');
  if (savedName) {
    var nameInput = document.getElementById('adminName');
    var adminNameEl = document.querySelector('.admin-name');
    var avatarEl = document.querySelector('.admin-avatar');
    var topbarAvatarEl = document.querySelector('.topbar-avatar');
    if (nameInput) nameInput.value = savedName;
    if (adminNameEl) adminNameEl.textContent = savedName;
    var initials = savedName.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
    if (avatarEl) avatarEl.textContent = initials;
    if (topbarAvatarEl) topbarAvatarEl.textContent = initials;
  }
  if (savedEmail) {
    var emailInput = document.getElementById('adminEmail');
    var adminRoleEl = document.querySelector('.admin-role');
    if (emailInput) emailInput.value = savedEmail;
    if (adminRoleEl) adminRoleEl.textContent = savedEmail;
  }
}

// ==================== EVENT LISTENERS ====================
function setupEvents() {
  var navItems = document.querySelectorAll('.nav-item[data-view]');
  for (var i = 0; i < navItems.length; i++) {
    navItems[i].addEventListener('click', function(e) {
      e.preventDefault();
      showView(this.getAttribute('data-view'));
    });
  }
  
  var panelLinks = document.querySelectorAll('.panel-link[data-view]');
  for (var j = 0; j < panelLinks.length; j++) {
    panelLinks[j].addEventListener('click', function(e) {
      e.preventDefault();
      showView(this.getAttribute('data-view'));
    });
  }

  var sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      var sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }

  var openAddPetBtn = document.getElementById('openAddPetBtn');
  if (openAddPetBtn) {
    openAddPetBtn.addEventListener('click', function() { openModal('addPetModal'); });
  }
  var openAddPetFromPetsBtn = document.getElementById('openAddPetFromPetsBtn');
  if (openAddPetFromPetsBtn) {
    openAddPetFromPetsBtn.addEventListener('click', function() { openModal('addPetModal'); });
  }
  var openAddUserBtn = document.getElementById('openAddUserBtn');
  if (openAddUserBtn) {
    openAddUserBtn.addEventListener('click', function() { openModal('addUserModal'); });
  }

  var closeBtns = ['closeAddPetModal', 'cancelAddPetBtn', 'closeAddUserModal', 'cancelAddUserBtn', 'closeEditPetModal', 'cancelEditPetBtn'];
  for (var k = 0; k < closeBtns.length; k++) {
    var btn = document.getElementById(closeBtns[k]);
    if (btn) {
      var modalId = '';
      if (closeBtns[k].includes('AddPet')) modalId = 'addPetModal';
      else if (closeBtns[k].includes('AddUser')) modalId = 'addUserModal';
      else if (closeBtns[k].includes('EditPet')) modalId = 'editPetModal';
      btn.addEventListener('click', (function(id) {
        return function() { closeModal(id); };
      })(modalId));
    }
  }
  
  var breedModalClose = document.getElementById('breedModalClose');
  if (breedModalClose) {
    breedModalClose.addEventListener('click', closeBreedModal);
  }

  var selectBreedBtn = document.getElementById('selectBreedPhotoBtn');
  if (selectBreedBtn) {
    selectBreedBtn.addEventListener('click', openBreedSelector);
  }
  var apType = document.getElementById('ap-type');
  if (apType) {
    apType.addEventListener('change', resetBreedSelection);
  }

  var addPetForm = document.getElementById('adminAddPetForm');
  if (addPetForm) addPetForm.addEventListener('submit', handleAddPet);
  var addUserForm = document.getElementById('adminAddUserForm');
  if (addUserForm) addUserForm.addEventListener('submit', handleAddUser);
  var editPetForm = document.getElementById('adminEditPetForm');
  if (editPetForm) editPetForm.addEventListener('submit', handleEditPet);
  var saveProfileBtn = document.getElementById('saveAdminProfileBtn');
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', handleSaveAdminProfile);

  var petTableSearch = document.getElementById('petTableSearch');
  if (petTableSearch) {
    petTableSearch.addEventListener('input', renderPetsTable);
    petTableSearch.addEventListener('change', renderPetsTable);
  }
  var petTableFilter = document.getElementById('petTableFilter');
  if (petTableFilter) {
    petTableFilter.addEventListener('input', renderPetsTable);
    petTableFilter.addEventListener('change', renderPetsTable);
  }
  var petStatusFilter = document.getElementById('petStatusFilter');
  if (petStatusFilter) {
    petStatusFilter.addEventListener('input', renderPetsTable);
    petStatusFilter.addEventListener('change', renderPetsTable);
  }

  var userTableSearch = document.getElementById('userTableSearch');
  if (userTableSearch) {
    userTableSearch.addEventListener('input', renderUsersTable);
    userTableSearch.addEventListener('change', renderUsersTable);
  }
  var userRoleFilter = document.getElementById('userRoleFilter');
  if (userRoleFilter) {
    userRoleFilter.addEventListener('input', renderUsersTable);
    userRoleFilter.addEventListener('change', renderUsersTable);
  }

  var adoptionSearch = document.getElementById('adoptionSearch');
  if (adoptionSearch) {
    adoptionSearch.addEventListener('input', renderAdoptionsTable);
    adoptionSearch.addEventListener('change', renderAdoptionsTable);
  }
  var adoptionStatusFilter = document.getElementById('adoptionStatusFilter');
  if (adoptionStatusFilter) {
    adoptionStatusFilter.addEventListener('input', renderAdoptionsTable);
    adoptionStatusFilter.addEventListener('change', renderAdoptionsTable);
  }

  var phoneInputs = ['ap-contact', 'au-phone'];
  for (var p = 0; p < phoneInputs.length; p++) {
    var phoneInput = document.getElementById(phoneInputs[p]);
    if (phoneInput) {
      phoneInput.addEventListener('input', function() {
        var val = this.value.replace(/\D/g, '').slice(0, 11);
        this.value = val;
      });
    }
  }

  var overlays = document.querySelectorAll('.modal-overlay');
  for (var o = 0; o < overlays.length; o++) {
    overlays[o].addEventListener('click', function(e) {
      if (e.target === this) {
        if (this.id === 'breedImageModal') closeBreedModal();
        else closeModal(this.id);
      }
    });
  }

  var clearPetsBtn = document.getElementById('clearAllPetsBtn');
  if (clearPetsBtn) {
    clearPetsBtn.addEventListener('click', async function() {
      if (!confirm('⚠️ Delete ALL pets? This cannot be undone.')) return;
      var r = await AdminApiService.clearAllPets();
      if (r && r.success) {
        showToast('All pets cleared', 'success');
        location.reload();
      } else {
        showToast('Operation failed', 'error');
      }
    });
  }
  
  var deleteUsersBtn = document.getElementById('deleteAllUsersBtn');
  if (deleteUsersBtn) {
    deleteUsersBtn.addEventListener('click', async function() {
      if (!confirm('⚠️ Delete ALL users? This cannot be undone.')) return;
      var r = await AdminApiService.deleteAllUsers();
      if (r && r.success) {
        showToast('All users deleted', 'success');
        location.reload();
      } else {
        showToast('Operation failed', 'error');
      }
    });
  }
  
  var resetDbBtn = document.getElementById('resetDatabaseBtn');
  if (resetDbBtn) {
    resetDbBtn.addEventListener('click', async function() {
      if (!confirm('⚠️ RESET the entire database? All data will be permanently lost.')) return;
      var r = await AdminApiService.resetDatabase();
      if (r && r.success) {
        showToast('Database reset complete', 'success');
        location.reload();
      } else {
        showToast('Operation failed', 'error');
      }
    });
  }

  var logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleAdminLogout();
    });
  }
  
  var exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      showToast('CSV export coming soon', 'info');
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    var openModals = document.querySelectorAll('.modal-overlay.open');
    for (var m = 0; m < openModals.length; m++) {
      if (openModals[m].id === 'breedImageModal') closeBreedModal();
      else closeModal(openModals[m].id);
    }
  });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async function() {
  checkAdminSession();
  preloadBreedImages();
  populateLocationDropdowns();
  setupEvents();
  await loadAllData();
  showView('dashboard');
});