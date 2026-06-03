import {
  LayoutDashboard,
  CalendarDays,
  FileCheck,
  Milestone,
  Receipt,
  Eye,
  GraduationCap
} from 'lucide-react';

export const employeeMenu = [
  { id: 'employee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'rota-group',
    label: 'Rota',
    icon: CalendarDays,
    isExpandable: true,
    submenu: [
      { id: 'rota', label: 'Rota Calendar' },
      { id: 'shift-planning', label: 'Shift Planning' },
      { id: 'day-notes', label: 'Day Notes' },
      { id: 'attendance', label: 'Attendance' }
    ]
  },
  { id: 'my-documents', label: 'My Documents', icon: FileCheck },
  { id: 'leave', label: 'Request Leave', icon: Milestone },
  { id: 'payroll', label: 'My Payslips', icon: Receipt },
  { id: 'observation', label: 'Observation', icon: Eye },
  { id: 'competency', label: 'Competency', icon: GraduationCap }
];
