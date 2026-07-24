const API_BASE = 'http://localhost:3000';

export async function apiRequest(path, options = {}) {
  const storage = await chrome.storage.local.get(['token']);
  const token = storage.token;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

export async function exchangeCode(code, deviceName) {
  return apiRequest('/api/extension/exchange-code', {
    method: 'POST',
    body: JSON.stringify({
      code,
      device_name: deviceName || 'Chrome Extension',
    }),
  });
}

export async function bootstrap() {
  return apiRequest('/api/extension/bootstrap');
}

export async function sendEvents(events) {
  return apiRequest('/api/extension/events', {
    method: 'POST',
    body: JSON.stringify({ events }),
  });
}

export async function enforce(blockActive, status) {
  return apiRequest('/api/extension/enforce', {
    method: 'POST',
    body: JSON.stringify({ block_active: blockActive, status }),
  });
}
