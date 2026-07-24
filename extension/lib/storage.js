const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'user_id',
  PROFILE: 'profile',
  TODAY: 'today',
  BLOCKED_SITES: 'blocked_sites',
  UPLOAD_ALLOWLISTS: 'upload_allowlists',
  RULES_VERSION: 'rules_version',
  ACTIVE_SESSION: 'active_session',
  PENDING_EVENTS: 'pending_events',
};

export async function getStorage(keys) {
  return chrome.storage.local.get(keys);
}

export async function setStorage(data) {
  return chrome.storage.local.set(data);
}

export async function removeStorage(keys) {
  return chrome.storage.local.remove(keys);
}

export async function getToken() {
  const { token } = await chrome.storage.local.get(STORAGE_KEYS.TOKEN);
  return token;
}

export async function setToken(token) {
  return chrome.storage.local.set({ [STORAGE_KEYS.TOKEN]: token });
}

export async function clearToken() {
  return chrome.storage.local.remove(STORAGE_KEYS.TOKEN);
}

export async function getProfile() {
  const { profile } = await chrome.storage.local.get(STORAGE_KEYS.PROFILE);
  return profile;
}

export async function setProfile(profile) {
  return chrome.storage.local.set({ [STORAGE_KEYS.PROFILE]: profile });
}

export async function getToday() {
  const { today } = await chrome.storage.local.get(STORAGE_KEYS.TODAY);
  return today;
}

export async function setToday(today) {
  return chrome.storage.local.set({ [STORAGE_KEYS.TODAY]: today });
}

export async function getBlockedSites() {
  const { blocked_sites } = await chrome.storage.local.get(STORAGE_KEYS.BLOCKED_SITES);
  return blocked_sites || [];
}

export async function setBlockedSites(sites) {
  return chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: sites });
}

export async function getAllowlists() {
  const { upload_allowlists } = await chrome.storage.local.get(STORAGE_KEYS.UPLOAD_ALLOWLISTS);
  return upload_allowlists || [];
}

export async function setAllowlists(allowlists) {
  return chrome.storage.local.set({ [STORAGE_KEYS.UPLOAD_ALLOWLISTS]: allowlists });
}

export async function getActiveSession() {
  const { active_session } = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_SESSION);
  return active_session;
}

export async function setActiveSession(session) {
  return chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_SESSION]: session });
}

export async function getPendingEvents() {
  const { pending_events } = await chrome.storage.local.get(STORAGE_KEYS.PENDING_EVENTS);
  return pending_events || [];
}

export async function setPendingEvents(events) {
  return chrome.storage.local.set({ [STORAGE_KEYS.PENDING_EVENTS]: events });
}

export async function addPendingEvent(event) {
  const events = await getPendingEvents();
  events.push(event);
  return setPendingEvents(events);
}

export async function clearPendingEvents() {
  return chrome.storage.local.set({ [STORAGE_KEYS.PENDING_EVENTS]: [] });
}
