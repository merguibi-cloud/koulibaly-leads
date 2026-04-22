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

            {/* Category */}
            <p className="text-[9px] font-medium tracking-[4px] uppercase text-muted-foreground mb-3">
              Objet de votre demande
            </p>
            <div className="grid grid-cols-4 gap-2 mb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3 py-2.5 border text-center transition-colors duration-150 cursor-pointer
                    text-[9px] font-medium tracking-[1.5px] uppercase
                    ${selectedCategory === cat.id
                      ? "border-foreground/80 text-foreground"
                      : "border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-destructive text-xs mb-2">{errors.category.message}</p>
            )}

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-6 mb-5">

              {/* Prénom */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Prénom *</label>
                <input
                  {...register("firstName")}
                  placeholder="Jean"
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
                />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
              </div>

              {/* Nom */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Nom *</label>
                <input
                  {...register("lastName")}
                  placeholder="Dupont"
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
                />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Email *</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="jean@exemple.com"
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
                />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              {/* Téléphone */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Téléphone</label>
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="+33 6 00 00 00 00"
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
                />
              </div>

              {/* Entreprise */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Entreprise</label>
                <input
                  {...register("company")}
                  placeholder="Votre société"
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
                />
              </div>

              {/* Pays */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Pays</label>
                <select
                  {...register("country")}
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground outline-none focus:border-foreground/60 transition-colors appearance-none cursor-pointer rounded-none"
                >
                  <option value="" className="bg-background">France</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} className="bg-background">{c}</option>)}
                </select>
              </div>

              {/* Message */}
              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Message *</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="Décrivez votre projet ou votre demande..."
                  className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors resize-none rounded-none"
                />
                {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || submitMutation.isPending}
              className="w-full py-4 bg-foreground/10 hover:bg-foreground/15 text-foreground text-[10px] font-medium tracking-[4px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || submitMutation.isPending ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
