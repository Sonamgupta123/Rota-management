# Routes & Menus Hierarchy

## 1. Public Routes
Unauthenticated routes accessible by any visitor.
- `/` - Root probe. Redirects dynamically to `/login` if unauthenticated, or to the specific role dashboard (e.g., `/hr/dashboard`) if an active session exists.
- `/login` - Primary authentication portal.
- `/forgot-password` - Password recovery flow.
- `/reset-password` - Secure password reset interface.
- `/403` - Access Denied page for unauthorized internal navigation.
- `/*` - 404 Not Found wildcard catcher.

## 2. Protected Routes Hierarchy
All internal routes sit behind `ProtectedRoute.jsx` (which verifies session existence) and `RoleBasedRoute.jsx` (which verifies the role matches the slug).

### 2.1 Admin Namespace (`/admin/*`)
- `/admin/dashboard`
- `/admin/employees`
- `/admin/documents`
- `/admin/rota`
- `/admin/shift-planning`
- `/admin/day-notes`
- `/admin/attendance`
- `/admin/leave`
- `/admin/payroll`
- `/admin/reports`
- `/admin/visitor-tablet`
- `/admin/audits`
- `/admin/observation`
- `/admin/competency`
- `/admin/settings`

### 2.2 HR Namespace (`/hr/*`)
- `/hr/dashboard`
- `/hr/employees`
- `/hr/documents`
- `/hr/leave`
- `/hr/payroll`
- `/hr/rota`
- `/hr/shift-planning`
- `/hr/day-notes`
- `/hr/attendance`
- `/hr/competency`
- `/hr/settings`

### 2.3 Manager Namespace (`/manager/*`)
- `/manager/dashboard`
- `/manager/employees`
- `/manager/rota`
- `/manager/shift-planning`
- `/manager/day-notes`
- `/manager/attendance`
- `/manager/documents`
- `/manager/leave`
- `/manager/payroll`
- `/manager/audits`
- `/manager/observation`
- `/manager/competency`
- `/manager/settings`

### 2.4 Compliance Namespace (`/compliance/*`)
- `/compliance/dashboard`
- `/compliance/audits`
- `/compliance/documents`
- `/compliance/rota`
- `/compliance/shift-planning`
- `/compliance/day-notes`
- `/compliance/attendance`
- `/compliance/observation`
- `/compliance/competency`
- `/compliance/settings`

### 2.5 Employee Namespace (`/employee/*`)
- `/employee/dashboard`
- `/employee/rota`
- `/employee/shift-planning`
- `/employee/day-notes`
- `/employee/attendance`
- `/employee/documents`
- `/employee/leave`
- `/employee/payroll`
- `/employee/observation`
- `/employee/competency`
- `/employee/settings`

### 2.6 Receptionist Namespace (`/receptionist/*`)
- `/receptionist/dashboard`
- `/receptionist/settings`

## 3. Sidebar Configuration (`src/constants/menus.js`)
Sidebar menus dynamically generate based on the authenticated user's role array map. The `icon` definitions utilize the `lucide-react` library. Sub-menus are not currently deployed; the structure is strictly flat for optimal mobile usability.
