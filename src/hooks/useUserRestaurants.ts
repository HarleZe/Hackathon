"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook personnalisé pour gérer l'état utilisateur local (Favoris et Visités).
 * Synchronise les données avec l'API au chargement de la session.
 */
export function useUserRestaurants() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]); // Liste des IDs de restaurants favoris
  const [visited, setVisited] = useState<string[]>([]);     // Liste des IDs de restaurants déjà visités
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setIsLoading(true);
      Promise.all([
        fetch("/api/user/favorites").then(res => res.json()),
        fetch("/api/user/visited").then(res => res.json())
      ]).then(([favs, vis]) => {
        setFavorites(favs);
        setVisited(vis);
      }).finally(() => setIsLoading(false));
    }
  }, [session]);

  const toggleFavorite = async (restaurantId: string) => {
    if (!session) {
        // Rediriger vers login ou afficher un message
        return;
    }
    const isFavorite = favorites.includes(restaurantId);
    const method = isFavorite ? "DELETE" : "POST";
    
    // Optimistic update
    setFavorites(prev => isFavorite ? prev.filter(id => id !== restaurantId) : [...prev, restaurantId]);

    try {
        const res = await fetch("/api/user/favorites", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ restaurantId }),
        });
        if (!res.ok) throw new Error();
    } catch (error) {
        // Rollback
        setFavorites(prev => isFavorite ? [...prev, restaurantId] : prev.filter(id => id !== restaurantId));
    }
  };

  const toggleVisited = async (restaurantId: string) => {
    if (!session) return;
    const isVisited = visited.includes(restaurantId);
    const method = isVisited ? "DELETE" : "POST";
    
    // Optimistic update
    setVisited(prev => isVisited ? prev.filter(id => id !== restaurantId) : [...prev, restaurantId]);

    try {
        const res = await fetch("/api/user/visited", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ restaurantId }),
        });
        if (!res.ok) throw new Error();
    } catch (error) {
        // Rollback
        setVisited(prev => isVisited ? [...prev, restaurantId] : prev.filter(id => id !== restaurantId));
    }
  };

  return { favorites, visited, toggleFavorite, toggleVisited, isLoading };
}
