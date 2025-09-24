import type { UserPermissions } from "./next-auth";

export interface PermissionsCacheAdapter {
  get(userId: string): Promise<UserPermissions | null> | UserPermissions | null;
  set(
    userId: string,
    permissions: UserPermissions,
    ttlMs?: number
  ): Promise<void> | void;
  delete(userId: string): Promise<void> | void;
  deleteMany?(userIds: string[]): Promise<void> | void;
  clear?(): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

class InMemoryPermissionsCache implements PermissionsCacheAdapter {
  private readonly store = new Map<
    string,
    { permissions: UserPermissions; expiresAt: number }
  >();

  constructor(private readonly ttlMs = DEFAULT_CACHE_TTL_MS) {}

  async get(userId: string): Promise<UserPermissions | null> {
    const record = this.store.get(userId);
    if (!record) {
      return null;
    }

    if (record.expiresAt <= Date.now()) {
      this.store.delete(userId);
      return null;
    }

    return record.permissions;
  }

  async set(userId: string, permissions: UserPermissions, ttlMs?: number) {
    const ttl = typeof ttlMs === "number" ? ttlMs : this.ttlMs;
    this.store.set(userId, {
      permissions,
      expiresAt: Date.now() + ttl,
    });
  }

  async delete(userId: string) {
    this.store.delete(userId);
  }

  async deleteMany(userIds: string[]) {
    userIds.forEach((id) => this.store.delete(id));
  }

  clear() {
    this.store.clear();
  }
}

const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 5;

export type CacheConfig = {
  adapter?: PermissionsCacheAdapter;
  defaultTtlMs?: number;
};

let defaultTtlMs = DEFAULT_CACHE_TTL_MS;

if (typeof process !== "undefined") {
  const envTtlValue = Number(process.env.PERMISSIONS_CACHE_TTL_MS);
  if (Number.isFinite(envTtlValue) && envTtlValue > 0) {
    defaultTtlMs = envTtlValue;
  }
}

let inMemoryDefault = new InMemoryPermissionsCache(defaultTtlMs);
let cacheAdapter: PermissionsCacheAdapter = inMemoryDefault;

export function configurePermissionsCache(config: CacheConfig = {}) {
  if (typeof config.defaultTtlMs === "number" && config.defaultTtlMs > 0) {
    defaultTtlMs = config.defaultTtlMs;
    if (cacheAdapter instanceof InMemoryPermissionsCache) {
      inMemoryDefault = new InMemoryPermissionsCache(defaultTtlMs);
      cacheAdapter = inMemoryDefault;
    }
  }

  if (config.adapter) {
    cacheAdapter = config.adapter;
  }
}

export function setPermissionsCacheAdapter(adapter: PermissionsCacheAdapter) {
  cacheAdapter = adapter;
}

export function getPermissionsCacheAdapter(): PermissionsCacheAdapter {
  return cacheAdapter;
}

export function resetPermissionsCacheAdapter() {
  if (cacheAdapter.dispose) {
    void cacheAdapter.dispose();
  }
  inMemoryDefault = new InMemoryPermissionsCache(defaultTtlMs);
  cacheAdapter = inMemoryDefault;
}

export { InMemoryPermissionsCache, DEFAULT_CACHE_TTL_MS };
