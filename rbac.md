# Role Based Access Control (RBAC)

| Module             | Admin | HR      | Compliance | Manager     | Receptionist | Employee    |
| ------------------ | ----- | ------- | ---------- | ----------- | ------------ | ----------- |
| Dashboard          | Full  | Limited | Limited    | Limited     | Limited      | Limited     |
| Employees          | CRUD  | CRUD    | View       | View        | No           | Self        |
| Documents          | CRUD  | CRUD    | View       | Verify      | No           | Own Docs    |
| Rota               | Full  | View    | View       | CRUD        | No           | View        |
| Open Shifts        | Full  | View    | View       | Manage      | No           | Pick Shift  |
| Attendance         | Full  | View    | View       | View        | No           | Own         |
| Leave              | Full  | Manage  | View       | Approve     | No           | Request     |
| Payroll            | Full  | Manage  | View       | View        | No           | Own Summary |
| Visitor Management | Full  | View    | View       | View        | CRUD         | No          |
| Audits             | Full  | View    | CRUD       | Participate | No           | No          |
| Reports            | Full  | View    | View       | View        | No           | Own         |
| Settings           | Full  | No      | No         | No          | No           | No          |

## Roles

### Admin

Complete system access.

### HR

Employee lifecycle management.

### Compliance Officer

Audits and compliance monitoring.

### Manager

Staff scheduling and operational oversight.

### Receptionist

Visitor registration and logs.

### Employee

Self-service portal.
