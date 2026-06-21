# providers/

React context providers composed for the Next.js App Router.

## What belongs here

Global providers that wrap the entire application: theme, data-fetching,
auth context, toast/notification systems.

## What does NOT belong here

Feature-specific contexts (keep those inside the feature folder) or any
server components (all providers must be `"use client"`).

## Composition

All providers are composed in `index.tsx` (`RootProviders`) and mounted
once in `src/app/layout.tsx`.  Add a new provider by wrapping the existing
children in `RootProviders` — keep the nesting order documented there.
