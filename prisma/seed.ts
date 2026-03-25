import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('Seeding database...')

  // Create Morocco country
  const morocco = await prisma.country.upsert({
    where: { name: 'Morocco' },
    update: {},
    create: {
      name: 'Morocco',
      nameAr: 'المغرب',
      nameFr: 'Maroc',
    },
  })

  console.log('Created country:', morocco.name)

  // Moroccan cities
  const citiesData = [
    { name: 'Casablanca', nameAr: 'الدار البيضاء', nameFr: 'Casablanca' },
    { name: 'Rabat', nameAr: 'الرباط', nameFr: 'Rabat' },
    { name: 'Marrakech', nameAr: 'مراكش', nameFr: 'Marrakech' },
    { name: 'Fès', nameAr: 'فاس', nameFr: 'Fès' },
    { name: 'Tanger', nameAr: 'طنجة', nameFr: 'Tanger' },
    { name: 'Agadir', nameAr: 'أكادير', nameFr: 'Agadir' },
    { name: 'Meknès', nameAr: 'مكناس', nameFr: 'Meknès' },
    { name: 'Oujda', nameAr: 'وجدة', nameFr: 'Oujda' },
    { name: 'Kenitra', nameAr: 'القنيطرة', nameFr: 'Kénitra' },
    { name: 'Tétouan', nameAr: 'تطوان', nameFr: 'Tétouan' },
    { name: 'Salé', nameAr: 'سلا', nameFr: 'Salé' },
    { name: 'Mohammedia', nameAr: 'المحمدية', nameFr: 'Mohammedia' },
  ]

  for (const city of citiesData) {
    await prisma.city.upsert({
      where: { name_countryId: { name: city.name, countryId: morocco.id } },
      update: {},
      create: { ...city, countryId: morocco.id },
    })
  }
  console.log(`Created ${citiesData.length} cities`)

  // Service categories
  const categoriesData = [
    { slug: 'plumbing', name: 'Plumbing', nameAr: 'السباكة', nameFr: 'Plomberie', icon: '🔧', order: 1 },
    { slug: 'electricity', name: 'Electricity', nameAr: 'الكهرباء', nameFr: 'Électricité', icon: '⚡', order: 2 },
    { slug: 'cleaning', name: 'Cleaning', nameAr: 'التنظيف', nameFr: 'Ménage & Nettoyage', icon: '🧹', order: 3 },
    { slug: 'carpentry', name: 'Carpentry', nameAr: 'النجارة', nameFr: 'Menuiserie', icon: '🪚', order: 4 },
    { slug: 'painting', name: 'Painting', nameAr: 'الدهن', nameFr: 'Peinture', icon: '🎨', order: 5 },
    { slug: 'hvac', name: 'HVAC / AC', nameAr: 'التكييف', nameFr: 'Climatisation', icon: '❄️', order: 6 },
    { slug: 'car-wash', name: 'Car Wash', nameAr: 'غسيل السيارات', nameFr: 'Lavage Auto', icon: '🚗', order: 7 },
    { slug: 'moving', name: 'Moving', nameAr: 'نقل العفش', nameFr: 'Déménagement', icon: '📦', order: 8 },
    { slug: 'gardening', name: 'Gardening', nameAr: 'البستنة', nameFr: 'Jardinage', icon: '🌿', order: 9 },
    { slug: 'security', name: 'Security', nameAr: 'الأمن', nameFr: 'Sécurité', icon: '🔒', order: 10 },
    { slug: 'masonry', name: 'Masonry', nameAr: 'البناء', nameFr: 'Maçonnerie', icon: '🧱', order: 11 },
    { slug: 'welding', name: 'Welding', nameAr: 'اللحام', nameFr: 'Soudure', icon: '⚙️', order: 12 },
  ]

  for (const cat of categoriesData) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    })
  }
  console.log(`Created ${categoriesData.length} service categories`)

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
