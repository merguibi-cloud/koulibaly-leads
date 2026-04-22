import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

const PHOTO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663396503091/HQZcV9YPe9Peeq6htetEth/kalidou_koulibaly_2034d4c4.jpg";

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

const inputClass = "bg-transparent border-0 border-b border-white/30 pb-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/70 transition-colors rounded-none w-full";
const labelClass = "text-[9px] font-medium tracking-[3px] uppercase text-white";

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
    <div className="min-h-screen bg-black">
      <div className="grid lg:grid-cols-2 min-h-screen">

        {/* ── Left: sticky photo ── */}
        <div className="relative overflow-hidden lg:sticky lg:top-0 lg:h-screen">
          {/* Sénégal flag bar */}
          <div className="absolute right-0 top-0 bottom-0 w-1.5 z-20 flex flex-col">
            <div className="flex-1 bg-[#00853F]" />
            <div className="flex-1 bg-[#FDEF42]" />
            <div className="flex-1 bg-[#E31E24]" />
          </div>

          <img
            src={PHOTO_URL}
            alt="Kalidou Koulibaly"
            className="w-full h-full object-cover object-top"
            style={{ filter: "grayscale(10%) contrast(1.05) brightness(0.85)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:hidden" />
        </div>

        {/* ── Right: identity + form ── */}
        <div className="flex flex-col bg-black px-8 pt-16 pb-10 lg:px-14 xl:px-16">

          {/* Identity */}
          <div className="mb-10">
            <p className="text-[9px] font-medium tracking-[5px] uppercase text-white mb-5">
              Prise de contact
            </p>

            <h1
              className="uppercase leading-none text-white mb-5"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
            >
              Kalidou<br />Koulibaly
            </h1>

            <p className="text-[11px] font-light tracking-[4px] uppercase text-white mb-7">
              Défenseur&nbsp;·&nbsp;Entrepreneur&nbsp;·&nbsp;Investisseur
            </p>

            <p className="text-sm font-light leading-relaxed text-white max-w-sm">
              Capitaine de l'équipe nationale du Sénégal, double Champion
              d'Afrique (2021 &amp; 2025), Kalidou Koulibaly construit aujourd'hui un
              héritage au-delà des terrains — investissements tech,
              entrepreneuriat et engagement social.
            </p>

            <div className="w-8 h-px bg-white/25 mt-10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1">

            {/* Category */}
            <p className="text-[9px] font-medium tracking-[4px] uppercase text-white mb-3">
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
                      ? "border-white bg-white/10 text-white"
                      : "border-white text-white hover:bg-white/10"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-destructive text-xs mt-1 mb-1">{errors.category.message}</p>
            )}

            {/* Fields */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-7 mb-6">

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Prénom *</label>
                <input {...register("firstName")} placeholder="Jean" className={inputClass} />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Nom *</label>
                <input {...register("lastName")} placeholder="Dupont" className={inputClass} />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Email *</label>
                <input {...register("email")} type="email" placeholder="jean@exemple.com" className={inputClass} />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Téléphone</label>
                <input {...register("phone")} type="tel" placeholder="+33 6 00 00 00 00" className={inputClass} />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Entreprise</label>
                <input {...register("company")} placeholder="Votre société" className={inputClass} />
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelClass}>Pays</label>
                <select {...register("country")} className={inputClass + " cursor-pointer appearance-none"}>
                  <option value="" className="bg-black">France</option>
                  {COUNTRIES.map((c) => <option key={c} value={c} className="bg-black">{c}</option>)}
                </select>
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <label className={labelClass}>Message *</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="Décrivez votre projet ou votre demande..."
                  className={inputClass + " resize-none"}
                />
                {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || submitMutation.isPending}
              className="w-full py-4 bg-stone-200 hover:bg-stone-100 text-stone-900 text-[10px] font-semibold tracking-[4px] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || submitMutation.isPending ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-[9px] tracking-[3px] uppercase text-white/50 mt-10">
            © 2026 Kalidou Koulibaly
          </p>
        </div>

      </div>
    </div>
  );
}
