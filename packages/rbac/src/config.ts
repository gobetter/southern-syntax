import { z } from "zod";

export const PERMISSION_ACTIONS = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  ASSIGN: "ASSIGN",
} as const;

export type PermissionActionType =
  (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];

const permissionActionValues = Object.values(PERMISSION_ACTIONS);
const permissionActionTuple = permissionActionValues as [
  PermissionActionType,
  ...PermissionActionType[],
];

export const PermissionActionSchema = z.enum(permissionActionTuple);

export function isPermissionAction(
  value: unknown
): value is PermissionActionType {
  return (
    typeof value === "string" &&
    (permissionActionValues as PermissionActionType[]).includes(
      value as PermissionActionType
    )
  );
}

export type PermissionResourceDefinition = {
  /** Actions that can be granted for the resource */
  actions: PermissionActionType[];
  /** Marks resources that should only be assignable by SUPERADMIN */
  superAdminOnly?: boolean;
  /** Optional translation key for display */
  labelKey?: string;
  /** Optional translation key for description */
  descriptionKey?: string;
};

export const PERMISSION_RESOURCE_DEFINITIONS = {
  ADMIN_DASHBOARD: {
    actions: [PERMISSION_ACTIONS.READ],
    superAdminOnly: true,
  },
  SETTINGS: {
    actions: [PERMISSION_ACTIONS.READ],
    superAdminOnly: true,
  },
  AUDIT_LOG: {
    actions: [PERMISSION_ACTIONS.READ],
    superAdminOnly: true,
  },
  LANGUAGE: {
    actions: [PERMISSION_ACTIONS.CREATE, PERMISSION_ACTIONS.READ, PERMISSION_ACTIONS.UPDATE],
  },
  USER: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  ROLE: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
    superAdminOnly: true,
  },
  ADMIN_ACCESS: {
    actions: [PERMISSION_ACTIONS.ASSIGN],
    superAdminOnly: true,
  },
  POST: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  POST_CATEGORY: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  POST_TAG: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  PRODUCT: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  PRODUCT_CATEGORY: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  PRODUCT_TAG: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  MEDIA: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
  MEDIA_TAXONOMY: {
    actions: [
      PERMISSION_ACTIONS.CREATE,
      PERMISSION_ACTIONS.READ,
      PERMISSION_ACTIONS.UPDATE,
      PERMISSION_ACTIONS.DELETE,
    ],
  },
} as const satisfies Record<string, PermissionResourceDefinition>;

export type PermissionResourceDefinitionMap =
  typeof PERMISSION_RESOURCE_DEFINITIONS;

export type PermissionResourceKey = keyof PermissionResourceDefinitionMap;

const permissionResourceKeys = Object.keys(
  PERMISSION_RESOURCE_DEFINITIONS
) as PermissionResourceKey[];

const permissionResourceTuple = permissionResourceKeys as [
  PermissionResourceKey,
  ...PermissionResourceKey[],
];

export const PERMISSION_RESOURCES = Object.freeze(
  permissionResourceKeys.reduce(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    {} as Record<PermissionResourceKey, PermissionResourceKey>
  )
) as { [K in PermissionResourceKey]: K };

export type PermissionResourceType = keyof typeof PERMISSION_RESOURCES;

export const PermissionResourceSchema = z.enum(permissionResourceTuple);

export function isPermissionResource(
  value: unknown
): value is PermissionResourceType {
  return (
    typeof value === "string" &&
    (permissionResourceKeys as PermissionResourceKey[]).includes(
      value as PermissionResourceKey
    )
  );
}

export type PermissionKey = `${PermissionResourceType}:${PermissionActionType}`;

function getPermissionResourceDefinition(
  resource: PermissionResourceType
): PermissionResourceDefinition {
  return PERMISSION_RESOURCE_DEFINITIONS[resource] as PermissionResourceDefinition;
}

const allPermissionDescriptors = permissionResourceKeys.flatMap(
  (resource) => {
    const definition = getPermissionResourceDefinition(
      resource as PermissionResourceType
    );
    return definition.actions.map((action) => ({
      key: `${resource}:${action}` as PermissionKey,
      resource: resource as PermissionResourceType,
      action,
      superAdminOnly: definition.superAdminOnly === true,
    }));
  }
);

export type PermissionDescriptor = (typeof allPermissionDescriptors)[number];

export const ALL_PERMISSION_KEYS: PermissionKey[] = allPermissionDescriptors.map(
  (descriptor) => descriptor.key
);

export function listAllPermissions(): PermissionDescriptor[] {
  return [...allPermissionDescriptors];
}

export function getActionsForResource(
  resource: PermissionResourceType
): PermissionActionType[] {
  return [
    ...getPermissionResourceDefinition(resource).actions,
  ];
}

export function isSuperAdminOnlyResource(resource: PermissionResourceType) {
  return getPermissionResourceDefinition(resource).superAdminOnly === true;
}

type RolePermissionMap = Partial<
  Record<PermissionResourceType, PermissionActionType[] | "ALL">
>;

export type RolePermissionPreset = "ALL" | RolePermissionMap;

type RoleDefinition = {
  displayName: Record<string, string>;
  isSystem: boolean;
  isAssignable: boolean;
  isSelectableOnRegistration?: boolean;
  descriptionKey?: string;
  defaultPermissions: RolePermissionPreset;
  /**
   * Marks a role whose assignment should require elevated checks
   * (e.g. assigning ADMIN should require ADMIN_ACCESS:ASSIGN).
   */
  isElevated?: boolean;
};

export type { RoleDefinition };

export const ROLE_DEFINITIONS = {
  SUPERADMIN: {
    displayName: { en: "Super Administrator", th: "ผู้ดูแลระบบสูงสุด" },
    isSystem: true,
    isAssignable: false,
    defaultPermissions: "ALL",
    isElevated: true,
  },
  ADMIN: {
    displayName: { en: "Administrator", th: "ผู้ดูแลระบบ" },
    isSystem: true,
    isAssignable: true,
    defaultPermissions: {
      ADMIN_DASHBOARD: [PERMISSION_ACTIONS.READ],
      USER: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      MEDIA: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      MEDIA_TAXONOMY: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      LANGUAGE: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
      ],
      SETTINGS: [PERMISSION_ACTIONS.READ],
      POST: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      POST_CATEGORY: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      POST_TAG: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      PRODUCT: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      PRODUCT_CATEGORY: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      PRODUCT_TAG: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
    },
    isElevated: true,
  },
  EDITOR: {
    displayName: { en: "Editor", th: "ผู้แก้ไขเนื้อหา" },
    isSystem: true,
    isAssignable: true,
    defaultPermissions: {
      POST: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      POST_CATEGORY: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      POST_TAG: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      PRODUCT: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      PRODUCT_CATEGORY: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      PRODUCT_TAG: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      MEDIA: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
      MEDIA_TAXONOMY: [
        PERMISSION_ACTIONS.CREATE,
        PERMISSION_ACTIONS.READ,
        PERMISSION_ACTIONS.UPDATE,
        PERMISSION_ACTIONS.DELETE,
      ],
    },
  },
  VIEWER: {
    displayName: { en: "Viewer", th: "ผู้เข้าชม" },
    isSystem: true,
    isAssignable: true,
    isSelectableOnRegistration: true,
    defaultPermissions: {
      POST: [PERMISSION_ACTIONS.READ],
      POST_CATEGORY: [PERMISSION_ACTIONS.READ],
      POST_TAG: [PERMISSION_ACTIONS.READ],
      PRODUCT: [PERMISSION_ACTIONS.READ],
      PRODUCT_CATEGORY: [PERMISSION_ACTIONS.READ],
      PRODUCT_TAG: [PERMISSION_ACTIONS.READ],
      MEDIA: [PERMISSION_ACTIONS.READ],
      MEDIA_TAXONOMY: [PERMISSION_ACTIONS.READ],
    },
  },
} as const satisfies Record<string, RoleDefinition>;

export type RoleDefinitionMap = typeof ROLE_DEFINITIONS;
export type RoleNameType = keyof RoleDefinitionMap;

function getRoleDefinition(role: RoleNameType): RoleDefinition {
  return ROLE_DEFINITIONS[role] as RoleDefinition;
}

const roleKeys = Object.keys(ROLE_DEFINITIONS) as RoleNameType[];

export const ROLE_NAMES = Object.freeze(
  roleKeys.reduce(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    {} as Record<RoleNameType, RoleNameType>
  )
) as { [K in RoleNameType]: K };

export const DEFAULT_USER_ROLE: RoleNameType = ROLE_NAMES.VIEWER;
export const DEFAULT_FALLBACK_ROLE: RoleNameType = ROLE_NAMES.VIEWER;

export const SYSTEM_ROLE_KEYS: RoleNameType[] = roleKeys.filter(
  (role) => getRoleDefinition(role).isSystem
);

export const ASSIGNABLE_ROLE_KEYS: RoleNameType[] = roleKeys.filter(
  (role) => getRoleDefinition(role).isAssignable
);

export const REGISTRATION_ROLE_KEYS: RoleNameType[] = roleKeys.filter(
  (role) => getRoleDefinition(role).isSelectableOnRegistration === true
);

export const ELEVATED_ROLE_KEYS: RoleNameType[] = roleKeys.filter(
  (role) => getRoleDefinition(role).isElevated === true
);

export function isSystemRole(role: RoleNameType) {
  return getRoleDefinition(role).isSystem;
}

export function isElevatedRole(role: RoleNameType) {
  return getRoleDefinition(role).isElevated === true;
}

export function getDefaultPermissionsForRole(
  role: RoleNameType
): PermissionKey[] {
  const preset = getRoleDefinition(role).defaultPermissions;

  if (preset === "ALL") {
    return [...ALL_PERMISSION_KEYS];
  }

  const keys: PermissionKey[] = [];
  const partialPreset = preset as RolePermissionMap;
  const presetEntries = Object.entries(partialPreset) as Array<[
    PermissionResourceType,
    RolePermissionMap[PermissionResourceType],
  ]>;

  for (const [resourceKey, actionValue] of presetEntries) {
    if (!actionValue) continue;
    if (actionValue === "ALL") {
      keys.push(
        ...getActionsForResource(resourceKey).map(
          (action) => `${resourceKey}:${action}` as PermissionKey
        )
      );
    } else {
      const actionList = actionValue as ReadonlyArray<PermissionActionType>;
      keys.push(
        ...actionList.map((action) => `${resourceKey}:${action}` as PermissionKey)
      );
    }
  }

  return keys;
}

export function getDefaultPermissionMapForRole(role: RoleNameType) {
  const preset = getRoleDefinition(role).defaultPermissions;

  if (preset === "ALL") {
    return permissionResourceKeys.reduce(
      (acc, resource) => {
        acc[resource as PermissionResourceType] = new Set(
          getActionsForResource(resource as PermissionResourceType)
        );
        return acc;
      },
      {} as Record<PermissionResourceType, Set<PermissionActionType>>
    );
  }

  const partialPreset = preset as RolePermissionMap;
  const presetEntries = Object.entries(partialPreset) as Array<[
    PermissionResourceType,
    RolePermissionMap[PermissionResourceType],
  ]>;

  return presetEntries.reduce(
    (acc, [resourceKey, actionValue]) => {
      if (!actionValue) return acc;
      const actionSet =
        actionValue === "ALL"
          ? new Set<PermissionActionType>(
              getActionsForResource(resourceKey)
            )
          : new Set<PermissionActionType>(
              actionValue as ReadonlyArray<PermissionActionType>
            );
      acc[resourceKey] = actionSet;
      return acc;
    },
    {} as Record<PermissionResourceType, Set<PermissionActionType>>
  );
}

export function ensureActionAllowed(
  resource: PermissionResourceType,
  action: PermissionActionType
) {
  const actions = getPermissionResourceDefinition(resource).actions;
  if (!actions.includes(action)) {
    throw new Error(
      `Permission action '${action}' is not allowed for resource '${resource}'.`
    );
  }
}

export const SUPERADMIN_ONLY_RESOURCES: PermissionResourceType[] =
  permissionResourceKeys.filter((resource) =>
    isSuperAdminOnlyResource(resource as PermissionResourceType)
  ) as PermissionResourceType[];

export const PERMISSION_ACTION_ORDER: PermissionActionType[] = [
  PERMISSION_ACTIONS.CREATE,
  PERMISSION_ACTIONS.READ,
  PERMISSION_ACTIONS.UPDATE,
  PERMISSION_ACTIONS.DELETE,
  PERMISSION_ACTIONS.ASSIGN,
];
