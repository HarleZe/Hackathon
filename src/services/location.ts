/**
 * Interface représentant la localisation d'un utilisateur avec sa ville
 */
export interface UserLocation {
  lat: number;
  lng: number;
  city: string;
}

/**
 * Coordonnées par défaut (Reims) en cas d'échec de la géolocalisation ou refus de l'utilisateur
 */
export const DEFAULT_LOCATION: UserLocation = {
  lat: 49.2583,
  lng: 4.0317,
  city: "Reims"
};

/**
 * Récupère la position GPS actuelle de l'utilisateur via l'API Geolocation du navigateur.
 * En cas d'erreur (timeout, refus) ou d'environnement non supporté (SSR), 
 * la fonction retourne silencieusement la position DEFAULT_LOCATION.
 * 
 * @returns {Promise<UserLocation>} Coordonnées lat/lng et nom de la ville
 */
export async function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve) => {
    // Vérification de l'environnement côté client uniquement
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(DEFAULT_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: "Ma position"
        });
      },
      () => {
        // Redirection vers le mode par défaut en cas d'erreur de permission
        resolve(DEFAULT_LOCATION);
      },
      { timeout: 5000 }
    );
  });
}

/**
 * Calcule la distance orthodromique entre deux points GPS en utilisant la formule de Haversine.
 * Cette version retourne un résultat précis en kilomètres, tenant compte de la courbure terrestre.
 * 
 * @param {number} lat1 Latitude du point A
 * @param {number} lon1 Longitude du point A
 * @param {number} lat2 Latitude du point B
 * @param {number} lon2 Longitude du point B
 * @returns {number} Distance en kilomètres (km)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}
