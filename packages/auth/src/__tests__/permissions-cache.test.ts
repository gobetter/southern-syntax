import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

import {
  getUserPermissions,
  invalidateUserPermissions,
} from "../utils";
import {
  InMemoryPermissionsCache,
  setPermissionsCacheAdapter,
  resetPermissionsCacheAdapter,
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
  });

  afterEach(() => {
    resetPermissionsCacheAdapter();
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
});
