import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Restaurant } from '@/data/restaurants';

/**
 * Calcule la distance orthodromique entre deux points GPS en utilisant la formule de Haversine (en km).
 * Utilisé ici côté serveur pour filtrer les restaurants par rayon.
 * 
 * @param {number} lat1 Latitude A
 * @param {number} lon1 Longitude A
 * @param {number} lat2 Latitude B
 * @param {number} lon2 Longitude B
 * @returns {number} Distance en kilomètres
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

/**
 * Cache mémoire pour éviter de relire le fichier JSON (36Mo) à chaque requête HTTP.
 * Ce cache est partagé entre toutes les requêtes tant que l'instance du serveur tourne.
 */
let cachedRestaurants: Restaurant[] | null = null;

/**
 * Point d'entrée de l'API pour récupérer les recommandations de restaurants.
 * Supporte le filtrage par localisation (lat/lng/rayon) et par ville.
 * 
 * @param {Request} request Objet de requête Next.js
 * @returns {NextResponse} Liste des restaurants au format JSON
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '48.8566');
  const lng = parseFloat(searchParams.get('lng') || '2.3522');
  const radius = parseFloat(searchParams.get('radius') || '50');
  const cityParam = searchParams.get('city') || '';
  const limit = parseInt(searchParams.get('limit') || '40');

  try {
    // 1. Initialisation du cache si vide (Lazy loading du JSON d'excellence)
    if (!cachedRestaurants) {
      const filePath = path.join(process.cwd(), 'src/data/restaurants_optimized.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      cachedRestaurants = JSON.parse(fileContents);
    }

    if (!cachedRestaurants) return NextResponse.json([]);

    let filtered = cachedRestaurants;

    // 2. Filtrage par ville si le paramètre est fourni (ex: "Reims", "Rennes")
    if (cityParam) {
      const cityResults = cachedRestaurants.filter((r: Restaurant) => 
        r.location.city.toLowerCase().includes(cityParam.toLowerCase())
      );
      if (cityResults.length > 0) {
        filtered = cityResults;
      }
    }

    // 3. Calcul des distances et préparation des métadonnées
    const restaurantsWithDistance = filtered.map((r: Restaurant) => ({
      ...r,
      distance: getDistance(lat, lng, r.location.lat, r.location.lng),
      // Complétion des champs manquants par des valeurs par défaut
      weatherFit: r.weatherFit || "all",
      openingStatus: r.openingStatus || "open",
    }));

    // 4. Tri par proximité et application du rayon de recherche
    const nearby = (cityParam ? restaurantsWithDistance : restaurantsWithDistance.filter(r => (r.distance || 0) <= radius))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);

    return NextResponse.json(nearby);
  } catch (error) {
    console.error('Erreur API Recommendations:', error);
    return NextResponse.json({ error: 'Échec du chargement des restaurants' }, { status: 500 });
  }
}
