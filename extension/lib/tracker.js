import { getBlockedSites, getAllowlists, getActiveSession, setActiveSession } from './storage.js';

let trackingInterval = null;

export function startTracking(tabId, url) {
  const session = {
    tab_id: tabId,
    url: url,
    host: new URL(url).hostname,
    started_at: new Date().toISOString(),
    last_tick_at: new Date().toISOString(),
  };

  setActiveSession(session);
  return session;
}

export function stopTracking() {
  return setActiveSession(null);
}

export async function shouldTrack(url) {
  if (!url) return false;

  try {
    const blockedSites = await getBlockedSites();
    const allowlists = await getAllowlists();

    const isAllowed = allowlists.some((allowlist) => {
      if (!allowlist.is_active) return false;
      return matchesPattern(url, allowlist.pattern, allowlist.pattern_type);
    });

    if (isAllowed) return false;

    const isBlocked = blockedSites.some((site) => {
      if (!site.is_active) return false;
      return matchesPattern(url, site.pattern, site.pattern_type);
    });

    return isBlocked;
  } catch {
    return false;
  }
}

export async function getMatchedPattern(url) {
  const blockedSites = await getBlockedSites();

  for (const site of blockedSites) {
    if (!site.is_active) continue;
    if (matchesPattern(url, site.pattern, site.pattern_type)) {
      return site.pattern;
    }
  }

  return null;
}

function matchesPattern(url, pattern, type) {
  try {
    const urlObj = new URL(url);

    switch (type) {
      case 'domain':
        return (
          urlObj.hostname === pattern ||
          urlObj.hostname.endsWith(`.${pattern}`)
        );

      case 'url_prefix':
        return url.startsWith(pattern);

      case 'wildcard': {
        const regex = pattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*');
        return new RegExp(`^${regex}$`).test(url);
      }

      case 'regex':
        return new RegExp(pattern).test(url);

      default:
        return url.includes(pattern);
    }
  } catch {
    return false;
  }
}

export function createEvent(session, matchedPattern) {
  const now = new Date();
  const startedAt = new Date(session.started_at);
  const durationSeconds = Math.floor((now - startedAt) / 1000);

  if (durationSeconds <= 0) return null;

  return {
    client_event_id: crypto.randomUUID(),
    host: session.host,
    url_normalized: session.url,
    pattern_matched: matchedPattern,
    started_at: session.started_at,
    ended_at: now.toISOString(),
    duration_seconds: durationSeconds,
  };
}
