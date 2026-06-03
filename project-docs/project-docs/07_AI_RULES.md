# AI Assistant Guidelines & Code Refactoring Rules

**CRITICAL DIRECTIVE:** Any AI agent (e.g., Cursor, Windsurf, Claude Code, GitHub Copilot) analyzing this repository MUST adhere to these strict rules before making any code modifications. Failure to adhere to these rules will break the application architecture.

## Strict Rules Checklist (50 Rules)

### Core Architectural Integrity
1. **Never delete `MainLayout.jsx`.** It wraps the entire authenticated experience.
2. **Never delete `AppRoutes.jsx`.** It is the master routing configuration.
3. **Never break `ProtectedRoute.jsx` or `RoleBasedRoute.jsx`.** They secure the application.
4. **Login opens first.** The `/login` page must always be the first screen a user sees on a cold start.
5. **Root routing redirects.** The root URL (`/`) must dynamically redirect to `/login` or the appropriate authenticated role dashboard.
6. **Backend is Read-Only conceptually.** This project is strictly the UI/Frontend phase. Do not add backend models or databases here.
7. **Frontend Only.** All operations must be browser-compatible React code.
8. **Never remove Dashboards.** `AdminDashboard`, `HRDashboard`, etc., are critical entry points.
9. **Preserve Sidebar UI.** Never delete or dramatically alter `Sidebar.jsx` without explicit instructions.
10. **Preserve Header UI.** Never delete `Header.jsx`.

### Component & File Deletion Protocols
11. **Check imports before deleting.** Run a workspace-wide search for the filename before assuming it is unused.
12. **Check exports before deleting.** Ensure the module is not implicitly exported from an index file.
13. **Check routes before deleting pages.** A page component might be dynamically loaded via `AppRoutes.jsx`.
14. **Check menus before deleting components.** Menus map to routes which map to components.
15. **Check dynamic imports.** Ensure no `React.lazy()` or dynamic `import()` calls reference the file.
16. **Never delete feature components.** Files in `src/components/features/` (e.g. `Employees.jsx`) hold heavy business logic.
17. **Do not remove shared context.** `AppContext.jsx` is the backbone of state management.
18. **Do not delete constants.** `roles.js` and `menus.js` define the core application structures.
19. **Never delete `.md` files.** Project documentation must be preserved.
20. **Never delete `.doc` or `.docx` files.** Business requirement documents must be kept intact.

### UI & Styling Rules
21. **Never break existing UI.** Ensure changes degrade gracefully.
22. **Always use Tailwind CSS.** Do not introduce standard CSS files unless globally required.
23. **Preserve Responsive Overflows.** Never remove `<div className="overflow-x-auto">` from `<table>` wrappers.
24. **Preserve Modal Layouts.** Always use `createPortal` for modals.
25. **Preserve Grid Collapsing.** Forms must use `grid-cols-1 sm:grid-cols-2`. Do not hardcode fixed columns.
26. **Maintain Z-Index Hierarchies.** Modals and overlays rely on specific z-indexes to block the underlying page.
27. **Do not alter Brand Colors.** Rely on existing `text-brand-600` and `bg-brand-50` classes.
28. **Preserve Glassmorphism.** Retain `backdrop-blur` and `glass-card` classes for premium aesthetics.
29. **Close icons are mandatory.** Every modal must have an 'X' button in the top right.
30. **No Horizontal Scrolling on Desktop.** Ensure page layouts fit within `100vw`.

### Routing & Navigation
31. **Never remove routes.** You may consolidate them, but the URL path must continue to function.
32. **Never remove menus.** The sidebar must reflect all active routes.
33. **Preserve Navigation.** `useNavigate` hooks must point to correct slugs.
34. **Role slugs must match.** Ensure the slug in `ROLE_SLUGS` strictly matches the `Route path` in `AppRoutes`.
35. **Graceful 404s.** Unmatched routes must hit the `NotFound.jsx` component.
36. **Graceful 403s.** Unauthorized access must hit the `AccessDenied.jsx` component.

### Business Logic & State
37. **Preserve functionality.** Refactoring must be functionally invisible to the end user.
38. **Assume Enterprise Grade.** Write robust, type-safe (or prop-type validated) code.
39. **Mock Data Preservation.** Do not delete `src/utils/mockData.js` until a real backend is integrated.
40. **State Management Strategy.** Rely on `AppContext` for global state. Do not arbitrarily introduce Redux unless instructed.
41. **Role Permissions.** Do not bypass RBAC checks for convenience.
42. **API Isolation.** When adding APIs later, create dedicated `services/` or `hooks/` directories. Do not fetch directly inside UI components.

### Best Practices & Workflow
43. **Analyze existing project.** Look at surrounding files before writing new code.
44. **Understand role-based structure.** Know the difference between Admin and Manager before altering a feature.
45. **Write professional code.** Use clear variable names and explicit comments.
46. **Long-term maintenance.** Code should be written so another developer (or AI) can read it 6 months later.
47. **Safe refactoring.** Run `npm run build` locally after any structural change.
48. **Check dependencies.** Run a dependency analysis before proposing npm package removals.
49. **Log changes.** Update `CHANGELOG.md` when introducing major structural modifications.
50. **Read Documentation First.** AI agents must read `01_PRD.md` through `06_ROUTES_MENUS.md` prior to any code generation.
