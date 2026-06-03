# Project Cleanup Audit Report

This report details the project cleanup audit conducted to identify and remove unused or temporary files/folders after the RBAC and Audit Architecture refactor.

---

## A. Safe To Delete (Deleted)

The following files and folders have been verified as temporary outputs, placeholders, or dead code. They are not referenced anywhere in the active codebase and have been permanently deleted:

### Temporary Folders / Outputs
* **`audit-requirements-extracted/`**
  * *Reason:* Contains temporary `.txt` text extraction outputs from the PDF source documents.
  * *Files contained:*
    * `10) Mealtime Audit.txt`
    * `6) Monthly Medication Audit.txt`
    * `AutoRecovery save of Care Plan Audit Swan for PCS.txt`
    * `AutoRecovery save of Dignity Audit 27.03.26.txt`
    * `Call bell audit.txt`
    * `Daily Chart Audit new (1).txt`
    * `Fire Audit.doc · version BLANK.txt`
    * `HEALTH & SAFETY AUDIT.txt`
    * `Infection Control Audit.txt`
    * `Matress Audit.txt`
    * `Weekly Medication Audit 2 (1).txt`
* **`audit_extracted/`**
  * *Reason:* Temporary directory containing unzipped/extracted document contents.
* **`scratch_med_audit/`**
  * *Reason:* Temporary scratch directory used during medication audit formatting.

### Temporary Archives
* **`audit.zip`**
  * *Reason:* Temporary archive used during pdf/document extraction.
* **`scratch_med_audit.zip`**
  * *Reason:* Temporary archive of the scratch medication audit data.

### Temporary Scripts & Text Logs
* **`extract_pdfs.js`**
  * *Reason:* Temporary Node.js utility script used to extract text from PDF files.
* **`extracted_text.txt`**
  * *Reason:* Temporary output log from extraction operations.
* **`extracted_text2.txt`**
  * *Reason:* Temporary output log from extraction operations.
* **`scratch_clean_questions.json`**
  * *Reason:* Temporary parser JSON file generated during audit data cleanup.
* **`scratch_extracted_audit.json`**
  * *Reason:* Temporary parser JSON file generated during audit data cleanup.
* **`scratch_form.jsx`**
  * *Reason:* Single-line placeholder file (`const a = 1;`) never used.
* **`scratch_formatted_med_audit.js`**
  * *Reason:* Temporary scratch script generated during audit analysis.
* **`scratch_view.jsx`**
  * *Reason:* Temporary scratch view containing backup component code, not imported or referenced.

### Unused Source Files (Dead Code)
* **`src/utils/auditQuestions.js`**
  * *Reason:* Legacy auto-generated questions file. All active audits now use their own individual modular config files in `src/modules/audits/configs/`. This file is not imported by any active module.

---

## B. Deleted Extra Audit Files

The following configuration and form files have been deleted because they are not referenced in the active `AUDIT_CATEGORIES` list in `AuditDashboard.jsx` and are not used by the application:

### Modular Audit Configs (11 files)
* **`src/modules/audits/configs/accidentIncident.config.js`**
* **`src/modules/audits/configs/bedRail.config.js`**
* **`src/modules/audits/configs/careNotes.config.js`**
* **`src/modules/audits/configs/complaints.config.js`**
* **`src/modules/audits/configs/compliment.config.js`**
* **`src/modules/audits/configs/dementiaEnvironment.config.js`**
* **`src/modules/audits/configs/medicationErrorCompetency.config.js`**
* **`src/modules/audits/configs/pressureCushion.config.js`**
* **`src/modules/audits/configs/sensorMat.config.js`**
* **`src/modules/audits/configs/serviceUserFinance.config.js`**
* **`src/modules/audits/configs/storageMedication.config.js`**

### Modular Audit Forms (11 files)
* **`src/modules/audits/forms/AccidentIncidentAudit.jsx`**
* **`src/modules/audits/forms/BedRailAudit.jsx`**
* **`src/modules/audits/forms/CareNotesAudit.jsx`**
* **`src/modules/audits/forms/ComplaintsAudit.jsx`**
* **`src/modules/audits/forms/ComplimentAudit.jsx`**
* **`src/modules/audits/forms/DementiaEnvironmentAudit.jsx`**
* **`src/modules/audits/forms/MedicationErrorCompetencyAudit.jsx`**
* **`src/modules/audits/forms/PressureCushionAudit.jsx`**
* **`src/modules/audits/forms/SensorMatAudit.jsx`**
* **`src/modules/audits/forms/ServiceUserFinanceAudit.jsx`**
* **`src/modules/audits/forms/StorageMedicationAudit.jsx`**

---

## C. Keep

The following files constitute the active, core features of the CQC audit compliance application and must not be touched:

### Active Layouts & Context Providers
* **`src/layouts/shared/Header.jsx`** (Header navigation)
* **`src/layouts/shared/Logo.jsx`** (App brand logo)
* **`src/layouts/shared/Sidebar.jsx`** (Primary navigation panel)
* **`src/context/AppContext.jsx`** (Application state manager)

### Active Sidebar & Navigation Configs
* **`src/config/sidebar/adminMenu.js`**
* **`src/config/sidebar/complianceMenu.js`**
* **`src/config/sidebar/employeeMenu.js`**
* **`src/config/sidebar/hrMenu.js`**
* **`src/config/sidebar/managerMenu.js`**
* **`src/config/sidebar/receptionistMenu.js`**

### Active Routes & View Components
* **`src/routes/index.jsx`** (Active application router)
* **`src/App.jsx`** (Application entry layout)
* **`src/main.jsx`** (Vite entry point)
* **`src/modules/admin/AdminDashboard.jsx`**
* **`src/modules/hr/HRDashboard.jsx`**
* **`src/modules/employee/EmployeeDashboard.jsx`**
* **`src/modules/receptionist/VisitorTablet.jsx`**
* **`src/modules/shared/Attendance.jsx`**
* **`src/modules/shared/CompetencyManagement.jsx`**
* **`src/modules/shared/DayNotes.jsx`**
* **`src/modules/shared/Documents.jsx`**
* **`src/modules/shared/Employees.jsx`**
* **`src/modules/shared/Leave.jsx`**
* **`src/modules/shared/Login.jsx`**
* **`src/modules/shared/ObservationManagement.jsx`**
* **`src/modules/shared/Payroll.jsx`**
* **`src/modules/shared/Reports.jsx`**
* **`src/modules/shared/RotaCalendar.jsx`**
* **`src/modules/shared/RotaManagement.jsx`**
* **`src/modules/shared/Settings.jsx`**

### Active Audit Core & Forms Registry
* **`src/modules/audits/AuditDashboard.jsx`** (Master audit log, scheduling, execution dashboard)
* **`src/modules/audits/core/AuditActionPlan.jsx`** (Audit action plan component)
* **`src/modules/audits/core/AuditPdfExport.js`** (PDF export formatting)
* **`src/modules/audits/core/AuditRenderer.jsx`** (Form registry containing active form mappings)
* **`src/modules/audits/core/AuditScoringEngine.js`** (Score calculation engine)
* **`src/modules/audits/core/BaseAuditForm.jsx`** (Reusable form layout engine)

### Active Modular Audit Configs (15 files)
* `src/modules/audits/configs/callBell.config.js`
* `src/modules/audits/configs/carePlan.config.js`
* `src/modules/audits/configs/dailyWalkaround.config.js`
* `src/modules/audits/configs/dignity.config.js`
* `src/modules/audits/configs/fire.config.js`
* `src/modules/audits/configs/healthSafety.config.js`
* `src/modules/audits/configs/houseKeeping.config.js`
* `src/modules/audits/configs/infectionControl.config.js`
* `src/modules/audits/configs/kitchen.config.js`
* `src/modules/audits/configs/mealTime.config.js`
* `src/modules/audits/configs/monthlyMedication.config.js`
* `src/modules/audits/configs/nutritionHydration.config.js`
* `src/modules/audits/configs/orderingMedication.config.js`
* `src/modules/audits/configs/pressureMattress.config.js`
* `src/modules/audits/configs/weeklyMedication.config.js`

### Active Modular Audit Forms (15 files)
* `src/modules/audits/forms/CallBellAudit.jsx`
* `src/modules/audits/forms/CarePlanAudit.jsx`
* `src/modules/audits/forms/DailyWalkaroundAudit.jsx`
* `src/modules/audits/forms/DignityAudit.jsx`
* `src/modules/audits/forms/FireAudit.jsx`
* `src/modules/audits/forms/HealthSafetyAudit.jsx`
* `src/modules/audits/forms/HouseKeepingAudit.jsx`
* `src/modules/audits/forms/InfectionControlAudit.jsx`
* `src/modules/audits/forms/KitchenAudit.jsx`
* `src/modules/audits/forms/MealTimeAudit.jsx`
* `src/modules/audits/forms/MonthlyMedicationAudit.jsx`
* `src/modules/audits/forms/NutritionHydrationAudit.jsx`
* `src/modules/audits/forms/OrderingMedicationAudit.jsx`
* `src/modules/audits/forms/PressureMattressAudit.jsx`
* `src/modules/audits/forms/WeeklyMedicationAudit.jsx`

### Client Source Documents (Must not be deleted)
* **`audit-requirements/`** (Folder containing CQC PDF reference requirements)
* **`Call bell audit.pdf`** (Root reference document)

---

## D. Import Dependency Check

Verification has been performed across the codebase to ensure no file targeted for deletion is imported by any active component.

| File / Folder | Dependency Search Result | Status |
| :--- | :--- | :--- |
| `audit-requirements-extracted/` | Zero active imports found in the codebase. | Deleted |
| `audit_extracted/` | Zero active imports found in the codebase. | Deleted |
| `scratch_med_audit/` | Zero active imports found in the codebase. | Deleted |
| `audit.zip` | Zero active imports found in the codebase. | Deleted |
| `scratch_med_audit.zip` | Zero active imports found in the codebase. | Deleted |
| `extract_pdfs.js` | Zero active imports found in the codebase. | Deleted |
| `extracted_text.txt` | Zero active imports found in the codebase. | Deleted |
| `extracted_text2.txt` | Zero active imports found in the codebase. | Deleted |
| `scratch_clean_questions.json` | Zero active imports found in the codebase. | Deleted |
| `scratch_extracted_audit.json` | Zero active imports found in the codebase. | Deleted |
| `scratch_form.jsx` | Zero active imports found in the codebase. | Deleted |
| `scratch_formatted_med_audit.js` | Zero active imports found in the codebase. | Deleted |
| `scratch_view.jsx` | Zero active imports found in the codebase. | Deleted |
| `src/utils/auditQuestions.js` | Zero active imports found in `src/`. | Deleted |
| 11 extra configs & forms | Zero imports from any active files. | Deleted |
