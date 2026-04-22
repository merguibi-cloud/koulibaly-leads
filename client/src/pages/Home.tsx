import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

const CATEGORIES = [
  { id: "Investissement", label: "Investissement" },
  { id: "Partenariat",    label: "Partenariat"    },
  { id: "Collaboration",  label: "Collaboration"  },
  { id: "Conférence",     label: "Conférence"     },
  { id: "Association",    label: "Association"    },
  { id: "Autre",          label: "Autre"          },
] as const;

const COUNTRIES = [
  "France", "Sénégal", "Belgique", "Suisse", "Maroc", "Côte d'Ivoire",
  "Royaume-Uni", "Italie", "Espagne", "Arabie Saoudite", "États-Unis",
  "Canada", "Allemagne", "Portugal", "Pays-Bas", "Autre",
];

const schema = z.object({
  category: z.enum(["Investissement", "Partenariat", "Collaboration", "Conférence", "Association", "Autre"]),
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName:  z.string().min(1, "Nom requis").max(100),
  email:     z.email("Email invalide"),
  phone:     z.string().max(50).optional(),
  company:   z.string().max(200).optional(),
  country:   z.string().max(100).optional(),
  message:   z.string().min(10, "Message trop court (min 10 caractères)").max(5000),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitMutation = trpc.leads.submit.useMutation({
    onSuccess: () => navigate("/merci"),
    onError:   (err) => toast.error(err.message || "Une erreur est survenue. Veuillez réessayer."),
  });

  const onSubmit = (data: FormData) => submitMutation.mutate(data);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setValue("category", cat as FormData["category"], { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-8 py-14">

        {/* Identity */}
        <div className="mb-10">
          <p className="text-[9px] font-medium tracking-[5px] uppercase text-primary mb-6">
            Prise de contact
          </p>

          <h1 className="font-black uppercase leading-none tracking-tight text-foreground mb-5"
              style={{ fontSize: "clamp(3.5rem, 13vw, 7rem)" }}>
            Kalidou<br />Koulibaly
          </h1>

          <p className="text-[11px] font-light tracking-[4px] uppercase text-foreground/50 mb-7">
            Défenseur&nbsp;·&nbsp;Entrepreneur&nbsp;·&nbsp;Investisseur
          </p>

          <p className="text-sm font-light leading-relaxed text-foreground/65 max-w-sm">
            Capitaine de l'équipe nationale du Sénégal, double Champion d'Afrique (2021 &amp; 2025),
            Kalidou Koulibaly construit aujourd'hui un héritage au-delà des terrains —
            investissements tech, entrepreneuriat et engagement social.
          </p>

          <div className="w-8 h-px bg-foreground/30 mt-10" />
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

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-6 mb-5">

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Prénom *</label>
              <input
                {...register("firstName")}
                placeholder="Jean"
                className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
              />
              {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Nom *</label>
              <input
                {...register("lastName")}
                placeholder="Dupont"
                className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
              />
              {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
            </div>

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

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Téléphone</label>
              <input
                {...register("phone")}
                type="tel"
                placeholder="+33 6 00 00 00 00"
                className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Entreprise</label>
              <input
                {...register("company")}
                placeholder="Votre société"
                className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-foreground/60 transition-colors rounded-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-medium tracking-[3px] uppercase text-muted-foreground">Pays</label>
              <select
                {...register("country")}
                className="bg-transparent border-0 border-b border-foreground/20 pb-2 text-sm text-foreground outline-none focus:border-foreground/60 transition-colors appearance-none cursor-pointer rounded-none"
              >
                <option value="" className="bg-black">France</option>
                {COUNTRIES.map((c) => <option key={c} value={c} className="bg-black">{c}</option>)}
              </select>
            </div>

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
  );
}
