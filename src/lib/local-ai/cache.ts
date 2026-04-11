/**
 * Tiny LRU cache.
 *
 * Used to memoize query embeddings so repeated RAG calls don't re-hit
 * Ollama for the same question. Map preserves insertion order, so we
 * delete-and-re-set to move entries to the "newest" end.
 */

export class LRU<K, V> {
  private map = new Map<K, V>();
  constructor(private readonly max = 500) {}

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value === undefined) return undefined;
    // refresh recency
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, value);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
  }

  get size(): number {
    return this.map.size;
  }
}
