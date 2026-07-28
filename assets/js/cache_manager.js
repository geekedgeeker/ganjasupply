/**
 * Cache Manager
 * Provides in-memory caching with LRU eviction for performance optimization
 */
class CacheManager {
  constructor(maxSize = 100, ttl = 300000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = ttl; // 5 minutes default
    this.accessOrder = [];
  }

  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }

    // Update access order
    if (this.cache.has(key)) {
      const index = this.accessOrder.indexOf(key);
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);

    // Store with expiration
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access order
    const index = this.accessOrder.indexOf(key);
    this.accessOrder.splice(index, 1);
    this.accessOrder.push(key);

    return item.value;
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  delete(key) {
    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  size() {
    // Clean expired items first
    this.cleanup();
    return this.cache.size;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.delete(key);
      }
    }
  }

  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      keys: Array.from(this.cache.keys())
    };
  }

  calculateHitRate() {
    // Simplified hit rate calculation
    return this.cache.size > 0 ? (this.cache.size / this.maxSize) * 100 : 0;
  }
}

const cache_manager = new CacheManager();
