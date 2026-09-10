import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// `next/font/google` is a build-time transform (SWC plugin) with no runtime
// implementation — calling it under Vitest throws. Stub it with the same
// shape next/font returns so shared modules that instantiate a font (e.g.
// src/lib/fonts.ts) load in tests.
vi.mock("next/font/google", () => ({
  Heebo: () => ({
    className: "mock-heebo",
    variable: "mock-heebo-variable",
    style: { fontFamily: "Heebo" },
  }),
}));

// jsdom does not implement matchMedia; MUI's useMediaQuery needs it.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
