
const CACHE_PREFIX = 'nc_cache_';
const DEFAULT_EXPIRY = 1000 * 60 * 60 * 24; // 24 Hours

interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry: number;
}

export const cacheService = {
  set: <T>(key: string, value: T, ttl: number = DEFAULT_EXPIRY) => {
    try {
      const item: CacheItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: ttl,
      };
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache write failed (Storage likely full)', e);
      // Optional: Clear old cache here to make space
      cacheService.prune();
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      const now = Date.now();

      if (now - item.timestamp > item.expiry) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return item.value;
    } catch (e) {
      return null;
    }
  },

  prune: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          // Simple LRU or expiry check could go here
          // For now, just robustly handling expiration on get, 
          // this method forces cleanup of everything older than 2 days
          const stored = localStorage.getItem(key);
          if (stored) {
             const item = JSON.parse(stored);
             if (Date.now() - item.timestamp > DEFAULT_EXPIRY * 2) {
                 localStorage.removeItem(key);
             }
          }
        }
      });
    } catch (e) {}
  }
};
