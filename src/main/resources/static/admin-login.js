/* ═══════════════════════════════════════════════════════════════
   FurReal Admin Login — admin-login.js
   Backend URL: http://localhost:6060/admin
   Pre-created admin account in AdminController
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ==================== CONFIGURATION ====================
const ADMIN_API_BASE_URL = 'http://localhost:6060/admin';

// Pre-created admin credentials (from backend)
// These are hardcoded in AdminController or database
const DEFAULT_ADMIN = {
    email: 'admin@furreal.com',
    password: 'admin123'
};

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || '•'}</span> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(110%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== STORAGE FUNCTIONS ====================
function setAdminSession(adminData) {
    localStorage.setItem('adminToken', btoa(JSON.stringify(adminData)));
    localStorage.setItem('adminEmail', adminData.email);
    localStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('adminLoginTime', new Date().toISOString());
}

function clearAdminSession() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoginTime');
}

function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// ==================== API CALL ====================
async function adminLogin(email, password) {
    try {
        // First, try to authenticate with backend
        const response = await fetch(`${ADMIN_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                return { success: true, data: result.data, message: 'Login successful' };
            }
        }
        
        // Fallback: Check against default admin credentials (if backend not ready)
        if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
            return { 
                success: true, 
                data: { 
                    id: 1, 
                    name: 'Super Admin', 
                    email: DEFAULT_ADMIN.email,
                    role: 'admin'
                }, 
                message: 'Login successful (local auth)' 
            };
        }
        
        return { success: false, message: 'Invalid email or password' };
    } catch (error) {
        console.error('Login error:', error);
        
        // Fallback: Check against default admin credentials
        if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
            return { 
                success: true, 
                data: { 
                    id: 1, 
                    name: 'Super Admin', 
                    email: DEFAULT_ADMIN.email,
                    role: 'admin'
                }, 
                message: 'Login successful (offline mode)' 
            };
        }
        
        return { success: false, message: 'Connection error. Please try again.' };
    }
}

// ==================== FORM HANDLER ====================
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }
    
    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span>⏳ Authenticating...</span>';
    loginBtn.disabled = true;
    
    const result = await adminLogin(email, password);
    
    // Reset button
    loginBtn.innerHTML = originalText;
    loginBtn.disabled = false;
    
    if (result.success) {
        setAdminSession(result.data);
        showToast(result.message, 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } else {
        showToast(result.message, 'error');
        
        // Clear password field
        document.getElementById('password').value = '';
    }
}

// ==================== PASSWORD TOGGLE ====================
function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

// ==================== CHECK IF ALREADY LOGGED IN ====================
function checkExistingSession() {
    if (isAdminLoggedIn()) {
        // Optional: Auto-redirect to dashboard
        // window.location.href = 'admin.html';
    }
}

// ==================== SETUP EVENT LISTENERS ====================
function setupEvents() {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Enter key support
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && document.activeElement?.tagName !== 'BUTTON') {
            const form = document.getElementById('adminLoginForm');
            if (form) form.dispatchEvent(new Event('submit'));
        }
    });
}

// ==================== PRE-FILL DEMO CREDENTIALS (for testing) ====================
function prefillDemoCredentials() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput && !emailInput.value) {
        emailInput.value = DEFAULT_ADMIN.email;
    }
}

// ==================== INITIALIZATION ====================
function init() {
    setupPasswordToggle();
    setupEvents();
    checkExistingSession();
    prefillDemoCredentials();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);