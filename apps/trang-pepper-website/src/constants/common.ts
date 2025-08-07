export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

// Common Prisma orderBy object for sorting by name ascending
export const ORDER_BY_NAME_ASC = { name: "asc" } as const;
export type OrderByNameAsc = typeof ORDER_BY_NAME_ASC;
