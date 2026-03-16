// ============================================
// Community Connect - NGO Discovery
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  updateNavUser();

  const user = getUser();
  // Show register NGO button for NGO users
  if (user && (user.role === 'ngo' || user.role === 'admin')) {
    document.getElementById('addNGOBtn').style.display = 'inline-flex';
  }

  loadNGOs();
  loadRegisteredNGOs();

  document.getElementById('ngoForm').addEventListener('submit', handleNGOSubmit);
});

async function loadNGOs() {
  const grid = document.getElementById('ngosGrid');
  grid.innerHTML = '<div class="spinner"></div>';

  const search = document.getElementById('searchNGO').value;
  const category = document.getElementById('filterCategory').value;

  let query = '';
  if (search) query += `search=${encodeURIComponent(search)}&`;
  if (category) query += `category=${category}&`;

  try {
    const ngos = await apiRequest(`/ngos?${query}`);
    const user = getUser();

    if (ngos.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon">🏢</div>
          <h3>No NGOs found</h3>
          <p>${search ? 'Try a different search term' : 'Be the first to register your organization!'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = ngos.map(n => `
      <div class="item-card animate-in">
        <div class="card-header">
          <div class="card-title">${n.name}</div>
          ${n.verified ? '<span class="badge badge-verified">✅ Verified</span>' : '<span class="badge badge-amber">Unverified</span>'}
        </div>
        <div class="card-body">
          <p>${n.description}</p>
          ${n.mission ? `<p style="font-style:italic; color:var(--accent-purple); font-size:0.85rem;">"${n.mission}"</p>` : ''}
          <div class="card-meta">
            <span class="badge badge-purple">${getCategoryIcon(n.category)} ${n.category}</span>
            <span class="badge badge-cyan">📍 ${n.address}</span>
          </div>
          <div style="display:flex; gap:16px; font-size:0.85rem; color:var(--text-secondary); margin-top:8px;">
            <span>👥 ${n.impactStats?.peopleHelped || 0} helped</span>
            <span>🎁 ${n.impactStats?.donationsReceived || 0} received</span>
            <span>📋 ${n.impactStats?.projectsCompleted || 0} projects</span>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size:0.8rem; color:var(--text-muted);">
            By ${n.user?.name || 'Unknown'} · ${timeAgo(n.createdAt)}
          </span>
          <div style="display:flex; gap:8px;">
            ${n.website ? `<a href="${n.website}" target="_blank" class="btn btn-secondary btn-sm">🌐 Website</a>` : ''}
            ${user && user.role === 'admin' && !n.verified ? `
              <button class="btn btn-success btn-sm" onclick="verifyNGO('${n._id}')">Verify</button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast(error.message, 'error');
    grid.innerHTML = '<div class="empty-state"><h3>Failed to load NGOs</h3></div>';
  }
}

function openNGOModal() {
  document.getElementById('ngoModal').classList.add('active');
}

function closeNGOModal() {
  document.getElementById('ngoModal').classList.remove('active');
}

async function handleNGOSubmit(e) {
  e.preventDefault();

  const body = {
    name: document.getElementById('ngoName').value,
    category: document.getElementById('ngoCategory').value,
    description: document.getElementById('ngoDescription').value,
    mission: document.getElementById('ngoMission').value,
    address: document.getElementById('ngoAddress').value,
    website: document.getElementById('ngoWebsite').value
  };

  try {
    await apiRequest('/ngos', { method: 'POST', body });
    showToast('NGO registered successfully!', 'success');
    closeNGOModal();
    loadNGOs();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function verifyNGO(id) {
  if (!confirm('Verify this NGO?')) return;
  try {
    await apiRequest(`/ngos/${id}/verify`, { method: 'PUT' });
    showToast('NGO verified!', 'success');
    loadNGOs();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Load and display registered NGO members
async function loadRegisteredNGOs() {
  try {
    const ngoUsers = await apiRequest('/users?role=ngo');
    renderMemberCards(ngoUsers, 'ngoMembersList', 'ngoMemberCount', 'organization');
  } catch (error) {
    const container = document.getElementById('ngoMembersList');
    if (container) container.innerHTML = '<div class="members-empty">Failed to load NGO members</div>';
  }
}
