export { SORT_ORDERS } from "@southern-syntax/types";
export type { SortOrder } from "@southern-syntax/types";

// Common Prisma orderBy object for sorting by name ascending
export const ORDER_BY_NAME_ASC = { name: "asc" } as const;
export type OrderByNameAsc = typeof ORDER_BY_NAME_ASC;
