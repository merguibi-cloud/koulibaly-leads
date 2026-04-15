import { nanoid } from "nanoid";
import { ENV } from "./_core/env";

export type Lead = {
  id: string;
  createdAt: Date;
  category: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  message: string;
};

export type InsertLead = Omit<Lead, "id" | "createdAt">;

export async function appendLead(data: InsertLead): Promise<void> {
  const payload = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    ...data,
  };

  const res = await fetch(ENV.googleAppsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to write to Google Sheet: ${res.status}`);
  }
}

export async function getAllLeads(): Promise<Lead[]> {
  const res = await fetch(`${ENV.googleAppsScriptUrl}?action=getAll`);
  if (!res.ok) throw new Error(`Failed to read from Google Sheet: ${res.status}`);
  const json = await res.json() as { rows: string[][] };
  if (!json.rows || json.rows.length <= 1) return [];
  return json.rows.slice(1).map((row) => ({
    id: String(row[0] ?? ""),
    createdAt: new Date(String(row[1] ?? "")),
    category: String(row[2] ?? ""),
    firstName: String(row[3] ?? ""),
    lastName: String(row[4] ?? ""),
    email: String(row[5] ?? ""),
    phone: row[6] ? String(row[6]) : null,
    company: row[7] ? String(row[7]) : null,
    country: row[8] ? String(row[8]) : null,
    message: String(row[9] ?? ""),
  }));
}

export async function getLeadsByCategory(category: string): Promise<Lead[]> {
  const leads = await getAllLeads();
  return leads.filter((l) => l.category === category);
}
