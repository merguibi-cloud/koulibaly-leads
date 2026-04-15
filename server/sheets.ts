import { google } from "googleapis";
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

const HEADER_ROW = [
  "ID",
  "Date",
  "Catégorie",
  "Prénom",
  "Nom",
  "Email",
  "Téléphone",
  "Entreprise",
  "Pays",
  "Message",
];

function getSheetsClient() {
  const credentials = JSON.parse(ENV.googleServiceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function initSheet(): Promise<void> {
  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: ENV.googleSpreadsheetId,
    range: "A1:J1",
  });

  if (!data.values || data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: ENV.googleSpreadsheetId,
      range: "A1:J1",
      valueInputOption: "RAW",
      requestBody: { values: [HEADER_ROW] },
    });
    console.log("[Sheets] Header row initialized.");
  }
}

export async function appendLead(data: InsertLead): Promise<void> {
  const sheets = getSheetsClient();
  const id = nanoid();
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: ENV.googleSpreadsheetId,
    range: "A:J",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          id,
          now,
          data.category,
          data.firstName,
          data.lastName,
          data.email,
          data.phone ?? "",
          data.company ?? "",
          data.country ?? "",
          data.message,
        ],
      ],
    },
  });
}

export async function getAllLeads(): Promise<Lead[]> {
  const sheets = getSheetsClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: ENV.googleSpreadsheetId,
    range: "A:J",
  });

  if (!data.values || data.values.length <= 1) return [];

  return data.values.slice(1).map((row) => ({
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
