import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

const PHOTO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663396503091/HQZcV9YPe9Peeq6htetEth/kalidou_koulibaly_2034d4c4.jpg";

const CATEGORIES = [
  { id: "Investissement", label: "Investissement", icon: "💼" },
  { id: "Partenariat", label: "Partenariat", icon: "🤝" },
  { id: "Collaboration", label: "Collaboration", icon: "🎯" },
  { id: "Conférence", label: "Conférence", icon: "🎤" },
  { id: "Association", label: "Association", icon: "❤️" },
  { id: "Autre", label: "Autre", icon: "✦" },
] as const;

const COUNTRIES = [
  "France", "Sénégal", "Belgique", "Suisse", "Maroc", "Côte d'Ivoire",
  "Royaume-Uni", "Italie", "Espagne", "Arabie Saoudite", "États-Unis",
  "Canada", "Allemagne", "Portugal", "Pays-Bas", "Autre",
];

const schema = z.object({
  category: z.enum(["Investissement", "Partenariat", "Collaboration", "Conférence", "Association", "Autre"]),
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide"),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  message: z.string().min(10, "Message trop court (min 10 caractères)").max(5000),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitMutation = trpc.leads.submit.useMutation({
    onSuccess: () => {
      navigate("/merci");
    },
    onError: (err) => {
      toast.error(err.message || "Une erreur est survenue. Veuillez réessayer.");
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setValue("category", cat as FormData["category"], { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero grid */}
      <div className="grid lg:grid-cols-2 min-h-screen">

        {/* Left: Photo */}
        <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
          {/* Sénégal flag bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 z-20 flex flex-col">
            <div className="flex-1 bg-[#00853F]" />
            <div className="flex-1 bg-[#FDEF42]" />
            <div className="flex-1 bg-[#E31E24]" />
          </div>

          <img
            src={PHOTO_URL}
            alt="Kalidou Koulibaly"
            className="w-full h-full object-cover object-top"
            style={{ filter: "grayscale(8%) contrast(1.06) brightness(0.88)" }}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent lg:hidden" />

          {/* Blue glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(26,86,160,0.15),transparent_60%)]" />
        </div>

        {/* Right: Content + Form */}
        <div className="flex flex-col justify-center px-6 py-16 lg:px-16 xl:px-20 bg-background relative">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/60 to-transparent" />

          {/* Identity */}
          <div className="mb-10">
            <p className="text-[10px] font-medium tracking-[4px] uppercase text-primary mb-4">
              Capitaine du Sénégal &nbsp;·&nbsp; 2× Champion d'Afrique
            </p>

            <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-normal leading-[0.95] tracking-tight mb-3">
              Kalidou
              <span className="block font-bold bg-gradient-to-br from-sky-300 to-blue-200 bg-clip-text text-transparent">
                Koulibaly
              </span>
            </h1>

            <p className="font-serif italic text-sm lg:text-base text-sky-300/80 mb-6 tracking-wide">
              Footballeur professionnel · Entrepreneur · Investisseur
            </p>

            {/* Stats */}
            <div className="flex gap-7 pb-6 border-b border-border mb-6">
              {[
                { num: "20+", label: "Ans de carrière" },
                { num: "CAN", label: "2021 & 2025" },
                { num: "4", label: "Projets actifs" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-serif text-2xl font-bold text-primary leading-none">{s.num}</div>
                  <div className="text-[9px] font-medium tracking-[1.5px] uppercase text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-sm font-light leading-relaxed text-foreground/70 max-w-md">
              Défenseur de classe mondiale encore en activité, Kalidou Koulibaly construit en parallèle son empire entrepreneurial : propriétaire du CS Sedan, fondateur de l'Académie Mbarodi en Afrique, investisseur en Tech & IA, et porteur d'une fondation engagée pour les communautés.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[9px] font-medium tracking-[4px] uppercase text-primary">Prendre contact</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Category cards */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-md border text-center transition-all duration-200 cursor-pointer
                    ${selectedCategory === cat.id
                      ? "border-primary bg-primary/15 shadow-[0_0_0_1px_rgba(74,158,224,0.3)]"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/8"
                    }`}
                >
                  <span className="text-lg leading-none">{cat.icon}</span>
                  <span className={`text-[9px] font-medium tracking-[1.2px] uppercase transition-colors
                    ${selectedCategory === cat.id ? "text-sky-300" : "text-muted-foreground"}`}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-destructive text-xs mb-3 -mt-2">{errors.category.message}</p>
            )}

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Prénom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Prénom *</label>
                <input
                  {...register("firstName")}
                  placeholder="Jean"
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:bg-primary/5 transition-all"
                />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
              </div>

              {/* Nom */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Nom *</label>
                <input
                  {...register("lastName")}
                  placeholder="Dupont"
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:bg-primary/5 transition-all"
                />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Email *</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="jean@exemple.com"
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:bg-primary/5 transition-all"
                />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              {/* Téléphone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Téléphone</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+33 6 00 00 00 00"
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:bg-primary/5 transition-all"
                />
              </div>

              {/* Entreprise */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Entreprise</label>
                <input
                  {...register("company")}
                  placeholder="Votre structure"
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:bg-primary/5 transition-all"
                />
              </div>

              {/* Pays */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Pays</label>
                <select
                  {...register("country")}
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground outline-none focus:border-primary focus:bg-primary/5 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Sélectionner…</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Message */}
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[9px] font-medium tracking-[2px] uppercase text-muted-foreground">Message *</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="Décrivez brièvement votre projet ou votre demande…"
                  className="bg-card border border-border rounded-md px-3 py-2.5 text-sm font-light text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary focus:bg-primary/5 transition-all resize-y"
                />
                {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || submitMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-sky-400 text-white rounded-md text-[10px] font-medium tracking-[3px] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(26,86,160,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {isSubmitting || submitMutation.isPending ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>

            <p className="text-[10px] text-muted-foreground/60 text-center mt-3 tracking-wide">
              Vos données sont traitées de manière confidentielle et ne seront jamais partagées avec des tiers.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
