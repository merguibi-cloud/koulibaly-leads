import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { appendLead, getAllLeads, getLeadsByCategory } from "./sheets";
import type { Lead } from "./sheets";
import { notifyOwner } from "./_core/notification";

const CATEGORIES = [
  "Investissement",
  "Partenariat",
  "Collaboration",
  "Conférence",
  "Association",
  "Autre",
] as const;

const leadSchema = z.object({
  category: z.enum(CATEGORIES),
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").max(320),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  message: z.string().min(10, "Message trop court (min 10 caractères)").max(5000),
});

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs" });
  }
  return next({ ctx });
});

// CSV helper
function leadsToCSV(rows: Lead[]): string {
  const header = ["ID", "Date", "Catégorie", "Prénom", "Nom", "Email", "Téléphone", "Entreprise", "Pays", "Message"];
  const escape = (v: string | null | undefined) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map(r => [
    r.id,
    r.createdAt.toISOString(),
    escape(r.category),
    escape(r.firstName),
    escape(r.lastName),
    escape(r.email),
    escape(r.phone),
    escape(r.company),
    escape(r.country),
    escape(r.message),
  ].join(","));
  return [header.join(","), ...lines].join("\n");
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  leads: router({
    // Public: submit a lead
    submit: publicProcedure
      .input(leadSchema)
      .mutation(async ({ input }) => {
        try {
          await appendLead({
            category: input.category,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone ?? null,
            company: input.company ?? null,
            country: input.country ?? null,
            message: input.message,
          });
        } catch (e) {
          console.error("[Sheets] appendLead failed:", e);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(e) });
        }

        // Notify owner
        try {
          await notifyOwner({
            title: `🎯 Nouveau lead — ${input.category}`,
            content: `**${input.firstName} ${input.lastName}** (${input.email}) a soumis une demande de type **${input.category}**.\n\n${input.company ? `Entreprise : ${input.company}\n` : ""}${input.country ? `Pays : ${input.country}\n` : ""}${input.phone ? `Tél : ${input.phone}\n` : ""}\n**Message :**\n${input.message}`,
          });
        } catch (e) {
          console.warn("[Notification] Failed to notify owner:", e);
        }

        return { success: true };
      }),

    // Admin: list all leads with optional category filter
    list: adminProcedure
      .input(z.object({ category: z.enum(CATEGORIES).optional() }).optional())
      .query(async ({ input }) => {
        if (input?.category) {
          return getLeadsByCategory(input.category);
        }
        return getAllLeads();
      }),

    // Admin: export CSV
    exportCSV: adminProcedure
      .input(z.object({ category: z.enum(CATEGORIES).optional() }).optional())
      .query(async ({ input }) => {
        const rows = input?.category
          ? await getLeadsByCategory(input.category)
          : await getAllLeads();
        return { csv: leadsToCSV(rows), count: rows.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
