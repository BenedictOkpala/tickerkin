import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  readonly ok: true;
  readonly data: T;
}

export interface ApiErrorResponse {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standard Cache-Control header for static verified registry lookups.
 * Allows client and edge CDN caching while keeping responses fresh.
 */
const DEFAULT_CACHE_CONTROL = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

export function successResponse<T>(
  data: T,
  status = 200,
  cacheControl = DEFAULT_CACHE_CONTROL
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {
      status,
      headers: {
        "Cache-Control": cacheControl,
        "Content-Type": "application/json",
      },
    }
  );
}

export function errorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    }
  );
}
