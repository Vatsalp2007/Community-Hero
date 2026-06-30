export const ISSUE_CATEGORIES = {
  pothole: {
    label: "Pothole",
    icon: "circle-dot",
    color: "#DC2626",
    department: "roads",
    visionLabels: ["pothole", "road", "asphalt", "pavement", "crack", "hole"]
  },
  streetlight: {
    label: "Broken Streetlight",
    icon: "lamp-street",
    color: "#D97706",
    department: "electricity",
    visionLabels: ["street light", "lamp post", "light fixture", "lamppost"]
  },
  water_leak: {
    label: "Water Leakage",
    icon: "droplets",
    color: "#2563EB",
    department: "water",
    visionLabels: ["water", "flood", "leak", "puddle", "pipe", "drainage", "waterlogged"]
  },
  garbage: {
    label: "Garbage / Waste",
    icon: "trash-2",
    color: "#16A34A",
    department: "sanitation",
    visionLabels: ["garbage", "waste", "trash", "litter", "dump", "rubbish"]
  },
  manhole: {
    label: "Open Manhole",
    icon: "circle-off",
    color: "#7C3AED",
    department: "roads",
    visionLabels: ["manhole", "sewer", "grate", "cover", "drain"]
  },
  road_damage: {
    label: "Road Damage",
    icon: "road",
    color: "#EA580C",
    department: "roads",
    visionLabels: ["road", "street", "damage", "broken", "construction"]
  },
  other: {
    label: "Other Issue",
    icon: "alert-circle",
    color: "#6B7280",
    department: "other",
    visionLabels: []
  }
};

export const SEVERITY_LEVELS = {
  1: { label: "Low", color: "#16A34A", description: "Minor inconvenience" },
  2: { label: "Minor", color: "#65A30D", description: "Needs attention soon" },
  3: { label: "Moderate", color: "#D97706", description: "Affects daily life" },
  4: { label: "High", color: "#EA580C", description: "Safety concern" },
  5: { label: "Critical", color: "#DC2626", description: "Immediate danger" }
};

export const ISSUE_STATUSES = {
  open: { label: "Open", color: "#6B7280", bg: "#F3F4F6" },
  verified: { label: "Community Verified", color: "#16A34A", bg: "#F0FDF4" },
  assigned: { label: "Assigned", color: "#2563EB", bg: "#EFF6FF" },
  in_progress: { label: "In Progress", color: "#D97706", bg: "#FFFBEB" },
  resolved: { label: "Resolved", color: "#16A34A", bg: "#F0FDF4" },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2" }
};

export const DEPARTMENTS = {
  roads: "Roads & Infrastructure",
  water: "Water & Sewerage",
  sanitation: "Sanitation & Waste",
  electricity: "Electricity & Streetlights",
  other: "General Administration"
};

export const CIVIC_SCORE_EVENTS = {
  report_accepted: 20,
  report_verified: 50,
  report_resolved: 100,
  upvote_verified: 5,
  moderator_verify: 30,
  streak_bonus: 25,
  first_in_ward: 75
};

export const LEVEL_THRESHOLDS = {
  bronze: 0,
  silver: 200,
  gold: 500,
  platinum: 1000,
  hero: 2500
};

export const BADGES = [
  { id: "first_report", label: "First Report", description: "Submitted your first issue", icon: "flag" },
  { id: "pothole_hunter", label: "Pothole Hunter", description: "Reported 5 potholes", icon: "circle-dot" },
  { id: "water_warrior", label: "Water Warrior", description: "Reported 5 water leaks", icon: "droplets" },
  { id: "street_guardian", label: "Street Guardian", description: "Reported 5 streetlight issues", icon: "lamp-street" },
  { id: "century_club", label: "Century Club", description: "100 civic score points", icon: "award" },
  { id: "verified_reporter", label: "Verified Reporter", description: "3 reports verified by community", icon: "badge-check" },
  { id: "resolver", label: "Problem Solver", description: "5 of your reports resolved", icon: "check-circle" }
];

export const UPVOTE_THRESHOLD = 5;

export const MAP_CENTER_DEFAULT = { lat: 23.0225, lng: 72.5714 };
export const MAP_ZOOM_DEFAULT = 13;
