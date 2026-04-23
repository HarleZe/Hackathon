import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(__dirname, '../src/data/restaurants_optimized.json')
  
  if (!fs.existsSync(filePath)) {
    console.error('JSON file not found at:', filePath)
    return
  }

  const restaurants = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  console.log(`Starting seed with ${restaurants.length} restaurants...`)

  // Delete existing data to avoid conflicts on re-run
  await prisma.restaurant.deleteMany({})

  // Batch create to speed up
  const batchSize = 1000
  for (let i = 0; i < restaurants.length; i += batchSize) {
    const batch = restaurants.slice(i, i + batchSize).map((res: any) => ({
      id: res.id.toString(),
      name: res.name,
      stars: res.stars || 0,
      image: res.image || '',
      video: res.video || null,
      priceRange: res.priceRange || '€',
      category: res.category || 'Restaurant',
      vibes: JSON.stringify(res.vibes || []),
      description: res.description || "",
      expertReview: res.expertReview || null,
      facilities: JSON.stringify(res.facilities || []),
      weatherFit: res.weatherFit || "all",
      openingStatus: res.openingStatus || "open",
      lat: res.location.lat,
      lng: res.location.lng,
      address: res.location.address,
      city: res.location.city,
      phone: res.phone || null,
      website: res.website || null,
      hours: res.hours || null,
    }))

    await prisma.restaurant.createMany({
      data: batch,
    })
    console.log(`Processed ${Math.min(i + batchSize, restaurants.length)} / ${restaurants.length}`)
  }

  console.log('Seed finished successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
