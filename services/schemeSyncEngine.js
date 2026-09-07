const schemes = require('../data/schemes');

const SyncStatus = {
  SYNCED: 'synced',
  NEEDS_VERIFICATION: 'needs_verification',
  UPDATED: 'updated',
  REMOVED: 'removed'
};

function discoverSchemes() {
  return {
    status: SyncStatus.SYNCED,
    timestamp: new Date().toISOString(),
    message: 'Demo mode: Using curated seed dataset',
    stats: {
      total: schemes.length,
      active: schemes.filter(s => s.status === 'active').length,
      needsVerification: 0
    }
  };
}

function validateScheme(scheme) {
  const required = ['id', 'name', 'shortDescription', 'benefit', 'eligibilityRules', 'officialApplicationUrl'];
  const missing = required.filter(f => !scheme[f]);
  return {
    valid: missing.length === 0,
    missing,
    status: missing.length === 0 ? SyncStatus.SYNCED : SyncStatus.NEEDS_VERIFICATION
  };
}

function syncSchemes() {
  const results = schemes.map(s => ({
    id: s.id,
    name: s.name,
    validation: validateScheme(s),
    lastVerified: s.lastVerified
  }));
  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    results,
    message: 'Demo mode: All seed data validated'
  };
}

module.exports = { discoverSchemes, validateScheme, syncSchemes, SyncStatus };
