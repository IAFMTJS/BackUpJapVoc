// Cache configuration
const CACHE_CONFIG = {
  maxSize: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
  cleanupInterval: 1000 * 60 * 5 // 5 minutes
};

// Debounce configuration
const DEBOUNCE_CONFIG = {
  defaultDelay: 300,
  maxDelay: 1000
};

// Cache implementation
class Cache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = CACHE_CONFIG.maxSize, ttl: number = CACHE_CONFIG.ttl) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: K, value: V): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private getOldestKey(): K | undefined {
    let oldestKey: K | undefined;
    let oldestTimestamp = Infinity;

    for (const [key, { timestamp }] of this.cache.entries()) {
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, { timestamp }] of this.cache.entries()) {
      if (now - timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create caches for different data types
export const caches = {
  kanjiData: new Cache<string, any>(),
  strokeData: new Cache<string, any>(),
  practiceData: new Cache<string, any>(),
  progressData: new Cache<string, any>()
};

// Start cleanup interval
setInterval(() => {
  Object.values(caches).forEach(cache => cache.cleanup());
}, CACHE_CONFIG.cleanupInterval);

// Debounce implementation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = DEBOUNCE_CONFIG.defaultDelay
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = undefined;
    }, Math.min(delay, DEBOUNCE_CONFIG.maxDelay));
  };
};

// Throttle implementation
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number = DEBOUNCE_CONFIG.defaultDelay
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization implementation
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  options: {
    maxSize?: number;
    ttl?: number;
    keyFn?: (...args: Parameters<T>) => string;
  } = {}
): T => {
  const cache = new Cache<string, ReturnType<T>>(
    options.maxSize,
    options.ttl
  );

  const keyFn = options.keyFn || ((...args: Parameters<T>) => JSON.stringify(args));

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Batch processing implementation
export class BatchProcessor<T> {
  private batch: T[] = [];
  private processing: boolean = false;
  private readonly maxBatchSize: number;
  private readonly processFn: (items: T[]) => Promise<void>;
  private readonly flushInterval: number;

  constructor(
    processFn: (items: T[]) => Promise<void>,
    maxBatchSize: number = 100,
    flushInterval: number = 1000
  ) {
    this.processFn = processFn;
    this.maxBatchSize = maxBatchSize;
    this.flushInterval = flushInterval;

    // Start periodic flush
    setInterval(() => this.flush(), this.flushInterval);
  }

  async add(item: T): Promise<void> {
    this.batch.push(item);

    if (this.batch.length >= this.maxBatchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.processing || this.batch.length === 0) return;

    this.processing = true;
    const items = [...this.batch];
    this.batch = [];

    try {
      await this.processFn(items);
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Put items back in batch
      this.batch = [...items, ...this.batch];
    } finally {
      this.processing = false;
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private readonly maxMetrics: number = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(label: string): () => void {
    const start = performance.now();
    return () => this.endMeasure(label, start);
  }

  private endMeasure(label: string, start: number): void {
    const duration = performance.now() - start;
    const metrics = this.metrics.get(label) || [];
    metrics.push(duration);

    // Keep only the last N metrics
    if (metrics.length > this.maxMetrics) {
      metrics.shift();
    }

    this.metrics.set(label, metrics);
  }

  getMetrics(label?: string): { [key: string]: { avg: number; min: number; max: number } } {
    if (label) {
      return this.calculateMetrics(label);
    }

    const result: { [key: string]: { avg: number; min: number; max: number } } = {};
    for (const key of this.metrics.keys()) {
      result[key] = this.calculateMetrics(key)[key];
    }
    return result;
  }

  private calculateMetrics(label: string): { [key: string]: { avg: number; min: number; max: number } } {
    const metrics = this.metrics.get(label) || [];
    if (metrics.length === 0) {
      return { [label]: { avg: 0, min: 0, max: 0 } };
    }

    const sum = metrics.reduce((a, b) => a + b, 0);
    const avg = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return { [label]: { avg, min, max } };
  }

  clearMetrics(label?: string): void {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility function to measure async operations
export const measureAsync = async <T>(
  label: string,
  operation: () => Promise<T>
): Promise<T> => {
  const endMeasure = performanceMonitor.startMeasure(label);
  try {
    return await operation();
  } finally {
    endMeasure();
  }
};

// Utility function to measure sync operations
export const measureSync = <T>(
  label: string,
  operation: () => T
): T => {
  const endMeasure = performanceMonitor.startMeasure(label);
  try {
    return operation();
  } finally {
    endMeasure();
  }
};

// React hooks for performance optimization
import { useCallback, useRef, useEffect } from 'react';

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = DEBOUNCE_CONFIG.defaultDelay
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, Math.min(delay, DEBOUNCE_CONFIG.maxDelay));
  }, [callback, delay]);
};

export const useMemoization = <T extends (...args: any[]) => any>(
  callback: T,
  options: {
    maxSize?: number;
    ttl?: number;
    keyFn?: (...args: Parameters<T>) => string;
  } = {}
): T => {
  const cacheRef = useRef(new Cache<string, ReturnType<T>>(options.maxSize, options.ttl));
  const keyFn = options.keyFn || ((...args: Parameters<T>) => JSON.stringify(args));

  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn(...args);
    const cached = cacheRef.current.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = callback(...args);
    cacheRef.current.set(key, result);
    return result;
  }, [callback, keyFn]) as T;
}; 