// นี่คือ Next.js Route Handler สำหรับ tRPC API
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app"; // Import Root tRPC Router
import { createTRPCContext } from "@/server/trpc"; // Import tRPC Context creator

// Handler สำหรับทั้ง GET และ POST requests
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc", // URL ของ API endpoint ที่ Frontend จะเรียกใช้
    req, // Request object
    router: appRouter, // Root tRPC Router ของเรา
    createContext: createTRPCContext, // ฟังก์ชันสำหรับสร้าง context
    // onError: สำหรับ Production Logging และ Debugging ใน Development
    onError:
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            // ใน Development, แสดง Error บน Console
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined, // ใน Production, อาจจะใช้บริการ Logging อื่นๆ
  });

// Export handlers สำหรับ Next.js App Router
export { handler as GET, handler as POST };
