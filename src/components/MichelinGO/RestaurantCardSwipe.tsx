"use client";

import React from "react";
import { Star, Navigation, CheckCircle } from "lucide-react";
import { Restaurant } from "@/data/restaurants";
import { cn } from "@/lib/utils";

interface RestaurantCardSwipeProps {
  restaurant: Restaurant;
  distance?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onAlreadyDone: () => void;
  isCompact?: boolean;
}

/**
 * Composant de carte SPÉCIALISÉ pour le mode Swipe.
 * Basé sur le design Premium de la Roulette but optimisé pour le swipe.
 */
export default function RestaurantCardSwipe({
  restaurant,
  distance,
  onSwipeLeft,
  onSwipeRight,
  onAlreadyDone,
  isCompact = true
}: RestaurantCardSwipeProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden group rounded-[2.5rem] border border-gray-100">
      {/* 
        ZONE IMAGE : Format Premium 
      */}
      <div className={cn(
        "relative overflow-hidden transition-all duration-500 shrink-0",
        isCompact ? "h-[40%] md:h-[45%]" : "h-[48%] md:h-[55%]"
      )}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Badges Michelin */}
        <div className="absolute top-4 left-4">
          {restaurant.stars > 0 && (
            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-gray-100">
              <Star size={12} className="fill-michelin-red text-michelin-red" />
              <span className="text-michelin-black font-black text-[9px] uppercase tracking-wider">
                {restaurant.stars} {restaurant.stars > 1 ? 'Étoiles' : 'Étoile'}
              </span>
            </div>
          )}
        </div>

        {/* Informations rapides (Prix & Distance) */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-white px-3 py-1.5 rounded-xl shadow-lg border border-gray-100">
            <span className="text-michelin-red font-bold text-[9px] uppercase tracking-widest">{restaurant.priceRange}</span>
          </div>
          {distance && (
            <div className="bg-white px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-1.5">
              <Navigation size={10} className="text-michelin-gray" />
              <span className="text-michelin-black font-bold text-[9px]">{distance}</span>
            </div>
          )}
        </div>
      </div>

      {/* 
        ZONE TEXTE : Contenu Premium 
      */}
      <div className={cn(
        "flex-1 flex flex-col justify-between bg-white relative p-4 md:p-6",
        !isCompact && "p-6 md:p-8"
      )}>
        <div className="space-y-2 md:space-y-4">
          <div className="space-y-0.5">
            <h3 className={cn(
              "font-serif text-michelin-black leading-tight tracking-tight",
              isCompact ? "text-2xl" : "text-3xl md:text-5xl"
            )}>{restaurant.name}</h3>
            <p className="text-michelin-gray font-bold text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-80">{restaurant.category} • {restaurant.location.city}</p>
          </div>

          <p className={cn(
            "text-michelin-gray/90 leading-relaxed italic font-medium overflow-hidden",
            isCompact ? "text-[11px] line-clamp-2" : "text-sm md:text-base line-clamp-3"
          )}>
            &laquo; {restaurant.description} &raquo;
          </p>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {restaurant.vibes?.slice(0, 2).map((vibe, i) => (
              <span 
                key={i} 
                className="uppercase text-michelin-red px-2 py-0.5 bg-michelin-red/5 rounded-md border border-michelin-red/10 opacity-70 font-bold text-[10px]"
              >
                {vibe}
              </span>
            ))}
          </div>
        </div>

        {/* 
          ACTIONS : Bouton massif spécial Swipe 
        */}
        <div className={cn(
          "flex flex-col w-full gap-3 pt-3",
          !isCompact && "pt-6 md:pt-8"
        )}>
          <div className="flex gap-3">
            <button
              onClick={onSwipeRight}
              className="flex-1 h-14 md:h-16 bg-michelin-red text-white flex items-center justify-center rounded-2xl font-black text-xs uppercase tracking-[0.25em] hover:bg-michelin-red-dark transition-all shadow-xl shadow-michelin-red/30 active:scale-95 outline-none"
            >
              Réserver
            </button>
            <button
              onClick={onAlreadyDone}
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-50 text-michelin-gray hover:bg-gray-100 hover:text-michelin-black transition-all border border-gray-100 flex items-center justify-center outline-none shrink-0"
              title="Déjà fait / Passer"
            >
              <CheckCircle size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
