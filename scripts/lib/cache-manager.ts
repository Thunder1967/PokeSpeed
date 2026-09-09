import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.resolve(process.cwd(), 'scripts/.cache');

/**
 * Ensures the cache directory exists
 */
async function ensureCacheDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}

/**
 * Hash a URL to a stable filename
 */
function getCacheKey(url: string): string {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const sanitized = url.replace(/[^a-zA-Z0-9_-]/g, '_').slice(-40);
  return `${sanitized}_${hash}.txt`;
}

/**
 * Fetch a URL with disk caching
 * @param url The URL to fetch
 * @param ttlMs Time to live in milliseconds (default: 24 hours)
 * @param force Force refresh even if cache is valid
 */
export async function fetchWithCache(url: string, ttlMs: number = 24 * 60 * 60 * 1000, force: boolean = false): Promise<string> {
  await ensureCacheDir();
  const cacheFile = path.join(CACHE_DIR, getCacheKey(url));

  if (!force) {
    try {
      const stats = await fs.stat(cacheFile);
      const isFresh = Date.now() - stats.mtimeMs < ttlMs;
      if (isFresh) {
        return await fs.readFile(cacheFile, 'utf8');
      }
    } catch {
      // Cache file doesn't exist or read error, proceed to fetch
    }
  }

  console.log(`[Fetch] ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  await fs.writeFile(cacheFile, text, 'utf8');
  return text;
}
