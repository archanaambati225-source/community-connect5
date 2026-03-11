// ============================================
// Community Connect - Impact Dashboard
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  updateNavUser();
  loadImpactData();
});

async function loadImpactData() {
  try {
    const stats = await apiRequest('/dashboard/stats');

    // Animate counters
    animateCounter('counterDonations', stats.totalDonations);
    animateCounter('counterDelivered', stats.deliveredDonations);
    animateCounter('counterNGOs', stats.totalNGOs);
    animateCounter('counterVolunteers', stats.totalVolunteers);
    animateCounter('counterHours', stats.totalVolunteerHours);
    animateCounter('counterFulfilled', stats.fulfilledRequests);

    // Platform stats
    document.getElementById('statDonors').textContent = stats.totalDonors;
    document.getElementById('statVerified').textContent = stats.verifiedNGOs;
    document.getElementById('statTotalRequests').textContent = stats.totalRequests;
    document.getElementById('statActivities').textContent = stats.completedActivities;

    // Category breakdown
    renderCategoryBreakdown(stats.categoryBreakdown, stats.totalDonations);
  } catch (error) {
    showToast('Failed to load impact data', 'error');
  }
}

function animateCounter(elementId, target) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const duration = 1500;
  const start = performance.now();
  const initial = 0;

  function update(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(initial + (target - initial) * eased);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function renderCategoryBreakdown(categories, total) {
  const container = document.getElementById('categoryBreakdown');
  if (!categories || categories.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);">No donation data yet</p>';
    return;
  }

  const colorClasses = ['', 'blue', 'emerald', 'amber', 'rose'];

  container.innerHTML = categories.map((cat, index) => {
    const percentage = total > 0 ? Math.round((cat.count / total) * 100) : 0;
    const colorClass = colorClasses[index % colorClasses.length];

    return `
      <div class="progress-item">
        <div class="progress-header">
          <span class="progress-label">${getCategoryIcon(cat._id)} ${cat._id}</span>
          <span class="progress-value">${cat.count} donations (${percentage}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${colorClass}" style="width: 0%;" data-width="${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Animate progress bars after render
  setTimeout(() => {
    document.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 100);
}
