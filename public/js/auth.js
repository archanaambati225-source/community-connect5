// ============================================
// Community Connect - Auth (Login/Register)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      btn.textContent = 'Signing In...';
      btn.disabled = true;

      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
          }
        });

        saveAuth(data);
        showToast('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      } catch (error) {
        showToast(error.message, 'error');
        btn.textContent = 'Sign In';
        btn.disabled = false;
      }
    });
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      btn.textContent = 'Creating Account...';
      btn.disabled = true;

      try {
        const body = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          role: document.getElementById('role').value,
          phone: document.getElementById('phone').value
        };

        const orgField = document.getElementById('organization');
        if (orgField && orgField.value) {
          body.organization = orgField.value;
        }

        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body
        });

        saveAuth(data);
        showToast('Account created! Redirecting...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      } catch (error) {
        showToast(error.message, 'error');
        btn.textContent = 'Create Account';
        btn.disabled = false;
      }
    });
  }
});
