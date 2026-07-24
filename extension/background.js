import { exchangeCode, bootstrap, sendEvents, enforce } from './lib/api.js';
import { getToken, setToken, setProfile, setToday, setBlockedSites, setAllowlists, getActiveSession, setActiveSession, addPendingEvent, getPendingEvents, clearPendingEvents } from './lib/storage.js';
import { shouldTrack, getMatchedPattern, startTracking, createEvent } from './lib/tracker.js';
import { applyRules, removeAllRules } from './lib/rules.js';

const FLUSH_ALARM_NAME = 'flush-events';
const SYNC_ALARM_NAME = 'sync-data';
const FLUSH_INTERVAL_MINUTES = 0.5;
const SYNC_INTERVAL_MINUTES = 5;

let lastSyncTime = 0;
const SYNC_COOLDOWN_MS = 60000;

chrome.runtime.onInstalled.addListener(async () => {
  console.log('UporBlock Extension installed');
  await initialize();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('UporBlock Extension started');
  await initialize();
});

async function initialize() {
  const token = await getToken();

  if (!token) {
    console.log('No token found, waiting for pairing');
    return;
  }

  try {
    await syncData();
    await setupAlarms();
    await checkCurrentTab();
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

async function syncData() {
  const now = Date.now();
  if (now - lastSyncTime < SYNC_COOLDOWN_MS) {
    const storage = await chrome.storage.local.get(['today', 'blocked_sites', 'upload_allowlists', 'profile']);
    return {
      settings: storage.profile,
      task: storage.today,
      blocked_sites: storage.blocked_sites || [],
      upload_allowlists: storage.upload_allowlists || [],
    };
  }

  try {
    const data = await bootstrap();

    await setProfile(data.settings);
    await setToday(data.task);
    await setBlockedSites(data.blocked_sites);
    await setAllowlists(data.upload_allowlists);

    if (data.task) {
      await applyRules(data.blocked_sites, data.upload_allowlists, data.task.block_active);
    }

    lastSyncTime = now;
    return data;
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

async function setupAlarms() {
  await chrome.alarms.create(FLUSH_ALARM_NAME, {
    delayInMinutes: FLUSH_INTERVAL_MINUTES,
    periodInMinutes: FLUSH_INTERVAL_MINUTES,
  });

  await chrome.alarms.create(SYNC_ALARM_NAME, {
    delayInMinutes: SYNC_INTERVAL_MINUTES,
    periodInMinutes: SYNC_INTERVAL_MINUTES,
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === FLUSH_ALARM_NAME) {
    await flushEvents();
  } else if (alarm.name === SYNC_ALARM_NAME) {
    try {
      await syncData();
    } catch (error) {
      console.error('Periodic sync error:', error);
    }
  }
});

async function flushEvents() {
  const token = await getToken();
  if (!token) return;

  const session = await getActiveSession();

  if (session) {
    const isWindowFocused = await checkWindowFocus();

    if (!isWindowFocused) {
      const matchedPattern = await getMatchedPattern(session.url);

      if (matchedPattern) {
        const event = createEvent(session, matchedPattern);

        if (event) {
          await addPendingEvent(event);
        }
      }

      await setActiveSession(null);
      return;
    }

    const matchedPattern = await getMatchedPattern(session.url);

    if (matchedPattern) {
      const event = createEvent(session, matchedPattern);

      if (event) {
        await addPendingEvent(event);

        const now = new Date();
        await setActiveSession({
          ...session,
          started_at: now.toISOString(),
          last_tick_at: now.toISOString(),
        });
      }
    } else {
      await setActiveSession(null);
    }
  }

  const pendingEvents = await getPendingEvents();

  if (pendingEvents.length > 0) {
    try {
      const result = await sendEvents(pendingEvents);

      await setToday(result.task);

      if (result.task) {
        const blockedSites = await getBlockedSites();
        const allowlists = await getAllowlists();
        await applyRules(blockedSites, allowlists, result.task.block_active);

        if (result.task.status === 'completed') {
          await removeAllRules();
        }
      }

      await clearPendingEvents();
    } catch (error) {
      console.error('Flush events error:', error);
    }
  }
}

async function checkWindowFocus() {
  try {
    const window = await chrome.windows.getCurrent();
    return window.focused;
  } catch {
    return false;
  }
}

async function checkCurrentTab() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab?.url) return;

    const currentSession = await getActiveSession();

    if (currentSession && currentSession.tab_id === activeTab.id) {
      return;
    }

    if (currentSession) {
      const matchedPattern = await getMatchedPattern(currentSession.url);

      if (matchedPattern) {
        const event = createEvent(currentSession, matchedPattern);

        if (event) {
          await addPendingEvent(event);
        }
      }

      await setActiveSession(null);
    }

    const track = await shouldTrack(activeTab.url);

    if (track) {
      startTracking(activeTab.id, activeTab.url);
    }
  } catch (error) {
    console.error('Check current tab error:', error);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const token = await getToken();
  if (!token) return;

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (!tab.url) return;

    const currentSession = await getActiveSession();

    if (currentSession && currentSession.tab_id === activeInfo.tabId) {
      return;
    }

    if (currentSession) {
      const matchedPattern = await getMatchedPattern(currentSession.url);

      if (matchedPattern) {
        const event = createEvent(currentSession, matchedPattern);

        if (event) {
          await addPendingEvent(event);
        }
      }

      await setActiveSession(null);
    }

    const track = await shouldTrack(tab.url);

    if (track) {
      startTracking(activeInfo.tabId, tab.url);
    }
  } catch (error) {
    console.error('Tab activated error:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const token = await getToken();
  if (!token) return;

  if (changeInfo.url) {
    const currentSession = await getActiveSession();

    if (currentSession && currentSession.tab_id === tabId) {
      const matchedPattern = await getMatchedPattern(currentSession.url);

      if (matchedPattern) {
        const event = createEvent(currentSession, matchedPattern);

        if (event) {
          await addPendingEvent(event);
        }
      }

      await setActiveSession(null);
    }

    const track = await shouldTrack(changeInfo.url);

    if (track) {
      startTracking(tabId, changeInfo.url);
    }
  }

  if (changeInfo.status === 'complete' && tab.active) {
    const currentSession = await getActiveSession();

    if (!currentSession || currentSession.tab_id !== tabId) {
      const track = await shouldTrack(tab.url);

      if (track) {
        startTracking(tabId, tab.url);
      }
    }
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  const token = await getToken();
  if (!token) return;

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    const session = await getActiveSession();

    if (session) {
      const matchedPattern = await getMatchedPattern(session.url);

      if (matchedPattern) {
        const event = createEvent(session, matchedPattern);

        if (event) {
          await addPendingEvent(event);
        }
      }

      await setActiveSession(null);
    }
  } else {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, windowId });

      if (activeTab?.url) {
        const track = await shouldTrack(activeTab.url);

        if (track) {
          startTracking(activeTab.id, activeTab.url);
        }
      }
    } catch (error) {
      console.error('Window focus changed error:', error);
    }
  }
});

chrome.idle.onStateChanged.addListener(async (newState) => {
  const token = await getToken();
  if (!token) return;

  if (newState === 'active') {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (activeTab?.url) {
        const track = await shouldTrack(activeTab.url);

        if (track) {
          startTracking(activeTab.id, activeTab.url);
        }
      }
    } catch (error) {
      console.error('Idle state change error:', error);
    }
  } else {
    const session = await getActiveSession();

    if (session) {
      const matchedPattern = await getMatchedPattern(session.url);

      if (matchedPattern) {
        const event = createEvent(session, matchedPattern);

        if (event) {
          await addPendingEvent(event);
        }
      }

      await setActiveSession(null);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXCHANGE_CODE') {
    exchangeCode(message.code, message.deviceName)
      .then((data) => {
        setToken(data.token);
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (message.type === 'SYNC_DATA') {
    lastSyncTime = 0;
    syncData()
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (message.type === 'GET_STATUS') {
    Promise.all([getToken(), getToday(), getActiveSession()])
      .then(([token, today, session]) => {
        sendResponse({
          hasToken: !!token,
          today,
          session,
        });
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });

    return true;
  }

  if (message.type === 'ENFORCE_BLOCK') {
    enforce(message.blockActive, message.status)
      .then((data) => {
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  if (message.type === 'GET_RULES_COUNT') {
    chrome.declarativeNetRequest.getDynamicRules()
      .then((rules) => {
        sendResponse({ count: rules.length });
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });

    return true;
  }
});
