import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowLeft, X } from 'lucide-react';
import { Restaurant } from '../../data/restaurants';
import RestaurantCard from './RestaurantCard';
import RestaurantDetails from './RestaurantDetails';

interface RouletteSelectorProps {
  restaurants: Restaurant[];
  userLocation: { lat: number; lng: number } | null;
  onExit: () => void;
  onConfirmBooking: (restaurant: Restaurant, details: any) => void;
}

/**
 * Composant du Mode Roulette.
 * Gère une animation de sélection aléatoire parmi une liste de restaurants filtrés.
 * 
 * @param {Restaurant[]} restaurants Liste des établissements éligibles au tirage
 * @param {UserLocation} userLocation Coordonnées de l'utilisateur pour le calcul des distances
 * @param {Function} onExit Callback de fermeture du mode
 * @param {Function} onConfirmBooking Callback de succès de réservation
 */
export default function RouletteSelector({ restaurants, userLocation, onExit, onConfirmBooking }: RouletteSelectorProps) {
  const [isSpinning, setIsSpinning] = useState(true);
  const [spinIndex, setSpinIndex] = useState(0);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<Restaurant | null>(null);
  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialise et gère l'animation de la roulette.
   * Fait défiler les images à grande vitesse puis s'arrête sur un gagnant aléatoire.
   */
  const startSpin = () => {
    setIsSpinning(true);
    setWinner(null);
    let count = 0;
    const duration = 2500; // Durée totale de l'animation (ms)
    const intervalTime = 100;
    const totalSteps = duration / intervalTime;

    spinInterval.current = setInterval(() => {
      // Rotation cyclique dans la liste
      setSpinIndex((prev) => (prev + 1) % restaurants.length);
      count++;

      // Arrêt de l'animation après la durée impartie
      if (count >= totalSteps) {
        if (spinInterval.current) clearInterval(spinInterval.current);
        const finalWinner = restaurants[Math.floor(Math.random() * restaurants.length)];
        setWinner(finalWinner);
        setIsSpinning(false);
      }
    }, intervalTime);
  };

  useEffect(() => {
    startSpin();
    return () => {
      if (spinInterval.current) clearInterval(spinInterval.current);
    };
  }, [restaurants]);

  /**
   * Formate la distance de manière humaine (mètres ou km).
   * @param {Restaurant} restaurant 
   * @returns {string} Distance formatée
   */
  const getFormattedDistance = (restaurant: Restaurant) => {
    if (typeof restaurant.distance === 'undefined') return "À proximité";
    // Si la distance est < 1 km, on affiche en mètres
    if (restaurant.distance < 1) {
      return `${(restaurant.distance * 1000).toFixed(0)} m`;
    }
    // Sinon on affiche en kilomètres
    return `${restaurant.distance.toFixed(1)} km`;
  };

  /**
   * Gère la validation finale de la réservation
   */
  const handleConfirmBooking = (restaurant: Restaurant, details: any) => {
    if (onConfirmBooking) {
      onConfirmBooking(restaurant, details);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* 
        HEADER DYNAMIQUE : Affiche la ville du gagnant ou de la sélection actuelle
      */}
      <header className="shrink-0 p-3 md:p-4 flex justify-between items-center z-50 w-full bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
        <button
          onClick={onExit}
          className="p-2 md:p-3 rounded-full bg-gray-50 border border-gray-100 hover:border-michelin-red transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-michelin-red animate-pulse" />
            <span className="text-michelin-black font-black text-[10px] md:text-xs uppercase tracking-[0.3em]">Michelin GO</span>
          </div>
          <span className="text-michelin-red font-black text-[9px] md:text-[10px] uppercase tracking-widest leading-none px-3 py-1 bg-michelin-red/5 rounded-full border border-michelin-red/10">
            MODE ROULETTE • {isSpinning ? restaurants[spinIndex]?.location.city : (winner ? winner.location.city : (restaurants[0]?.location.city || "REIMS"))}
          </span>
        </div>
        <button
          onClick={onExit}
          className="p-2 md:p-3 rounded-full bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all shadow-sm"
        >
          <X size={18} />
        </button>
      </header>

      {/* 
        MAIN CONTENT : Zone de rendu centrée
      */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 relative">
        <AnimatePresence mode="wait">
          {isSpinning ? (
            /* Phase 1 : Animation de tirage aléatoire */
            <motion.div
              key="spinning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-michelin-red/20 rounded-full"
                />
                <RefreshCw size={32} className="text-michelin-red animate-spin" />
              </div>

              <div className="w-full max-w-sm bg-white p-5 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden">
                  <img
                    src={restaurants[spinIndex]?.image}
                    className="w-full h-full object-cover grayscale opacity-30"
                    alt="Spinning"
                  />
                </div>
                <div className="flex-1 text-left space-y-2">
                  <div className="h-3.5 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
            </motion.div>
          ) : winner ? (
            /* Phase 2 : Résultat final avec carte interactive */
            <motion.div
              key="winner"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full max-w-md"
            >
              {/* Carte du restaurant gagnant - Mode Compact pour accommoder le bouton Relancer */}
              <div className="w-full max-w-[300px] md:max-w-[360px] aspect-[9/16] md:aspect-auto md:h-[600px] shadow-2xl rounded-[2.5rem] flex items-center justify-center transition-all bg-white overflow-hidden">
                <RestaurantCard
                  restaurant={winner}
                  distance={getFormattedDistance(winner)}
                  isCompact={true}
                  onSwipeLeft={() => { }}
                  onSwipeRight={() => setSelectedDetails(winner)}
                  onAlreadyDone={() => startSpin()}
                  footerAction={
                    /* Bouton de relance intégré en bas de la carte */
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startSpin();
                      }}
                      className="w-full flex items-center justify-center gap-2 text-michelin-gray hover:text-michelin-red transition-all text-xs font-black uppercase tracking-[0.2em] py-3"
                    >
                      <RefreshCw size={12} />
                      <span>Relancer la roulette</span>
                    </button>
                  }
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      {/* Overlay de détails complets */}
      <AnimatePresence>
        {selectedDetails && (
          <RestaurantDetails
            restaurant={selectedDetails}
            distance={getFormattedDistance(selectedDetails)}
            onClose={() => setSelectedDetails(null)}
            onConfirmBooking={handleConfirmBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
