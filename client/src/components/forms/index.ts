/**
 * Reusable form building blocks.
 *
 * Why forms/: form components (ControlledTextField, ControlledSelect,
 * ControlledCheckbox) abstract the React Hook Form Controller wiring so
 * feature forms don't repeat the same boilerplate.
 *
 * What belongs here: RHF-wired MUI field wrappers that are domain-agnostic
 * (ControlledTextField, ControlledSwitch, FormSection, SubmitButton).
 *
 * What does NOT belong here: actual forms for a specific feature (those live
 * in features/<feature>/components/) or form-level validation schemas
 * (those live in features/<feature>/schemas.ts or lib/validation/).
 *
 * TODO: Build controlled field wrappers as the first forms are designed.
 */

export {};
