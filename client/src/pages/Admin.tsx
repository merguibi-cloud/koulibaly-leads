import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const CATEGORIES = ["Investissement", "Partenariat", "Collaboration", "Conférence", "Association", "Autre"] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<Category, string> = {
  "Investissement": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Partenariat": "bg-sky-500/20 text-sky-300 border-sky-500/30",
  "Collaboration": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "Conférence": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "Association": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Autre": "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function Admin() {
  const { user, loading, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<Category | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: leads, isLoading } = trpc.leads.list.useQuery(
    filter ? { category: filter } : undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const exportQuery = trpc.leads.exportCSV.useQuery(
    filter ? { category: filter } : undefined,
    { enabled: false }
  );

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-koulibaly-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${result.data.count} lead(s) exporté(s)`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full border border-primary/40 flex items-center justify-center mx-auto mb-6 bg-primary/10">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-3">Accès restreint</h2>
          <p className="text-sm text-muted-foreground mb-6">Connectez-vous pour accéder à l'interface d'administration.</p>
          <a
            href={getLoginUrl()}
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-md text-[10px] font-medium tracking-[3px] uppercase transition-all hover:shadow-[0_4px_16px_rgba(26,86,160,0.4)]"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-foreground mb-3">Accès refusé</h2>
          <p className="text-sm text-muted-foreground">Vous n'avez pas les droits d'administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 lg:px-10 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Administration</h1>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">Leads — Kalidou Koulibaly</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.name}</span>
          <button
            onClick={handleExport}
            disabled={exportQuery.isFetching}
            className="flex items-center gap-2 px-4 py-2 border border-primary/40 text-primary hover:bg-primary/10 rounded-md text-[9px] font-medium tracking-[2px] uppercase transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {exportQuery.isFetching ? "Export…" : "Exporter CSV"}
          </button>
          <a href="/" className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground hover:text-foreground transition-colors">
            ← Formulaire
          </a>
        </div>
      </header>

      <div className="px-6 lg:px-10 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <button
            onClick={() => setFilter(undefined)}
            className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${!filter ? "border-primary bg-primary/15" : "border-border bg-card hover:border-primary/30"}`}
          >
            <div className="font-serif text-2xl font-bold text-foreground">{leads?.length ?? "—"}</div>
            <div className="text-[9px] tracking-[1.5px] uppercase text-muted-foreground mt-1">Total</div>
          </button>
          {CATEGORIES.map((cat) => {
            const count = leads?.filter(l => l.category === cat).length ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setFilter(filter === cat ? undefined : cat)}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${filter === cat ? "border-primary bg-primary/15" : "border-border bg-card hover:border-primary/30"}`}
              >
                <div className="font-serif text-2xl font-bold text-foreground">{count}</div>
                <div className="text-[9px] tracking-[1px] uppercase text-muted-foreground mt-1 leading-tight">{cat}</div>
              </button>
            );
          })}
        </div>

        {/* Leads table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !leads || leads.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-foreground/50 mb-2">Aucun lead</p>
            <p className="text-sm text-muted-foreground">
              {filter ? `Aucun lead pour la catégorie "${filter}"` : "Les leads apparaîtront ici après soumission du formulaire."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-card border border-border rounded-lg overflow-hidden transition-all"
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-muted-foreground font-mono w-8 shrink-0">#{lead.id}</span>
                  <span className={`text-[9px] font-medium tracking-[1px] uppercase px-2 py-1 rounded border ${CATEGORY_COLORS[lead.category as Category] || "bg-muted text-muted-foreground border-border"}`}>
                    {lead.category}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {lead.firstName} {lead.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[200px]">{lead.email}</span>
                  {lead.company && (
                    <span className="text-xs text-muted-foreground hidden lg:block truncate max-w-[150px]">{lead.company}</span>
                  )}
                  <span className="text-xs text-muted-foreground hidden md:block shrink-0">
                    {new Date(lead.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${expandedId === lead.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded details */}
                {expandedId === lead.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[9px] tracking-[1.5px] uppercase text-muted-foreground mb-1">Contact</p>
                      <p className="text-sm text-foreground">{lead.firstName} {lead.lastName}</p>
                      <p className="text-sm text-primary/80">{lead.email}</p>
                      {lead.phone && <p className="text-sm text-foreground/70">{lead.phone}</p>}
                    </div>
                    {(lead.company || lead.country) && (
                      <div>
                        <p className="text-[9px] tracking-[1.5px] uppercase text-muted-foreground mb-1">Organisation</p>
                        {lead.company && <p className="text-sm text-foreground">{lead.company}</p>}
                        {lead.country && <p className="text-sm text-foreground/70">{lead.country}</p>}
                      </div>
                    )}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <p className="text-[9px] tracking-[1.5px] uppercase text-muted-foreground mb-1">Message</p>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[1.5px] uppercase text-muted-foreground mb-1">Reçu le</p>
                      <p className="text-sm text-foreground/70">
                        {new Date(lead.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                        {" à "}
                        {new Date(lead.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
