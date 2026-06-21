import type { ApiError } from "@/types/api";
import { API_CONFIG } from "./config";

/**
 * Thin fetch wrapper that all service functions should use.
 *
 * Why here: a single client means auth injection, error normalisation, and
 * request/response logging happen in one place instead of being duplicated
 * across every fetch call.
 *
 * What belongs here: transport concerns — headers, auth token attachment,
 * timeout, generic error normalisation, response parsing.
 *
 * What does NOT belong here: business logic, endpoint paths, or any knowledge
 * of specific resources (those live in services/).
 *
 * TODO: Add auth token injection once the auth layer is implemented.
 * TODO: Consider replacing with axios if richer interceptor support is needed.
 */

type RequestOptions = RequestInit & {
  /** Typed request body — will be JSON.stringified automatically. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
};

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers: extraHeaders, ...rest } = options;

  const url = `${API_CONFIG.baseURL}${path}`;

  const headers: HeadersInit = {
    ...API_CONFIG.headers,
    ...(extraHeaders as Record<string, string>),
    // TODO: inject auth token here
    // ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(API_CONFIG.timeoutMs),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error: ApiError = {
      status: response.status,
      message:
        (errorBody as { message?: string }).message ?? response.statusText,
      details: errorBody,
    };
    throw error;
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request<T>(path, { ...options, method: "POST", body: body as any }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request<T>(path, { ...options, method: "PUT", body: body as any }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request<T>(path, { ...options, method: "PATCH", body: body as any }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
