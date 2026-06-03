# Product Requirements Document (PRD)
## 1. Project Overview
**Project Name:** Rota Management System (Care Home Workforce Management)
**Current Stage:** UI/Frontend Phase (Backend not integrated yet)

### 1.1 Project Vision
To create an enterprise-grade, comprehensive workforce management application tailored for healthcare and care home environments. The system aims to simplify complex administrative tasks like rota scheduling, attendance tracking, compliance monitoring, and payroll calculation into a unified, secure, and intuitive web platform.

### 1.2 Business Goals
- Eliminate manual and paper-based scheduling and attendance tracking.
- Ensure strict compliance with healthcare regulations and internal policies.
- Provide clear visibility into staff availability, leave, and payroll.
- Empower different organizational tiers (Admin, HR, Manager, Employees) with customized workflows.

### 1.3 Problem Statement
Care homes often struggle with fragmented systems for scheduling, tracking staff attendance, managing compliance documents, and calculating payroll. This fragmentation leads to administrative overhead, compliance risks, and staff dissatisfaction. A centralized, role-based system is required to unify these operations safely.

## 2. Target Audience & Roles
**Target Users:** Care home administrators, HR personnel, ward managers, frontline care staff, compliance officers, and receptionists.

**Roles & User Types:**
1. **Super Admin / Admin:** Unrestricted access to all modules, system configurations, and master data.
2. **HR:** Manages personnel records, leave policies, payroll processing, and employee onboarding.
3. **Manager:** Oversees daily operational shifts, approvals, day notes, and staff observation.
4. **Compliance Officer:** Monitors regulatory compliance, training certificates, and incident reports.
5. **Employee:** Frontline staff who view rotas, clock in/out, submit leave, and read policies.
6. **Receptionist:** Manages visitor logs and front-desk check-ins via the Visitor Tablet module.

## 3. Functional Requirements
### 3.1 Modules & Features
- **Authentication & Security:** Secure login interface, password recovery, and strict role-based route protection. Unauthenticated users are redirected to `/login`.
- **Dashboard:** Role-specific landing pages displaying customized KPIs, pending actions, and live statistics.
- **Employees Module:** Staff directory, profile management, onboarding, and termination workflows.
- **Rota Management & Calendar:** Drag-and-drop shift scheduling, shift templates, conflict detection, and calendar views.
- **Attendance & Time Tracking:** Clock in/out tracking, automated break deductions, and timesheet approvals.
- **Leave Management:** Time-off requests, accrued balances, and manager approval workflows.
- **Payroll System:** Automated wage calculation based on attendance, standard deductions, and exportable registries.
- **Compliance & Documents:** Expiry tracking for mandatory training, policy distribution, and audit logging.
- **Day Notes / Handovers:** Secure shift-to-shift communication and resident observation logs.
- **Visitor Tablet:** Digital sign-in/sign-out kiosk interface for guests and contractors.

### 3.2 Dashboard Requirements
- Must provide immediate visual insight into critical metrics (e.g., active shifts, pending leave, compliance alerts).
- Must be tailored exactly to the authenticated user's role.
- Must collapse gracefully on mobile devices (Responsive Grid).

### 3.3 Form Requirements
- All forms must render as Modal popups floating over the application UI via React Portals.
- Every modal must feature a top-right 'X' close button.
- Forms must utilize responsive grid layouts (`grid-cols-1 sm:grid-cols-2`) to stack inputs on smaller screens.

### 3.4 Reporting Requirements
- Export functionality for Payroll registries (CSV format).
- Visual charts and data tables for compliance audits and attendance anomalies.

## 4. Non-Functional Requirements
### 4.1 UI/UX Requirements
- Must employ a premium, modern design language utilizing Tailwind CSS.
- Extensive use of glassmorphism, micro-animations, and vibrant color palettes (e.g., brand-600, indigo, emerald).
- Strict adherence to responsive design (Mobile, Tablet, Desktop) preventing horizontal scrolling via `overflow-x-auto` wrappers on tables.

### 4.2 Security Considerations (Frontend perspective)
- Immediate forced redirection for unauthenticated root (`/`) access.
- Role-based Route Protection (`RoleBasedRoute.jsx`) rendering a 403 Access Denied page for unauthorized internal navigation.
- Safe 404 Not Found handling.

### 4.3 Assumptions & Dependencies
- **Assumptions:** The backend will provide robust RESTful APIs returning standard JSON payloads. Token-based authentication (JWT) will be utilized.
- **Dependencies:** React.js, React Router DOM, Tailwind CSS, Lucide React (Icons), and Context API for state.

## 5. Future Scope & Success Criteria
- **Future Scope:** Integration with live backend endpoints, WebSockets for live visitor tracking, mobile app wrapper, and automated SMS/Email notifications.
- **Success Criteria:** A flawlessly functioning UI where no routes break, role boundaries are strictly enforced visually and programmatically, and user workflows require zero training due to intuitive design.
