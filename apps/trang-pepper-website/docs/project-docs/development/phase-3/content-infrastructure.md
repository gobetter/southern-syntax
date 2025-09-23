# **Phase 3: โครงสร้างพื้นฐานเนื้อหา (Content Infrastructure)**

เฟสนี้ครอบคลุมการพัฒนาโมเดลข้อมูลหลักและระบบจัดการเนื้อหาที่รองรับการทำงานหลายภาษา การดำเนินการในเฟสนี้เป็นสิ่งสำคัญในการวางรากฐานสำหรับการจัดการเนื้อหาที่ซับซ้อนและหลากหลาย รวมถึง Asset ที่เกี่ยวข้อง โดยมุ่งเน้นการสร้างความสามารถในการจัดการข้อมูลที่เป็นหัวใจหลักของ CMS

## 1. การพัฒนา Core Data Models และ Services

ในขั้นตอนนี้ จะเริ่มต้นการสร้างโมเดลและ Service สำหรับข้อมูลหลักของระบบ CMS ซึ่งเป็นหัวใจสำคัญของ Application และเป็นรากฐานสำหรับการจัดการเนื้อหาที่ซับซ้อนและหลากหลายรูปแบบที่ธุรกิจต้องการนำเสนอ

### 1.1 การผสานรวม tRPC

เราจะนำ tRPC มาใช้เป็น Protocol หลักสำหรับการสื่อสารระหว่าง Frontend และ Backend เพื่อสร้าง API ที่มีความปลอดภัยด้าน Type (Type-safe) ตั้งแต่ต้นจนจบ (end-to-end)

#### 1.1.1 การติดตั้ง tRPC Packages

เปิด Terminal ในโฟลเดอร์โปรเจกต์ `trang-pepper-cms` ของคุณ และรันคำสั่ง:

```bash
pnpm add @trpc/server @trpc/react-query @trpc/client @tanstack/react-query zod
pnpm add -D @types/react-query # สำหรับ react-query v3 (ถ้ายังใช้) หรือ @tanstack/eslint-plugin-query (ถ้าใช้ v4+)
```

**คำอธิบาย:**

- `@trpc/server`: แพ็กเกจหลักสำหรับ Backend ของ tRPC
- `@trpc/react-query`: สำหรับการผสานรวม tRPC กับ React Query ในฝั่ง Frontend
- `@trpc/client`: สำหรับการสร้าง tRPC Client ในฝั่ง Frontend
- `@tanstack/react-query`: Library สำหรับ Data Fetching และ State Management ใน React
- `zod`: (ติดตั้งไปแล้วใน Phase 2\) สำหรับ Schema Validation

#### 1.1.2 การสร้าง tRPC Backend (Router & Procedure)

เราจะสร้างโครงสร้างพื้นฐานสำหรับ tRPC Router ใน Backend

- **สร้างไฟล์ `src/server/trpc.ts`:** (หรือ `src/lib/trpc.ts` ถ้าคุณชอบรวมใน lib)

```ts
// src/server/trpc.ts
import { initTRPC } from '@trpc/server';
import { getServerSession } from 'next-auth'; // เพื่อใช้ใน context ของ tRPC
import { authOptions, can } from '@/lib/auth'; // authOptions และ can function
import prisma from '@/lib/prisma'; // Prisma Client instance
import { PermissionActionType, PermissionResourceType } from '@/lib/auth/constants'; // นำเข้า Type ที่ถูกต้อง

// สร้าง Context สำหรับ tRPC
// Context จะมีข้อมูลที่เข้าถึงได้ในทุก tRPC procedure (เช่น session, prisma client)
export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions); // ดึง NextAuth.js session
  return {
    session, // ส่ง session เข้าไปใน context
    prisma, // ส่ง prisma client เข้าไปใน context
  };
};

// Initialize tRPC
// .context<typeof createTRPCContext>() เพื่อให้ tRPC รู้จัก Type ของ context ที่เราสร้าง
const t = initTRPC.context<typeof createTRPCContext>().create();

// สร้าง Reusable middleware และ Procedure Builders
export const router = t.router;
// publicProcedure: สำหรับ API ที่ใครก็เรียกได้ (ไม่ต้อง Login)
export const publicProcedure = t.procedure;

// protectedProcedure: สำหรับ API ที่ต้อง Login แล้วเท่านั้น
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    // ตรวจสอบว่ามี session และ user ใน session หรือไม่
    if (!ctx.session || !ctx.session.user) {
      // ถ้าไม่มี session, โยน Error Unauthorized
      throw new Error('UNAUTHORIZED');
    }
    // ถ้ามี session, ส่ง session นั้นต่อไปใน context ของ procedure ถัดไป
    return next({
      ctx: {
        session: ctx.session,
      },
    });
  }),
);

// authorizedProcedure: สำหรับ API ที่ต้อง Login แล้วและมีสิทธิ์ตามที่กำหนด
// แก้ไข Type ของ resource และ action ให้เป็น Type ที่ถูกต้องจาก constants
export const authorizedProcedure = (
  resource: PermissionResourceType,
  action: PermissionActionType,
) => {
  return protectedProcedure.use(
    t.middleware(async ({ ctx, next }) => {
      // ใช้ can function จาก src/lib/auth/utils.ts เพื่อตรวจสอบสิทธิ์
      // ตอนนี้ไม่จำเป็นต้องใช้ Type Assertion (as any) แล้ว
      const hasPermission = await can(ctx.session, resource, action);

      // ถ้าไม่มีสิทธิ์, โยน Error Forbidden
      if (!hasPermission) {
        throw new Error('FORBIDDEN');
      }
      // ถ้ามีสิทธิ์, ดำเนินการต่อ
      return next();
    }),
  );
};
```

- **สร้างไฟล์ `src/server/routers/_app.ts`:** (สำหรับ Root Router)

```ts
// src/server/routers/_app.ts
import { router, publicProcedure } from '../trpc';

// Import routers ของแต่ละโมดูลในอนาคต (เมื่อสร้าง)
import { productRouter } from './content/product'; // สำหรับ Product-related procedures
import { productCategoryRouter } from './content/product-category'; // สำหรับ ProductCategory-related procedures
import { postRouter } from './content/post'; // สำหรับ Post-related procedures
import { postCategoryRouter } from './content/post-category'; // สำหรับ PostCategory-related procedures
import { postTagRouter } from './content/post-tag'; // สำหรับ PostTag-related procedures
import { mediaRouter } from './content/media'; // สำหรับ Media-related procedures
import { languageRouter } from './content/language'; // สำหรับ Language-related procedures

// appRouter: Root Router ที่จะรวมทุก routers ย่อย
export const appRouter = router({
  // healthcheck: ตัวอย่าง public procedure สำหรับตรวจสอบสถานะ API
  healthcheck: publicProcedure.query(() => ({ status: 'ok' })),

  // รวม Routers ย่อยๆ ของ Content Modules เข้ามาใน Root Router
  // Frontend จะสามารถเรียกใช้ Procedures ได้ผ่าน trpc.<moduleName>.<procedureName>
  product: productRouter,
  productCategory: productCategoryRouter,
  post: postRouter,
  postCategory: postCategoryRouter,
  postTag: postTagRouter,
  media: mediaRouter,
  language: languageRouter,

  // สามารถเพิ่ม routers อื่นๆ ในอนาคต (เช่น authRouter ถ้าแยก Auth API)
});

// Export Type ของ AppRouter เพื่อให้ Frontend สามารถ Infer Types ได้
export type AppRouter = typeof appRouter;
```

- **สร้างไฟล์ `src/app/api/trpc/[trpc]/route.ts`:** (Next.js API Endpoint สำหรับ tRPC)

```ts
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app'; // Import Root tRPC Router
import { createTRPCContext } from '@southern-syntax/trpc'; // Import tRPC Context creator

// Handler สำหรับทั้ง GET และ POST requests
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc', // URL ของ API endpoint ที่ Frontend จะเรียกใช้
    req, // Request object
    router: appRouter, // Root tRPC Router ของเรา
    createContext: createTRPCContext, // ฟังก์ชันสำหรับสร้าง context
    // onError: สำหรับ Production Logging และ Debugging ใน Development
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            // ใน Development, แสดง Error บน Console
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined, // ใน Production, อาจจะใช้บริการ Logging อื่นๆ
  });

// Export handlers สำหรับ Next.js App Router
export { handler as GET, handler as POST };
```

#### 1.1.3 การสร้าง tRPC Frontend Client

เราจะสร้าง tRPC Client เพื่อให้ Frontend สามารถเรียกใช้ API ได้อย่าง Type-safe

- **สร้างไฟล์ `src/lib/trpc-client.ts`:**

```ts
// src/lib/trpc-client.ts
'use client'; // กำหนดให้เป็น Client Component

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app'; // Import Type จาก Backend

// สร้าง tRPC Client สำหรับ React Components
export const trpc = createTRPCReact<AppRouter>();
```

- **สร้างไฟล์ `src/lib/trpc-provider.tsx`:** (สำหรับห่อหุ้ม `App` Component)

```ts
// src/lib/trpc-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './trpc-client'; // tRPC Client ที่เราสร้างไว้
import { httpBatchLink } from '@trpc/client'; // สำหรับการเชื่อมต่อ HTTP
import { ReactNode, useState } from 'react'; // React Hooks

interface TRPCProviderProps {
  children: ReactNode;
}

export default function TRPCProvider({ children }: TRPCProviderProps) {
  // สร้าง QueryClient สำหรับ React Query (จัดการ Caching, Deduping, etc.)
  const [queryClient] = useState(() => new QueryClient({
    // ตั้งค่า default options สำหรับ React Query (ตัวอย่าง)
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 วินาที
        refetchOnWindowFocus: false, // ไม่ต้อง refetch เมื่อกลับมาที่หน้าต่าง
      },
    },
  }));

  // สร้าง tRPC Client
  const [trpcClient] = useState(() =>
    trpc.createClient({
      // Links: กำหนดวิธีการสื่อสารของ tRPC
      links: [
        // httpBatchLink: ส่ง requests หลายตัวพร้อมกันใน HTTP request เดียว (Batching)
        httpBatchLink({
          url: '/api/trpc', // URL ของ tRPC API Endpoint
          // headers: (context) => {
          //   // สามารถเพิ่ม headers เช่น Authorization token ที่นี่ได้ (ถ้าจำเป็น)
          //   // const token = getAuthToken();
          //   // return token ? { authorization: `Bearer ${token}` } : {};
          // },
        }),
      ],
    })
  );

  return (
    // ห่อหุ้ม children ด้วย tRPC Provider และ React Query Provider
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

- **ปรับปรุง `src/app/layout.tsx`:** ห่อหุ้มด้วย `TRPCProvider` (และ `SessionProviderWrapper`)

```sh
// src/app/layout.tsx (ส่วนที่แก้ไข)
import './globals.css';
import SessionProviderWrapper from './session-provider-wrapper';
import TRPCProvider from '@/lib/trpc-provider'; // Import TRPCProvider
import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider> {/* ห่อหุ้มด้วย TRPCProvider */}
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </TRPCProvider>
      </body>
    </html>
  );
}
```

### 1.2 การกำหนด Prisma Schema เพิ่มเติม (สำหรับ Content Models)

เราจะขยาย `prisma/schema.prisma` เพื่อเพิ่ม Models สำหรับเนื้อหาหลักของ CMS

#### 1.2.1 เพิ่ม `LocalizedString` Type

เนื่องจาก `JSONB` เป็น Type ใน PostgreSQL ไม่ใช่ Type ของ Prisma โดยตรง เราจะกำหนด `LocalizedString` ให้เป็น `Json` ใน Prisma Schema และใน TypeScript เราจะกำหนด `type LocalizedString = { [locale: string]: string; }`

- **สร้างไฟล์ `src/types/i18n.d.ts`:** (เพื่อกำหนด TypeScript Type ของ `LocalizedString`)

```ts
// src/types/i18n.d.ts
// กำหนด Type สำหรับ Field ที่รองรับหลายภาษา (JSONB ใน PostgreSQL)
export type LocalizedString = {
  [locale: string]: string; // key เป็น locale code (e.g., "en", "th"), value เป็น string
};
```

- **แก้ไขไฟล์ `prisma/schema.prisma`:**
  - เพิ่ม `model Language` เพื่อจัดการภาษาที่รองรับ
  - เพิ่ม Models สำหรับ `Product`, `ProductCategory`, `Post`, `PostCategory`, `PostTag`, `Media`
  - ใช้ `Json` Type สำหรับ Field ที่จะเป็น `LocalizedString`

```prisma
// prisma/schema.prisma (ส่วนที่แก้ไข)

// ... (Models User, Account, Session, VerificationToken, Role, Permission, RolePermission เหมือนเดิม)

// --- Models สำหรับการจัดการภาษา (i18n & l10n) ---
model Language {
  id        String    @id @default(cuid())
  code      String    @unique // รหัสภาษา (e.g., "en", "th", "fr")
  name      String    // ชื่อภาษา (e.g., "English", "ภาษาไทย")
  isDefault Boolean   @default(false) // เป็นภาษา Default หรือไม่
  isActive  Boolean   @default(true)  // เปิดใช้งานหรือไม่ (สำหรับ Frontend/Admin UI)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}


// --- Core Content Models ---

model Product {
  id              String         @id @default(cuid())
  slug            String         @unique // สำหรับ URL (e.g., "thai-black-pepper")
  title           Json           // LocalizedString for product title (JSONB)
  description     Json?          @db.Text // LocalizedString for product description (JSONB, long text)
  price           Decimal
  stock           Int
  isPublished     Boolean        @default(false) // สถานะเผยแพร่
  featuredImageId String?        // Foreign key to Media model
  featuredImage   Media?         @relation(name: "ProductFeaturedImage", fields: [featuredImageId], references: [id])

  images          ProductImage[] // Relation to ProductImage (Many-to-Many with Media)
  categories      ProductCategory[] // Relation to ProductCategory (Many-to-Many)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model ProductCategory {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        Json      // LocalizedString for category name (JSONB)
  description Json?     @db.Text // LocalizedString for category description (JSONB)
  parent      ProductCategory? @relation("ProductCategoryHierarchy", fields: [parentId], references: [id])
  parentId    String?
  children    ProductCategory[] @relation("ProductCategoryHierarchy")

  products    Product[] // Relation to Product (Many-to-Many)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model ProductImage {
  id        String @id @default(cuid())
  productId String
  mediaId   String
  order     Int?   // สำหรับเรียงลำดับรูปภาพ

  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  media     Media   @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@unique([productId, mediaId]) // Product หนึ่งมี Media รูปภาพนี้ได้ครั้งเดียว
}

model Post {
  id              String         @id @default(cuid())
  slug            String         @unique
  title           Json           // LocalizedString for post title (JSONB)
  content         Json           @db.Text // LocalizedString for post content (JSONB, rich text)
  excerpt         Json?          @db.Text // LocalizedString for post excerpt (JSONB)
  authorId        String         // Foreign key to User model
  author          User           @relation(fields: [authorId], references: [id])
  isPublished     Boolean        @default(false) // สถานะเผยแพร่
  publishedAt     DateTime?      // วันที่เผยแพร่จริง
  featuredImageId String?
  featuredImage   Media?         @relation(name: "PostFeaturedImage", fields: [featuredImageId], references: [id])

  categories      PostCategory[] // Relation to PostCategory (Many-to-Many)
  tags            PostTag[]      // Relation to PostTag (Many-to-Many)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model PostCategory {
  id          String    @id @default(cuid())
  slug        String    @unique
  name        Json      // LocalizedString for category name (JSONB)
  description Json?     @db.Text // LocalizedString for category description (JSONB)

  posts       Post[]    // Relation to Post (Many-to-Many)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model PostTag {
  id        String    @id @default(cuid())
  slug      String    @unique
  name      Json      // LocalizedString for tag name (JSONB)

  posts     Post[]    // Relation to Post (Many-to-Many)

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Media {
  id               String         @id @default(cuid())
  filename         String         // ชื่อไฟล์ต้นฉบับ
  originalUrl      String         // URL ของไฟล์ต้นฉบับใน Cloud Storage
  mimeType         String         // e.g., "image/jpeg", "video/mp4"
  fileSize         Int            // ขนาดไฟล์เป็น bytes
  altText          Json?          // LocalizedString for alt text (JSONB)
  caption          Json?          @db.Text // LocalizedString for caption (JSONB, long text)
  variants         Json?          // JSONB: Store URLs for different sizes/formats (e.g., { "thumbnail": "url", "medium": "url" })
  isSystem         Boolean        @default(false) // true = system-generated (e.g. default placeholder image), should not be deleted

  productFeaturedImage Product[]    @relation("ProductFeaturedImage") // Relation: featured image for products
  postFeaturedImage    Post[]       @relation("PostFeaturedImage")   // Relation: featured image for posts
  productImages        ProductImage[] // Relation: gallery images for products

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}

// --- AuditLog Model (พิจารณาในอนาคต) ---
// Model สำหรับบันทึกกิจกรรมสำคัญในระบบ (User actions, System events)
model AuditLog {
  id        String    @id @default(cuid()) // Unique ID for the log entry
  userId    String?   // Optional: ID of the user who performed the action (can be null if system action)
  user      User?     @relation(fields: [userId], references: [id]) // Relation to User model

  entityId  String?   // Optional: ID of the entity that was affected (e.g., Role ID, Permission ID, User ID, Product ID)
  entityType String?  // Optional: Type of the entity (e.g., "User", "Role", "Permission", "Product", "Post", "Media")

  action    String    // What action was performed (e.g., "user_created", "role_updated", "product_deleted", "post_published")
  details   Json      // Detailed payload of the action, including old/new values, IPs, etc.
  createdAt DateTime  @default(now()) // Timestamp of the action

  @@index([userId]) // Index for faster lookup by user
  @@index([createdAt]) // Index for faster lookup by time
  @@index([entityType, entityId]) // Optional: For faster lookup by affected entity
}
```

### 1.3 การสร้าง Service Layer และ tRPC Routers (สำหรับ Core Content Models)

เราจะสร้าง Service Layer สำหรับแต่ละ Content Model เพื่อรวม Business Logic และผสานรวมกับ tRPC เพื่อสร้าง API Endpoints ที่ Type-safe

#### 1.3.1 สร้างโฟลเดอร์สำหรับ Services และ Routers

- สร้างโฟลเดอร์ย่อยใน `src/services/` (ถ้าต้องการแยกชัดเจน) และใน `src/server/routers/` สำหรับ tRPC Routers

```bash
mkdir src/services
mkdir src/server/routers/content
```

#### 1.3.2 สร้าง Services สำหรับ Content Models (ตัวอย่าง: Product Service)

- สร้างไฟล์ **`src/services/product.ts`** (หรือ `src/lib/product-service.ts` ถ้าชอบรวมใน lib)

```ts
// src/services/product.ts
// หรือ src/lib/product-service.ts
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { LocalizedString } from '@/types/i18n'; // Import LocalizedString type
import { can } from '@/lib/auth'; // สำหรับตรวจสอบสิทธิ์

// --- Zod Schemas สำหรับ Validation Input ---
// ควรสร้างใน src/lib/schemas หรือ src/schemas/product.ts
export const productInputSchema = z.object({
  // title จะเป็น JSONB ดังนั้นใช้ z.record(z.string(), z.string())
  title: z
    .record(z.string(), z.string().min(1, 'Title cannot be empty'))
    .refine((obj) => Object.keys(obj).length > 0, 'At least one language title is required'),
  description: z.record(z.string(), z.string()).optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isPublished: z.boolean().default(false),
  featuredImageId: z.string().optional(),
  // categoryIds: z.array(z.string()).optional(), // ถ้าเป็น Many-to-Many ผ่าน join table
  // tagIds: z.array(z.string()).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// --- Product Service ---
export const productService = {
  async createProduct(data: ProductInput) {
    const validatedData = productInputSchema.parse(data); // Validate data
    const newProduct = await prisma.product.create({ data: validatedData });
    return newProduct;
  },

  async getProductById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  async updateProduct(id: string, data: Partial<ProductInput>) {
    const validatedData = productInputSchema.partial().parse(data); // Validate partial data for update
    const updatedProduct = await prisma.product.update({ where: { id }, data: validatedData });
    return updatedProduct;
  },

  async deleteProduct(id: string) {
    // Implement RBAC check here in a real application
    // if (!await can(session, 'PRODUCT', 'DELETE')) throw new Error('FORBIDDEN');
    return prisma.product.delete({ where: { id } });
  },

  async getAllProducts() {
    return prisma.product.findMany();
  },
};
```

- **ทำเช่นเดียวกันสำหรับ Models อื่นๆ:** `category.ts`, `post.ts`, `media.ts`, `language.ts` (ในโฟลเดอร์ `src/services/` หรือ `src/lib/`)

#### 1.3.3 การสร้าง tRPC Routers สำหรับ Content Modules

- สร้างไฟล์ **`src/server/routers/content/product.ts`**

```ts
// src/server/routers/content/product.ts
import { router, publicProcedure, protectedProcedure, authorizedProcedure } from '@southern-syntax/trpc';
import { productInputSchema, productService } from '@/services/product'; // หรือ '@/lib/product-service'
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';
import { z } from 'zod';
import { LocalizedString } from '@/types/i18n'; // Import LocalizedString type

// Zod Schema สำหรับ AltText และ Caption ที่เป็น LocalizedString
const localizedStringSchema = z.record(z.string(), z.string());

// Zod Schema สำหรับ Media Upload/Update Input (คล้ายกับใน service)
// ควรสร้างใน src/lib/schemas หรือ src/schemas/media.ts
const mediaUploadInputSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'Mime type is required'),
  fileSize: z.number().int().min(0, 'File size must be non-negative'),
  // buffer: z.any(), // tRPC doesn't directly support Buffer in input without custom transformers
  altText: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
});

const mediaUpdateInputSchema = z.object({
  altText: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
  isSystem: z.boolean().optional(),
});

export const mediaRouter = router({
  // อัปโหลดไฟล์ (ซับซ้อนกว่าเพราะต้องจัดการ Buffer)
  // tRPC ไม่ได้จัดการ multipart/form-data โดยตรง
  // อาจจะต้องสร้าง Next.js Route Handler ปกติสำหรับอัปโหลดไฟล์
  // แล้วเรียกใช้ mediaService.uploadMedia จากนั้น tRPC จะจัดการแค่ metadata
  // หรือใช้ tRPC transformers สำหรับ Buffer (Advanced)

  // getAll media (Admin UI listing)
  getAll: authorizedProcedure(PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.READ).query(
    async ({ ctx }) => {
      // เพิ่ม ctx parameter
      return mediaService.getAllMedia();
    },
  ),

  // get media by ID
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return mediaService.getMediaById(input.id);
  }),

  // update media metadata (altText, caption, isSystem)
  update: authorizedProcedure(PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.UPDATE)
    .input(z.object({ id: z.string(), data: mediaUpdateInputSchema }))
    .mutation(async ({ input, ctx }) => {
      // เพิ่ม ctx parameter
      return mediaService.updateMedia(input.id, input.data);
    }),

  // delete media
  delete: authorizedProcedure(PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.DELETE)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // เพิ่ม ctx parameter
      return mediaService.deleteMedia(input.id);
    }),
});
```

- **ปรับปรุง `src/server/routers/_app.ts`:**

```ts
// src/server/routers/_app.ts (ส่วนที่แก้ไข)
import { router, publicProcedure } from '../trpc';
import { productRouter } from './content/product';
// import { mediaRouter } from './content/media'; // Import mediaRouter
// import { categoryRouter } from './content/category';
// import { postRouter } from './content/post';
// import { languageRouter } from './content/language';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => ({ status: 'ok' })),
  product: productRouter,
  // media: mediaRouter, // เพิ่ม mediaRouter
  // category: categoryRouter,
  // post: postRouter,
  // language: languageRouter,
});

export type AppRouter = typeof appRouter;
```

#### 1.3.4 การสร้าง tRPC Frontend Client

เราจะสร้าง tRPC Client เพื่อให้ Frontend สามารถเรียกใช้ API ได้อย่าง Type-safe

- **สร้างไฟล์ `src/lib/trpc-client.ts`:**

```ts
// src/lib/trpc-client.ts
'use client'; // กำหนดให้เป็น Client Component

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app'; // Import Type จาก Backend

// สร้าง tRPC Client สำหรับ React Components
export const trpc = createTRPCReact<AppRouter>();
```

- **สร้างไฟล์ `src/lib/trpc-provider.tsx`:** (สำหรับห่อหุ้ม `App` Component)

```ts
// src/lib/trpc-provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './trpc-client';
import { httpBatchLink } from '@trpc/client';
import { ReactNode, useState } from 'react';

export default function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc', // URL ของ tRPC API
          // You can add headers here if needed (e.g., for auth tokens)
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

- **ปรับปรุง `src/app/layout.tsx`:** ห่อหุ้มด้วย `TRPCProvider` (และ `SessionProviderWrapper`)

```ts
// src/app/layout.tsx (ส่วนที่แก้ไข)
import './globals.css';
import SessionProviderWrapper from './session-provider-wrapper';
import TRPCProvider from '@/lib/trpc-provider'; // Import TRPCProvider
import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider> {/* ห่อหุ้มด้วย TRPCProvider */}
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </TRPCProvider>
      </body>
    </html>
  );
}
```

## 2. การพัฒนาระบบจัดการภาษาด้วย `next-intl`

ขั้นตอนนี้จะมุ่งเน้นการใช้ Library **`next-intl`** ซึ่งเป็นโซลูชันที่ทันสมัยและถูกออกแบบมาสำหรับ Next.js App Router โดยเฉพาะ เพื่อให้ระบบสามารถจัดการการแปลภาษา (i18n) และการปรับเนื้อหาตามท้องถิ่น (l10n) ได้อย่างมีประสิทธิภาพและครบวงจร

### 2.1 การติดตั้งและกำหนดค่าพื้นฐาน

- **การติดตั้ง Library:**

  ```bash
  pnpm add next-intl
  ```

- **การกำหนดค่าหลัก (`next-intl.config.ts`):**
  สร้างไฟล์ที่ root ของโปรเจกต์เพื่อกำหนดค่าภาษาที่รองรับ (`locales`) และภาษาเริ่มต้น (`defaultLocale`) ซึ่งจะถูกใช้เป็นศูนย์กลางอ้างอิงของทั้งระบบ

- **การสร้างไฟล์ข้อความ (`messages/`):**
  สร้างโฟลเดอร์ `messages` ที่ root เพื่อจัดเก็บไฟล์ `.json` สำหรับแต่ละภาษา โดยมีการแบ่งตาม namespace (เช่น `common.json`, `auth.json`) เพื่อความเป็นระเบียบ

- **การโหลดข้อความ (`src/i18n/request.ts`):**
  สร้างฟังก์ชันที่ใช้ `getRequestConfig` จาก `next-intl/server` เพื่อโหลดไฟล์ JSON ที่ถูกต้องตาม `locale` ที่ร้องขอเข้ามา พร้อมมี Logic ในการจัดการกับ `locale` ที่ไม่ถูกต้องโดยจะ fallback ไปใช้ภาษาเริ่มต้นเสมอ

### 2.2 การผสานรวมกับ Routing

- **Middleware (`src/middleware.ts`):**
  ใช้ `createMiddleware` จาก `next-intl` เพื่อสร้าง middleware ที่ทำหน้าที่จัดการ i18n routing โดยอัตโนมัติ โดยมี `matcher` ที่แข็งแรงเพื่อ:
  1. ดักจับทุก request ที่ไม่ใช่ไฟล์ asset หรือ API
  2. ตรวจสอบ locale จาก URL prefix
  3. Redirect ไปยัง defaultLocale หากไม่พบ locale หรือ locale ที่ระบุมาไม่ถูกต้อง
  4. ทำให้ URL มี prefix ภาษาอยู่เสมอ (`localePrefix: 'always'`)

- **โครงสร้างโฟลเดอร์ (`src/app/[lang]/`):**
  หน้าเว็บทั้งหมดที่ต้องการการแปลภาษาจะถูกวางไว้ในไดเรกทอรี `[lang]` เพื่อให้ Next.js ส่ง `lang` parameter มาให้ใช้งานได้

### 2.3 การใช้งานใน Components

- **Provider (`src/app/[lang]/layout.tsx`):**
  ใน `LocaleLayout` จะมีการใช้ `NextIntlClientProvider` เพื่อส่งต่อ `messages` ที่โหลดจากฝั่ง Server ไปให้ Client Components สามารถใช้งานได้

- **การดึงคำแปล:**
  - **Server Components:** ใช้ `const t = await getTranslations(...)` เพื่อดึงและแสดงผลคำแปลโดยตรงบนเซิร์ฟเวอร์
  - **Client Components:** ใช้ `const t = useTranslations(...)` hook เพื่อเข้าถึงคำแปลที่ถูกส่งมาจาก Provider

### 2.4 การจัดการภาษาใน Admin (แผนในอนาคต)

- รายการภาษาที่รองรับจะถูกจัดเก็บในฐานข้อมูล (`model Language`) พร้อม `is_active` flag ทำให้ผู้ดูแลระบบสามารถจัดการภาษาที่แสดงผลบนหน้าเว็บได้ผ่าน Admin UI

## 3. การพัฒนาระบบจัดการรูปภาพ (Media Asset Management)

เริ่มต้นการดำเนินการสำหรับการอัปโหลดและการประมวลผลรูปภาพ ซึ่งเป็นองค์ประกอบสำคัญสำหรับระบบ CMS

### 3.1 การกำหนดค่า Cloud Storage (Supabase Storage)

- **ติดตั้ง Supabase JS Client:**

```bash
pnpm add @supabase/supabase-js
```

- **กำหนดค่า Supabase Client:** สร้างไฟล์ `src/lib/supabase-client.ts`

```ts
// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // ต้องกำหนดใน .env
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // ต้องกำหนดใน .env

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- **เพิ่ม Environment Variables ใน `.env`:**

```env
# .env (หรือ .env.local)
NEXT_PUBLIC_SUPABASE_URL="https://<YOUR_PROJECT_REF>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<YOUR_SUPABASE_ANON_KEY>"
```

- **สร้าง Storage Bucket ใน Supabase Dashboard:**
  - ไปที่ Supabase Dashboard \-\> **"Storage"** (ไอคอนรูปถัง)
  - คลิก **"New bucket"**
  - ตั้งชื่อ Bucket (เช่น `trang-pepper-media`)
  - ตั้งค่า Public/Private ตามต้องการ (สำหรับรูปภาพ Public ควรเป็น Public).
  - **สร้าง Policy สำหรับ Bucket** เพื่อควบคุมการเข้าถึง (สำคัญมากสำหรับ Production)

### 3.2 การดำเนินการ Image Processing (`sharp`)

- **ติดตั้ง `sharp`:**

```bash
pnpm add sharp
pnpm add -D @types/sharp
```

- **สร้าง Service สำหรับ Image Processing:** `src/services/image-processing.ts` (ใช้ใน API Route หรือ Server Action)

```ts
// src/services/image-processing.ts
import sharp from 'sharp';

interface ImageVariant {
  width: number;
  height?: number;
  fit?: keyof sharp.Fit;
  format: keyof sharp.FormatEnum | 'original'; // 'webp', 'jpeg', etc.
  prefix: string; // เช่น 'thumb_', 'medium_'
}

const IMAGE_VARIANTS: ImageVariant[] = [
  { width: 150, height: 150, fit: 'cover', format: 'webp', prefix: 'thumb_' },
  { width: 800, format: 'webp', prefix: 'medium_' },
  { width: 1200, format: 'webp', prefix: 'large_' },
];

/**
 * Processes an image buffer into various optimized formats and sizes.
 * @param imageBuffer The image buffer to process.
 * @returns An array of objects containing variant buffer, filename, and mimeType.
 */
export async function processImage(imageBuffer: Buffer, originalFilename: string) {
  const processedImages = [];
  const originalFormat = originalFilename.split('.').pop()?.toLowerCase() || 'jpeg';

  for (const variant of IMAGE_VARIANTS) {
    let image = sharp(imageBuffer);

    // Resize
    if (variant.width || variant.height) {
      image = image.resize(variant.width, variant.height, { fit: variant.fit });
    }

    // Convert format
    if (variant.format !== 'original') {
      image = image.toFormat(variant.format);
    }

    const outputBuffer = await image.toBuffer();
    const filename = `${variant.prefix}${originalFilename.split('.').slice(0, -1).join('.')}.${variant.format}`;
    const mimeType = `image/${variant.format}`; // Adjusted mimeType based on format

    processedImages.push({
      buffer: outputBuffer,
      filename,
      mimeType,
    });
  }

  // Include original image as a variant
  processedImages.push({
    buffer: imageBuffer,
    filename: originalFilename,
    mimeType: `image/${originalFormat}`,
  });

  return processedImages;
}
```

- **สร้าง Service สำหรับ Media File Upload/Management:** `src/services/media.ts` (ใช้ Supabase Storage Client)

```ts
// src/services/media.ts
import { supabase } from '@/lib/supabase-client';
import prisma from '@/lib/prisma';
import { processImage } from './image-processing'; // Import image processing service
import { LocalizedString } from '@/types/i18n'; // Import LocalizedString

const BUCKET_NAME = 'trang-pepper-media'; // ชื่อ Bucket ใน Supabase Storage

export interface MediaUploadInput {
  filename: string;
  mimeType: string;
  fileSize: number;
  buffer: Buffer; // Raw image data
  altText?: LocalizedString;
  caption?: LocalizedString;
}

export interface MediaUpdateInput {
  altText?: LocalizedString;
  caption?: LocalizedString;
  isSystem?: boolean;
}

export const mediaService = {
  async uploadMedia(input: MediaUploadInput) {
    const { filename, mimeType, fileSize, buffer, altText, caption } = input;

    // 1. Process image variants (e.g., thumbnail, medium, large)
    const processedVariants = await processImage(buffer, filename);

    const uploadedUrls: { [key: string]: string } = {}; // { original: url, thumb: url, medium: url }

    // 2. Upload to Supabase Storage
    for (const variant of processedVariants) {
      const filePath = `${Date.now()}_${variant.filename}`; // Unique path for each variant
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, variant.buffer, {
          contentType: variant.mimeType,
          upsert: false, // Don't overwrite if exists
        });

      if (error) throw new Error(`Supabase upload failed: ${error.message}`);

      const publicUrlResponse = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      if (publicUrlResponse.error)
        throw new Error(`Supabase get public URL failed: ${publicUrlResponse.error.message}`);
      uploadedUrls[variant.filename.split('_')[0] || 'original'] = publicUrlResponse.data.publicUrl;
    }

    // 3. Save media metadata to Prisma
    const newMedia = await prisma.media.create({
      data: {
        filename,
        originalUrl: uploadedUrls['original'], // Original URL
        mimeType,
        fileSize,
        altText: altText || {}, // default to empty object for JSONB
        caption: caption || {},
        variants: uploadedUrls, // Store all variant URLs as JSONB
      },
    });

    return newMedia;
  },

  async getMediaById(id: string) {
    return prisma.media.findUnique({ where: { id } });
  },

  async getAllMedia() {
    return prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateMedia(id: string, data: MediaUpdateInput) {
    // Implement RBAC check if needed
    return prisma.media.update({ where: { id }, data });
  },

  async deleteMedia(id: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) throw new Error('Media not found');
    if (media.isSystem) throw new Error('Cannot delete system media.');

    // Delete from Supabase Storage first
    const variants = media.variants as { [key: string]: string };
    const filePathsToDelete = Object.values(variants).map((url) => {
      // Extract path from public URL (e.g., .../storage/v1/object/public/bucket_name/path_to_file)
      const parts = url.split('/');
      return parts.slice(parts.indexOf(BUCKET_NAME) + 1).join('/');
    });

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePathsToDelete);
    if (deleteError) console.error('Failed to delete files from Supabase Storage:', deleteError);

    // Delete from database
    return prisma.media.delete({ where: { id } });
  },
};
```

- **ปรับปรุง `src/lib/auth/constants.ts` (เพิ่ม RESOURCES):**

```ts
// src/lib/auth/constants.ts (เพิ่ม PERMISSION_RESOURCES)
export const PERMISSION_RESOURCES = {
  // ... existing resources
  MEDIA: 'MEDIA', // เพิ่มสำหรับ Media
} as const;
```

- **ปรับปรุง `src/lib/auth/index.ts` (Export service):**

```ts
// src/lib/auth/index.ts
// ... (existing exports)
export * from './options';
export * from './schemas';
export * from './service';
export * from './utils';
export * from './constants';
// export * from '../../services/product'; // ตัวอย่าง ถ้า product service ถูกย้ายไปที่ src/lib/product-service
// export * from '../../services/media'; // ตัวอย่าง
```

#### 3.3.3 การสร้าง API สำหรับ Media (tRPC Router)

- สร้างไฟล์ **`src/server/routers/content/media.ts`**

```ts
// src/server/routers/content/media.ts
import { router, publicProcedure, protectedProcedure, authorizedProcedure } from '@southern-syntax/trpc';
import { mediaService, MediaUploadInput, MediaUpdateInput } from '@/services/media'; // หรือ '@/lib/media-service'
import { PERMISSION_RESOURCES, PERMISSION_ACTIONS } from '@/lib/auth/constants';
import { z } from 'zod';
import { LocalizedString } from '@/types/i18n'; // Import LocalizedString type

// Zod Schema สำหรับ AltText และ Caption ที่เป็น LocalizedString
const localizedStringSchema = z.record(z.string(), z.string());

// Zod Schema สำหรับ Media Upload/Update Input (คล้ายกับใน service)
// ควรสร้างใน src/lib/schemas หรือ src/schemas/media.ts
const mediaUploadInputSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'Mime type is required'),
  fileSize: z.number().int().min(0, 'File size must be non-negative'),
  // buffer: z.any(), // tRPC doesn't directly support Buffer in input without custom transformers
  altText: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
});

const mediaUpdateInputSchema = z.object({
  altText: localizedStringSchema.optional(),
  caption: localizedStringSchema.optional(),
  isSystem: z.boolean().optional(),
});

export const mediaRouter = router({
  // อัปโหลดไฟล์ (ซับซ้อนกว่าเพราะต้องจัดการ Buffer)
  // tRPC ไม่ได้จัดการ multipart/form-data โดยตรง
  // อาจจะต้องสร้าง Next.js Route Handler ปกติสำหรับอัปโหลดไฟล์
  // แล้วเรียกใช้ mediaService.uploadMedia จากนั้น tRPC จะจัดการแค่ metadata
  // หรือใช้ tRPC transformers สำหรับ Buffer (Advanced)

  // getAll media (Admin UI listing)
  getAll: authorizedProcedure(PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.READ).query(
    async ({ ctx }) => {
      // เพิ่ม ctx parameter
      return mediaService.getAllMedia();
    },
  ),

  // get media by ID
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return mediaService.getMediaById(input.id);
  }),

  // update media metadata (altText, caption, isSystem)
  update: authorizedProcedure(PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.UPDATE)
    .input(z.object({ id: z.string(), data: mediaUpdateInputSchema }))
    .mutation(async ({ input, ctx }) => {
      // เพิ่ม ctx parameter
      return mediaService.updateMedia(input.id, input.data);
    }),

  // delete media
  delete: authorizedProcedure(PERMISSION_RESOURCES.MEDIA, PERMISSION_ACTIONS.DELETE)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // เพิ่ม ctx parameter
      return mediaService.deleteMedia(input.id);
    }),
});
```

- **ปรับปรุง `src/server/routers/_app.ts`:**

```ts
// src/server/routers/_app.ts (ส่วนที่แก้ไข)
import { router } from '../trpc';
import { productRouter } from './content/product';
// import { mediaRouter } from './content/media'; // Import mediaRouter
// import { categoryRouter } from './content/category';
// import { postRouter } from './content/post';
// import { languageRouter } from './content/language';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => ({ status: 'ok' })),
  product: productRouter,
  // media: mediaRouter, // เพิ่ม mediaRouter
  // category: categoryRouter,
  // post: postRouter,
  // language: languageRouter,
});

export type AppRouter = typeof appRouter;
```

#### 3.3.4 การสร้าง Admin UI สำหรับ Media Library

- สร้างหน้า Admin UI ใน `src/app/[lang]/admin/media/page.tsx`
- ใช้ tRPC Client (`trpc.media.getAll.useQuery()`) เพื่อดึงข้อมูล Media และแสดงผล
- **การอัปโหลดไฟล์ใน Admin UI:** เนื่องจาก tRPC ไม่ได้จัดการ `multipart/form-data` โดยตรง คุณจะต้องสร้าง **Next.js Route Handler ปกติ** (REST API) สำหรับการอัปโหลดไฟล์ และเรียกใช้จาก Client Component ใน Admin UI
