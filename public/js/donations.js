// ============================================
// Community Connect - Donations Management
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  updateNavUser();

  const user = getUser();
  // Show add button only for donors and admins
  if (user && (user.role === 'donor' || user.role === 'admin')) {
    document.getElementById('addDonationBtn').style.display = 'inline-flex';
  }

  loadDonations();
  loadRegisteredDonors();

  // Form submit
  document.getElementById('donationForm').addEventListener('submit', handleDonationSubmit);
});

async function loadDonations() {
  const grid = document.getElementById('donationsGrid');
  grid.innerHTML = '<div class="spinner"></div>';

  const category = document.getElementById('filterCategory').value;
  const status = document.getElementById('filterStatus').value;

  let query = '';
  if (category) query += `category=${category}&`;
  if (status) query += `status=${status}&`;

  try {
    const donations = await apiRequest(`/donations?${query}`);
    const user = getUser();

    if (donations.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon">🎁</div>
          <h3>No donations found</h3>
          <p>Be the first to post a donation!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = donations.map(d => `
      <div class="item-card animate-in">
        <div class="card-header">
          <div class="card-title">${getCategoryIcon(d.category)} ${d.title}</div>
          <span class="badge status-${d.status}">${d.status}</span>
        </div>
        <div class="card-body">
          <p>${d.description}</p>
          <div class="card-meta">
            <span class="badge badge-purple">${d.category}</span>
            <span class="badge badge-blue">${d.quantity} ${d.unit || 'items'}</span>
            <span class="badge badge-cyan">📍 ${d.location}</span>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size:0.8rem; color:var(--text-muted);">
            By ${d.donor?.name || 'Unknown'} · ${timeAgo(d.createdAt)}
          </span>
          <div style="display:flex; gap:8px;">
            ${d.status === 'available' && user && (user.role === 'ngo' || user.role === 'volunteer') ? `
              <button class="btn btn-success btn-sm" onclick="claimDonation('${d._id}')">Claim</button>
            ` : ''}
            ${user && (d.donor?._id === user._id || user.role === 'admin') ? `
              <button class="btn btn-secondary btn-sm" onclick="editDonation('${d._id}', '${encodeURIComponent(JSON.stringify({ title: d.title, category: d.category, description: d.description, quantity: d.quantity, unit: d.unit, location: d.location }))}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteDonation('${d._id}')">Delete</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
    grid.innerHTML = '<div class="empty-state"><h3>Failed to load donations</h3></div>';
  }
}

function openDonationModal(data = null) {
  document.getElementById('donationModal').classList.add('active');
  if (data) {
    document.getElementById('modalTitle').textContent = 'Edit Donation';
    document.getElementById('donationId').value = data._id || '';
    document.getElementById('donTitle').value = data.title || '';
    document.getElementById('donCategory').value = data.category || 'food';
    document.getElementById('donDescription').value = data.description || '';
    document.getElementById('donQuantity').value = data.quantity || '';
    document.getElementById('donUnit').value = data.unit || 'items';
    document.getElementById('donLocation').value = data.location || '';
  } else {
    document.getElementById('modalTitle').textContent = 'New Donation';
    document.getElementById('donationForm').reset();
    document.getElementById('donationId').value = '';
  }
}

function closeDonationModal() {
  document.getElementById('donationModal').classList.remove('active');
}

async function handleDonationSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('donationId').value;
  const body = {
    title: document.getElementById('donTitle').value,
    category: document.getElementById('donCategory').value,
    description: document.getElementById('donDescription').value,
    quantity: parseInt(document.getElementById('donQuantity').value),
    unit: document.getElementById('donUnit').value,
    location: document.getElementById('donLocation').value
  };

  try {
    if (id) {
      await apiRequest(`/donations/${id}`, { method: 'PUT', body });
      showToast('Donation updated!', 'success');
    } else {
      await apiRequest('/donations', { method: 'POST', body });
      showToast('Donation posted!', 'success');
    }

    closeDonationModal();
    loadDonations();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function editDonation(id, encodedData) {
  try {
    const data = JSON.parse(decodeURIComponent(encodedData));
    data._id = id;
    openDonationModal(data);
  } catch (e) {
    showToast('Failed to load donation data', 'error');
  }
}

async function claimDonation(id) {
  if (!confirm('Claim this donation?')) return;
  try {
    await apiRequest(`/donations/${id}/claim`, { method: 'PUT' });
    showToast('Donation claimed!', 'success');
    loadDonations();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteDonation(id) {
  if (!confirm('Are you sure you want to delete this donation?')) return;
  try {
    await apiRequest(`/donations/${id}`, { method: 'DELETE' });
    showToast('Donation deleted', 'success');
    loadDonations();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Load and display registered donors
async function loadRegisteredDonors() {
  try {
    const donors = await apiRequest('/users?role=donor');
    renderMemberCards(donors, 'donorsList', 'donorCount', 'email');
  } catch (error) {
    const container = document.getElementById('donorsList');
    if (container) container.innerHTML = '<div class="members-empty">Failed to load donors</div>';
  }
}
