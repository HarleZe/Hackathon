"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Navigation, RotateCcw, Hand, ArrowRight, Info, RefreshCw } from "lucide-react";
import FlashSelector from "@/components/MichelinGO/FlashSelector";
import SwipeDeck from "@/components/MichelinGO/SwipeDeck";
import RouletteSelector from "@/components/MichelinGO/RouletteSelector";
import { getContextualMatches, Context } from "@/services/contextualAI";
import { Restaurant } from "@/data/restaurants";
import { getUserLocation, UserLocation } from "@/services/location";
import { cn } from "@/lib/utils";

/**
 * Types pour la gestion des vues et des modes de l'application
 */
type View = "portal" | "onboarding" | "swipe" | "roulette";
type Mode = "swipe" | "roulette";

/**
 * Point d'entrée principal de l'application Michelin GO.
 * Gère le cycle de vie complet : Portail -> Configuration -> Modes.
 * 
 * Architecture "Single Page" pilotée par l'état 'view' pour une fluidité maximale.
 */
export default function Home() {
  // États de navigation et de stockage des données
  const [view, setView] = useState<View>("portal");
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [matches, setMatches] = useState<Restaurant[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialise le tunnel de recherche pour un mode spécifique.
   * @param {Mode} mode "swipe" ou "roulette"
   */
  const startOnboarding = (mode: Mode) => {
    setSelectedMode(mode);
    setView("onboarding");
  };

  /**
   * Traitement final après la configuration des préférences.
   * 1. Récupère la position GPS réelle (ou défaut Reims).
   * 2. Interroge le moteur de recommandation contextuel.
   * 3. Bascule vers l'interface de jeu sélectionnée.
   * 
   * @param {any} prefs Préférences utilisateur (budget, faim, etc.)
   */
  const handleOnboardingComplete = async (prefs: any) => {
    setIsLoading(true);
    try {
      // 1. Récupération de la localisation GPS réelle
      const location = await getUserLocation();
      setUserLocation(location);

      // 2. Création du contexte pour l'algorithme de recommandation
      const context: Context = {
        weather: "sunny",
        time: new Date().toLocaleTimeString(),
        userLocation: location,
        userPrefs: prefs
      };

      // 3. Récupération des restaurants filtrés via le service IA
      const filtered = await getContextualMatches(context);
      setMatches(filtered);

      // 4. Passage à la vue finale
      setView(selectedMode === "swipe" ? "swipe" : "roulette");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-michelin-black flex flex-col font-sans">
      {/* En-tête Michelin - Masqué pendant les modes de jeu pour plus d'immersion */}
      {view === "portal" && (
        <header className="w-full px-6 py-6 flex items-center justify-between bg-white z-50">
          <div className="flex items-center gap-2">
            <span className="text-michelin-red font-black text-2xl tracking-tighter">MICHELIN</span>
            <div className="bg-michelin-red text-white text-[10px] font-black px-2 py-0.5 rounded cursor-default">GO</div>
          </div>
        </header>
      )}

      <AnimatePresence mode="wait">
        {/* Overlay de chargement avec animation premium */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-8"
          >
            <div className="relative">
              <div className="w-24 h-24 border-2 border-gray-100 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-24 h-24 border-t-2 border-michelin-red rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-michelin-red animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif text-michelin-black tracking-tight">Génération de votre sélection...</h2>
              <p className="text-michelin-gray font-medium">Recherche des meilleures tables autour de vous</p>
            </div>
          </motion.div>
        )}

        {/* Vue d'accueil (Le Portail) */}
        {view === "portal" && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative"
          >
            <div className="mb-16 text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-michelin-red text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-sm shadow-lg">
                <Navigation size={12} className="fill-white" />
                Nouveauté : Michelin GO
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-michelin-black tracking-tight leading-none">
                L'Émotion <span className="text-michelin-red italic">Instantanée</span>.
              </h1>
              <p className="text-michelin-gray text-xl max-w-2xl mx-auto font-medium font-sans">
                Accélérez votre sélection gastronomique. Choisissez votre expérience de recherche optimisée pour découvrir les meilleures tables d'excellence.
              </p>
            </div>

            {/* Cartes de Sélection des Modes */}
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
              {/* Carte Mode Swipe */}
              <button
                onClick={() => startOnboarding("swipe")}
                className="group relative bg-[#f7f7f7] hover:bg-white rounded-[2rem] p-12 text-left border-2 border-transparent hover:border-michelin-red transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="flex flex-col h-full justify-between gap-12">
                  <div className="w-16 h-16 rounded-2xl bg-michelin-red/5 flex items-center justify-center text-michelin-red group-hover:scale-110 transition-transform">
                    <Hand size={32} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif text-michelin-black underline decoration-michelin-red decoration-4 transition-all group-hover:decoration-8">Mode <span className="text-michelin-red">Swipe</span></h3>
                    <p className="text-michelin-gray leading-relaxed text-lg font-medium">La sélection visuelle. Parcourez les pépites gastronomiques de façon ludique et intuitive.</p>
                  </div>
                  <div className="flex items-center gap-2 text-michelin-red font-black text-sm tracking-widest bg-white w-fit px-6 py-3 rounded-full border border-michelin-red/20 group-hover:bg-michelin-red group-hover:text-white transition-all shadow-sm">
                    LANCER LE SWIPE <ArrowRight size={16} />
                  </div>
                </div>
              </button>

              {/* Carte Mode Roulette */}
              <button
                onClick={() => startOnboarding("roulette")}
                className="group relative bg-[#f7f7f7] hover:bg-white rounded-[2rem] p-12 text-left border-2 border-transparent hover:border-michelin-red transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="flex flex-col h-full justify-between gap-12">
                  <div className="w-16 h-16 rounded-2xl bg-michelin-red/5 flex items-center justify-center text-michelin-red group-hover:scale-110 transition-transform">
                    <RotateCcw size={32} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif text-michelin-black underline decoration-michelin-red decoration-4 transition-all group-hover:decoration-8">Mode <span className="text-michelin-red">Roulette</span></h3>
                    <p className="text-michelin-gray leading-relaxed text-lg font-medium">Laissez le destin décider. Un tirage au sort instantané parmi la sélection d'excellence.</p>
                  </div>
                  <div className="flex items-center gap-2 text-michelin-red font-black text-sm tracking-widest bg-white w-fit px-6 py-3 rounded-full border border-michelin-red/20 group-hover:bg-michelin-red group-hover:text-white transition-all shadow-sm">
                    LAISSER LE HASARD DÉCIDER <ArrowRight size={16} />
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Rendu dynamique des différentes vues de l'application */}
        {view === "onboarding" && (
          <FlashSelector key="onboarding" onComplete={handleOnboardingComplete} />
        )}

        {view === "swipe" && userLocation && (
          <SwipeDeck
            key="swipe"
            restaurants={matches}
            userLocation={userLocation}
            onExit={() => setView("portal")}
            onConfirmBooking={() => setView("portal")}
          />
        )}
        {view === "swipe" && !userLocation && (
          <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <RefreshCw className="animate-spin text-michelin-red" />
          </div>
        )}

        {view === "roulette" && userLocation && (
          <RouletteSelector
            key="roulette"
            restaurants={matches}
            userLocation={userLocation}
            onExit={() => setView("portal")}
            onConfirmBooking={() => setView("portal")}
          />
        )}
        {view === "roulette" && !userLocation && (
          <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
            <RefreshCw className="animate-spin text-michelin-red" />
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
