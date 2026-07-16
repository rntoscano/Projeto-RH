interface Identifiable {
  id?: number;
}

function readList<T>(key: string): T[] {
  const stored = localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function writeList<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function getItemKey<T extends Identifiable>(item: T, fallbackKeys: Array<keyof T>): string {
  if (typeof item.id === 'number') {
    return `id:${item.id}`;
  }

  const fallback = fallbackKeys.map((key) => item[key]).find((value) => typeof value === 'string' && value);
  return `fallback:${String(fallback ?? crypto.randomUUID())}`;
}

export function getCachedList<T>(key: string): T[] {
  return readList<T>(key);
}

export function replaceCachedList<T extends Identifiable>(key: string, items: T[], _fallbackKeys: Array<keyof T>) {
  void _fallbackKeys;
  writeList(key, items);
  return items;
}

export function mergeCachedList<T extends Identifiable>(key: string, items: T[], fallbackKeys: Array<keyof T>) {
  const existing = readList<T>(key);
  const merged = mergeByIdentity(existing, items, fallbackKeys);
  writeList(key, merged);
  return items;
}

export function upsertCachedItem<T extends Identifiable>(key: string, item: T, fallbackKeys: Array<keyof T>) {
  const existing = readList<T>(key);
  const itemIdentity = getItemKey(item, fallbackKeys);
  const next = [item, ...existing.filter((cachedItem) => getItemKey(cachedItem, fallbackKeys) !== itemIdentity)];
  writeList(key, next);
  return item;
}

export function removeCachedItem<T extends Identifiable>(key: string, id: number, fallbackKeys: Array<keyof T>) {
  const existing = readList<T>(key);
  writeList(
    key,
    existing.filter((item) => getItemKey(item, fallbackKeys) !== `id:${id}`),
  );
}

function mergeByIdentity<T extends Identifiable>(existing: T[], incoming: T[], fallbackKeys: Array<keyof T>): T[] {
  const map = new Map<string, T>();

  existing.forEach((item) => {
    map.set(getItemKey(item, fallbackKeys), item);
  });

  incoming.forEach((item) => {
    map.set(getItemKey(item, fallbackKeys), item);
  });

  return Array.from(map.values());
}
