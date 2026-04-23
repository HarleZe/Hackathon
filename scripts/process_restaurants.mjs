import fs from 'fs';
import readline from 'readline';
import path from 'path';

const inputFile = './src/data/raw/all_restaurants.jsonl';
const outputFile = './src/data/restaurants_optimized.json';

// Helper to strip HTML tags
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// Helper to map stars
function mapStars(award) {
  if (award === 'THREE') return 3;
  if (award === 'TWO') return 2;
  if (award === 'ONE') return 1;
  return 0;
}

async function processFile() {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const restaurants = [];
  let count = 0;

  console.log('🔄 Démarrage du traitement...');

  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      
      const restaurant = {
        id: data.identifier || data.objectID,
        name: data.name,
        stars: mapStars(data.michelin_star),
        category: data.cuisines && data.cuisines[0] ? data.cuisines[0].label : 'Gastronomie',
        location: {
          city: data.city ? data.city.name : 'Inconnue',
          address: data.street || '',
          lat: data._geoloc ? data._geoloc.lat : 0,
          lng: data._geoloc ? data._geoloc.lng : 0
        },
        image: data.image || (data.main_image ? data.main_image.url : '/placeholder-restaurant.jpg'),
        description: stripHtml(data.main_desc || ''),
        priceRange: data.price_category ? data.price_category.label : '€€',
        vibes: data.tag_thematic ? data.tag_thematic.map(t => t.label) : ['Élégant'],
        facilities: data.facilities ? data.facilities.map(f => f.label) : ['Wifi', 'Climatisation'],
        website: data.website || '',
        hours: "Vérifier sur le site", // Simplified for now
        expertReview: stripHtml(data.main_desc || '')
      };

      restaurants.push(restaurant);
      count++;
      
      if (count % 1000 === 0) {
        console.log(`📍 ${count} restaurants traités...`);
      }
    } catch (err) {
      console.error('❌ Erreur sur une ligne :', err);
    }
  }

  console.log(`✅ Traitement terminé. ${count} restaurants exportés.`);
  
  fs.writeFileSync(outputFile, JSON.stringify(restaurants, null, 2));
  console.log(`💾 Fichier sauvegardé sous : ${outputFile}`);
}

processFile().catch(console.error);
