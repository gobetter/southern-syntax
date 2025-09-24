import type { UserPermissions } from "./next-auth";

export interface PermissionsCacheAdapter {
  get(userId: string): Promise<UserPermissions | null> | UserPermissions | null;
  set(
    userId: string,
    permissions: UserPermissions,
    ttlMs?: number
  ): Promise<void> | void;
  delete(userId: string): Promise<void> | void;
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

  clear() {
    this.store.clear();
  }
}

const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 5;

const defaultAdapter = new InMemoryPermissionsCache();
let cacheAdapter: PermissionsCacheAdapter = defaultAdapter;

export function setPermissionsCacheAdapter(adapter: PermissionsCacheAdapter) {
  cacheAdapter = adapter;
}

export function getPermissionsCacheAdapter(): PermissionsCacheAdapter {
  return cacheAdapter;
}

export function resetPermissionsCacheAdapter() {
  defaultAdapter.clear();
  cacheAdapter = defaultAdapter;
}

export { InMemoryPermissionsCache, DEFAULT_CACHE_TTL_MS };
