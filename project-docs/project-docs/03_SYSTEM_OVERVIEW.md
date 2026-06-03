# System Overview

## 1. Project Summary
The **Rota Management System** is a bespoke, enterprise-level web application designed specifically for care homes and healthcare institutions. It centralizes all operational, administrative, and compliance requirements into a single, unified digital platform. 

## 2. System Purpose
To replace fragmented paper trails, physical punch cards, and disparate spreadsheets with a unified, role-based React.js application. It ensures data accuracy, compliance adherence, and simplifies complex scheduling and payroll tasks.

## 3. High-Level Architecture Summary
The application is built on a **React.js Single Page Application (SPA)** architecture.
- **Routing:** Handled entirely by `react-router-dom` with strict nested layouts.
- **State:** Centrally managed via React Context API (`AppContext.jsx`) to simulate a robust store.
- **Styling:** Tailored using `Tailwind CSS`, relying heavily on responsive utility classes (`sm:`, `md:`, `lg:`) and custom CSS variables defined in `index.css`.
- **Security Perimeter:** Hardened at the routing layer. Unauthenticated users are sandboxed in `/login` and public routes.

## 4. Main Modules
1. **Dashboard Analytics:** Role-specific KPIs.
2. **Rota / Shift Planning:** Calendar interfaces for scheduling.
3. **Employees / HR:** Master personnel records.
4. **Attendance & Payroll:** Financial calculation engine.
5. **Compliance & Documents:** Regulatory audit trailing.
6. **Day Notes:** Secure internal communication.

## 5. User Roles
- **Super Admin:** Ultimate oversight.
- **HR:** Focuses on personnel, leave, and payroll.
- **Manager:** Focuses on shifts, daily operations, and approvals.
- **Compliance:** Focuses on training and audits.
- **Employee:** Focuses on personal shifts, timesheets, and leave.
- **Receptionist:** Focuses on building access and visitor tracking.

## 6. Current Development Stage
**Frontend UI/UX Phase.** The application is fully visually mapped. Forms, navigation, roles, routing, and responsive behaviors are fully operational. State is temporarily managed in memory (mock data) via React Context.

## 7. Future Backend Integration Plan
The frontend is built to be agnostic. 
- Context methods (e.g. `addEmployee`, `login`) currently mutating local state arrays will be swapped out for `fetch` or `axios` API calls.
- `useEffect` hooks will trigger on mount to fetch data dynamically from REST APIs.
- The UI will natively support async loading states and spinners without structural refactoring.
