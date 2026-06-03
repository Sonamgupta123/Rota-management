export const infectionControlConfig = {
  title: "Infection Control Audit",
  category: "Compliance",
  frequency: "Scheduled",
  targetScore: 90,
  questions: [
  {
    "id": 1,
    "section": "General compliance",
    "question": "Are clinical PPE stations (aprons, gloves, sanitizers) fully stocked outside every resident bedroom?"
  },
  {
    "id": 2,
    "section": "General compliance",
    "question": "Are yellow clinical waste bags and general domestic bags segregated, tied, and disposed of appropriately?"
  },
  {
    "id": 3,
    "section": "General compliance",
    "question": "Are hand wash stations clean, active, and stocked with paper towels and clinical soap dispensers?"
  },
  {
    "id": 4,
    "section": "General compliance",
    "question": "Has laundry thermal disinfection cycles met strict compliance (minimum 65°C for 10 mins or 71°C for 3 mins)?"
  }
]
};
