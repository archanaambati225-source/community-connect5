// ============================================
// Community Connect - Shared API Helper
// ============================================

const API_BASE = '/api';

// Get stored auth token
function getToken() {
  return localStorage.getItem('cc_token');
}

// Get stored user data
function getUser() {
  const data = localStorage.getItem('cc_user');
  return data ? JSON.parse(data) : null;
}

// Save auth data
function saveAuth(data) {
  localStorage.setItem('cc_token', data.token);
  localStorage.setItem('cc_user', JSON.stringify({
    _id: data._id,
    name: data.name,
    email: data.email,
    role: data.role
  }));
}

// Clear auth data
function clearAuth() {
  localStorage.removeItem('cc_token');
  localStorage.removeItem('cc_user');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Require authentication - redirect to login if not logged in
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Logout function
function logout() {
  clearAuth();
  window.location.href = 'login.html';
}

// Update navbar with user info
function updateNavUser() {
  const user = getUser();
  if (!user) return;

  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const avatarEl = document.getElementById('userAvatar');
  const welcomeEl = document.getElementById('welcomeName');

  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  if (welcomeEl) welcomeEl.textContent = user.name;
}

// Shared fetch wrapper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  // Add auth token if available
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Stringify body if needed
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Toast notification system
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format relative time
function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateString);
}

// Category icons
function getCategoryIcon(category) {
  const icons = {
    food: '🍽️',
    clothes: '👕',
    education: '📚',
    medical: '💊',
    other: '📦',
    health: '🏥',
    environment: '🌿',
    poverty: '🏠',
    hunger: '🍽️',
    equality: '⚖️'
  };
  return icons[category] || '📦';
}

// Mobile nav toggle
function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  if (links) {
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  }
}
