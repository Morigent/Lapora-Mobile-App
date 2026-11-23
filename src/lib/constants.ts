/** Evidence + accuracy rules from README §3.4.1 and §3.7. */
export const ACCURACY_TARGET_M = 25;
/** Above this the capture cannot be submitted at all (screen 21 copy: ambang tim 50 m). */
export const ACCURACY_HARD_LIMIT_M = 50;
/** A fix is only valid if measured within this window around the shutter press. */
export const LOCATION_FRESHNESS_MS = 15_000;
export const LOCATION_SHUTTER_TOLERANCE_MS = 2_000;
export const LOCATION_TIMEOUT_MS = 12_000;
/** Distance between captured fix and a fresh fix that triggers screen 07. */
export const LOCATION_MISMATCH_M = 100;

export const SEARCH_DEBOUNCE_MS = 300;
export const DESCRIPTION_MAX = 240;
export const DESCRIPTION_MIN = 20;
export const PHOTO_MAX_BYTES = 8 * 1024 * 1024;
export const UPLOAD_MAX_ATTEMPTS = 3;

export const DEFAULT_MAP_RADIUS_KM = 2;
export const MAP_RADIUS_OPTIONS_KM = [0.5, 1, 2, 5] as const;

export const CAPTURE_SESSION_TTL_MS = 30 * 60 * 1000;

export const STORAGE_KEYS = {
  accounts: 'lapora.accounts.v1',
  session: 'lapora.session.v1',
  profile: 'lapora.profile.v1',
  reports: 'lapora.reports.v1',
  media: 'lapora.reportMedia.v1',
  history: 'lapora.reportHistory.v1',
  hazardZones: 'lapora.hazardZones.v1',
  draft: 'lapora.draft.v1',
  consent: 'lapora.consent.v1',
} as const;
