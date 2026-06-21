<!-- BEGIN:nextjs-agent-rules -->

# Next.js version-specific rules

This project may use a newer Next.js version than the model's training data.

Before writing or modifying any Next.js code:

1. Inspect the installed Next.js version from `package.json`.
2. Read the relevant local documentation under `node_modules/next/dist/docs/` when available.
3. Prefer the project's existing conventions over generic Next.js assumptions.
4. Do not assume APIs, routing conventions, config options, metadata handling, caching behavior, or file structure from older Next.js versions.
5. Pay attention to deprecation notices and breaking changes.
6. If unsure, verify against the installed package and local docs before implementing.

Do not rewrite the app structure unless explicitly requested.
Do not introduce Pages Router patterns into an App Router project.
Do not change framework configuration unless necessary for the requested task.

<!-- END:nextjs-agent-rules -->
