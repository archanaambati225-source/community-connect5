// ============================================
// Community Connect - Volunteer Activities
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  updateNavUser();

  const user = getUser();
  if (user && (user.role === 'volunteer' || user.role === 'admin')) {
    document.getElementById('addActivityBtn').style.display = 'inline-flex';
  }

  loadActivities();
  loadRegisteredVolunteers();

  document.getElementById('activityForm').addEventListener('submit', handleActivitySubmit);
});

async function loadActivities() {
  const container = document.getElementById('activitiesContainer');
  container.innerHTML = '<div class="spinner"></div>';

  const type = document.getElementById('filterType').value;
  const status = document.getElementById('filterStatus').value;

  let query = '';
  if (type) query += `type=${type}&`;
  if (status) query += `status=${status}&`;

  try {
    const activities = await apiRequest(`/activities?${query}`);
    const user = getUser();

    if (activities.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🙋</div>
          <h3>No activities found</h3>
          <p>Volunteer activities will appear here</p>
        </div>
      `;
      return;
    }

    // Render as timeline and cards
    let html = '<div class="data-grid">';

    activities.forEach(a => {
      const typeIcons = { collection: '📦', distribution: '🚚', event: '🎉' };

      html += `
        <div class="item-card animate-in">
          <div class="card-header">
            <div class="card-title">${typeIcons[a.type] || '🙋'} ${a.title}</div>
            <span class="badge status-${a.status}">${a.status}</span>
          </div>
          <div class="card-body">
            <p>${a.description || 'No description'}</p>
            <div class="card-meta">
              <span class="badge badge-purple">${a.type}</span>
              <span class="badge badge-cyan">📍 ${a.location}</span>
              <span class="badge badge-amber">📅 ${formatDate(a.date)}</span>
              ${a.hoursLogged ? `<span class="badge badge-emerald">⏱️ ${a.hoursLogged}h</span>` : ''}
            </div>
          </div>
          <div class="card-footer">
            <span style="font-size:0.8rem; color:var(--text-muted);">
              By ${a.volunteer?.name || 'Unknown'}
            </span>
            <div style="display:flex; gap:8px;">
              ${user && a.volunteer?._id === user._id && a.status !== 'completed' ? `
                <button class="btn btn-success btn-sm" onclick="updateActivityStatus('${a._id}', '${a.status === 'planned' ? 'in-progress' : 'completed'}')">
                  ${a.status === 'planned' ? 'Start' : 'Complete'}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  } catch (error) {
    showToast(error.message, 'error');
    container.innerHTML = '<div class="empty-state"><h3>Failed to load activities</h3></div>';
  }
}

function openActivityModal() {
  document.getElementById('activityModal').classList.add('active');
  // Set default date to today
  document.getElementById('actDate').valueAsDate = new Date();
}

function closeActivityModal() {
  document.getElementById('activityModal').classList.remove('active');
}

async function handleActivitySubmit(e) {
  e.preventDefault();

  const body = {
    title: document.getElementById('actTitle').value,
    type: document.getElementById('actType').value,
    description: document.getElementById('actDescription').value,
    location: document.getElementById('actLocation').value,
    date: document.getElementById('actDate').value,
    hoursLogged: parseFloat(document.getElementById('actHours').value) || 0
  };

  try {
    await apiRequest('/activities', { method: 'POST', body });
    showToast('Activity logged!', 'success');
    closeActivityModal();
    loadActivities();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function updateActivityStatus(id, newStatus) {
  try {
    await apiRequest(`/activities/${id}`, {
      method: 'PUT',
      body: { status: newStatus }
    });
    showToast(`Activity marked as ${newStatus}!`, 'success');
    loadActivities();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Load and display registered volunteers
async function loadRegisteredVolunteers() {
  try {
    const volunteers = await apiRequest('/users?role=volunteer');
    renderMemberCards(volunteers, 'volunteersList', 'volunteerCount', 'email');
  } catch (error) {
    const container = document.getElementById('volunteersList');
    if (container) container.innerHTML = '<div class="members-empty">Failed to load volunteers</div>';
  }
}
