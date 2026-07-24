document.addEventListener('DOMContentLoaded', async () => {
  const pairingView = document.getElementById('pairing-view');
  const statusView = document.getElementById('status-view');
  const pairingCode = document.getElementById('pairing-code');
  const pairBtn = document.getElementById('pair-btn');
  const pairingError = document.getElementById('pairing-error');
  const statusBadge = document.getElementById('status-badge');
  const distractionTime = document.getElementById('distraction-time');
  const threshold = document.getElementById('threshold');
  const blockStatus = document.getElementById('block-status');
  const progressFill = document.getElementById('progress-fill');
  const progressPercent = document.getElementById('progress-percent');
  const sessionIndicator = document.getElementById('session-indicator');
  const sessionText = document.getElementById('session-text');
  const syncBtn = document.getElementById('sync-btn');
  const dashboardBtn = document.getElementById('dashboard-btn');
  const logoutBtn = document.getElementById('logout-btn');

  let refreshInterval = null;

  checkStatus();

  function checkStatus() {
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
      if (chrome.runtime.lastError) {
        showPairing();
        return;
      }

      if (response?.hasToken) {
        showStatus(response);
      } else {
        showPairing();
      }
    });
  }

  function showPairing() {
    pairingView.classList.remove('hidden');
    statusView.classList.add('hidden');

    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  function showStatus(response) {
    pairingView.classList.add('hidden');
    statusView.classList.remove('hidden');

    if (response.today) {
      updateStatus(response.today);
    }

    updateSession(response.session);

    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    refreshInterval = setInterval(checkStatus, 5000);
  }

  function updateStatus(task) {
    const statusMap = {
      incomplete: { text: 'Incomplete', class: 'status-incomplete' },
      warning: { text: 'Warning', class: 'status-warning' },
      blocked: { text: 'Blocked', class: 'status-blocked' },
      completed: { text: 'Completed', class: 'status-completed' },
    };

    const status = statusMap[task.status] || statusMap.incomplete;
    statusBadge.textContent = status.text;
    statusBadge.className = `status-badge ${status.class}`;

    const mins = Math.floor(task.distraction_seconds / 60);
    const secs = task.distraction_seconds % 60;
    distractionTime.textContent = `${mins}m ${secs}s`;

    const thresholdSeconds = task.threshold_seconds || 1800;
    const thresholdMins = Math.floor(thresholdSeconds / 60);
    threshold.textContent = `${thresholdMins} menit`;

    blockStatus.textContent = task.block_active ? 'Ya' : 'Tidak';

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

  function updateSession(session) {
    if (session) {
      sessionIndicator.className = 'session-indicator';
      sessionText.textContent = `Aktif: ${new URL(session.url).hostname}`;
    } else {
      sessionIndicator.className = 'session-indicator inactive';
      sessionText.textContent = 'Tidak ada sesi aktif';
    }
  }

  pairBtn.addEventListener('click', async () => {
    const code = pairingCode.value.trim().toUpperCase();

    if (!code || code.length < 4) {
      pairingError.textContent = 'Masukkan kode yang valid';
      pairingError.classList.remove('hidden');
      return;
    }

    pairBtn.disabled = true;
    pairBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="animation: spin 1s linear infinite;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
      Menghubungkan...
    `;
    pairingError.classList.add('hidden');

    chrome.runtime.sendMessage(
      { type: 'EXCHANGE_CODE', code, deviceName: 'Chrome Extension' },
      (response) => {
        pairBtn.disabled = false;
        pairBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          Hubungkan
        `;

        if (response?.success) {
          chrome.runtime.sendMessage({ type: 'SYNC_DATA' }, (syncResponse) => {
            if (syncResponse?.success) {
              showStatus({ hasToken: true, today: syncResponse.data.task });
            } else {
              showStatus({ hasToken: true });
            }
          });
        } else {
          pairingError.textContent = response?.error || 'Gagal menghubungkan';
          pairingError.classList.remove('hidden');
        }
      }
    );
  });

  pairingCode.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      pairBtn.click();
    }
  });

  syncBtn.addEventListener('click', () => {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="animation: spin 1s linear infinite;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
      Syncing...
    `;

    chrome.runtime.sendMessage({ type: 'SYNC_DATA' }, (response) => {
      syncBtn.disabled = false;
      syncBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
        </svg>
        Sync
      `;

      if (response?.success) {
        updateStatus(response.data.task);
      }
    });
  });

  dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  });

  logoutBtn.addEventListener('click', () => {
    if (confirm('Yakin ingin logout? Token akan dihapus.')) {
      chrome.storage.local.clear(() => {
        showPairing();
      });
    }
  });
});

const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
