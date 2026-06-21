# components/

Shared, feature-agnostic UI components.

## Sub-folders

| Folder    | Purpose                                                          |
|-----------|------------------------------------------------------------------|
| `shared/` | Primitive UI building blocks (LoadingSpinner, ErrorBoundary, …)  |
| `layout/` | Structural shells (AppShell, PageContainer, TopNav, SideNav)     |
| `forms/`  | RHF-wired MUI field wrappers (ControlledTextField, …)            |

## What belongs here

Components that do not import from `src/features/` and carry no domain logic.

## What does NOT belong here

Feature-specific UI → `src/features/<feature>/components/`.  If a component
starts importing from a feature folder, it should move there.
