import { useLocation } from "wouter";

const PHOTO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663396503091/HQZcV9YPe9Peeq6htetEth/kalidou_koulibaly_2034d4c4.jpg";

export default function Merci() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background photo blurred */}
      <div className="absolute inset-0 z-0">
        <img
          src={PHOTO_URL}
          alt=""
          className="w-full h-full object-cover object-top opacity-10"
          style={{ filter: "blur(12px) grayscale(40%)" }}
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,86,160,0.15),transparent_70%)] z-0" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Check icon */}
        <div className="w-16 h-16 rounded-full border border-primary/50 flex items-center justify-center mx-auto mb-8 bg-primary/10">
          <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        {/* Flag bar */}
        <div className="flex justify-center gap-1 mb-8">
          <div className="w-8 h-1 rounded-full bg-[#00853F]" />
          <div className="w-8 h-1 rounded-full bg-[#FDEF42]" />
          <div className="w-8 h-1 rounded-full bg-[#E31E24]" />
        </div>

        <h1 className="font-serif text-4xl lg:text-5xl font-normal text-foreground mb-4">
          Message envoyé
        </h1>
        <p className="font-serif italic text-primary/80 text-lg mb-6">
          Merci pour votre intérêt
        </p>
        <p className="text-sm font-light leading-relaxed text-foreground/65 mb-10">
          Votre demande a bien été transmise à l'équipe de Kalidou Koulibaly. Nous reviendrons vers vous dans les meilleurs délais pour donner suite à votre projet.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 border border-primary/50 text-primary hover:bg-primary/10 rounded-md text-[10px] font-medium tracking-[3px] uppercase transition-all duration-200 cursor-pointer"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
