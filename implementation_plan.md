# Implementation Plan - Refactoring Employee Section, Header, Sidebar, and Settings

Refactor the employee section into a full list-to-detail navigation flow, remove the Navbar role switcher, restrict the profile dropdown to a simple "Logout" action, and add a dedicated "Settings" panel in the sidebar to handle profile updates.

## User Review Required

> [!IMPORTANT]
> The role switcher will be removed from the Navbar. To test different roles (Admin, HR, Compliance, Manager, Receptionist, Employee), users will log in with appropriate credentials or we can keep a hidden dev-mode switcher or simple debug mechanism if desired, but as requested, it is completely removed from the navbar.
> Clicking on the profile avatar will now ONLY show a "Sign Out Session" (Logout) button. All profile updates and settings will be consolidated in the "Settings" tab in the sidebar.

## Proposed Changes

### [Core State & Context]

#### [MODIFY] [AppContext.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/context/AppContext.jsx)
- Implement `updateEmployee` function that updates the details of a given employee in the `employees` state.
- Expose `updateEmployee` in `AppContext.Provider`.
- Expose the current logged-in employee dynamically or active employee details so they can be modified on the Settings page.

---

### [Components]

#### [MODIFY] [Header.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/components/Header.jsx)
- Remove the Role Switcher dropdown selector in the navigation bar completely.
- Modify the Profile Dropdown to remove "My Profile Details", "Settings & Security", and their dividers.
- Retain only the "Sign Out Session" (Logout) button in the profile dropdown.

#### [MODIFY] [Sidebar.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/components/Sidebar.jsx)
- Append `{ id: 'settings', label: 'Settings', icon: Settings }` to the navigation links array returned by `getNavLinks()` for all roles.
- Ensure the sidebar highlights the "Settings" tab when active.

---

### [Views]

#### [NEW] [Settings.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/views/Settings.jsx)
- Create a beautiful, responsive settings view page.
- Implement a "Profile Update" section as the core feature of the settings page:
  - Input fields: Full Name, Date of Birth, Email Address, Phone Number, Home Address, and Emergency Contact.
  - Save button that calls `updateEmployee` to persist changes back to the global app state.
  - Interactive profile photo upload placeholder or selector.
- Include subtle transitions and standard, cohesive dark-mode/light-mode compatible designs.

#### [MODIFY] [Employees.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/views/Employees.jsx)
- Refactor the component to support two sub-views: `list` (All Employees directory) and `details` (Single Employee full view).
- In **`list` view**:
  - Show a search bar and category filters on top.
  - Display all employees in a clean, modern card grid (avatar, name, role title, skill group tag, compliance status badge).
  - Clicking any card sets `selectedEmpId` and changes viewMode to `'details'`.
  - Include an "Onboard New Staff" button to add new employees.
- In **`details` view**:
  - Show a header with "Back to Employees" (with chevron-left icon) that switches back to the `list` view.
  - Display a split layout:
    - **Left Tab Sidebar** (styled exactly like the screenshot):
      - Employee Details
      - Personal Information
      - Locations
      - Roles
      - Wage & Salary
      - Work Schedule
      - Documents
      - Logbook
    - **Right Content Panel**:
      - *Employee Details*: Assigned role, skill group, start date, line manager, and holiday allowance.
      - *Personal Information*: DOB, phone, email, address, emergency contact details.
      - *Locations*: Search bar, "Select All" / "Deselect All" options, checklist of locations (e.g. "Swan care home"), and "Save" / "Cancel" actions.
      - *Roles*: View/modify system access roles (Admin, HR, etc.) with save button.
      - *Wage & Salary*: Hourly wage rate, gross earnings estimate, breaks deductions, and mock monthly payslips.
      - *Work Schedule*: Calendar list of weekly assigned shifts.
      - *Documents*: The 19-document checklist verification (Verified/Needs Verification status selector).
      - *Logbook*: Detailed table of historical attendance records (clock-in, clock-out, breaks).

---

### [Application Entrypoint]

#### [MODIFY] [App.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/App.jsx)
- Import `Settings` view from `./views/Settings`.
- In `renderMainView()`, add a case for `'settings'` to return the `<Settings />` view component.

## Verification Plan

### Automated/Manual Verification
- Run the React development server to verify the following behaviors:
  1. Click **Employee Profiles** in the sidebar. Verify the All Employees list is shown.
  2. Click on a specific employee card. Verify it displays the beautiful tabbed sidebar details view.
  3. Go to **Locations** tab in employee details, verify the checkbox, search bar, select/deselect, and Save/Cancel buttons match the screenshot.
  4. Click the "Back to Employees" header and check if it successfully returns to the staff grid.
  5. Inspect the Navbar: Verify that the role selector dropdown is completely gone.
  6. Click the profile picture dropdown in the Navbar: Verify that only the **Sign Out** option is visible.
  7. Click the **Settings** option in the sidebar: Verify that the profile update form is fully functional and successfully updates the active employee details (such as in the header).
  8. Check both light and dark modes to ensure perfect visual appeal and premium look.
