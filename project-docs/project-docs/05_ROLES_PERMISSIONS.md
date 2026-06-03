# Roles & Permissions (RBAC)

## 1. Role Definitions
The application enforces strict Role-Based Access Control (RBAC). 
1. **Admin (`admin`)**: Superuser with complete visibility across all facilities, modules, and financial data.
2. **HR (`hr`)**: Manages personnel files, onboarding, leave balances, and processes payroll.
3. **Manager (`manager`)**: Oversees day-to-day operations, ward shifts, approves leave, and logs staff competencies.
4. **Compliance (`compliance`)**: Specialized role focused purely on audits, policies, document expirations, and regulatory adherence.
5. **Employee (`employee`)**: Standard frontline staff viewing their own schedules, logging time, and requesting personal leave.
6. **Receptionist (`receptionist`)**: Restricted role granting access only to the Visitor Tablet interface and basic settings.

## 2. Permission Matrix
*(Access definitions: **R** = Read, **C** = Create, **E** = Edit, **D** = Delete, **-** = No Access)*

| Module | Admin | HR | Manager | Compliance | Employee | Receptionist |
|--------|-------|----|---------|------------|----------|--------------|
| Dashboard | R | R | R | R | R | R |
| Employees Directory | R/C/E/D | R/C/E/D | R/E | R | R (Self) | - |
| Rota Calendar | R/C/E/D | R | R/C/E | R | R (Self) | - |
| Shift Planning | R/C/E/D | R | R/C/E | R | R (Self) | - |
| Day Notes | R/C/E/D | R | R/C/E | R | R/C | - |
| Attendance (Time Log) | R/E/D | R/E | R/C/E | R | R/C (Self) | - |
| Leave Management | R/C/E/D | R/C/E | R/C/E | R | R/C (Self) | - |
| Payroll | R/E | R/C/E | R | - | R (Self) | - |
| Documents & Policies | R/C/E/D | R/C/E | R/C | R/C/E/D | R | - |
| Observation Mgmt | R/C/E/D | R | R/C/E | R/E | R/C | - |
| Competency Tracking| R/C/E/D | R/C/E | R/C/E | R/E | R (Self) | - |
| Compliance Audits | R/C/E/D | - | R | R/C/E/D | - | - |
| Visitor Tablet | R/C/E/D | - | - | - | - | R/C/E |
| Reports | R/C | R/C | R | R/C | - | - |
| Settings | R/C/E/D | R/C/E | R/C/E | R/E | R/E (Self) | R/E (Self) |

## 3. Enforcement Strategy
- **Sidebar Visibility:** Configured via `src/constants/menus.js`. If a role does not have access to a module, the navigation link simply does not render.
- **Route Protection:** Configured via `src/routes/AppRoutes.jsx`. Even if a user attempts to manually type a URL (e.g. an Employee typing `/hr/payroll`), the `RoleBasedRoute` component intercepts and throws a `403 Access Denied`.
