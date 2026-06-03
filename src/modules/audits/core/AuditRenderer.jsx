import React from 'react';

// Import All 16 Audit Forms for Dashboard
import DailyWalkaroundAudit from '../forms/DailyWalkaroundAudit'; // Daily Chart Audit
import MonthlyMedicationAudit from '../forms/MonthlyMedicationAudit';
import WeeklyMedicationAudit from '../forms/WeeklyMedicationAudit';
import MealTimeAudit from '../forms/MealTimeAudit';
import InfectionControlAudit from '../forms/InfectionControlAudit';
import CarePlanAudit from '../forms/CarePlanAudit';
import DignityAudit from '../forms/DignityAudit';
import FireAudit from '../forms/FireAudit';
import HealthSafetyAudit from '../forms/HealthSafetyAudit';
import PressureMattressAudit from '../forms/PressureMattressAudit'; // Mattress Audit
import NutritionHydrationAudit from '../forms/NutritionHydrationAudit'; // Meal Nutrition Audit
import CallBellAudit from '../forms/CallBellAudit';
import HouseKeepingAudit from '../forms/HouseKeepingAudit';
import KitchenAudit from '../forms/KitchenAudit';
import OrderingMedicationAudit from '../forms/OrderingMedicationAudit';

// Note: The keys here MUST exactly match the 16 strings in AUDIT_CATEGORIES in AuditDashboard.jsx
const FORM_MAP = {
  "Daily Chart Audit": DailyWalkaroundAudit,
  "Monthly Medication Audit": MonthlyMedicationAudit,
  "Weekly Medication Audit": WeeklyMedicationAudit,
  "Meal Time Audit": MealTimeAudit,
  "Infection Control Audit": InfectionControlAudit,
  "Care Plan Audit": CarePlanAudit,
  "Dignity Audit": DignityAudit,
  "Fire Audit": FireAudit,
  "Health & Safety Audit": HealthSafetyAudit,
  "House Keeping Cleaning Standards": HouseKeepingAudit,
  "Kitchen Audit": KitchenAudit,
  "Mattress Audit": PressureMattressAudit,
  "Meal Nutrition Audit": NutritionHydrationAudit,
  "Ordering and Receipt of Medication Audit": OrderingMedicationAudit,
  "Call Bell Audit": CallBellAudit
};

export const AuditRenderer = ({ selectedAudit, submitAuditResult, setSelectedAudit, isEditMode }) => {
  if (!selectedAudit) return null;

  const FormComponent = FORM_MAP[selectedAudit.type];

  if (!FormComponent) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Unknown Audit Form</h3>
        <p className="text-sm text-slate-500">The audit type "{selectedAudit.type}" is not recognized.</p>
        <button
          onClick={() => setSelectedAudit(null)}
          className="h-9 px-4 rounded-xl border border-slate-200 text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <FormComponent 
      selectedAudit={selectedAudit} 
      submitAuditResult={submitAuditResult} 
      setSelectedAudit={setSelectedAudit} 
      isEditMode={isEditMode}
    />
  );
};

export default AuditRenderer;
