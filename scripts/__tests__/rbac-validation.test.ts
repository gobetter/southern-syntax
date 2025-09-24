import { describe, it, expect } from "vitest";

import {
  runRbacValidation,
  listResourceKeys,
} from "../lib/rbac-validation.mts";
import { listAllPermissions } from "@southern-syntax/rbac";

describe("RBAC integration", () => {
  it("ensures RBAC validation passes without throwing", () => {
    expect(() => runRbacValidation()).not.toThrow();
  });

  it("ensures every resource listed in permissions appears in descriptors", () => {
    const resources = new Set(listResourceKeys());
    const descriptorResources = new Set(
      listAllPermissions().map(({ resource }) => resource)
    );

    descriptorResources.forEach((resource) => {
      expect(resources.has(resource)).toBe(true);
    });
  });
});
