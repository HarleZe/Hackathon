"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import RestaurantCardSwipe from "./RestaurantCardSwipe";
import RestaurantDetails from "./RestaurantDetails";
import { Restaurant } from "@/data/restaurants";
import { ArrowLeft, RefreshCw, X, Trophy } from "lucide-react";
import { calculateDistance, UserLocation } from "@/services/location";
import { cn } from "@/lib/utils";

interface SwipeDeckProps {
  restaurants: Restaurant[];
  userLocation: UserLocation;
  onExit: () => void;
  onConfirmBooking?: (restaurant: Restaurant, details: any) => void;
}

/**
 * Composant principal du Mode Swipe.
 * Gère une pile de cartes (stack) que l'utilisateur peut balayer à gauche (refus) ou à droite (détails/réservation).
 * 
 * @param {Restaurant[]} initialRestaurants Liste des restaurants filtrés
 * @param {UserLocation} userLocation Localisation utilisateur pour le calcul des distances
 * @param {Function} onExit Callback pour quitter le mode
 * @param {Function} onConfirmBooking Callback de succès de réservation
 */
import { useUserRestaurants } from "@/hooks/useUserRestaurants";

export default function SwipeDeck({ restaurants: initialRestaurants, userLocation, onExit, onConfirmBooking }: SwipeDeckProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [selectedDetails, setSelectedDetails] = useState<Restaurant | null>(null);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null);
  const { favorites, visited, toggleFavorite, toggleVisited } = useUserRestaurants();

  /**
   * Calcul mémoïsé des distances pour optimiser les performances lors des animations de swipe.
   */
  const restaurantsWithDistance = useMemo(() => {
    return restaurants.map(r => {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        r.location.lat,
        r.location.lng
      );
      return {
        ...r,
        distanceText: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`
      };
    });
  }, [restaurants, userLocation]);

  const activeIndex = restaurants.length - 1; // La carte visible est la dernière du tableau (Stack)
  const currentRestaurant = restaurantsWithDistance[activeIndex];

  /**
   * Action de refus : retire la carte du dessus.
   */
  const handleSwipeLeft = () => {
    setLastDirection('left');
    setRestaurants((prev) => prev.slice(0, -1));
  };

  /**
   * Action de sélection : ouvre l'overlay de détails.
   */
  const handleSwipeRight = () => {
    setLastDirection('right');
    setSelectedDetails(currentRestaurant);
  };

  /**
   * Fermeture du mode après confirmation de réservation.
   */
  const handleConfirmBooking = (restaurant: Restaurant, details: any) => {
    if (onConfirmBooking) {
      onConfirmBooking(restaurant, details);
    }
  };

  const handleAlreadyDone = () => {
    setLastDirection('right'); // Ou neutre
    setRestaurants((prev) => prev.slice(0, -1));
  };

  /**
   * État de fin : affiche un écran de félicitations quand la pile est vide.
   */
  if (restaurants.length === 0) {
    return (
      <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
        <div className="p-10 rounded-[3rem] bg-gray-50 border border-gray-100 flex items-center justify-center shadow-xl shadow-gray-200/50">
          <Trophy size={48} className="text-michelin-red" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black text-michelin-black tracking-tight uppercase">Plus de matchs !</h2>
          <p className="text-michelin-gray font-medium max-w-xs mx-auto">
            Vous avez parcouru toutes les pépites à proximité. Affinez vos critères pour de nouvelles découvertes.
          </p>
        </div>
        <button
          onClick={onExit}
          className="px-10 py-5 bg-michelin-red text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-michelin-red/20 hover:scale-105 active:scale-95 transition-all outline-none"
        >
          Retour au menu
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 flex flex-col overflow-hidden font-sans">
      {/* 
        HEADER DYNAMIQUE : Affiche le nombre d'options et la ville de la carte active
      */}
      <header className="shrink-0 p-2 md:p-4 flex justify-between items-center z-50 w-full bg-white border-b border-gray-100 shadow-sm transition-all">
        <button
          onClick={onExit}
          className="p-1.5 md:p-3 rounded-full bg-gray-50 border border-gray-100 hover:border-michelin-red transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-michelin-red animate-pulse" />
            <span className="text-michelin-black font-black text-[9px] md:text-xs uppercase tracking-[0.3em]">Michelin GO</span>
          </div>
          <span className="text-michelin-red font-black text-[8px] md:text-[10px] uppercase tracking-widest leading-none px-2 py-1 bg-michelin-red/5 rounded-full">
            {restaurants.length} OPTIONS RESTANTES • {currentRestaurant?.location.city || "À PROXIMITÉ"}
          </span>
        </div>
        <button
          onClick={onExit}
          className="p-1.5 md:p-3 rounded-full bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all shadow-sm"
        >
          <X size={18} />
        </button>
      </header>

      {/* ZONE DE CARTES : Pile optimisée */}
      <main className="flex-1 relative flex items-center justify-center p-4">
        <div className="relative w-full max-w-[340px] md:max-w-[420px] aspect-[9/16] h-[66vh] md:h-[75vh] flex items-center justify-center">
          <AnimatePresence custom={lastDirection}>
            {restaurantsWithDistance.map((res, index) => {
              const isTop = index === activeIndex;
              return (
                <DraggableCard
                  key={res.id}
                  restaurant={res}
                  distance={res.distanceText}
                  isTop={isTop}
                  direction={lastDirection}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onAlreadyDone={handleAlreadyDone}
                  isFavorite={favorites.includes(res.id)}
                  isVisited={visited.includes(res.id)}
                  onToggleFavorite={() => toggleFavorite(res.id)}
                  onToggleVisited={() => toggleVisited(res.id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* OVERLAY DÉTAILS : Affiché lors d'un swipe droit */}
      <AnimatePresence>
        {selectedDetails && (
          <RestaurantDetails
            restaurant={selectedDetails}
            distance={restaurantsWithDistance.find(r => r.id === selectedDetails.id)?.distanceText || "..."}
            onClose={() => setSelectedDetails(null)}
            onConfirmBooking={handleConfirmBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Composant de carte interactive gérant les gestes (Drag) via Framer Motion.
 */
function DraggableCard({
  restaurant,
  distance,
  isTop,
  direction,
  onSwipeLeft,
  onSwipeRight,
  onAlreadyDone,
  isFavorite,
  isVisited,
  onToggleFavorite,
  onToggleVisited,
}: {
  restaurant: Restaurant;
  distance: string;
  isTop: boolean;
  direction: 'left' | 'right' | null;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onAlreadyDone: () => void;
  isFavorite?: boolean;
  isVisited?: boolean;
  onToggleFavorite?: () => void;
  onToggleVisited?: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const dragOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      style={isTop ? { x, rotate, opacity: dragOpacity } : {}}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onSwipeRight();
        else if (info.offset.x < -100) onSwipeLeft();
      }}
      className={cn(
        "absolute inset-0 cursor-grab active:cursor-grabbing rounded-[2.5rem] bg-white",
        isTop ? "z-20 shadow-2xl shadow-black/10" : "z-10 pointer-events-none"
      )}
      initial={false}
      animate={{ 
        scale: isTop ? 1 : 0.95,
        y: isTop ? 0 : 16,
        opacity: isTop ? 1 : 0.5,
      }}
      exit={{ 
        x: direction === 'left' ? -600 : 600, 
        opacity: 0, 
        scale: 0.9,
        transition: { duration: 0.4 } 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <RestaurantCardSwipe
        restaurant={restaurant}
        distance={distance}
        isCompact={true}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        onAlreadyDone={onAlreadyDone}
        isFavorite={isFavorite}
        isVisited={isVisited}
        onToggleFavorite={onToggleFavorite}
        onToggleVisited={onToggleVisited}
      />
    </motion.div>
  );
}
