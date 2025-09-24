import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

import {
  getUserPermissions,
  invalidateUserPermissions,
  invalidatePermissionsByRole,
} from "../utils";
import {
  InMemoryPermissionsCache,
  setPermissionsCacheAdapter,
  resetPermissionsCacheAdapter,
  configurePermissionsCache,
  getPermissionsCacheAdapter,
  DEFAULT_CACHE_TTL_MS,
  type PermissionsCacheAdapter,
} from "../permissions-cache";

const prismaMock = mockDeep<PrismaClient>();

vi.mock("@southern-syntax/db", () => ({
  prisma: prismaMock,
  default: prismaMock,
}));

const sampleUser = {
  id: "user-1",
  role: {
    permissions: [
      {
        permission: {
          resource: "USER",
          action: "READ",
        },
      },
    ],
  },
};

describe("permissions cache", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    resetPermissionsCacheAdapter();
    configurePermissionsCache({ defaultTtlMs: DEFAULT_CACHE_TTL_MS });
  });

  afterEach(() => {
    resetPermissionsCacheAdapter();
    configurePermissionsCache({ defaultTtlMs: DEFAULT_CACHE_TTL_MS });
  });

  it("caches permissions using the configured adapter", async () => {
    const cache = new InMemoryPermissionsCache(1000);
    setPermissionsCacheAdapter(cache);

    prismaMock.user.findUnique.mockResolvedValue(sampleUser as never);

    const first = await getUserPermissions("user-1");
    expect(first).toEqual({ USER: { READ: true } });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);

    prismaMock.user.findUnique.mockClear();

    const second = await getUserPermissions("user-1");
    expect(second).toEqual(first);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();

    invalidateUserPermissions("user-1");

    prismaMock.user.findUnique.mockResolvedValue(sampleUser as never);
    await getUserPermissions("user-1");
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it("expires cached entries after TTL", async () => {
    vi.useFakeTimers();

    const cache = new InMemoryPermissionsCache(10);
    setPermissionsCacheAdapter(cache);

    await cache.set("tester", { USER: { READ: true } });
    const beforeExpiry = await cache.get("tester");
    expect(beforeExpiry).toEqual({ USER: { READ: true } });

    vi.advanceTimersByTime(20);
    const afterExpiry = await cache.get("tester");
    expect(afterExpiry).toBeNull();

    vi.useRealTimers();
  });

  it("supports configuring default TTL for the in-memory cache", async () => {
    vi.useFakeTimers();

    configurePermissionsCache({ defaultTtlMs: 20 });
    resetPermissionsCacheAdapter();
    const cache = getPermissionsCacheAdapter();

    await cache.set("ttl-user", { USER: { READ: true } });
    vi.advanceTimersByTime(15);
    expect(await cache.get("ttl-user")).toEqual({ USER: { READ: true } });

    vi.advanceTimersByTime(10);
    expect(await cache.get("ttl-user")).toBeNull();

    vi.useRealTimers();
  });

  it("uses bulk deletion when the adapter supports deleteMany", async () => {
    const deleteMany = vi.fn();
    const adapter: PermissionsCacheAdapter = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      deleteMany,
    };

    setPermissionsCacheAdapter(adapter);

    prismaMock.user.findMany.mockResolvedValue([
      { id: "user-a" },
      { id: "user-b" },
    ] as never);

    await invalidatePermissionsByRole("role-a");

    expect(deleteMany).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledWith(["user-a", "user-b"]);
  });
});
