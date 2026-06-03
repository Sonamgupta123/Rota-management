import {
  LayoutDashboard,
  ShieldCheck,
  FileCheck,
  CalendarDays,
  Eye,
  GraduationCap
} from 'lucide-react';

export const complianceMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'audits', label: 'Scheduled Audits', icon: ShieldCheck },
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
  { id: 'observation', label: 'Observation', icon: Eye },
  { id: 'competency', label: 'Competency', icon: GraduationCap }
];
