export function generateRules(blockedSites, allowlists, blockActive) {
  const rules = [];

  if (!blockActive) {
    return rules;
  }

  // Add allowlist rules first (higher priority)
  allowlists
    .filter((a) => a.is_active)
    .forEach((allowlist, index) => {
      rules.push({
        id: 10000 + index,
        priority: allowlist.priority || 120,
        action: {
          type: 'allow',
        },
        condition: {
          urlFilter: convertPattern(allowlist.pattern, allowlist.pattern_type),
          resourceTypes: ['main_frame'],
        },
      });
    });

  // Add block rules
  blockedSites
    .filter((s) => s.is_active)
    .forEach((site, index) => {
      rules.push({
        id: 1000 + index,
        priority: site.priority || 10,
        action: {
          type: 'redirect',
          redirect: {
            extensionPath: '/blocked.html',
          },
        },
        condition: {
          urlFilter: convertPattern(site.pattern, site.pattern_type),
          resourceTypes: ['main_frame'],
        },
      });
    });

  return rules;
}

function convertPattern(pattern, type) {
  switch (type) {
    case 'domain':
      return `||${pattern}`;
    case 'url_prefix':
      return `|${pattern}`;
    case 'wildcard':
      return pattern.replace(/\*/g, '*');
    case 'regex':
      return pattern;
    default:
      return pattern;
  }
}

export async function applyRules(blockedSites, allowlists, blockActive) {
  const rules = generateRules(blockedSites, allowlists, blockActive);

  // Remove all existing rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: rules,
  });

  return rules.length;
}

export async function removeAllRules() {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: [],
  });
}
