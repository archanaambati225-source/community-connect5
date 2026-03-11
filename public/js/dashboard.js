// ============================================
// Community Connect - Dashboard
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  updateNavUser();
  loadDashboard();
});

async function loadDashboard() {
  const user = getUser();

  // Load stats
  try {
    const stats = await apiRequest('/dashboard/stats');
    document.getElementById('statDonations').textContent = stats.totalDonations;
    document.getElementById('statNGOs').textContent = stats.totalNGOs;
    document.getElementById('statVolunteers').textContent = stats.totalVolunteers;
    document.getElementById('statRequests').textContent = stats.pendingRequests;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }

  // Render quick actions based on role
  renderQuickActions(user.role);

  // Load recent activity
  loadRecentActivity();
}

function renderQuickActions(role) {
  const container = document.getElementById('quickActions');
  let actions = [];

  switch (role) {
    case 'donor':
      actions = [
        { icon: '🎁', title: 'Post Donation', desc: 'Share resources with the community', link: 'donations.html' },
        { icon: '📋', title: 'View Requests', desc: 'See resource needs from NGOs', link: 'requests.html' },
        { icon: '🌍', title: 'View Impact', desc: 'Track your donation impact', link: 'impact.html' }
      ];
      break;
    case 'ngo':
      actions = [
        { icon: '📋', title: 'Submit Request', desc: 'Request resources you need', link: 'requests.html' },
        { icon: '🏢', title: 'Manage Profile', desc: 'Update your NGO details', link: 'ngos.html' },
        { icon: '🎁', title: 'Browse Donations', desc: 'Claim available donations', link: 'donations.html' }
      ];
      break;
    case 'volunteer':
      actions = [
        { icon: '🙋', title: 'Log Activity', desc: 'Record your volunteer work', link: 'volunteers.html' },
        { icon: '🎁', title: 'Help Collect', desc: 'Coordinate donation pickup', link: 'donations.html' },
        { icon: '🌍', title: 'View Impact', desc: 'See your contribution', link: 'impact.html' }
      ];
      break;
    case 'admin':
      actions = [
        { icon: '✅', title: 'Approve Requests', desc: 'Review pending resource requests', link: 'requests.html' },
        { icon: '🏢', title: 'Verify NGOs', desc: 'Verify organization profiles', link: 'ngos.html' },
        { icon: '📊', title: 'View Impact', desc: 'Platform-wide analytics', link: 'impact.html' },
        { icon: '🎁', title: 'Manage Donations', desc: 'Oversee all donations', link: 'donations.html' }
      ];
      break;
  }

  container.innerHTML = actions.map(a => `
    <a href="${a.link}" class="feature-card animate-in" style="text-decoration:none; color:inherit;">
      <div class="feature-icon">${a.icon}</div>
      <h3>${a.title}</h3>
      <p>${a.desc}</p>
    </a>
  `).join('');
}

async function loadRecentActivity() {
  const container = document.getElementById('recentActivity');

  try {
    const data = await apiRequest('/dashboard/recent');
    let html = '<div class="timeline">';

    // Combine and sort all recent items
    const items = [];

    if (data.recentDonations) {
      data.recentDonations.forEach(d => {
        items.push({
          type: 'donation',
          title: d.title,
          desc: `${getCategoryIcon(d.category)} ${d.category} donation by ${d.donor?.name || 'Unknown'}`,
          date: d.createdAt,
          status: d.status
        });
      });
    }

    if (data.recentRequests) {
      data.recentRequests.forEach(r => {
        items.push({
          type: 'request',
          title: r.title,
          desc: `📋 Request from ${r.ngo?.name || 'Unknown'}`,
          date: r.createdAt,
          status: r.status
        });
      });
    }

    if (data.recentActivities) {
      data.recentActivities.forEach(a => {
        items.push({
          type: 'activity',
          title: a.title,
          desc: `🙋 Activity by ${a.volunteer?.name || 'Unknown'}`,
          date: a.createdAt,
          status: a.status
        });
      });
    }

    // Sort by date
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No recent activity</h3>
          <p>Activity will appear here as the platform is used</p>
        </div>
      `;
      return;
    }

    items.slice(0, 10).forEach(item => {
      html += `
        <div class="timeline-item ${item.status === 'completed' || item.status === 'delivered' ? 'completed' : ''}">
          <div class="timeline-content">
            <div class="timeline-date">${timeAgo(item.date)}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-description">${item.desc}</div>
            <span class="badge status-${item.status}" style="margin-top:8px;">${item.status}</span>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No recent activity</h3>
        <p>Start using the platform to see activity here</p>
      </div>
    `;
  }
}
