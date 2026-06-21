/**
 * API configuration constants.
 *
 * Why here: centralises environment-specific values so changing the API URL
 * for staging vs production requires editing exactly one place.
 *
 * What belongs here: base URL, timeout, default headers, API versioning path.
 *
 * What does NOT belong here: authentication tokens (those come from the auth
 * store at runtime), endpoint paths (those live in each service file).
 */

export const API_CONFIG = {
  /** Base URL of the backend API. Reads from env; falls back to localhost. */
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1337/api",

  /** Default request timeout in milliseconds. */
  timeoutMs: 15_000,

  headers: {
    "Content-Type": "application/json",
  },
} as const;
