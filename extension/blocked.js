document.addEventListener('DOMContentLoaded', async () => {
  const blockedView = document.getElementById('blocked-view');
  const completedView = document.getElementById('completed-view');
  const distractionTime = document.getElementById('distraction-time');
  const threshold = document.getElementById('threshold');
  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');

  let checkInterval = null;

  function updateUI(task) {
    if (task.status === 'completed') {
      showCompleted();
      return;
    }

    showBlocked(task);
  }

  function showBlocked(task) {
    blockedView.style.display = 'block';
    completedView.style.display = 'none';

    const mins = Math.floor(task.distraction_seconds / 60);
    const secs = task.distraction_seconds % 60;
    distractionTime.textContent = `${mins}m ${secs}s`;

    const thresholdSeconds = task.threshold_seconds || 1800;
    const thresholdMins = Math.floor(thresholdSeconds / 60);
    threshold.textContent = `${thresholdMins}m`;

    const progress = Math.min((task.distraction_seconds / thresholdSeconds) * 100, 100);
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${Math.round(progress)}%`;

    if (progress >= 100) {
      progressFill.className = 'progress-fill danger';
    } else if (progress >= 75) {
      progressFill.className = 'progress-fill warning';
    } else {
      progressFill.className = 'progress-fill';
    }
  }

  function showCompleted() {
    blockedView.style.display = 'none';
    completedView.style.display = 'block';

    chrome.runtime.sendMessage({
      type: 'ENFORCE_BLOCK',
      blockActive: false,
      status: 'completed',
    });

    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }

  function checkStatus() {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
      if (response?.today) {
        updateUI(response.today);
      }
    });
  }

  checkStatus();

  checkInterval = setInterval(checkStatus, 3000);

  window.addEventListener('beforeunload', () => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  });
});
