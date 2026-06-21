import { z } from "zod";

/**
 * Shared primitive Zod schemas used across multiple features.
 *
 * Why here: keeps common validation rules (email format, password strength,
 * non-empty string, etc.) in one place so features don't each define their
 * own slightly different variant.
 *
 * What belongs here: primitive validators and small re-usable schema
 * fragments that are not tied to a specific domain entity.
 *
 * What does NOT belong here: full entity schemas (those live in
 * src/features/<feature>/schemas.ts) or API response shapes (those live
 * in src/types/api.ts).
 *
 * TODO: Extend with project-specific primitives as forms are built.
 */

export const zEmail = z
  .string()
  .min(1, "Email is required")
  .email("Must be a valid email address");

export const zPassword = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const zNonEmptyString = z
  .string()
  .min(1, "This field is required")
  .trim();

export const zId = z.string().uuid("Must be a valid ID");
