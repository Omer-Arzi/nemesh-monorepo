/**
 * Shared primitive components — the lowest level of the component hierarchy.
 *
 * What belongs here: UI building blocks used across many features that have
 * no knowledge of any specific feature or domain.
 *
 * What does NOT belong here: anything that knows about a feature's data
 * (that belongs in features/<feature>/components/).
 */
export { default as PageContainer } from "./PageContainer";
export { default as Section } from "./Section";
export { default as SectionHeader } from "./SectionHeader";
export { default as AppButton } from "./AppButton";
export { default as SearchInput } from "./SearchInput";
export { default as EmptyState } from "./EmptyState";
export { default as LoadingState } from "./LoadingState";
export { default as ErrorState } from "./ErrorState";
export { default as NemeshImage } from "./NemeshImage";
export type { NemeshImageProps } from "./NemeshImage";
export { FreckleDust } from "./FreckleDust";
export type { FrecklePlacement, FreckleDensity } from "./FreckleDust";
export { BlockRenderer } from "./BlockRenderer";
export { default as SiteLogo } from "./SiteLogo";
export type { SiteLogoVariant } from "./SiteLogo";
