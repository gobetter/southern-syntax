import { ZodError } from "zod";

import { TranslatedUploadError } from "@southern-syntax/utils";

function jsonResponse(body: unknown, init: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

export function handleApiError(error: unknown): Response {
  console.error("[API Error]", error);

  if (error instanceof ZodError) {
    return jsonResponse(
      {
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (error instanceof TranslatedUploadError) {
    return jsonResponse(
      {
        error: error.messageKey,
        context: error.context,
      },
      { status: 400 }
    );
  }

  return jsonResponse(
    { error: "unexpected_error", context: {} },
    { status: 500 }
  );
}
