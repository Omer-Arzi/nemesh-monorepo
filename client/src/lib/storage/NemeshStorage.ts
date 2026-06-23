// Storage versioning: STORAGE_VERSION is embedded in every key.
// If the stored schema changes in a future release, bump STORAGE_VERSION
// and add migration logic here. Feature code never constructs key strings
// directly — only NemeshStorage does — so migrations can happen in one place.

const STORAGE_NAMESPACE = "nemesh";
const STORAGE_VERSION = 1;

type StorageWrapper<T> = {
  value: T;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
};

export type StorageKey = {
  feature: string;
  key: string;
};

function buildStorageKey(feature: string, key: string): string {
  return `${STORAGE_NAMESPACE}:v${STORAGE_VERSION}:${feature}:${key}`;
}

function isSsr(): boolean {
  return typeof window === "undefined";
}

function readRaw<T>(fullKey: string): StorageWrapper<T> | null {
  try {
    const raw = localStorage.getItem(fullKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StorageWrapper<T>;
    if (parsed.expiresAt != null && Date.now() > parsed.expiresAt) {
      try { localStorage.removeItem(fullKey); } catch { /* ignore */ }
      return null;
    }
    return parsed;
  } catch {
    // Corrupted value — clean it up so it doesn't block future writes.
    try { localStorage.removeItem(fullKey); } catch { /* ignore */ }
    return null;
  }
}

export const NemeshStorage = {
  /**
   * Read a stored value. Returns null when missing, expired, or corrupted.
   * Always returns null during SSR.
   *
   * Example key produced internally: "nemesh:v1:cooking-mode:<recipeId>"
   */
  get<T>({ feature, key }: StorageKey): T | null {
    if (isSsr()) return null;
    return readRaw<T>(buildStorageKey(feature, key))?.value ?? null;
  },

  /**
   * Write a value. Pass `expiresInMs` for time-limited storage.
   * Preserves `createdAt` when overwriting an existing entry.
   */
  set<T>({
    feature,
    key,
    value,
    expiresInMs,
  }: StorageKey & { value: T; expiresInMs?: number }): void {
    if (isSsr()) return;
    const fullKey = buildStorageKey(feature, key);
    const now = Date.now();
    const existing = readRaw<T>(fullKey);
    const wrapper: StorageWrapper<T> = {
      value,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      expiresAt: expiresInMs != null ? now + expiresInMs : undefined,
    };
    try { localStorage.setItem(fullKey, JSON.stringify(wrapper)); } catch { /* quota */ }
  },

  /** Remove a specific entry. */
  remove({ feature, key }: StorageKey): void {
    if (isSsr()) return;
    try { localStorage.removeItem(buildStorageKey(feature, key)); } catch { /* ignore */ }
  },

  /** Returns true when a non-expired value exists. */
  exists({ feature, key }: StorageKey): boolean {
    if (isSsr()) return false;
    return readRaw(buildStorageKey(feature, key)) !== null;
  },

  /**
   * Remove all keys belonging to a feature (across all `key` values).
   * Useful for feature-level resets and cache busting.
   *
   * Clears: "nemesh:v1:<feature>:*"
   */
  clearByFeature(feature: string): void {
    if (isSsr()) return;
    const prefix = `${STORAGE_NAMESPACE}:v${STORAGE_VERSION}:${feature}:`;
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) toRemove.push(k);
      }
      toRemove.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
    } catch { /* ignore */ }
  },
};
