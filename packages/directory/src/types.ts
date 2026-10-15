export const ROLES = ["psychologist", "counsellor", "youth_org", "school_psychologist", "helpline"] as const;
export type Role = (typeof ROLES)[number];

export const FORMATS = ["online", "in_person", "both"] as const;
export type Format = (typeof FORMATS)[number];

export const VERIFICATION = ["demo", "unverified", "verified"] as const;
export type Verification = (typeof VERIFICATION)[number];

export type Lang = "tg" | "ru" | "en";

export interface Text {
  ru: string;
  tg: string;
  verify?: boolean;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
// Weekday → [from, to] in Asia/Dushanbe, 24h "HH:MM".
export type Availability = Partial<Record<Weekday, [string, string]>>;

export interface Professional {
  id: string;
  name: Text; // demo rows: role-based labels, never person names
  role: Role;
  credentials: Text;
  languages: Lang[];
  city: Text | null; // null = whole country / online only
  format: Format;
  adolescentServices: boolean;
  verificationStatus: Verification;
  lastVerifiedAt: string | null; // ISO
  contactMethod: Text; // how to reach them, as verified; demo rows describe, never list a real contact
  availability: Availability | null;
  acceptingRequests: boolean;
  isDemo: boolean;
}

export interface Helpline {
  id: string;
  name: Text;
  number: string | null; // null until verified — nothing renders without verifiedAt
  hours: Text | null;
  languages: Lang[];
  categories: ("fake_content" | "extortion" | "fraud" | "cyberbullying")[]; // order only: /urgent shows every verified line, these first
  verifiedBy: string | null;
  verifiedAt: string | null;
  note: Text | null; // where the candidate came from; VERIFY notes
}
