# Implementation Plan - Call Bell Audit High-Fidelity Refactor

This plan details the visual and structural updates to [CallBellAudit.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/modules/audits/forms/CallBellAudit.jsx) to match the template requirements specified in [Call bell audit.txt](file:///d:/Kiaan%20Technology/Rota-mangement/audit-requirements-extracted/Call%20bell%20audit.txt) and the screenshot.

## Proposed Changes

### Compliance Audit Module

#### [MODIFY] [CallBellAudit.jsx](file:///d:/Kiaan%20Technology/Rota-mangement/src/modules/audits/forms/CallBellAudit.jsx)

Refactor the component to support:
1. **Title Banner**:
   - Header: `"Call Bell Audit"` with the AS CARE logo image on the right.
2. **Metadata Table**:
   - Light blue background (`bg-[#d9e1f2]`) for headers, thin black borders.
   - Row 1: `Completed By:` | `Date Completed:`
   - Row 2: `Number of Staff on Duty:` | `Number of Adults in Service:`
3. **Visual Inspection Table**:
   - Left vertical header: `Visual Inspection of Call Bells` spanning 4 criteria rows.
   - Header columns: `Standard` | `Criteria` | `Yes` | `No` | `Comments`.
4. **Random Testing Table**:
   - Left vertical header: `Random Testing` spanning 7 rows.
   - Columns: `Room number` | `Response Time` | `Comments`.
   - 5 rows for entering test metrics.
   - Dynamic rows for:
     - `Average Response time:` and `Service expectation time:`
     - `Any Actions Identified? [Yes] [No]` checkboxes.
5. **Call Bell Feedback from Residents**:
   - Section header: `Call Bell feedback from Residents`
   - Columns: `Adult` | `Initials` | `Do you know what call bell is for?` | `Do you know how to use it?` | `Comments`
   - Inputs for `Adult 1`, `Adult 2`, and `Adult 3`.
6. **Action Plan Grid**:
   - Custom Action table: `Finding` | `Action Required` | `Responsible Person` | `Date completed` | `Sign when completed`.
7. **Signatures**:
   - Assessor Signature, Role.
   - Manager comments, Manager signature, Date.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify there are no compilation errors.

### Manual Verification
- Open the compliance audit dashboard, click **Call Bell Audit**, and verify:
  - Header logo & light blue Word-like layout structure.
  - Interactive checkboxes and text fields.
