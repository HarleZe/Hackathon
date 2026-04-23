import { Restaurant } from "../data/restaurants";

/**
 * Types de conditions météorologiques supportées pour l'adaptation contextuelle
 */
export type WeatherCondition = "sunny" | "rainy";

/**
 * Interface représentant le contexte utilisateur au moment de la recherche.
 * Ces données sont utilisées pour filtrer et trier les recommandations.
 */
export interface Context {
  weather: WeatherCondition;
  time: string;
  userLocation: { lat: number; lng: number } | null;
  userPrefs: {
    hungryNow: boolean;
    vibe: "chill" | "chic";
    budget: number; // Niveau de 1 (économique) à 4 (luxe)
    radius: number; // Rayon de recherche en km
    targetCity?: string;
  };
}

/**
 * Moteur de recommandation contextuel ("Le Cerveau" de Michelin GO).
 * Récupère les restaurants via l'API interne et applique une couche de filtrage
 * secondaire basée sur les préférences fines de l'utilisateur (vibe, budget).
 * 
 * @param {Context} context Contexte utilisateur complet (lieu, météo, préférences)
 * @returns {Promise<Restaurant[]>} Liste triée et filtrée des meilleurs établissements
 */
export const getContextualMatches = async (context: Context): Promise<Restaurant[]> => {
  // Coordonnées de repli (Paris) si aucune localisation n'est fournie
  const lat = context.userLocation?.lat || 48.8566;
  const lng = context.userLocation?.lng || 2.3522;
  const radius = context.userPrefs.radius || 50;
  const city = context.userPrefs.targetCity || "";

  try {
    // 1. Appel à l'API interne avec les paramètres de base
    const response = await fetch(`/api/recommendations?lat=${lat}&lng=${lng}&radius=${radius}&city=${encodeURIComponent(city)}&limit=50`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    
    let results: Restaurant[] = await response.json();

    // 2. Filtrage secondaire heuristique
    results = results.filter(res => {
      // Conversion du label de prix (JSON) en niveau numérique pour comparaison
      const priceLevel = res.priceRange === "Spare no expense" ? 4 : 
                         res.priceRange.includes("€€€") ? 3 : 
                         res.priceRange.includes("€€") ? 2 : 1;
      
      if (priceLevel > context.userPrefs.budget) return false;

      // Filtre de "Vibe" : 
      // - Mode Chic : privilégie l'excellence (étoilés uniquement)
      // - Mode Chill : privilégie l'accessibilité (2 étoiles max)
      if (context.userPrefs.vibe === "chic" && res.stars === 0) return false;
      if (context.userPrefs.vibe === "chill" && res.stars > 2) return false;
      
      return true;
    });

    // 3. Algorithme de tri multi-critères :
    // Priorité 1 : Prestige (Nombre d'étoiles décroissant)
    // Priorité 2 : Proximité (Distance croissante)
    results.sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      return (a.distance || 0) - (b.distance || 0);
    });

    return results;
  } catch (error) {
    console.error('Erreur dans getContextualMatches:', error);
    return [];
  }
};

/**
 * Génère des points de preuve sociale ou des tags contextuels pour un restaurant.
 * Utilise les 'vibes' du Guide Michelin pour enrichir la présentation.
 * 
 * @param {Restaurant} restaurant L'établissement concerné
 * @returns {string[]} Liste de labels descriptifs
 */
export const getSocialProof = (restaurant: Restaurant): string[] => {
  return restaurant.vibes && restaurant.vibes.length > 0 
    ? restaurant.vibes 
    : ["Ambiance unique", "Plats signatures", "Service soigné"];
};
