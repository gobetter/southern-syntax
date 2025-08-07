import { router, publicProcedure } from "../trpc";

// Import routers ของแต่ละโมดูล
import { userRouter } from "./content/user";
import { productRouter } from "./content/product";
import { productCategoryRouter } from "./content/product-category";
import { postRouter } from "./content/post";
import { postCategoryRouter } from "./content/post-category";
import { postTagRouter } from "./content/post-tag";
import { mediaRouter } from "./content/media";
import { languageRouter } from "./content/language";
import { mediaCategoryRouter } from "./content/media-category";
import { mediaTagRouter } from "./content/media-tag";
import { roleRouter } from "./content/role";
import { permissionRouter } from "./content/permission";
import { auditLogRouter } from "./content/auditLog";

// จัดกลุ่ม Routers ที่เกี่ยวข้องกัน
const contentRouter = router({
  product: productRouter,
  productCategory: productCategoryRouter,
  post: postRouter,
  postCategory: postCategoryRouter,
  postTag: postTagRouter,
  media: mediaRouter,
  mediaCategory: mediaCategoryRouter,
  mediaTag: mediaTagRouter,
  auditLog: auditLogRouter,
});

const adminRouter = router({
  user: userRouter,
  language: languageRouter,
  role: roleRouter,
  permission: permissionRouter,
});

// สร้าง AppRouter หลักแล้วใช้ .mergeRouters()
// (ใน tRPC v11 จะไม่มี .mergeRouters() แต่จะใช้การ spread (...) ใน object แทน)
// เราจะใช้การ spread syntax ซึ่งทันสมัยและแก้ปัญหา Type ได้ดีที่สุด
export const appRouter = router({
  // procedure พื้นฐาน
  healthcheck: publicProcedure.query(() => ({ status: "ok" })),

  // รวม router ที่จัดกลุ่มไว้โดยใช้ spread operator
  // จะได้ trpc.product.procedureName, trpc.post.procedureName เป็นต้น
  ...contentRouter._def.procedures,

  // รวม admin router
  // จะได้ trpc.user.procedureName, trpc.language.procedureName
  ...adminRouter._def.procedures,
});

// Export Type ของ AppRouter เพื่อให้ Frontend ใช้งาน
export type AppRouter = typeof appRouter;
