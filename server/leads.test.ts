import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock sheets module
vi.mock("./sheets", () => ({
  appendLead: vi.fn().mockResolvedValue(undefined),
  getAllLeads: vi.fn().mockResolvedValue([
    {
      id: "abc123",
      category: "Investissement",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@exemple.com",
      phone: "+33600000000",
      company: "Acme Corp",
      country: "France",
      message: "Je souhaite investir dans vos projets.",
      createdAt: new Date("2026-01-01T10:00:00Z"),
    },
  ]),
  getLeadsByCategory: vi.fn().mockResolvedValue([]),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

const adminUser: User = {
  id: 1,
  openId: "admin-open-id",
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const regularUser: User = {
  ...adminUser,
  id: 2,
  openId: "regular-user",
  role: "user",
};

function makeCtx(user: User | null = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("leads.submit", () => {
  it("accepte une soumission valide et retourne success: true", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.leads.submit({
      category: "Investissement",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean@exemple.com",
      message: "Je souhaite investir dans vos projets.",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejette un email invalide", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.leads.submit({
        category: "Partenariat",
        firstName: "Marie",
        lastName: "Martin",
        email: "not-an-email",
        message: "Message de test valide avec plus de 10 caractères.",
      })
    ).rejects.toThrow();
  });

  it("rejette un message trop court", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.leads.submit({
        category: "Collaboration",
        firstName: "Pierre",
        lastName: "Durand",
        email: "pierre@exemple.com",
        message: "Court",
      })
    ).rejects.toThrow();
  });

  it("rejette si prénom manquant", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.leads.submit({
        category: "Conférence",
        firstName: "",
        lastName: "Durand",
        email: "pierre@exemple.com",
        message: "Message valide avec plus de 10 caractères.",
      })
    ).rejects.toThrow();
  });
});

describe("leads.list (admin)", () => {
  it("retourne la liste des leads pour un admin", async () => {
    const caller = appRouter.createCaller(makeCtx(adminUser));
    const result = await caller.leads.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("category", "Investissement");
  });

  it("refuse l'accès à un utilisateur non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx(regularUser));
    await expect(caller.leads.list()).rejects.toThrow("Accès réservé aux administrateurs");
  });

  it("refuse l'accès à un utilisateur non connecté", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.leads.list()).rejects.toThrow();
  });
});

describe("leads.exportCSV (admin)", () => {
  it("retourne un CSV valide pour un admin", async () => {
    const caller = appRouter.createCaller(makeCtx(adminUser));
    const result = await caller.leads.exportCSV();
    expect(result).toHaveProperty("csv");
    expect(result).toHaveProperty("count");
    expect(typeof result.csv).toBe("string");
    expect(result.csv).toContain("ID,Date,Catégorie");
  });

  it("refuse l'accès à un non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx(regularUser));
    await expect(caller.leads.exportCSV()).rejects.toThrow("Accès réservé aux administrateurs");
  });
});
