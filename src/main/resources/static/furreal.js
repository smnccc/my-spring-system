
/* ═══════════════════════════════════════════════════════════════
   FurReal — furreal.js (COMPLETE WITH TWO OPTIONS)
   - Option 1: Select from Breed Gallery (with pictures)
   - Option 2: Upload Own Photo (with dropdown breed selection)
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ==================== API SERVICE LAYER ====================
const API_BASE_URL = 'https://furreal.up.railway.app';


const ApiService = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async sendOTP(email, purpose) {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    });
    return response.json();
  },

  async verifyOTP(email, otpCode, purpose) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, purpose })
    });
    return response.json();
  },

  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  async resetPassword(email, otpCode, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, newPassword })
    });
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    return response.json();
  },

  async getPets(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `${API_BASE_URL}/pets?${params}` : `${API_BASE_URL}/pets`;
    const response = await fetch(url);
    return response.json();
  },

  async getFeaturedPets(limit = 3) {
    const response = await fetch(`${API_BASE_URL}/pets/featured?limit=${limit}`);
    return response.json();
  },

  async getPetById(id) {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`);
    return response.json();
  },

  async createPet(petData) {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData)
    });
    return response.json();
  },

  async updatePet(id, petData) {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData)
    });
    return response.json();
  },

  async deletePet(id) {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, { method: 'DELETE' });
    return response.json();
  },

  async uploadPetImages(petId, formData) {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}/images`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async getPetImages(petId) {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}/images`);
    return response.json();
  },

  async deletePetImage(imageId) {
    const response = await fetch(`${API_BASE_URL}/pet-images/${imageId}`, { method: 'DELETE' });
    return response.json();
  },

  async getUserProfile(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`);
    return response.json();
  },

  async updateUserProfile(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async changePassword(userId, currentPassword, newPassword) {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/change-password?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`,
      { method: 'POST' }
    );
    return response.json();
  },

  async deleteAccount(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
    return response.json();
  },

  async getMyPostedPets(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/pets`);
    return response.json();
  },

  async getMyAdoptedPets(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/adopted`);
    return response.json();
  },

  async submitAdoptionRequest(petId, adopterData) {
    const response = await fetch(`${API_BASE_URL}/adoptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId, ...adopterData })
    });
    return response.json();
  },

  async getAdoptionRequests(userId, email) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/adoption-requests?email=${encodeURIComponent(email)}`);
    return response.json();
  },

  async updateAdoptionStatus(adoptionId, status) {
    const response = await fetch(`${API_BASE_URL}/adoptions/${adoptionId}/status?status=${status}`, { method: 'PUT' });
    return response.json();
  },

  async downloadWaiverTemplate() {
    const response = await fetch(`${API_BASE_URL}/waiver/template`);
    return response.blob();
  },

  async uploadSignedWaiver(adoptionId, file) {
    const formData = new FormData();
    formData.append('waiver', file);
    const response = await fetch(`${API_BASE_URL}/adoptions/${adoptionId}/waiver`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async getWaiver(adoptionId) {
    const response = await fetch(`${API_BASE_URL}/adoptions/${adoptionId}/waiver`);
    return response.json();
  },

  async createPayment(adoptionId, amount) {
    const response = await fetch(`${API_BASE_URL}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adoptionId, amount })
    });
    return response.json();
  },

  async processPayment(paymentId, paymentDetails) {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentDetails)
    });
    return response.json();
  },

  async getPaymentStatus(paymentId) {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/status`);
    return response.json();
  },

  async uploadProofOfPayment(adoptionId, file) {
    const formData = new FormData();
    formData.append('proof', file);
    const response = await fetch(`${API_BASE_URL}/payments/${adoptionId}/proof`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async updateProfilePicture(userId, imageData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profilePicture: imageData })
    });
    return response.json();
  },

  async getProfilePicture(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`);
    return response.json();
  }
};

// ==================== BREED IMAGES DATABASE ====================
const BREED_IMAGES = {
  dog: [
    { name: 'Askal (Asong Pinoy / Mixed Breed)', image: 'images/askal.jpg', description: 'Loyal, resilient, intelligent — the beloved native Filipino dog' },
    { name: 'Golden Retriever', image: 'images/golden-retriever.jpg', description: 'Friendly, intelligent, and devoted' },
    { name: 'Labrador Retriever', image: 'images/labrador.jpg', description: 'Playful, loyal, and energetic' },
    { name: 'Beagle', image: 'images/beagle.jpg', description: 'Curious, friendly, and merry' },
    { name: 'Siberian Husky', image: 'images/husky.jpg', description: 'Active, adventurous, and outgoing' },
    { name: 'German Shepherd', image: 'images/german-shepherd.jpg', description: 'Confident, courageous, and smart' },
    { name: 'Poodle', image: 'images/poodle.jpg', description: 'Intelligent, active, and alert' },
    { name: 'French Bulldog', image: 'images/french-bulldog.jpg', description: 'Adaptable, playful, and smart' },
    { name: 'Corgi', image: 'images/corgi.jpg', description: 'Affectionate, smart, and active' },
    { name: 'Shih Tzu', image: 'images/shih-tzu.jpg', description: 'Affectionate, playful, and outgoing' },
    { name: 'Chow Chow', image: 'images/chow-chow.jpg', description: 'Loyal, independent, and protective' }
  ],
  cat: [
    { name: 'Puspin (Pusang Pinoy / Mixed Breed)', image: 'images/puspin.jpg', description: 'Resilient, independent, and loving native Filipino cat' },
    { name: 'Persian', image: 'images/persian.jpg', description: 'Calm, gentle, and affectionate' },
    { name: 'Siamese', image: 'images/siamese.jpg', description: 'Vocal, social, and intelligent' },
    { name: 'Maine Coon', image: 'images/maine-coon.jpg', description: 'Friendly, gentle, and intelligent' },
    { name: 'Ragdoll', image: 'images/ragdoll.jpg', description: 'Relaxed, affectionate, and floppy' },
    { name: 'British Shorthair', image: 'images/british-shorthair.jpg', description: 'Calm, dignified, and loyal' },
    { name: 'Bengal', image: 'images/bengal.jpg', description: 'Energetic, curious, and playful' },
    { name: 'Scottish Fold', image: 'images/scottish-fold.jpg', description: 'Sweet, calm, and adaptable' },
    { name: 'Sphynx', image: 'images/sphynx.jpg', description: 'Loving, energetic, and social' },
    { name: 'American Shorthair', image: 'images/american-shorthair.jpg', description: 'Easygoing, affectionate, and adaptable' }
  ]
};

// ==================== PRELOAD BREED IMAGES ====================
const _preloadCache = [];
let imagesPreloaded = false;

function preloadBreedImages() {
  if (imagesPreloaded) return;
  imagesPreloaded = true;
  const allBreeds = [...BREED_IMAGES.dog, ...BREED_IMAGES.cat];
  allBreeds.forEach(breed => {
    const img = new Image();
    _preloadCache.push(img);
    img.src = breed.image;
  });
  console.log(`[FurReal] Preloading ${allBreeds.length} breed images...`);
}

// ==================== BREED OPTIONS FOR DROPDOWN ====================
function getBreedOptions(petType) {
  if (!petType) return [];
  return BREED_IMAGES[petType].map(breed => breed.name);
}

function populateBreedDropdowns(petType) {
  const uploadBreedSelect = document.getElementById('uploadPetBreed');
  const spUploadBreedSelect = document.getElementById('spUploadPetBreed');
  
  const breeds = getBreedOptions(petType);
  const options = '<option value="">-- Select Breed --</option>' + 
    breeds.map(breed => `<option value="${breed}">${breed}</option>`).join('');
  
  if (uploadBreedSelect) uploadBreedSelect.innerHTML = options;
  if (spUploadBreedSelect) spUploadBreedSelect.innerHTML = options;
}

// ==================== LOCATIONS DATABASE ====================
const LOCATIONS = [
  'Metro Manila, Philippines', 'Quezon City, Philippines', 'Makati City, Philippines',
  'Taguig City, Philippines', 'Pasig City, Philippines', 'Mandaluyong City, Philippines',
  'Manila City, Philippines', 'Caloocan City, Philippines', 'Cebu City, Philippines',
  'Davao City, Philippines', 'Baguio City, Philippines', 'Iloilo City, Philippines',
  'Bacolod City, Philippines', 'Cagayan de Oro City, Philippines', 'General Santos City, Philippines',
  'Batangas City, Philippines', 'Lipa City, Philippines', 'Laguna, Philippines',
  'Cavite, Philippines', 'Bulacan, Philippines', 'Pampanga, Philippines'
];

// ==================== APPLICATION STATE ====================
let currentUser = null;
let pets = [];
let myPostedPets = [];
let adoptedPets = [];
let currentAdoptPet = null;
let pendingOTPEmail = null;
let pendingOTPPurpose = null;
let currentPetImages = [];

// ==================== TWO OPTIONS STATE ====================
let selectedPhotoOption = 'gallery';
let uploadedOwnPhotoFile = null;
let uploadedOwnPhotoDataUrl = null;

// ==================== HELPER FUNCTIONS ====================
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initDatePickers() {
  const postDateInput = document.getElementById('postDate');
  const spPostDateInput = document.getElementById('sp-postDate');
  
  if (postDateInput) {
    postDateInput.value = getTodayDate();
    postDateInput.max = getTodayDate();
  }
  if (spPostDateInput) {
    spPostDateInput.value = getTodayDate();
    spPostDateInput.max = getTodayDate();
  }
}

// ==================== COMPRESS IMAGE FUNCTION ====================
async function compressImageForDatabase(imageDataUrl, maxWidth = 250, maxHeight = 250, quality = 0.5) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.src = imageDataUrl;
  });
}

// ==================== TWO OPTIONS FUNCTIONS ====================
function initTwoOptions() {
  console.log('[FurReal] Initializing two options...');
  
  // Get elements for Profile page
  const galleryCard = document.getElementById('galleryOptionCard');
  const uploadCard = document.getElementById('uploadOptionCard');
  const gallerySection = document.getElementById('gallerySection');
  const uploadSection = document.getElementById('uploadSection');
  const galleryRadio = document.getElementById('galleryRadioCircle');
  const uploadRadio = document.getElementById('uploadRadioCircle');
  const hiddenInput = document.getElementById('selectedPhotoOption');
  const uploadArea = document.getElementById('ownPhotoUploadArea');
  const fileInput = document.getElementById('ownPhotoFileInput');
  const preview = document.getElementById('ownPhotoPreview');
  const previewImg = document.getElementById('ownPhotoPreviewImg');
  const removeBtn = document.getElementById('removeOwnPhotoBtn');
  
  // Get elements for Standalone page
  const spGalleryCard = document.getElementById('spGalleryOptionCard');
  const spUploadCard = document.getElementById('spUploadOptionCard');
  const spGallerySection = document.getElementById('spGallerySection');
  const spUploadSection = document.getElementById('spUploadSection');
  const spGalleryRadio = document.getElementById('spGalleryRadioCircle');
  const spUploadRadio = document.getElementById('spUploadRadioCircle');
  const spHiddenInput = document.getElementById('spSelectedPhotoOption');
  const spUploadArea = document.getElementById('spOwnPhotoUploadArea');
  const spFileInput = document.getElementById('spOwnPhotoFileInput');
  const spPreview = document.getElementById('spOwnPhotoPreview');
  const spPreviewImg = document.getElementById('spOwnPhotoPreviewImg');
  const spRemoveBtn = document.getElementById('spRemoveOwnPhotoBtn');
  
  // Populate breed dropdowns when pet type changes
  function updateBreedDropdowns() {
    const petType = getSelectedPetType();
    if (petType) {
      populateBreedDropdowns(petType);
    }
  }
  
  // Listen to pet type radio changes
  const dogRadio = document.getElementById('typeDogRadio');
  const catRadio = document.getElementById('typeCatRadio');
  const spDogRadio = document.getElementById('spTypeDogRadio');
  const spCatRadio = document.getElementById('spTypeCatRadio');
  
  if (dogRadio) dogRadio.addEventListener('change', updateBreedDropdowns);
  if (catRadio) catRadio.addEventListener('change', updateBreedDropdowns);
  if (spDogRadio) spDogRadio.addEventListener('change', updateBreedDropdowns);
  if (spCatRadio) spCatRadio.addEventListener('change', updateBreedDropdowns);
  
  // Function to select Gallery option
  function selectGalleryOption() {
    console.log('[FurReal] Gallery option selected');
    selectedPhotoOption = 'gallery';
    if (hiddenInput) hiddenInput.value = 'gallery';
    if (spHiddenInput) spHiddenInput.value = 'gallery';
    
    // Update styles for Profile page
    if (galleryCard) {
      galleryCard.style.borderColor = 'var(--primary)';
      galleryCard.style.background = 'rgba(0, 150, 136, 0.05)';
    }
    if (uploadCard) {
      uploadCard.style.borderColor = 'var(--border)';
      uploadCard.style.background = 'transparent';
    }
    if (galleryRadio) {
      galleryRadio.style.borderColor = 'var(--primary)';
      galleryRadio.style.background = 'var(--primary)';
      galleryRadio.style.boxShadow = 'inset 0 0 0 3px white';
    }
    if (uploadRadio) {
      uploadRadio.style.borderColor = 'var(--border)';
      uploadRadio.style.background = 'white';
      uploadRadio.style.boxShadow = 'none';
    }
    
    // Update styles for Standalone page
    if (spGalleryCard) {
      spGalleryCard.style.borderColor = 'var(--primary)';
      spGalleryCard.style.background = 'rgba(0, 150, 136, 0.05)';
    }
    if (spUploadCard) {
      spUploadCard.style.borderColor = 'var(--border)';
      spUploadCard.style.background = 'transparent';
    }
    if (spGalleryRadio) {
      spGalleryRadio.style.borderColor = 'var(--primary)';
      spGalleryRadio.style.background = 'var(--primary)';
      spGalleryRadio.style.boxShadow = 'inset 0 0 0 3px white';
    }
    if (spUploadRadio) {
      spUploadRadio.style.borderColor = 'var(--border)';
      spUploadRadio.style.background = 'white';
      spUploadRadio.style.boxShadow = 'none';
    }
    
    // Show/hide sections
    if (gallerySection) gallerySection.style.display = 'block';
    if (uploadSection) uploadSection.style.display = 'none';
    if (spGallerySection) spGallerySection.style.display = 'block';
    if (spUploadSection) spUploadSection.style.display = 'none';
    
    // Clear uploaded photo if any
    if (uploadedOwnPhotoFile) {
      uploadedOwnPhotoFile = null;
      uploadedOwnPhotoDataUrl = null;
      if (preview) preview.style.display = 'none';
      if (previewImg) previewImg.src = '';
      if (fileInput) fileInput.value = '';
      if (spPreview) spPreview.style.display = 'none';
      if (spPreviewImg) spPreviewImg.src = '';
      if (spFileInput) spFileInput.value = '';
      const mainPreview = document.getElementById('petImagePreview');
      if (mainPreview) {
        mainPreview.src = '';
        mainPreview.style.display = 'none';
      }
      const spMainPreview = document.getElementById('sp-petImagePreview');
      if (spMainPreview) {
        spMainPreview.src = '';
        spMainPreview.style.display = 'none';
      }
    }
  }
  
  // Function to select Upload option
  function selectUploadOption() {
    const petType = getSelectedPetType();
    if (!petType) {
      showToast('Please select a pet type (Dog or Cat) first!', 'error');
      return;
    }
    
    console.log('[FurReal] Upload option selected');
    selectedPhotoOption = 'upload';
    if (hiddenInput) hiddenInput.value = 'upload';
    if (spHiddenInput) spHiddenInput.value = 'upload';
    
    // Populate breed dropdowns
    populateBreedDropdowns(petType);
    
    // Update styles for Profile page
    if (uploadCard) {
      uploadCard.style.borderColor = 'var(--primary)';
      uploadCard.style.background = 'rgba(0, 150, 136, 0.05)';
    }
    if (galleryCard) {
      galleryCard.style.borderColor = 'var(--border)';
      galleryCard.style.background = 'transparent';
    }
    if (uploadRadio) {
      uploadRadio.style.borderColor = 'var(--primary)';
      uploadRadio.style.background = 'var(--primary)';
      uploadRadio.style.boxShadow = 'inset 0 0 0 3px white';
    }
    if (galleryRadio) {
      galleryRadio.style.borderColor = 'var(--border)';
      galleryRadio.style.background = 'white';
      galleryRadio.style.boxShadow = 'none';
    }
    
    // Update styles for Standalone page
    if (spUploadCard) {
      spUploadCard.style.borderColor = 'var(--primary)';
      spUploadCard.style.background = 'rgba(0, 150, 136, 0.05)';
    }
    if (spGalleryCard) {
      spGalleryCard.style.borderColor = 'var(--border)';
      spGalleryCard.style.background = 'transparent';
    }
    if (spUploadRadio) {
      spUploadRadio.style.borderColor = 'var(--primary)';
      spUploadRadio.style.background = 'var(--primary)';
      spUploadRadio.style.boxShadow = 'inset 0 0 0 3px white';
    }
    if (spGalleryRadio) {
      spGalleryRadio.style.borderColor = 'var(--border)';
      spGalleryRadio.style.background = 'white';
      spGalleryRadio.style.boxShadow = 'none';
    }
    
    // Show/hide sections
    if (uploadSection) uploadSection.style.display = 'block';
    if (gallerySection) gallerySection.style.display = 'none';
    if (spUploadSection) spUploadSection.style.display = 'block';
    if (spGallerySection) spGallerySection.style.display = 'none';
    
    // Clear breed selection from gallery
    const breedInput = document.getElementById('petBreed');
    if (breedInput) breedInput.value = '';
    const spBreedInput = document.getElementById('sp-petBreed');
    if (spBreedInput) spBreedInput.value = '';
    
    const mainPreview = document.getElementById('petImagePreview');
    if (mainPreview) {
      mainPreview.src = '';
      mainPreview.style.display = 'none';
    }
    const spMainPreview = document.getElementById('sp-petImagePreview');
    if (spMainPreview) {
      spMainPreview.src = '';
      spMainPreview.style.display = 'none';
    }
  }
  
  // Handle file upload for Profile page
  async function handleFileUpload(file, isStandalone = false) {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      showToast('File too large! Maximum size is 2MB', 'error');
      return;
    }
    
    uploadedOwnPhotoFile = file;
    const reader = new FileReader();
    reader.onload = async function(event) {
      let compressedDataUrl = event.target.result;
      if (compressedDataUrl.length > 5000) {
        compressedDataUrl = await compressImageForDatabase(compressedDataUrl, 200, 200, 0.3);
      }
      uploadedOwnPhotoDataUrl = compressedDataUrl;
      
      if (!isStandalone) {
        if (previewImg) previewImg.src = uploadedOwnPhotoDataUrl;
        if (preview) preview.style.display = 'block';
        const mainPreview = document.getElementById('petImagePreview');
        if (mainPreview) {
          mainPreview.src = uploadedOwnPhotoDataUrl;
          mainPreview.style.display = 'block';
        }
      } else {
        if (spPreviewImg) spPreviewImg.src = uploadedOwnPhotoDataUrl;
        if (spPreview) spPreview.style.display = 'block';
        const spMainPreview = document.getElementById('sp-petImagePreview');
        if (spMainPreview) {
          spMainPreview.src = uploadedOwnPhotoDataUrl;
          spMainPreview.style.display = 'block';
        }
      }
      showToast('Photo uploaded successfully! Now select a breed.', 'success');
    };
    reader.readAsDataURL(file);
  }
  
  // Remove uploaded photo
  function removeUploadedPhoto(isStandalone = false) {
    uploadedOwnPhotoFile = null;
    uploadedOwnPhotoDataUrl = null;
    
    if (!isStandalone) {
      if (preview) preview.style.display = 'none';
      if (previewImg) previewImg.src = '';
      if (fileInput) fileInput.value = '';
      const mainPreview = document.getElementById('petImagePreview');
      if (mainPreview) {
        mainPreview.src = '';
        mainPreview.style.display = 'none';
      }
      const breedSelect = document.getElementById('uploadPetBreed');
      if (breedSelect) breedSelect.value = '';
    } else {
      if (spPreview) spPreview.style.display = 'none';
      if (spPreviewImg) spPreviewImg.src = '';
      if (spFileInput) spFileInput.value = '';
      const spMainPreview = document.getElementById('sp-petImagePreview');
      if (spMainPreview) {
        spMainPreview.src = '';
        spMainPreview.style.display = 'none';
      }
      const spBreedSelect = document.getElementById('spUploadPetBreed');
      if (spBreedSelect) spBreedSelect.value = '';
    }
    showToast('Photo removed', 'info');
  }
  
  // Add event listeners for Profile page
  if (galleryCard) galleryCard.addEventListener('click', selectGalleryOption);
  if (uploadCard) uploadCard.addEventListener('click', selectUploadOption);
  
  if (uploadArea) {
    uploadArea.addEventListener('click', () => {
      if (selectedPhotoOption !== 'upload') {
        showToast('Please select "Upload My Own Photo" option first', 'info');
        return;
      }
      const petType = getSelectedPetType();
      if (!petType) {
        showToast('Please select a pet type (Dog or Cat) first!', 'error');
        return;
      }
      fileInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0], false);
      }
      fileInput.value = '';
    });
  }
  
  if (removeBtn) {
    removeBtn.addEventListener('click', () => removeUploadedPhoto(false));
  }
  
  // Add event listeners for Standalone page
  if (spGalleryCard) spGalleryCard.addEventListener('click', selectGalleryOption);
  if (spUploadCard) spUploadCard.addEventListener('click', selectUploadOption);
  
  if (spUploadArea) {
    spUploadArea.addEventListener('click', () => {
      if (selectedPhotoOption !== 'upload') {
        showToast('Please select "Upload My Own Photo" option first', 'info');
        return;
      }
      const petType = getSelectedPetType('sp');
      if (!petType) {
        showToast('Please select a pet type (Dog or Cat) first!', 'error');
        return;
      }
      spFileInput.click();
    });
  }
  
  if (spFileInput) {
    spFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0], true);
      }
      spFileInput.value = '';
    });
  }
  
  if (spRemoveBtn) {
    spRemoveBtn.addEventListener('click', () => removeUploadedPhoto(true));
  }
  
  // Set default (gallery selected)
  selectGalleryOption();
  
  console.log('[FurReal] Two options initialized successfully');
}

// ==================== WAIVER FORM FUNCTIONS ====================
async function downloadWaiverForm() {
  try {
    showToast('Downloading waiver form...', 'info');
    const blob = await ApiService.downloadWaiverTemplate();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FurReal_Adoption_Waiver.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showToast('Waiver form downloaded!', 'success');
  } catch (error) {
    showToast('Failed to download waiver form', 'error');
  }
}

function showWaiverUploadModal(adoptionId) {
  let modal = document.getElementById('waiverUploadModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('submitWaiverBtn').onclick = async () => {
      const fileInput = document.getElementById('waiverFileInput');
      const file = fileInput.files[0];
      if (!file) {
        showToast('Please select a file to upload', 'error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showToast('File too large! Maximum size is 5MB', 'error');
        return;
      }
      
      const result = await ApiService.uploadSignedWaiver(adoptionId, file);
      if (result && result.success) {
        showToast('Waiver uploaded successfully!', 'success');
        closeModal('waiverUploadModal');
        showPaymentModal(adoptionId);
      } else {
        showToast(result?.message || 'Failed to upload waiver', 'error');
      }
    };
  }
}

// ==================== PAYMENT FUNCTIONS ====================
function showPaymentModal(adoptionId) {
  let modal = document.getElementById('paymentModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    const refInput = document.getElementById('paymentRefNo');
    const refLabel = document.getElementById('refLabel');
    const refHint = document.getElementById('refHint');
    const paymentInstructions = document.getElementById('paymentInstructions');
    const proofOfPaymentGroup = document.getElementById('proofOfPaymentGroup');
    const radioButtons = document.querySelectorAll('input[name="paymentMethod"]');
    
    window.currentPaymentAdoptionId = adoptionId;
    window.selectedProofFile = null;
    
    function setupProofUpload() {
      const uploadArea = document.getElementById('proofUploadArea');
      const fileInput = document.getElementById('proofOfPayment');
      const previewDiv = document.getElementById('proofPreview');
      const previewImg = document.getElementById('proofPreviewImg');
      
      if (uploadArea && fileInput) {
        const newUploadArea = uploadArea.cloneNode(true);
        if (uploadArea.parentNode) {
          uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
        }
        
        newUploadArea.style.cursor = 'pointer';
        newUploadArea.addEventListener('click', function() {
          const newFileInput = document.getElementById('proofOfPayment');
          if (newFileInput) newFileInput.click();
        });
        
        const newFileInput = document.getElementById('proofOfPayment');
        if (newFileInput) {
          newFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                showToast('File too large! Maximum size is 5MB', 'error');
                this.value = '';
                return;
              }
              const reader = new FileReader();
              reader.onload = function(event) {
                if (previewImg) previewImg.src = event.target.result;
                if (previewDiv) previewDiv.style.display = 'block';
              };
              reader.readAsDataURL(file);
              window.selectedProofFile = file;
            }
          });
        }
        
        const removeBtn = document.querySelector('.btn-remove-proof');
        if (removeBtn) {
          const newRemoveBtn = removeBtn.cloneNode(true);
          if (removeBtn.parentNode) {
            removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);
          }
          newRemoveBtn.addEventListener('click', function() {
            if (previewImg) previewImg.src = '';
            if (previewDiv) previewDiv.style.display = 'none';
            const newFileInput = document.getElementById('proofOfPayment');
            if (newFileInput) newFileInput.value = '';
            window.selectedProofFile = null;
          });
        }
      }
    }
    
    if (refInput) {
      refInput.maxLength = 15;
      refInput.type = 'tel';
      refInput.inputMode = 'numeric';
      refInput.addEventListener('input', function(e) {
        let val = this.value.replace(/[^0-9]/g, '');
        if (val.length > 15) val = val.slice(0, 15);
        this.value = val;
      });
    }
    
    function updatePaymentMethodUI() {
      const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
      
      if (selectedMethod === 'cod') {
        if (refLabel) refLabel.textContent = 'Order Reference (Optional)';
        if (refHint) refHint.textContent = 'You can leave this blank for Cash on Delivery (Numbers only, max 15 digits)';
        if (refInput) refInput.placeholder = 'Leave blank or enter numbers only (max 15)';
        if (refInput) refInput.required = false;
        if (proofOfPaymentGroup) proofOfPaymentGroup.style.display = 'none';
        if (paymentInstructions) {
          paymentInstructions.innerHTML = `
            <div class="payment-instructions" style="background: #1a1a1a; padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; color: #ffffff;">
              <p style="font-weight: bold; margin-bottom: 0.5rem; color: #f0fdf4;">🚚 Cash on Delivery</p>
              <p style="color: #d1d5db;">Pay ₱100.00 when the pet is delivered to your location.</p>
              <p style="margin-top: 0.5rem; color: #9ca3af;">No need to upload proof of payment.</p>
              <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #6b7280;">Reference number is optional (numbers only, max 15 digits)</p>
            </div>
          `;
        }
      } else {
        if (refLabel) refLabel.textContent = 'GCash Reference Number';
        if (refHint) refHint.textContent = 'Enter your GCash reference number (Numbers only, max 15 digits)';
        if (refInput) refInput.placeholder = 'e.g., 123456789012345';
        if (refInput) refInput.required = true;
        if (proofOfPaymentGroup) proofOfPaymentGroup.style.display = 'block';
        if (paymentInstructions) {
          paymentInstructions.innerHTML = `
            <div class="payment-instructions" style="background: #1a1a1a; padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; color: #ffffff;">
              <p style="font-weight: bold; margin-bottom: 0.5rem; color: #e6f7ff;">📱 GCash Payment Instructions:</p>
              <p style="color: #d1d5db;">1. Open GCash App</p>
              <p style="color: #d1d5db;">2. Click "Send Money"</p>
              <p style="color: #d1d5db;">3. Send <strong style="color: #4ade80;">₱100.00</strong> to:</p>
              <p style="background: #2d2d2d; padding: 0.5rem; border-radius: 0.5rem; margin: 0.5rem 0;">
                <span style="color: #ffffff;"><strong>GCash Number:</strong> 0999 123 4567</span><br>
                <span style="color: #ffffff;"><strong>Account Name:</strong> FurReal Foundation Inc.</span>
              </p>
              <p style="color: #d1d5db;">4. Take a screenshot of your transaction</p>
              <p style="color: #d1d5db;">5. Upload the screenshot as proof of payment</p>
              <p style="color: #d1d5db;">6. Enter the reference number above (numbers only, max 15 digits)</p>
              <p style="color: #d1d5db;">7. Click "Confirm Payment" to complete your adoption</p>
            </div>
          `;
        }
      }
    }
    
    setupProofUpload();
    
    radioButtons.forEach(radio => {
      radio.removeEventListener('change', updatePaymentMethodUI);
      radio.addEventListener('change', updatePaymentMethodUI);
    });
    
    updatePaymentMethodUI();
    
    document.getElementById('confirmPaymentBtn').onclick = async () => {
      const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
      let refNo = document.getElementById('paymentRefNo')?.value.trim();
      const proofFile = window.selectedProofFile;
      
      if (refNo && !/^\d+$/.test(refNo)) {
        showToast('Reference number must contain numbers only', 'error');
        return;
      }
      
      if (refNo && refNo.length > 15) {
        showToast('Reference number cannot exceed 15 digits', 'error');
        return;
      }
      
      if (selectedMethod === 'gcash') {
        if (!refNo) {
          showToast('Please enter your GCash reference number', 'error');
          return;
        }
        if (!proofFile) {
          showToast('Please upload proof of payment (screenshot)', 'error');
          return;
        }
      }
      
      showToast('Processing payment...', 'info');
      
      const result = await ApiService.createPayment(adoptionId, 100);
      
      if (result && result.success) {
        const paymentResult = await ApiService.processPayment(result.data.id, {
          method: selectedMethod,
          referenceNumber: refNo || 'COD-' + Date.now()
        });
        
        if (paymentResult && paymentResult.success) {
          if (selectedMethod === 'gcash' && proofFile) {
            showToast('Uploading proof of payment...', 'info');
            const uploadResult = await ApiService.uploadProofOfPayment(adoptionId, proofFile);
            if (!uploadResult || !uploadResult.success) {
              showToast(uploadResult?.message || 'Warning: Payment recorded but proof upload failed', 'warning');
            }
          }
          
          if (selectedMethod === 'cod') {
            showToast('Adoption request submitted! Our team will contact you for delivery.', 'success');
          } else {
            showToast('Payment recorded! Our admin will verify your payment within 24 hours.', 'success');
          }
          closeModal('paymentModal');
          await loadAllData();
        } else {
          showToast(paymentResult?.message || 'Payment processing failed', 'error');
        }
      } else {
        showToast(result?.message || 'Failed to create payment', 'error');
      }
    };
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ==================== PET GALLERY FUNCTIONS ====================
function openPetGallery(petId, petName) {
  let modal = document.getElementById('petGalleryModal');
  if (modal) {
    document.getElementById('galleryPetName').textContent = `${petName}'s Photos`;
    loadPetGallery(petId);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

async function loadPetGallery(petId) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  
  grid.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading images...</div>';
  
  const result = await ApiService.getPetImages(petId);
  if (result && result.success && result.data && result.data.length > 0) {
    currentPetImages = result.data;
    grid.innerHTML = currentPetImages.map(img => `
      <div class="gallery-item">
        <img src="${img.url}" alt="Pet photo" style="width: 100%; height: 150px; object-fit: cover; border-radius: 0.75rem; cursor: pointer;" onclick="window.open('${img.url}', '_blank')" />
      </div>
    `).join('');
  } else {
    grid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #888;">No additional photos available</div>';
  }
}

// ==================== OTP MODAL FUNCTIONS ====================
function showOTPModal(email, purpose, onSuccess) {
  pendingOTPEmail = email;
  pendingOTPPurpose = purpose;
  
  let otpModal = document.getElementById('otpModal');
  if (otpModal) {
    const messageEl = document.getElementById('otpMessage');
    if (messageEl) messageEl.innerHTML = `We've sent a 6-digit code to <strong>${email}</strong>`;
    
    otpModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('otpCodeInput').value = '';
    document.getElementById('otpCodeInput').focus();
    
    window.otpSuccessCallback = onSuccess;
  }
}

function closeOTPModal() {
  const modal = document.getElementById('otpModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  pendingOTPEmail = null;
  pendingOTPPurpose = null;
}

async function verifyOTPAndProceed() {
  const otpCode = document.getElementById('otpCodeInput').value.trim();
  if (!otpCode || otpCode.length !== 6) {
    showToast('Please enter a valid 6-digit code', 'error');
    return;
  }
  
  const result = await ApiService.verifyOTP(pendingOTPEmail, otpCode, pendingOTPPurpose);
  if (result && result.success) {
    showToast('Verification successful!', 'success');
    closeOTPModal();
    if (window.otpSuccessCallback) {
      window.otpSuccessCallback();
    }
  } else {
    showToast(result?.message || 'Invalid verification code', 'error');
  }
}

async function resendOTPCode() {
  if (!pendingOTPEmail || !pendingOTPPurpose) return;
  const result = await ApiService.sendOTP(pendingOTPEmail, pendingOTPPurpose);
  if (result && result.success) {
    showToast(`New code sent to ${pendingOTPEmail}`, 'success');
  } else {
    showToast(result?.message || 'Failed to send code', 'error');
  }
}

// ==================== PROFILE PICTURE FUNCTIONS ====================
let currentProfilePicture = null;

function setupProfilePictureUpload() {
  const fileInput = document.getElementById('profilePicInput');
  if (!fileInput) return;
  
  fileInput.removeEventListener('change', handleFileChange);
  fileInput.addEventListener('change', handleFileChange);
  
  const profilePic = document.getElementById('profilePicture');
  if (profilePic) {
    profilePic.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }
}

async function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file && file.type.startsWith('image/')) {
    showToast('Uploading profile picture...', 'info');
    const compressedImage = await compressImage(file);
    const reader = new FileReader();
    reader.onload = async function(event) {
      const imageData = event.target.result;
      currentProfilePicture = imageData;
      updateProfilePictureDisplay(imageData);
      const userId = localStorage.getItem('userId');
      if (userId) {
        const result = await ApiService.updateProfilePicture(userId, imageData);
        if (result && result.success) {
          showToast('Profile picture saved!', 'success');
        } else {
          showToast('Failed to save profile picture', 'error');
        }
      }
    };
    reader.readAsDataURL(compressedImage);
  } else {
    showToast('Please select a valid image file', 'error');
  }
  e.target.value = '';
}

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;
        const maxSize = 200;
        if (width > height) {
          if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        } else {
          if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => { resolve(blob); }, 'image/jpeg', 0.7);
      };
    };
  });
}

function updateProfilePictureDisplay(imageData) {
  const innerContainer = document.getElementById('profilePictureInner');
  const initialsSpan = document.getElementById('avatarInitials');
  if (!innerContainer) return;
  const existingImg = innerContainer.querySelector('img');
  if (existingImg) {
    existingImg.src = imageData;
  } else {
    if (initialsSpan) initialsSpan.style.display = 'none';
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = 'Profile Picture';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    innerContainer.appendChild(img);
  }
}

function resetProfilePictureToInitials() {
  const innerContainer = document.getElementById('profilePictureInner');
  const initialsSpan = document.getElementById('avatarInitials');
  const existingImg = innerContainer?.querySelector('img');
  if (existingImg) existingImg.remove();
  if (initialsSpan) {
    initialsSpan.style.display = 'flex';
    if (currentUser?.name) {
      const initials = currentUser.name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
      initialsSpan.textContent = initials;
    } else {
      initialsSpan.textContent = '?';
    }
  }
  currentProfilePicture = null;
}

async function loadProfilePicture() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  try {
    const result = await ApiService.getProfilePicture(userId);
    if (result && result.success && result.data && result.data.profilePicture) {
      currentProfilePicture = result.data.profilePicture;
      updateProfilePictureDisplay(currentProfilePicture);
    }
  } catch (error) {
    console.error('Failed to load profile picture:', error);
  }
}

// ==================== VALIDATION FUNCTIONS ====================
function validatePhoneNumber(phone) {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  return digitsOnly.length === 11;
}

function formatPhoneNumber(phone) {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length === 11 ? digits : phone;
}

// ==================== THEME TOGGLE ====================
function initTheme() {
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  const saved = localStorage.getItem('furreal-theme') || 'light';
  html.setAttribute('data-theme', saved);
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('furreal-theme', next);
  });
}

// ==================== UPDATE NAVIGATION BAR ====================
function updateNavigationBar() {
  const navActions = document.getElementById('navActions');
  const mobileNavList = document.getElementById('mobileNavList');
  if (!navActions) return;
  const isLoggedIn = !!(localStorage.getItem('userId') && currentUser);
  if (isLoggedIn) {
    navActions.innerHTML = `<a href="#" class="btn btn-outline btn-sm" data-page="profile">👤 My Profile</a><a href="#" class="btn btn-primary btn-sm" data-page="logout">🚪 Logout</a>`;
    if (mobileNavList) mobileNavList.innerHTML = `<li><a href="#" data-page="home">Home</a></li><li><a href="#" data-page="pets">Browse Pets</a></li><li><a href="#" data-page="profile">My Profile</a></li><li><a href="#" data-page="logout">Logout</a></li>`;
  } else {
    navActions.innerHTML = `<a href="#" class="btn btn-ghost btn-sm" data-page="login">Login</a><a href="#" class="btn btn-primary btn-sm" data-page="register">Sign Up</a>`;
    if (mobileNavList) mobileNavList.innerHTML = `<li><a href="#" data-page="home">Home</a></li><li><a href="#" data-page="pets">Browse Pets</a></li><li><a href="#" data-page="login">Login</a></li><li><a href="#" data-page="register">Sign Up</a></li>`;
  }
  reattachNavListeners();
}

function handleNavClick(e) {
  e.preventDefault();
  const page = this.getAttribute('data-page');
  if (page === 'logout') handleLogout();
  else if (page) showPage(page);
}

function reattachNavListeners() {
  document.querySelectorAll('[data-page]').forEach(link => {
    link.removeEventListener('click', handleNavClick);
    link.addEventListener('click', handleNavClick);
  });
}

// ==================== DATA LOADERS ====================
async function loadAllData() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    renderAllViews();
    updateNavigationBar();
    return;
  }
  try {
    const [petsRes, myPetsRes, adoptedRes, userRes] = await Promise.all([
      ApiService.getPets(),
      ApiService.getMyPostedPets(userId),
      ApiService.getMyAdoptedPets(userId),
      ApiService.getUserProfile(userId)
    ]);
    if (petsRes && petsRes.success) pets = petsRes.data || [];
    if (myPetsRes && myPetsRes.success) myPostedPets = myPetsRes.data || [];
    if (adoptedRes && adoptedRes.success) adoptedPets = adoptedRes.data || [];
    if (userRes && userRes.success) currentUser = userRes.data;
    renderAllViews();
    updateStats();
    updateNavigationBar();
  } catch (error) {
    console.error('Failed to load data:', error);
    renderAllViews();
  }
}

function updateStats() {
  const statPets = document.getElementById('stat-pets');
  const statAdoptions = document.getElementById('stat-adoptions');
  if (statPets) statPets.textContent = pets.length;
  if (statAdoptions) statAdoptions.textContent = adoptedPets.length;
}

function renderAllViews() {
  renderFeaturedPets();
  renderAllPets();
  renderMyPets();
  renderAdoptedPets();
  updateProfileDisplay();
  updateStats();
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
  const drawer = document.getElementById('navDrawer');
  if (drawer) drawer.classList.remove('open');
  if (pageId === 'profile' && !currentUser) {
    showPage('login');
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'home') renderFeaturedPets();
  if (pageId === 'pets') renderAllPets();
  if (pageId === 'profile') {
    renderMyPets();
    renderAdoptedPets();
    updateProfileDisplay();
  }
  if (pageId === 'post-pet') {
    initDatePickers();
    setTimeout(() => {
      initTwoOptions();
    }, 100);
  }
}

// ==================== POPULATE DROPDOWNS ====================
function getSelectedPetType(prefix = '') {
  const dogRadio = document.getElementById(`${prefix}typeDogRadio`);
  const catRadio = document.getElementById(`${prefix}typeCatRadio`);
  if (dogRadio && dogRadio.checked) return 'dog';
  if (catRadio && catRadio.checked) return 'cat';
  return null;
}

function populateLocationDropdown() {
  const locationSelect = document.getElementById('location');
  const spLocationSelect = document.getElementById('sp-location');
  const options = LOCATIONS.map(loc => `<option value="${loc}">${loc}</option>`).join('');
  if (locationSelect) locationSelect.innerHTML = '<option value="">-- Select Location --</option>' + options;
  if (spLocationSelect) spLocationSelect.innerHTML = '<option value="">-- Select Location --</option>' + options;
}

// ==================== BREED IMAGE SELECTOR FOR GALLERY (WITH PICTURES) ====================
function openBreedSelector(targetBreedInputId, targetImageInputId, targetPreviewId, prefix = '') {
  if (selectedPhotoOption !== 'gallery') {
    showToast('Please select "Select from Breed Gallery" option first', 'info');
    return;
  }
  
  const petType = getSelectedPetType(prefix);
  if (!petType) {
    showToast('Please select a pet type (Dog or Cat) first!', 'error');
    return;
  }
  
  preloadBreedImages();
  const breeds = BREED_IMAGES[petType];
  const modal = document.getElementById('breedImageModal');
  const grid = document.getElementById('breedImagesGrid');
  const title = document.getElementById('breedModalTitle');
  const sub = document.getElementById('breedModalSub');
  title.textContent = `Select a ${petType === 'dog' ? '🐕 Dog' : '🐈 Cat'} Breed`;
  sub.textContent = 'Click on any image to select both breed and photo';
  
  grid.innerHTML = breeds.map(breed => `
    <div class="breed-image-card" onclick="window.selectBreedCallback('${breed.name.replace(/'/g, "\\'")}', '${breed.image}', '${targetBreedInputId}', '${targetPreviewId}')">
      <img src="${breed.image}" alt="${breed.name}" loading="eager" onerror="this.src='https://placehold.co/300x200/cccccc/666666?text=${encodeURIComponent(breed.name)}'" />
      <div class="breed-name">${breed.name}<span class="breed-type">${breed.description}</span></div>
    </div>
  `).join('');
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

window.selectBreedCallback = function(breedName, imageUrl, targetBreedInputId, targetPreviewId) {
  const breedInput = document.getElementById(targetBreedInputId);
  if (breedInput) breedInput.value = breedName;

  const preview = document.getElementById(targetPreviewId);
  if (preview) {
    preview.src = imageUrl;
    preview.classList.add('has-image');
    preview.style.display = 'block';
  }

  closeBreedModal();
  showToast(`Selected: ${breedName}`, 'success');
};

function closeBreedModal() {
  const modal = document.getElementById('breedImageModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// ==================== HTML ESCAPE ====================
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

// ==================== CARD BUILDER ====================
function buildPetCard(pet, showDelete = false) {
  const badgeClass = pet.type === 'dog' ? 'badge-dog' : 'badge-cat';
  const badgeText = pet.type === 'dog' ? '🐕 Dog' : '🐈 Cat';
  let actions;
  
  const postedDate = pet.postedDate ? formatDate(pet.postedDate) : '';
  const dateHtml = postedDate ? `<div class="pet-posted-date">📅 Posted on ${postedDate}</div>` : '';
  
  if (showDelete) {
    const statusChip = pet.status === 'pending' ? `<span class="pending-badge">⏳ Pending</span>` : `<span class="chip">${pet.adopted ? '✓ Adopted' : '• Available'}</span>`;
    actions = `<div class="my-pet-actions">${statusChip}${dateHtml}<button class="btn btn-danger btn-sm" onclick="deleteMyPet(${pet.id})">Delete</button></div>`;
  } else {
    actions = `<div class="pet-actions">${dateHtml}<button class="btn btn-primary btn-sm" data-adopt-id="${pet.id}">Adopt Me →</button></div>`;
  }
  const descriptionHtml = pet.description ? `<p class="pet-description">📝 ${escapeHtml(pet.description)}</p>` : '';
  return `<div class="pet-card"><div class="pet-card-img"><img src="${pet.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${pet.name}" loading="lazy" /><span class="pet-badge ${badgeClass}">${badgeText}</span></div><div class="pet-card-body"><h3 class="pet-card-name">${escapeHtml(pet.name)}</h3><div class="pet-chips"><span class="chip">${escapeHtml(pet.breed || '')}</span><span class="chip">${escapeHtml(pet.age || '')}</span></div><p class="pet-location">📍 ${escapeHtml(pet.location || '')}</p>${descriptionHtml}${actions}</div></div>`;
}

function buildAdoptedCard(pet) {
  const emoji = pet.type === 'cat' ? '🐈' : '🐕';
  const adoptedDate = pet.adoptedDate ? formatDate(pet.adoptedDate) : '';
  return `<div class="pet-card"><div class="pet-card-img"><img src="${pet.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${pet.name}" loading="lazy" /><span class="pet-badge" style="background:#3A7A73;color:#fff;">Adopted</span></div><div class="pet-card-body"><h3 class="pet-card-name">${emoji} ${escapeHtml(pet.name)}</h3><div class="pet-chips"><span class="chip">${escapeHtml(pet.breed || '')}</span><span class="chip">${escapeHtml(pet.age || '')}</span></div><p class="pet-location">🗓 Adopted on ${adoptedDate || 'N/A'}</p></div></div>`;
}

// ==================== RENDER FUNCTIONS ====================
function renderFeaturedPets() {
  const container = document.getElementById('featured-pets');
  if (!container) return;
  const featured = pets.filter(p => p.status === 'approved').slice(0, 3);
  if (featured.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">🐾</div><p>No pets available yet. Check back soon!</p></div>`; return; }
  container.innerHTML = featured.map(p => buildPetCard(p)).join('');
  attachAdoptButtons(container);
}

function renderAllPets() {
  const typeFilter = document.getElementById('filter-type')?.value || 'all';
  const searchTerm = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
  const countEl = document.getElementById('filter-count');
  const container = document.getElementById('all-pets');
  if (!container) return;
  let filtered = pets.filter(p => p.status === 'approved');
  if (typeFilter !== 'all') filtered = filtered.filter(p => p.type === typeFilter);
  if (searchTerm) filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(searchTerm) || (p.breed || '').toLowerCase().includes(searchTerm));
  if (countEl) countEl.textContent = `${filtered.length} pet${filtered.length !== 1 ? 's' : ''} found`;
  if (filtered.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>No pets match your search. Try different filters!</p></div>`; return; }
  container.innerHTML = filtered.map(p => buildPetCard(p)).join('');
  attachAdoptButtons(container);
}

function renderMyPets() {
  const container = document.getElementById('my-pets-list');
  if (!container) return;
  if (!myPostedPets || myPostedPets.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">🐾</div><p>You haven't posted any pets yet.</p><button class="btn btn-primary" id="postFirstPetBtn">Post Your First Pet</button></div>`; const btn = document.getElementById('postFirstPetBtn'); if (btn) btn.addEventListener('click', () => activateTab('post-pet')); return; }
  container.innerHTML = myPostedPets.map(p => buildPetCard(p, true)).join('');
}

function renderAdoptedPets() {
  const container = document.getElementById('adopted-pets-list');
  if (!container) return;
  if (!adoptedPets || adoptedPets.length === 0) { container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏠</div><p>You haven't adopted any pets yet.</p><button class="btn btn-primary" id="browsePetsBtn">Browse Pets</button></div>`; const btn = document.getElementById('browsePetsBtn'); if (btn) btn.addEventListener('click', () => showPage('pets')); return; }
  container.innerHTML = adoptedPets.map(p => buildAdoptedCard(p)).join('');
}

function attachAdoptButtons(container) {
  container.querySelectorAll('[data-adopt-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-adopt-id'));
      const pet = pets.find(p => p.id === id);
      if (pet) openAdoptModal(pet);
    });
  });
}

// ==================== ADOPT MODAL ====================
function openAdoptModal(pet) {
  currentAdoptPet = pet;
  document.getElementById('modal-pet-name').textContent = `Adopt ${pet.name}`;
  document.getElementById('adopterName').value = currentUser?.name || '';
  document.getElementById('adopterEmail').value = currentUser?.email || '';
  document.getElementById('adopterPhone').value = currentUser?.phone || '';
  document.getElementById('adopterMessage').value = `Hi! I'd love to give ${pet.name} a forever home. 🐾`;
  document.getElementById('adoptModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdoptModal() {
  const modal = document.getElementById('adoptModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  currentAdoptPet = null;
}

async function handleAdoptSubmit(e) {
  e.preventDefault();
  if (!currentAdoptPet) return;
  
  await downloadWaiverForm();
  
  const result = await ApiService.submitAdoptionRequest(currentAdoptPet.id, {
    name: document.getElementById('adopterName').value,
    email: currentUser?.email,
    phone: document.getElementById('adopterPhone').value,
    message: document.getElementById('adopterMessage').value
  });
  
  if (result && result.success) {
    showToast(`🎉 Adoption request sent for ${currentAdoptPet.name}!`, 'success');
    closeAdoptModal();
    
    setTimeout(() => {
      showWaiverUploadModal(result.data.id);
    }, 100);
    
    await loadAllData();
  } else {
    showToast(result?.message || 'Something went wrong. Please try again.', 'error');
  }
}

// ==================== POST PET ====================
async function handlePostPet(e, isStandalone = false) {
  e.preventDefault();
  const prefix = isStandalone ? 'sp-' : '';
  const typeEl = document.querySelector(isStandalone ? 'input[name="spPetType"]:checked' : 'input[name="petType"]:checked');
  const userId = localStorage.getItem('userId');
  
  if (!userId) {
    showToast('Please login first', 'error');
    showPage('login');
    return;
  }
  
  const petName = document.getElementById(`${prefix}petName`)?.value.trim();
  const petAge = document.getElementById(`${prefix}petAge`)?.value.trim();
  const petType = typeEl?.value;
  const location = document.getElementById(`${prefix}location`)?.value;
  let contact = document.getElementById(`${prefix}contactInfo`)?.value.trim();
  const description = document.getElementById(`${prefix}petDescription`)?.value.trim() || '';
  const postedDate = document.getElementById(`${prefix}postDate`)?.value || getTodayDate();
  
  let breed = '';
  let imageUrl = '';
  
  if (selectedPhotoOption === 'upload') {
    // Using uploaded photo
    if (!uploadedOwnPhotoDataUrl) {
      showToast('Please upload your pet\'s photo first!', 'error');
      return;
    }
    imageUrl = uploadedOwnPhotoDataUrl;
    
    // Get breed from dropdown
    const breedSelect = document.getElementById(isStandalone ? 'spUploadPetBreed' : 'uploadPetBreed');
    breed = breedSelect?.value;
    
    if (!breed) {
      showToast('Please select a breed for your pet!', 'error');
      return;
    }
  } else {
    // Using breed gallery
    breed = document.getElementById(`${prefix}petBreed`)?.value.trim();
    const preview = document.getElementById(`${prefix}petImagePreview`);
    imageUrl = (preview && preview.src && preview.src !== window.location.href) ? preview.src : '';
    
    if (!breed) {
      showToast('Please select a breed from the gallery first!', 'error');
      return;
    }
    if (!imageUrl) {
      showToast('Please select a photo from the gallery first!', 'error');
      return;
    }
  }
  
  // Validate required fields
  if (!petName) { showToast('Please enter pet name', 'error'); return; }
  if (!petType) { showToast('Please select pet type', 'error'); return; }
  if (!petAge) { showToast('Please enter pet age', 'error'); return; }
  if (!location) { showToast('Please select location', 'error'); return; }
  if (!contact) { showToast('Please enter contact number', 'error'); return; }
  if (contact && !validatePhoneNumber(contact)) {
    showToast('Phone number must be exactly 11 digits!', 'error');
    return;
  }
  contact = formatPhoneNumber(contact);
  
  const petData = {
    name: petName,
    type: petType,
    age: petAge,
    breed: breed,
    description: description,
    imageUrl: imageUrl,
    location: location,
    contact: contact,
    postedDate: postedDate,
    userId: userId,
    adopted: false,
    status: 'pending'
  };
  
  try {
    const result = await ApiService.createPet(petData);
    if (result && result.success) {
      // Reset form
      const formId = isStandalone ? 'postPetFormStandalone' : 'postPetForm';
      if (document.getElementById(formId)) {
        document.getElementById(formId).reset();
      }
      
      // Reset breed input for gallery
      const breedInput = document.getElementById(`${prefix}petBreed`);
      if (breedInput) breedInput.value = '';
      
      // Reset previews
      const preview = document.getElementById(`${prefix}petImagePreview`);
      if (preview) {
        preview.src = '';
        preview.style.display = 'none';
      }
      
      // Reset uploaded photo and breed dropdown
      uploadedOwnPhotoFile = null;
      uploadedOwnPhotoDataUrl = null;
      
      const ownPreview = document.getElementById('ownPhotoPreview');
      const ownPreviewImg = document.getElementById('ownPhotoPreviewImg');
      if (ownPreview) ownPreview.style.display = 'none';
      if (ownPreviewImg) ownPreviewImg.src = '';
      const fileInput = document.getElementById('ownPhotoFileInput');
      if (fileInput) fileInput.value = '';
      
      const breedSelect = document.getElementById('uploadPetBreed');
      if (breedSelect) breedSelect.value = '';
      
      const spOwnPreview = document.getElementById('spOwnPhotoPreview');
      const spOwnPreviewImg = document.getElementById('spOwnPhotoPreviewImg');
      if (spOwnPreview) spOwnPreview.style.display = 'none';
      if (spOwnPreviewImg) spOwnPreviewImg.src = '';
      const spFileInput = document.getElementById('spOwnPhotoFileInput');
      if (spFileInput) spFileInput.value = '';
      const spBreedSelect = document.getElementById('spUploadPetBreed');
      if (spBreedSelect) spBreedSelect.value = '';
      
      // Reset date
      const dateInput = document.getElementById(`${prefix}postDate`);
      if (dateInput) dateInput.value = getTodayDate();
      
      // Switch back to gallery option
      if (selectedPhotoOption === 'upload') {
        const galleryCard = document.getElementById('galleryOptionCard');
        if (galleryCard) galleryCard.click();
      }
      
      showToast(`🐾 ${petName} submitted! Waiting for admin approval.`, 'success');
      await loadAllData();
      
      if (!isStandalone) {
        activateTab('my-pets');
      } else {
        setTimeout(() => showPage('profile'), 1500);
      }
    } else {
      showToast(result?.message || 'Failed to post pet. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error posting pet:', error);
    showToast('Network error. Please check your connection.', 'error');
  }
}

async function deleteMyPet(petId) {
  if (!confirm('Remove this pet listing?')) return;
  const result = await ApiService.deletePet(petId);
  if (result && result.success) { showToast('Pet listing removed.', 'info'); await loadAllData(); }
  else showToast('Failed to delete pet.', 'error');
}

// ==================== AUTHENTICATION ====================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showToast('Please enter your email and password.', 'error'); return; }
  const result = await ApiService.login(email, password);
  if (result && result.success) {
    localStorage.setItem('userId', result.data.id);
    currentUser = result.data;
    updateProfileDisplay();
    updateNavigationBar();
    showToast('Welcome back! 👋', 'success');
    await loadAllData();
    await loadProfilePicture();
    showPage('profile');
  } else {
    showToast(result?.message || 'Invalid credentials. Please try again.', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirmPassword').value;
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const name = document.getElementById('regFullName').value.trim();
  
  if (password !== confirm) { showToast('Passwords do not match.', 'error'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  if (phone && !validatePhoneNumber(phone)) { showToast('Phone number must be exactly 11 digits!', 'error'); return; }
  
  const otpResult = await ApiService.sendOTP(email, 'REGISTRATION');
  if (otpResult && otpResult.success) {
    pendingOTPEmail = email;
    pendingOTPPurpose = 'REGISTRATION';
    
    showOTPModal(email, 'REGISTRATION', async () => {
      const userData = { name, email, phone: formatPhoneNumber(phone), password };
      const registerResult = await ApiService.register(userData);
      if (registerResult && registerResult.success) {
        localStorage.setItem('userId', registerResult.data.id);
        currentUser = registerResult.data;
        updateProfileDisplay();
        updateNavigationBar();
        showToast('Account created! Welcome to FurReal 🐾', 'success');
        showPage('profile');
        await loadProfilePicture();
      } else {
        showToast(registerResult?.message || 'Registration failed', 'error');
      }
    });
  } else {
    showToast(otpResult?.message || 'Failed to send verification code', 'error');
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) return;
  
  const result = await ApiService.sendOTP(email, 'FORGOT_PASSWORD');
  if (result && result.success) {
    pendingOTPEmail = email;
    pendingOTPPurpose = 'FORGOT_PASSWORD';
    
    showOTPModal(email, 'FORGOT_PASSWORD', async () => {
      showResetPasswordModal(email);
    });
  } else {
    showToast(result?.message || 'Failed to send reset code', 'error');
  }
}

function showResetPasswordModal(email) {
  let resetModal = document.getElementById('resetPasswordModal');
  if (resetModal) {
    document.getElementById('resetEmailDisplay').textContent = email;
    resetModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('resetSubmitBtn').onclick = async () => {
      const newPassword = document.getElementById('resetNewPassword').value;
      const confirmPassword = document.getElementById('resetConfirmPassword').value;
      
      if (!newPassword || newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      
      const result = await ApiService.resetPassword(email, null, newPassword);
      if (result && result.success) {
        showToast('Password reset successfully! Please login.', 'success');
        closeResetModal();
        showPage('login');
      } else {
        showToast(result?.message || 'Failed to reset password', 'error');
      }
    };
  }
}

function closeResetModal() {
  const modal = document.getElementById('resetPasswordModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

async function handleLogout() {
  await ApiService.logout();
  localStorage.removeItem('userId');
  currentUser = null;
  pets = [];
  myPostedPets = [];
  adoptedPets = [];
  currentProfilePicture = null;
  updateNavigationBar();
  showToast('Logged out successfully.', 'info');
  showPage('home');
  renderAllViews();
}

// ==================== PROFILE / SETTINGS ====================
function updateProfileDisplay() {
  if (!currentUser) {
    resetProfilePictureToInitials();
    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = 'Welcome';
    return;
  }
  const initials = (currentUser.name || '?').split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
  const ids = ['profile-name', 'profile-email', 'profile-phone', 'settings-fullname', 'settings-email', 'settings-phone'];
  const vals = [currentUser.name || '', currentUser.email || '', currentUser.phone || '', currentUser.name || '', currentUser.email || '', currentUser.phone || ''];
  ids.forEach((id, i) => { const el = document.getElementById(id); if (el) { if (id.includes('settings') && i >= 3) el.value = vals[i]; else el.textContent = vals[i]; } });
  const initialsSpan = document.getElementById('avatarInitials');
  const innerContainer = document.getElementById('profilePictureInner');
  const existingImg = innerContainer?.querySelector('img');
  if (!currentProfilePicture && !existingImg && initialsSpan) {
    initialsSpan.style.display = 'flex';
    initialsSpan.textContent = initials;
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const userId = localStorage.getItem('userId');
  const phone = document.getElementById('settings-phone').value.trim();
  if (phone && !validatePhoneNumber(phone)) { showToast('Phone number must be exactly 11 digits!', 'error'); return; }
  const updatedUser = {
    name: document.getElementById('settings-fullname').value.trim(),
    email: document.getElementById('settings-email').value.trim(),
    phone: formatPhoneNumber(phone)
  };
  const result = await ApiService.updateUserProfile(userId, updatedUser);
  if (result && result.success) { currentUser = { ...currentUser, ...updatedUser }; updateProfileDisplay(); showToast('Profile updated successfully.', 'success'); }
  else showToast(result?.message || 'Failed to update profile.', 'error');
}

async function handleChangePassword(e) {
  e.preventDefault();
  const userId = localStorage.getItem('userId');
  const currentPass = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;
  const confirmPass = document.getElementById('confirmPassword').value;
  if (!newPass) { showToast('Please enter a new password.', 'error'); return; }
  if (newPass !== confirmPass) { showToast('New passwords do not match.', 'error'); return; }
  if (newPass.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  const result = await ApiService.changePassword(userId, currentPass, newPass);
  if (result && result.success) { document.getElementById('changePasswordForm').reset(); showToast('Password changed successfully.', 'success'); }
  else showToast(result?.message || 'Failed to change password.', 'error');
}

async function handleDeleteAccount() {
  const userId = localStorage.getItem('userId');
  if (!confirm('Are you sure? This will permanently delete your account and cannot be undone.')) return;
  const result = await ApiService.deleteAccount(userId);
  if (result && result.success) { localStorage.removeItem('userId'); currentUser = null; updateNavigationBar(); showToast('Account deleted. Goodbye! 👋', 'info'); showPage('home'); renderAllViews(); }
  else showToast(result?.message || 'Failed to delete account.', 'error');
}

// ==================== TABS ====================
function activateTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `tab-${tabName}`));
  if (tabName === 'post-pet') {
    setTimeout(() => {
      populateLocationDropdown();
      initDatePickers();
      initTwoOptions();
    }, 100);
  }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity .3s ease, transform .3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(110%)';
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

// ==================== ADD STYLES ====================
function addPendingStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .pending-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 0.2rem 0.6rem; border-radius: 100px; font-size: 0.7rem; font-weight: 600; margin-top: 0.5rem; }
    .pet-description { margin: 0.5rem 0; font-size: 0.8rem; color: #666; line-height: 1.4; }
    .breed-image-card img { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; min-height: 160px; }
    .breed-image-card img.loaded { animation: none; background: none; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .pet-posted-date { font-size: 0.7rem; color: #888; margin-top: 0.5rem; display: inline-block; margin-right: 0.75rem; }
    .pet-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
    .my-pet-actions { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    input[type="date"] { font-family: inherit; padding: 0.75rem 1rem; border-radius: 1rem; border: 1px solid var(--border); background: var(--card); color: var(--text); cursor: pointer; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: var(--date-picker-filter, none); cursor: pointer; }
    [data-theme="dark"] { --date-picker-filter: invert(1); }
    .radio-label { cursor: pointer; transition: background 0.2s; }
    .radio-label:hover { background: var(--surface-2); }
    .photo-option-card { transition: all 0.3s ease; cursor: pointer; }
    .photo-option-card:hover { border-color: var(--primary) !important; background: rgba(0, 150, 136, 0.05); }
    .own-photo-upload-area { transition: all 0.3s; cursor: pointer; }
    .own-photo-upload-area:hover { border-color: var(--primary) !important; background: rgba(0, 150, 136, 0.05); }
  `;
  document.head.appendChild(style);
}

// ==================== EVENT LISTENERS ====================
function setupEvents() {
  reattachNavListeners();
  document.getElementById('navHamburger')?.addEventListener('click', () => document.getElementById('navDrawer')?.classList.toggle('open'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));
  document.getElementById('selectBreedImageBtn')?.addEventListener('click', () => openBreedSelector('petBreed', 'petImage', 'petImagePreview', ''));
  document.getElementById('spSelectBreedImageBtn')?.addEventListener('click', () => openBreedSelector('sp-petBreed', 'sp-petImage', 'sp-petImagePreview', 'sp'));
  document.getElementById('breedModalClose')?.addEventListener('click', closeBreedModal);
  document.getElementById('breedImageModal')?.addEventListener('click', e => { if (e.target === document.getElementById('breedImageModal')) closeBreedModal(); });
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('forgotPasswordForm')?.addEventListener('submit', handleForgotPassword);
  document.getElementById('postPetForm')?.addEventListener('submit', e => handlePostPet(e, false));
  document.getElementById('postPetFormStandalone')?.addEventListener('submit', e => handlePostPet(e, true));
  document.getElementById('settingsForm')?.addEventListener('submit', handleUpdateProfile);
  document.getElementById('changePasswordForm')?.addEventListener('submit', handleChangePassword);
  document.getElementById('deleteAccountBtn')?.addEventListener('click', handleDeleteAccount);
  document.getElementById('adoptForm')?.addEventListener('submit', handleAdoptSubmit);
  document.getElementById('modalClose')?.addEventListener('click', closeAdoptModal);
  document.getElementById('adoptModal')?.addEventListener('click', e => { if (e.target === document.getElementById('adoptModal')) closeAdoptModal(); });
  document.getElementById('filter-type')?.addEventListener('change', renderAllPets);
  document.getElementById('filter-search')?.addEventListener('input', renderAllPets);
  
  document.addEventListener('click', (e) => {
    if (e.target.id === 'otpVerifyBtn') verifyOTPAndProceed();
    if (e.target.id === 'otpCancelBtn') closeOTPModal();
    if (e.target.id === 'otpModalClose') closeOTPModal();
    if (e.target.id === 'otpResendLink') resendOTPCode();
    if (e.target.id === 'closeWaiverModal' || e.target.id === 'cancelWaiverBtn') closeModal('waiverUploadModal');
    if (e.target.id === 'closePaymentModal' || e.target.id === 'cancelPaymentBtn') closeModal('paymentModal');
    if (e.target.id === 'downloadWaiverBtn') downloadWaiverForm();
    if (e.target.id === 'closeGalleryBtn' || e.target.id === 'closeGalleryModal') closeModal('petGalleryModal');
  });
  
  setupProfilePictureUpload();
  
  ['regPhone', 'settings-phone', 'contactInfo', 'sp-contactInfo'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('input', function(e) { let val = this.value.replace(/[^0-9]/g, ''); if (val.length > 11) val = val.slice(0, 11); this.value = val; });
  });
  
  ['typeDogRadio', 'typeCatRadio', 'spTypeDogRadio', 'spTypeCatRadio'].forEach(id => {
    const radio = document.getElementById(id);
    if (radio) radio.addEventListener('change', () => {
      preloadBreedImages();
      if (selectedPhotoOption === 'upload') {
        const petType = getSelectedPetType();
        if (petType) populateBreedDropdowns(petType);
      }
    });
  });
  
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAdoptModal(); closeBreedModal(); closeOTPModal(); closeResetModal(); closeModal('waiverUploadModal'); closeModal('paymentModal'); closeModal('petGalleryModal'); } });
}

// ==================== INITIALIZATION ====================
async function init() {
  preloadBreedImages();
  addPendingStyles();
  initTheme();
  setupEvents();
  populateLocationDropdown();
  initDatePickers();
  
  const userId = localStorage.getItem('userId');
  if (userId) {
    await loadAllData();
    await loadProfilePicture();
  } else {
    renderAllViews();
    updateNavigationBar();
  }
  showPage('home');
  
  setTimeout(() => {
    initTwoOptions();
  }, 500);
}

document.addEventListener('DOMContentLoaded', init);
