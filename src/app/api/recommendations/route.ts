import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Calcule la distance orthodromique entre deux points GPS en utilisant la formule de Haversine (en km).
 * Utilisé ici côté serveur pour filtrer les restaurants par rayon.
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
 * Point d'entrée de l'API pour récupérer les recommandations de restaurants.
 * Supporte le filtrage par localisation (lat/lng/rayon) et par ville.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '48.8566');
  const lng = parseFloat(searchParams.get('lng') || '2.3522');
  const radius = parseFloat(searchParams.get('radius') || '50');
  const cityParam = searchParams.get('city') || '';
  const limit = parseInt(searchParams.get('limit') || '40');

  try {
    // 1. Récupération des restaurants via Prisma
    let restaurants;
    
    if (cityParam) {
      restaurants = await prisma.restaurant.findMany({
        where: {
          city: {
            contains: cityParam,
          }
        }
      });
    } else {
      // Pour une recherche par rayon, on récupère tout ou une zone (boundingBox) pour filtrer ensuite en JS
      // SQLite ne gère pas nativement les distances GPS complexes facilement sans extension.
      // Avec 19k entrées, findMany() est très rapide.
      restaurants = await prisma.restaurant.findMany();
    }

    if (!restaurants) return NextResponse.json([]);

    // 2. Calcul des distances et préparation des métadonnées
    const restaurantsWithDistance = restaurants.map((r: any) => ({
      ...r,
      // On re-parse les champs JSON
      vibes: JSON.parse(r.vibes || "[]"),
      facilities: JSON.parse(r.facilities || "[]"),
      location: {
        lat: r.lat,
        lng: r.lng,
        address: r.address,
        city: r.city,
      },
      distance: getDistance(lat, lng, r.lat, r.lng),
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
