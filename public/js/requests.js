// ============================================
// Community Connect - Requests Management
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  updateNavUser();

  const user = getUser();
  // Show create button for NGO and admin
  if (user && (user.role === 'ngo' || user.role === 'admin')) {
    document.getElementById('addRequestBtn').style.display = 'inline-flex';
  }

  loadRequests();

  document.getElementById('requestForm').addEventListener('submit', handleRequestSubmit);
});

async function loadRequests() {
  const grid = document.getElementById('requestsGrid');
  grid.innerHTML = '<div class="spinner"></div>';

  const category = document.getElementById('filterCategory').value;
  const status = document.getElementById('filterStatus').value;
  const urgency = document.getElementById('filterUrgency').value;

  let query = '';
  if (category) query += `category=${category}&`;
  if (status) query += `status=${status}&`;
  if (urgency) query += `urgency=${urgency}&`;

  try {
    const requests = await apiRequest(`/requests?${query}`);
    const user = getUser();

    if (requests.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon">📋</div>
          <h3>No requests found</h3>
          <p>Resource requests from NGOs will appear here</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = requests.map(r => `
      <div class="item-card animate-in">
        <div class="card-header">
          <div class="card-title">${getCategoryIcon(r.category)} ${r.title}</div>
          <div style="display:flex; gap:6px;">
            <span class="badge urgency-${r.urgency}">${r.urgency}</span>
            <span class="badge status-${r.status}">${r.status}</span>
          </div>
        </div>
        <div class="card-body">
          <p>${r.description}</p>
          <div class="card-meta">
            <span class="badge badge-purple">${r.category}</span>
            <span class="badge badge-blue">Qty: ${r.quantityNeeded}</span>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size:0.8rem; color:var(--text-muted);">
            By ${r.ngo?.name || 'Unknown'} · ${timeAgo(r.createdAt)}
          </span>
          <div style="display:flex; gap:8px;">
            ${user && user.role === 'admin' && r.status === 'pending' ? `
              <button class="btn btn-success btn-sm" onclick="approveRequest('${r._id}')">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectRequest('${r._id}')">Reject</button>
            ` : ''}
            ${user && (user.role === 'donor' || user.role === 'volunteer') && r.status === 'approved' ? `
              <button class="btn btn-primary btn-sm" onclick="fulfillRequest('${r._id}')">Fulfill</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
    grid.innerHTML = '<div class="empty-state"><h3>Failed to load requests</h3></div>';
  }
}

function openRequestModal() {
  document.getElementById('requestModal').classList.add('active');
}

function closeRequestModal() {
  document.getElementById('requestModal').classList.remove('active');
}

async function handleRequestSubmit(e) {
  e.preventDefault();

  const body = {
    title: document.getElementById('reqTitle').value,
    category: document.getElementById('reqCategory').value,
    description: document.getElementById('reqDescription').value,
    quantityNeeded: parseInt(document.getElementById('reqQuantity').value),
    urgency: document.getElementById('reqUrgency').value
  };

  try {
    await apiRequest('/requests', { method: 'POST', body });
    showToast('Request submitted!', 'success');
    closeRequestModal();
    loadRequests();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function approveRequest(id) {
  if (!confirm('Approve this request?')) return;
  try {
    await apiRequest(`/requests/${id}/approve`, { method: 'PUT' });
    showToast('Request approved!', 'success');
    loadRequests();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function rejectRequest(id) {
  if (!confirm('Reject this request?')) return;
  try {
    await apiRequest(`/requests/${id}/reject`, { method: 'PUT' });
    showToast('Request rejected', 'warning');
    loadRequests();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function fulfillRequest(id) {
  if (!confirm('Mark this request as fulfilled?')) return;
  try {
    await apiRequest(`/requests/${id}/fulfill`, { method: 'PUT' });
    showToast('Request fulfilled!', 'success');
    loadRequests();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
