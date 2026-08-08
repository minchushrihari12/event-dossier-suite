export type Role = "organizer" | "dean" | "officer";

export const ROLE_LABEL: Record<Role, string> = {
  organizer: "Faculty / Organizer",
  dean: "Dean / HOD",
  officer: "Accreditation Officer",
};

export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export const EVENT_TYPES = [
  "Workshop",
  "Seminar",
  "Conference",
  "Cultural Event",
  "Sports Event",
  "Guest Lecture",
  "Hackathon",
  "FDP",
  "Awareness Program",
  "Other",
] as const;

export const BUDGET_CATEGORIES = [
  "Venue",
  "Food",
  "Guest / Speaker",
  "Travel",
  "Printing",
  "Equipment",
  "Decoration",
  "Marketing",
  "Other",
] as const;

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Program {
  id: string;
  departmentId: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  departmentId: string;
  designation: string;
}

export interface Institution {
  name: string;
  address: string;
  logoText: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  venue: string;
  departmentId: string;
  programId: string;
  academicYear: string;
  semester: string;
  expectedParticipants: number;
  coordinator: string;
  plannedBudget: number;
  posterUrl?: string;
  posterName?: string;
  status: EventStatus;
  organizerId: string;
  createdAt: string;
  submittedAt?: string;
  conductedAt?: string;
  dossierGeneratedAt?: string;
  verified?: boolean;
}

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  description: string;
  plannedAmount: number;
}

export interface Expense {
  id: string;
  eventId: string;
  category: string;
  description: string;
  plannedAmount: number;
  actualAmount: number;
  date: string;
  receiptUrl?: string;
  receiptName?: string;
}

export interface Approval {
  id: string;
  eventId: string;
  decision: "approved" | "rejected";
  approverName: string;
  approverRole: string;
  comment: string;
  timestamp: string;
}

export interface EventReport {
  eventId: string;
  description: string;
  outcomes: string;
  participants: number;
  highlights: string;
  achievements: string;
  challenges: string;
  conclusion: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  eventId: string;
  url: string;
  caption: string;
  geoTagged: boolean;
  latitude?: number;
  longitude?: number;
  uploadedAt: string;
}

export interface Feedback {
  eventId: string;
  responses: number;
  averageRating: number;
  satisfaction: number;
  content: number;
  organization: number;
  venue: number;
  experience: number;
  summary: string;
  reportName?: string;
  reportUrl?: string;
}

export interface PressClipping {
  id: string;
  eventId: string;
  title: string;
  source: string;
  publicationDate: string;
  kind: string;
  link?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface DossierRecord {
  id: string;
  eventId: string;
  generatedAt: string;
  generatedBy: string;
}

export interface DB {
  institution: Institution;
  departments: Department[];
  programs: Program[];
  users: User[];
  events: EventRecord[];
  budgetItems: BudgetItem[];
  expenses: Expense[];
  approvals: Approval[];
  reports: EventReport[];
  photos: Photo[];
  feedback: Feedback[];
  press: PressClipping[];
  dossiers: DossierRecord[];
}
