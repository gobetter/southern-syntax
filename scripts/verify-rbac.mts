#!/usr/bin/env tsx
import {
  validateResourceTranslations,
  validateRolePresets,
} from "./lib/rbac-validation.mts";

function run() {
  console.log("Verifying RBAC resources and translations...");
  validateResourceTranslations();
  console.log("✔ Resource translations are present");

  console.log("Validating role defaults against known permissions...");
  validateRolePresets();
  console.log("✔ Role presets reference existing permissions");

  console.log("RBAC verification completed successfully.");
}

try {
  run();
} catch (error) {
  console.error("RBAC verification failed:\n", error);
  process.exitCode = 1;
}
