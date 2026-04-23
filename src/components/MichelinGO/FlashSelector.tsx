"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Utensils, Zap, Sparkles, DollarSign, Navigation, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPrefs {
  hungryNow: boolean;
  vibe: string;
  budget: number;
  radius: number;
  targetCity: string;
}

interface FlashSelectorProps {
  onComplete: (prefs: UserPrefs) => void;
}

/**
 * Composant de configuration rapide
 * Permet à l'utilisateur de définir son contexte (faim, vibe, budget, lieu) en quelques clics
 * avant de lancer les modes Swipe ou Roulette.
 * 
 * @param {Function} onComplete Callback déclenché avec les préférences finales
 */
export default function FlashSelector({ onComplete }: FlashSelectorProps) {
  const [step, setStep] = useState(1);
  const [showCityInput, setShowCityInput] = useState(false);
  const [showDistanceOptions, setShowDistanceOptions] = useState(false);
  const [tempCity, setTempCity] = useState("");

  // Préférences par défaut
  const [prefs, setPrefs] = useState<UserPrefs>({
    hungryNow: false,
    vibe: "chill",
    budget: 2,
    radius: 50,
    targetCity: "",
  });

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else onComplete(prefs);
  };

  /**
   * Configuration des étapes du tunnel
   */
  const steps = [
    {
      id: 1,
      question: "Faim maintenant ?",
      options: [
        { label: "OUI, tout de suite", value: true, icon: Zap },
        { label: "Je prévois", value: false, icon: Utensils },
      ],
      key: "hungryNow",
    },
    {
      id: 2,
      question: "Plutôt Chill ou Chic ?",
      options: [
        { label: "Chill & Confort", value: "chill", icon: Coffee },
        { label: "Chic & Étoilé", value: "chic", icon: Sparkles },
      ],
      key: "vibe",
    },
    {
      id: 3,
      question: "Budget Max ?",
      options: [
        { label: "Abordable", value: 2, icon: DollarSign, subtitle: "Moins de 50€" },
        { label: "S'il le faut", value: 3, icon: DollarSign, subtitle: "50€ - 150€" },
        { label: "No Limit", value: 4, icon: DollarSign, subtitle: "Plus de 150€" },
      ],
      key: "budget",
    },
    {
      id: 4,
      question: "Quelle distance ?",
      options: [
        { label: "Sur place", value: "local", icon: Navigation, subtitle: "Autour de moi" },
        { label: "Choisir une ville", value: "city", icon: Sparkles, subtitle: "Prévoir un voyage" },
      ],
      key: "radius",
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white/80 backdrop-blur-md font-sans">
      <div className="min-h-full flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-xl bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all"
        >
          {/* Barre de progression haut de carte */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50">
            <motion.div
              className="h-full michelin-gradient"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step + (showDistanceOptions ? "-dist" : "") + (showCityInput ? "-city" : "")}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 md:space-y-10"
            >
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-michelin-red font-black text-sm tracking-[0.2em] uppercase">Phase {step}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                  {/* Bouton de retour spécifique à l'étape 4 pour changer entre Rayon et Ville */}
                  {step === 4 && (showDistanceOptions || showCityInput) && (
                    <button
                      onClick={() => {
                        setShowDistanceOptions(false);
                        setShowCityInput(false);
                      }}
                      className="text-[10px] font-black text-michelin-gray hover:text-michelin-red transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                      <RotateCcw size={10} /> Changer de mode
                    </button>
                  )}
                </div>
                <h2 className="text-2xl md:text-5xl font-serif text-michelin-black tracking-tight leading-tight uppercase">
                  {step === 4 && showDistanceOptions ? "Quel rayon ?" : step === 4 && showCityInput ? "Quelle ville ?" : currentStep.question}
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Étape 4 - Sous-vue : Sélection du Rayon */}
                {step === 4 && showDistanceOptions ? (
                  [
                    { label: "À proximité", value: 5, subtitle: "Moins de 5 km" },
                    { label: "Court trajet", value: 20, subtitle: "Moins de 20 km" },
                    { label: "Région", value: 50, subtitle: "Moins de 50 km" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPrefs({ ...prefs, radius: opt.value, targetCity: "" });
                        onComplete({ ...prefs, radius: opt.value, targetCity: "" });
                      }}
                      className="flex flex-col items-start justify-between p-5 md:p-8 rounded-[1.5rem] bg-gray-50 border border-gray-100 hover:border-michelin-red hover:bg-white group shadow-sm transition-all text-left"
                    >
                      <div className="p-2.5 md:p-3.5 rounded-xl bg-white border border-gray-100 text-gray-400 group-hover:text-michelin-red transition-all mb-3 md:mb-4">
                        <Navigation size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-base md:text-lg text-michelin-black tracking-tight group-hover:text-michelin-red transition-colors">{opt.label}</span>
                        <div className="text-[10px] font-black text-michelin-red uppercase tracking-[0.1em] pt-0.5 opacity-60">
                          {opt.subtitle}
                        </div>
                      </div>
                    </button>
                  ))
                ) : step === 4 && showCityInput ? (
                  /* Étape 4 - Sous-vue : Saisie de la Ville */
                  <div className="md:col-span-2 space-y-6">
                    <div className="relative">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Entrez une ville (ex: Paris)"
                        value={tempCity}
                        onChange={(e) => setTempCity(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && tempCity.trim()) {
                            setPrefs({ ...prefs, targetCity: tempCity.trim(), radius: 5000 });
                            onComplete({ ...prefs, targetCity: tempCity.trim(), radius: 5000 });
                          }
                        }}
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-michelin-red rounded-2xl md:rounded-3xl p-5 md:p-8 text-lg md:text-2xl font-serif text-michelin-black outline-none transition-all placeholder:text-gray-300 shadow-inner"
                      />
                      <button
                        onClick={() => {
                          if (tempCity.trim()) {
                            setPrefs({ ...prefs, targetCity: tempCity.trim(), radius: 5000 });
                            onComplete({ ...prefs, targetCity: tempCity.trim(), radius: 5000 });
                          }
                        }}
                        className="mt-4 md:mt-0 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 bg-michelin-red text-white w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        disabled={!tempCity.trim()}
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Rendu des options standards pour les étapes 1 à 3 */
                  currentStep.options.map((opt: any) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => {
                        if (step === 4) {
                          if (opt.value === "city") setShowCityInput(true);
                          else setShowDistanceOptions(true);
                        } else {
                          setPrefs({ ...prefs, [currentStep.key]: opt.value });
                          nextStep();
                        }
                      }}
                      className={cn(
                        "flex flex-col items-start justify-between p-5 md:p-8 rounded-[1.5rem] transition-all duration-300 text-left",
                        "bg-gray-50 border border-gray-100 hover:border-michelin-red hover:bg-white group shadow-sm",
                        currentStep.id === 3 && opt.value === 4 ? "md:col-span-2" : ""
                      )}
                    >
                      <div className="p-2.5 md:p-3.5 rounded-xl bg-white border border-gray-100 text-gray-400 group-hover:text-michelin-red transition-all mb-3 md:mb-4">
                        <opt.icon size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-base md:text-lg text-michelin-black tracking-tight group-hover:text-michelin-red transition-colors">{opt.label}</span>
                        {opt.subtitle && (
                          <div className="text-[10px] font-black text-michelin-red uppercase tracking-[0.1em] pt-0.5 opacity-60">
                            {opt.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Contrôles de navigation bas de carte */}
          <div className="mt-8 md:mt-12 flex justify-between items-center text-michelin-gray text-xs font-bold tracking-widest uppercase">
            <span>Étape {step}/4</span>
            <button
              onClick={() => {
                if (step === 4 && (showDistanceOptions || showCityInput)) {
                  setShowDistanceOptions(false);
                  setShowCityInput(false);
                } else {
                  setStep(step > 1 ? step - 1 : 1);
                }
              }}
              className="hover:text-michelin-red transition-colors flex items-center gap-2"
            >
              Précédent
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
