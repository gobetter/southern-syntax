# Custom permissions cache adapters

The default cache (`InMemoryPermissionsCache`) is ideal for local development
and single-instance deployments. When you scale to multiple app servers use a
shared store such as Redis or Memcached. Implement the
`PermissionsCacheAdapter` interface exported by `@southern-syntax/auth`.

```ts
import type { PermissionsCacheAdapter, UserPermissions } from "@southern-syntax/auth";
import { createClient } from "redis"; // or ioredis

export class RedisPermissionsCache implements PermissionsCacheAdapter {
  constructor(private readonly client = createClient(), private readonly ttlMs = 60_000) {}

  async get(userId: string) {
    const payload = await this.client.get(userId);
    if (!payload) return null;
    return JSON.parse(payload) as UserPermissions;
  }

  async set(userId: string, permissions: UserPermissions, ttlMs = this.ttlMs) {
    await this.client.set(userId, JSON.stringify(permissions), {
      PX: ttlMs,
    });
  }

  async delete(userId: string) {
    await this.client.del(userId);
  }

  async deleteMany(userIds: string[]) {
    if (userIds.length === 0) return;
    await this.client.del(userIds);
  }

  async dispose() {
    await this.client.quit();
  }
}
```

Usage:

```ts
import { configurePermissionsCache } from "@southern-syntax/auth";
import { RedisPermissionsCache } from "./redis-permissions-cache";

configurePermissionsCache({
  adapter: new RedisPermissionsCache(),
  defaultTtlMs: Number(process.env.PERMISSIONS_CACHE_TTL_MS ?? 300_000),
});
```

Ensure the adapter implements `deleteMany` for efficient bulk invalidation and
`dispose` for graceful shutdowns. Wrap configuration in your app bootstrap code
(e.g. Next.js custom server or API handler) so every instance shares the same
cache provider.
