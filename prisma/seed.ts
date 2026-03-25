import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
type Locale = 'en' | 'fr' | 'ar'

async function upsertTranslations(
  entries: { code: string; namespace: string; en: string; fr: string; ar: string }[]
) {
  for (const e of entries) {
    const locales: { locale: Locale; text: string }[] = [
      { locale: 'en', text: e.en },
      { locale: 'fr', text: e.fr },
      { locale: 'ar', text: e.ar },
    ]
    for (const { locale, text } of locales) {
      await prisma.translation.upsert({
        where: { code_locale: { code: e.code, locale } },
        update: { text, namespace: e.namespace },
        create: { code: e.code, locale, text, namespace: e.namespace },
      })
    }
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Seeding database...\n')

  // -------------------------------------------------------------------------
  // PARAMS — system configuration
  // -------------------------------------------------------------------------
  const params = [
    { key: 'SITE_NAME',              value: 'khdimti.com',      description: 'Platform name',                   isPublic: true  },
    { key: 'SITE_TAGLINE_CODE',      value: 'UI_SITE_TAGLINE',  description: 'Translation code for tagline',    isPublic: true  },
    { key: 'DEFAULT_LOCALE',         value: 'fr',               description: 'Default UI locale',               isPublic: true  },
    { key: 'SUPPORTED_LOCALES',      value: 'fr,en,ar',         description: 'Comma-separated locale list',     isPublic: true  },
    { key: 'MAX_PORTFOLIO_IMAGES',   value: '10',               description: 'Max portfolio images per provider', isPublic: false },
    { key: 'MIN_REVIEW_CHARS',       value: '10',               description: 'Minimum review comment length',   isPublic: false },
    { key: 'WHATSAPP_COUNTRY_CODE',  value: '+212',             description: 'Default country dial code',       isPublic: true  },
    { key: 'CONTACT_EMAIL',          value: 'contact@khdimti.com', description: 'Platform contact email',       isPublic: true  },
    { key: 'PROVIDER_APPROVAL_MODE', value: 'manual',           description: 'auto | manual',                   isPublic: false },
  ]
  for (const p of params) {
    await prisma.param.upsert({ where: { key: p.key }, update: p, create: p })
  }
  console.log(`✅ ${params.length} params`)

  // -------------------------------------------------------------------------
  // GEOGRAPHY
  // -------------------------------------------------------------------------
  const morocco = await prisma.country.upsert({
    where: { code: 'MA' },
    update: {},
    create: { code: 'MA', name: 'Morocco', nameAr: 'المغرب', nameFr: 'Maroc' },
  })

  const citiesData = [
    { code: 'CASA',      name: 'Casablanca',  nameAr: 'الدار البيضاء', nameFr: 'Casablanca'  },
    { code: 'RABAT',     name: 'Rabat',       nameAr: 'الرباط',        nameFr: 'Rabat'        },
    { code: 'MARRAKECH', name: 'Marrakech',   nameAr: 'مراكش',         nameFr: 'Marrakech'   },
    { code: 'FES',       name: 'Fès',         nameAr: 'فاس',           nameFr: 'Fès'          },
    { code: 'TANGER',    name: 'Tanger',      nameAr: 'طنجة',          nameFr: 'Tanger'       },
    { code: 'AGADIR',    name: 'Agadir',      nameAr: 'أكادير',        nameFr: 'Agadir'       },
    { code: 'MEKNES',    name: 'Meknès',      nameAr: 'مكناس',         nameFr: 'Meknès'       },
    { code: 'OUJDA',     name: 'Oujda',       nameAr: 'وجدة',          nameFr: 'Oujda'        },
    { code: 'KENITRA',   name: 'Kenitra',     nameAr: 'القنيطرة',      nameFr: 'Kénitra'      },
    { code: 'TETOUAN',   name: 'Tétouan',     nameAr: 'تطوان',         nameFr: 'Tétouan'      },
    { code: 'SALE',      name: 'Salé',        nameAr: 'سلا',           nameFr: 'Salé'         },
    { code: 'MOHAMMEDIA',name: 'Mohammedia',  nameAr: 'المحمدية',      nameFr: 'Mohammedia'   },
    { code: 'BENI_MELLAL',name:'Beni Mellal', nameAr: 'بني ملال',      nameFr: 'Béni Mellal'  },
    { code: 'SAFI',      name: 'Safi',        nameAr: 'آسفي',          nameFr: 'Safi'         },
  ]

  const cities: Record<string, number> = {}
  for (const c of citiesData) {
    const city = await prisma.city.upsert({
      where: { code: c.code },
      update: {},
      create: { ...c, countryId: morocco.id },
    })
    cities[c.code] = city.id
  }
  console.log(`✅ ${citiesData.length} cities`)

  // -------------------------------------------------------------------------
  // SERVICE CATEGORIES — code only, no translated text in the record
  // -------------------------------------------------------------------------
  const categoriesData = [
    { code: 'PLUMBING',    slug: 'plumbing',    icon: '🔧', order: 1  },
    { code: 'ELECTRICITY', slug: 'electricity', icon: '⚡', order: 2  },
    { code: 'CLEANING',    slug: 'cleaning',    icon: '🧹', order: 3  },
    { code: 'CARPENTRY',   slug: 'carpentry',   icon: '🪚', order: 4  },
    { code: 'PAINTING',    slug: 'painting',    icon: '🎨', order: 5  },
    { code: 'HVAC',        slug: 'hvac',        icon: '❄️', order: 6  },
    { code: 'CAR_WASH',    slug: 'car-wash',    icon: '🚗', order: 7  },
    { code: 'MOVING',      slug: 'moving',      icon: '📦', order: 8  },
    { code: 'GARDENING',   slug: 'gardening',   icon: '🌿', order: 9  },
    { code: 'SECURITY',    slug: 'security',    icon: '🔒', order: 10 },
    { code: 'MASONRY',     slug: 'masonry',     icon: '🧱', order: 11 },
    { code: 'WELDING',     slug: 'welding',     icon: '⚙️', order: 12 },
  ]

  const categoryIds: Record<string, number> = {}
  for (const cat of categoriesData) {
    const record = await prisma.serviceCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: { ...cat, isActive: true },
    })
    categoryIds[cat.code] = record.id
  }
  console.log(`✅ ${categoriesData.length} service categories`)

  // Category translations — "CAT_<CODE>"
  await upsertTranslations([
    { code: 'CAT_PLUMBING',    namespace: 'category', en: 'Plumbing',              fr: 'Plomberie',              ar: 'السباكة'          },
    { code: 'CAT_ELECTRICITY', namespace: 'category', en: 'Electricity',           fr: 'Électricité',            ar: 'الكهرباء'         },
    { code: 'CAT_CLEANING',    namespace: 'category', en: 'Cleaning',              fr: 'Ménage & Nettoyage',     ar: 'التنظيف'          },
    { code: 'CAT_CARPENTRY',   namespace: 'category', en: 'Carpentry',             fr: 'Menuiserie',             ar: 'النجارة'          },
    { code: 'CAT_PAINTING',    namespace: 'category', en: 'Painting',              fr: 'Peinture',               ar: 'الدهن والطلاء'    },
    { code: 'CAT_HVAC',        namespace: 'category', en: 'HVAC / Air Conditioning',fr: 'Climatisation',         ar: 'التكييف'          },
    { code: 'CAT_CAR_WASH',    namespace: 'category', en: 'Car Wash',              fr: 'Lavage Automobile',      ar: 'غسيل السيارات'    },
    { code: 'CAT_MOVING',      namespace: 'category', en: 'Moving',                fr: 'Déménagement',           ar: 'نقل العفش'        },
    { code: 'CAT_GARDENING',   namespace: 'category', en: 'Gardening',             fr: 'Jardinage',              ar: 'البستنة'          },
    { code: 'CAT_SECURITY',    namespace: 'category', en: 'Security',              fr: 'Sécurité',               ar: 'الأمن والحراسة'   },
    { code: 'CAT_MASONRY',     namespace: 'category', en: 'Masonry',               fr: 'Maçonnerie',             ar: 'البناء'           },
    { code: 'CAT_WELDING',     namespace: 'category', en: 'Welding',               fr: 'Soudure',                ar: 'اللحام'           },
    // Category descriptions
    { code: 'CAT_PLUMBING_DESC',    namespace: 'category', en: 'Plumbing repairs, water heaters and pipe installation', fr: 'Réparation de plomberie, chauffe-eau et installation de tuyauterie', ar: 'إصلاح السباكة، سخانات المياه وتركيب الأنابيب' },
    { code: 'CAT_ELECTRICITY_DESC', namespace: 'category', en: 'Electrical installation, repair and solar panels',      fr: 'Installation électrique, réparation et panneaux solaires',           ar: 'تركيب الكهرباء، الإصلاح والطاقة الشمسية'       },
    { code: 'CAT_CLEANING_DESC',    namespace: 'category', en: 'Home, office and carpet cleaning services',             fr: 'Services de nettoyage maison, bureau et tapis',                      ar: 'خدمات تنظيف المنازل والمكاتب والسجاد'           },
    { code: 'CAT_HVAC_DESC',        namespace: 'category', en: 'AC installation, maintenance and repair',               fr: 'Installation, entretien et réparation climatisation',                ar: 'تركيب وصيانة وإصلاح أجهزة التكييف'             },
  ])

  // -------------------------------------------------------------------------
  // SERVICE SUBCATEGORIES
  // -------------------------------------------------------------------------
  const subcatData = [
    // PLUMBING
    { code: 'PLUMBING_REPAIR',       slug: 'plumbing-repair',        catCode: 'PLUMBING'    },
    { code: 'PLUMBING_INSTALLATION', slug: 'plumbing-installation',  catCode: 'PLUMBING'    },
    { code: 'PLUMBING_WATER_HEATER', slug: 'plumbing-water-heater',  catCode: 'PLUMBING'    },
    { code: 'PLUMBING_DRAINAGE',     slug: 'plumbing-drainage',      catCode: 'PLUMBING'    },
    // ELECTRICITY
    { code: 'ELEC_INSTALLATION',     slug: 'elec-installation',      catCode: 'ELECTRICITY' },
    { code: 'ELEC_REPAIR',           slug: 'elec-repair',            catCode: 'ELECTRICITY' },
    { code: 'ELEC_SOLAR',            slug: 'elec-solar',             catCode: 'ELECTRICITY' },
    { code: 'ELEC_LIGHTING',         slug: 'elec-lighting',          catCode: 'ELECTRICITY' },
    // CLEANING
    { code: 'CLEANING_HOME',         slug: 'cleaning-home',          catCode: 'CLEANING'    },
    { code: 'CLEANING_OFFICE',       slug: 'cleaning-office',        catCode: 'CLEANING'    },
    { code: 'CLEANING_CARPET',       slug: 'cleaning-carpet',        catCode: 'CLEANING'    },
    { code: 'CLEANING_WINDOWS',      slug: 'cleaning-windows',       catCode: 'CLEANING'    },
    { code: 'CLEANING_DISINFECT',    slug: 'cleaning-disinfection',  catCode: 'CLEANING'    },
    // CARPENTRY
    { code: 'CARP_FURNITURE',        slug: 'carpentry-furniture',    catCode: 'CARPENTRY'   },
    { code: 'CARP_DOORS',            slug: 'carpentry-doors',        catCode: 'CARPENTRY'   },
    { code: 'CARP_KITCHENS',         slug: 'carpentry-kitchens',     catCode: 'CARPENTRY'   },
    // PAINTING
    { code: 'PAINT_INTERIOR',        slug: 'painting-interior',      catCode: 'PAINTING'    },
    { code: 'PAINT_EXTERIOR',        slug: 'painting-exterior',      catCode: 'PAINTING'    },
    { code: 'PAINT_DECORATIVE',      slug: 'painting-decorative',    catCode: 'PAINTING'    },
    // HVAC
    { code: 'HVAC_INSTALL',          slug: 'hvac-install',           catCode: 'HVAC'        },
    { code: 'HVAC_MAINTENANCE',      slug: 'hvac-maintenance',       catCode: 'HVAC'        },
    { code: 'HVAC_REPAIR',           slug: 'hvac-repair',            catCode: 'HVAC'        },
    // CAR_WASH
    { code: 'CARWASH_BASIC',         slug: 'carwash-basic',          catCode: 'CAR_WASH'    },
    { code: 'CARWASH_FULL',          slug: 'carwash-full',           catCode: 'CAR_WASH'    },
    { code: 'CARWASH_POLISH',        slug: 'carwash-polish',         catCode: 'CAR_WASH'    },
    // MOVING
    { code: 'MOVING_LOCAL',          slug: 'moving-local',           catCode: 'MOVING'      },
    { code: 'MOVING_INTERCITY',      slug: 'moving-intercity',       catCode: 'MOVING'      },
    { code: 'MOVING_STORAGE',        slug: 'moving-storage',         catCode: 'MOVING'      },
    // GARDENING
    { code: 'GARDEN_MAINTENANCE',    slug: 'garden-maintenance',     catCode: 'GARDENING'   },
    { code: 'GARDEN_DESIGN',         slug: 'garden-design',          catCode: 'GARDENING'   },
    { code: 'GARDEN_IRRIGATION',     slug: 'garden-irrigation',      catCode: 'GARDENING'   },
    // MASONRY
    { code: 'MASONRY_TILES',         slug: 'masonry-tiles',          catCode: 'MASONRY'     },
    { code: 'MASONRY_CONSTRUCTION',  slug: 'masonry-construction',   catCode: 'MASONRY'     },
    { code: 'MASONRY_RENOVATION',    slug: 'masonry-renovation',     catCode: 'MASONRY'     },
    // WELDING
    { code: 'WELDING_IRON',          slug: 'welding-iron',           catCode: 'WELDING'     },
    { code: 'WELDING_ALUMINUM',      slug: 'welding-aluminum',       catCode: 'WELDING'     },
    { code: 'WELDING_GATES',         slug: 'welding-gates',          catCode: 'WELDING'     },
    // SECURITY
    { code: 'SECURITY_CCTV',         slug: 'security-cctv',          catCode: 'SECURITY'    },
    { code: 'SECURITY_ALARM',        slug: 'security-alarm',         catCode: 'SECURITY'    },
    { code: 'SECURITY_LOCKS',        slug: 'security-locks',         catCode: 'SECURITY'    },
  ]

  const subcatIds: Record<string, number> = {}
  for (const sc of subcatData) {
    const record = await prisma.serviceSubcategory.upsert({
      where: { code: sc.code },
      update: {},
      create: { code: sc.code, slug: sc.slug, categoryId: categoryIds[sc.catCode] },
    })
    subcatIds[sc.code] = record.id
  }
  console.log(`✅ ${subcatData.length} subcategories`)

  // Subcategory translations — "SUBCAT_<CODE>"
  await upsertTranslations([
    // PLUMBING
    { code: 'SUBCAT_PLUMBING_REPAIR',       namespace: 'subcategory', en: 'Plumbing Repair',       fr: 'Réparation plomberie',      ar: 'إصلاح السباكة'        },
    { code: 'SUBCAT_PLUMBING_INSTALLATION', namespace: 'subcategory', en: 'Pipe Installation',     fr: 'Installation tuyauterie',   ar: 'تركيب الأنابيب'       },
    { code: 'SUBCAT_PLUMBING_WATER_HEATER', namespace: 'subcategory', en: 'Water Heater',          fr: 'Chauffe-eau',               ar: 'سخانات المياه'        },
    { code: 'SUBCAT_PLUMBING_DRAINAGE',     namespace: 'subcategory', en: 'Drainage & Unblocking', fr: 'Débouchage',                ar: 'تسليك المجاري'        },
    // ELECTRICITY
    { code: 'SUBCAT_ELEC_INSTALLATION',     namespace: 'subcategory', en: 'Electrical Installation', fr: 'Installation électrique',  ar: 'تركيب كهربائي'       },
    { code: 'SUBCAT_ELEC_REPAIR',           namespace: 'subcategory', en: 'Electrical Repair',     fr: 'Réparation électrique',     ar: 'إصلاح كهربائي'        },
    { code: 'SUBCAT_ELEC_SOLAR',            namespace: 'subcategory', en: 'Solar Panels',          fr: 'Panneaux solaires',         ar: 'الألواح الشمسية'      },
    { code: 'SUBCAT_ELEC_LIGHTING',         namespace: 'subcategory', en: 'Lighting',              fr: 'Éclairage',                 ar: 'الإضاءة'              },
    // CLEANING
    { code: 'SUBCAT_CLEANING_HOME',         namespace: 'subcategory', en: 'Home Cleaning',         fr: 'Ménage maison',             ar: 'تنظيف المنزل'         },
    { code: 'SUBCAT_CLEANING_OFFICE',       namespace: 'subcategory', en: 'Office Cleaning',       fr: 'Nettoyage bureau',          ar: 'تنظيف المكاتب'        },
    { code: 'SUBCAT_CLEANING_CARPET',       namespace: 'subcategory', en: 'Carpet Cleaning',       fr: 'Nettoyage tapis',           ar: 'تنظيف السجاد'         },
    { code: 'SUBCAT_CLEANING_WINDOWS',      namespace: 'subcategory', en: 'Window Cleaning',       fr: 'Nettoyage vitres',          ar: 'تنظيف النوافذ'        },
    { code: 'SUBCAT_CLEANING_DISINFECT',    namespace: 'subcategory', en: 'Disinfection',          fr: 'Désinfection',              ar: 'التعقيم والتطهير'     },
    // CARPENTRY
    { code: 'SUBCAT_CARP_FURNITURE',        namespace: 'subcategory', en: 'Furniture',             fr: 'Meubles',                   ar: 'الأثاث'               },
    { code: 'SUBCAT_CARP_DOORS',            namespace: 'subcategory', en: 'Doors & Windows',       fr: 'Portes & Fenêtres',         ar: 'الأبواب والنوافذ'     },
    { code: 'SUBCAT_CARP_KITCHENS',         namespace: 'subcategory', en: 'Kitchen Cabinets',      fr: 'Cuisines équipées',         ar: 'مطابخ مدمجة'          },
    // PAINTING
    { code: 'SUBCAT_PAINT_INTERIOR',        namespace: 'subcategory', en: 'Interior Painting',     fr: 'Peinture intérieure',       ar: 'دهن داخلي'            },
    { code: 'SUBCAT_PAINT_EXTERIOR',        namespace: 'subcategory', en: 'Exterior Painting',     fr: 'Peinture extérieure',       ar: 'دهن خارجي'            },
    { code: 'SUBCAT_PAINT_DECORATIVE',      namespace: 'subcategory', en: 'Decorative Painting',   fr: 'Peinture décorative',       ar: 'دهن ديكوراتيف'        },
    // HVAC
    { code: 'SUBCAT_HVAC_INSTALL',          namespace: 'subcategory', en: 'AC Installation',       fr: 'Installation climatisation', ar: 'تركيب المكيف'        },
    { code: 'SUBCAT_HVAC_MAINTENANCE',      namespace: 'subcategory', en: 'AC Maintenance',        fr: 'Entretien climatisation',   ar: 'صيانة المكيف'         },
    { code: 'SUBCAT_HVAC_REPAIR',           namespace: 'subcategory', en: 'AC Repair',             fr: 'Réparation climatisation',  ar: 'إصلاح المكيف'         },
    // CAR_WASH
    { code: 'SUBCAT_CARWASH_BASIC',         namespace: 'subcategory', en: 'Basic Wash',            fr: 'Lavage simple',             ar: 'غسيل عادي'            },
    { code: 'SUBCAT_CARWASH_FULL',          namespace: 'subcategory', en: 'Full Detail',           fr: 'Lavage complet',            ar: 'غسيل شامل'            },
    { code: 'SUBCAT_CARWASH_POLISH',        namespace: 'subcategory', en: 'Polish & Wax',          fr: 'Polissage & cire',          ar: 'تلميع وتشميع'         },
    // MOVING
    { code: 'SUBCAT_MOVING_LOCAL',          namespace: 'subcategory', en: 'Local Moving',          fr: 'Déménagement local',        ar: 'نقل محلي'             },
    { code: 'SUBCAT_MOVING_INTERCITY',      namespace: 'subcategory', en: 'Intercity Moving',      fr: 'Déménagement inter-villes', ar: 'نقل بين المدن'        },
    { code: 'SUBCAT_MOVING_STORAGE',        namespace: 'subcategory', en: 'Storage',               fr: 'Stockage',                  ar: 'تخزين'                },
    // GARDENING
    { code: 'SUBCAT_GARDEN_MAINTENANCE',    namespace: 'subcategory', en: 'Garden Maintenance',    fr: 'Entretien jardin',          ar: 'صيانة الحديقة'        },
    { code: 'SUBCAT_GARDEN_DESIGN',         namespace: 'subcategory', en: 'Garden Design',         fr: 'Aménagement paysager',      ar: 'تصميم الحدائق'        },
    { code: 'SUBCAT_GARDEN_IRRIGATION',     namespace: 'subcategory', en: 'Irrigation Systems',    fr: 'Systèmes d\'irrigation',    ar: 'أنظمة الري'           },
    // MASONRY
    { code: 'SUBCAT_MASONRY_TILES',         namespace: 'subcategory', en: 'Tiling',                fr: 'Carrelage',                 ar: 'تبليط'                },
    { code: 'SUBCAT_MASONRY_CONSTRUCTION',  namespace: 'subcategory', en: 'Construction',          fr: 'Construction',              ar: 'بناء'                 },
    { code: 'SUBCAT_MASONRY_RENOVATION',    namespace: 'subcategory', en: 'Renovation',            fr: 'Rénovation',                ar: 'ترميم وتجديد'         },
    // WELDING
    { code: 'SUBCAT_WELDING_IRON',          namespace: 'subcategory', en: 'Iron Work',             fr: 'Ferronnerie',               ar: 'أعمال الحديد'         },
    { code: 'SUBCAT_WELDING_ALUMINUM',      namespace: 'subcategory', en: 'Aluminum',              fr: 'Aluminium',                 ar: 'الألومنيوم'           },
    { code: 'SUBCAT_WELDING_GATES',         namespace: 'subcategory', en: 'Gates & Railings',      fr: 'Portails & garde-corps',    ar: 'بوابات وحواجز'        },
    // SECURITY
    { code: 'SUBCAT_SECURITY_CCTV',         namespace: 'subcategory', en: 'CCTV Installation',     fr: 'Installation caméras',      ar: 'تركيب كاميرات المراقبة' },
    { code: 'SUBCAT_SECURITY_ALARM',        namespace: 'subcategory', en: 'Alarm Systems',         fr: 'Systèmes d\'alarme',        ar: 'أنظمة الإنذار'        },
    { code: 'SUBCAT_SECURITY_LOCKS',        namespace: 'subcategory', en: 'Locks & Safes',         fr: 'Serrures & coffres-forts',  ar: 'الأقفال والخزائن'     },
  ])
  console.log('✅ All translations seeded')

  // -------------------------------------------------------------------------
  // ADMIN USER
  // -------------------------------------------------------------------------
  const adminPassword = await bcrypt.hash('Admin@khdimti2025!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@khdimti.com' },
    update: {},
    create: {
      name: 'Admin Khdimti',
      email: 'admin@khdimti.com',
      phone: '+212600000000',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // -------------------------------------------------------------------------
  // SAMPLE CUSTOMERS (for reviews)
  // -------------------------------------------------------------------------
  const customerPassword = await bcrypt.hash('Customer@123', 10)
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'karim.benali@gmail.com' },
      update: {},
      create: { name: 'Karim Benali', email: 'karim.benali@gmail.com', phone: '+212661234567', password: customerPassword, role: 'CUSTOMER', cityId: cities['CASA'] },
    }),
    prisma.user.upsert({
      where: { email: 'fatima.z@gmail.com' },
      update: {},
      create: { name: 'Fatima Zahra', email: 'fatima.z@gmail.com', phone: '+212662345678', password: customerPassword, role: 'CUSTOMER', cityId: cities['RABAT'] },
    }),
    prisma.user.upsert({
      where: { email: 'youssef.amrani@hotmail.com' },
      update: {},
      create: { name: 'Youssef Amrani', email: 'youssef.amrani@hotmail.com', phone: '+212663456789', password: customerPassword, role: 'CUSTOMER', cityId: cities['MARRAKECH'] },
    }),
    prisma.user.upsert({
      where: { email: 'nadia.haddad@gmail.com' },
      update: {},
      create: { name: 'Nadia Haddad', email: 'nadia.haddad@gmail.com', phone: '+212664567890', password: customerPassword, role: 'CUSTOMER', cityId: cities['FES'] },
    }),
    prisma.user.upsert({
      where: { email: 'omar.idrissi@gmail.com' },
      update: {},
      create: { name: 'Omar Idrissi', email: 'omar.idrissi@gmail.com', phone: '+212665678901', password: customerPassword, role: 'CUSTOMER', cityId: cities['TANGER'] },
    }),
  ])
  console.log(`✅ ${customers.length} sample customers`)

  // -------------------------------------------------------------------------
  // SAMPLE PROVIDERS
  // -------------------------------------------------------------------------
  const providerPassword = await bcrypt.hash('Provider@123', 10)

  type ProviderInput = {
    email: string
    name: string
    phone: string
    whatsapp: string
    businessName: string
    bio: string
    bioFr: string
    bioAr: string
    cityCode: string
    catCode: string
    subcatCodes: string[]
    yearsExperience: number
    rating: number
    reviewCount: number
    isVerified: boolean
  }

  const providerInputs: ProviderInput[] = [
    {
      email: 'hassan.plombier@gmail.com',
      name: 'Hassan Tahiri',
      phone: '+212661111111',
      whatsapp: '+212661111111',
      businessName: 'Plomberie Hassan Casablanca',
      bio: 'Experienced plumber with 12 years in residential and commercial plumbing in Casablanca.',
      bioFr: 'Plombier expérimenté avec 12 ans d\'expérience en plomberie résidentielle et commerciale à Casablanca.',
      bioAr: 'سبّاك محترف بخبرة 12 سنة في أعمال السباكة المنزلية والتجارية بالدار البيضاء.',
      cityCode: 'CASA',
      catCode: 'PLUMBING',
      subcatCodes: ['PLUMBING_REPAIR', 'PLUMBING_WATER_HEATER', 'PLUMBING_DRAINAGE'],
      yearsExperience: 12,
      rating: 4.8,
      reviewCount: 3,
      isVerified: true,
    },
    {
      email: 'kamal.elec@gmail.com',
      name: 'Kamal Bensouda',
      phone: '+212662222222',
      whatsapp: '+212662222222',
      businessName: 'ElecPro Rabat',
      bio: 'Certified electrician offering residential wiring, solar panel installation and electrical repairs.',
      bioFr: 'Électricien certifié proposant câblage résidentiel, installation solaire et réparations électriques.',
      bioAr: 'كهربائي معتمد يقدم أعمال الأسلاك المنزلية، تركيب الطاقة الشمسية وإصلاح الأعطال الكهربائية.',
      cityCode: 'RABAT',
      catCode: 'ELECTRICITY',
      subcatCodes: ['ELEC_INSTALLATION', 'ELEC_SOLAR', 'ELEC_LIGHTING'],
      yearsExperience: 8,
      rating: 4.9,
      reviewCount: 2,
      isVerified: true,
    },
    {
      email: 'naima.clean@gmail.com',
      name: 'Naïma Berrada',
      phone: '+212663333333',
      whatsapp: '+212663333333',
      businessName: 'NettoyagePro Casablanca',
      bio: 'Professional cleaning service for homes and offices. Available 7 days a week.',
      bioFr: 'Service de nettoyage professionnel pour maisons et bureaux. Disponible 7j/7.',
      bioAr: 'خدمة تنظيف احترافية للمنازل والمكاتب. متاحة 7 أيام في الأسبوع.',
      cityCode: 'CASA',
      catCode: 'CLEANING',
      subcatCodes: ['CLEANING_HOME', 'CLEANING_OFFICE', 'CLEANING_CARPET'],
      yearsExperience: 5,
      rating: 4.7,
      reviewCount: 2,
      isVerified: true,
    },
    {
      email: 'amine.menuisier@gmail.com',
      name: 'Amine Lahrichi',
      phone: '+212664444444',
      whatsapp: '+212664444444',
      businessName: 'Menuiserie Lahrichi Marrakech',
      bio: 'Master carpenter specializing in custom kitchens, doors and furniture in Marrakech.',
      bioFr: 'Maître menuisier spécialisé dans les cuisines sur mesure, portes et meubles à Marrakech.',
      bioAr: 'نجار ماهر متخصص في المطابخ المدمجة والأبواب والأثاث بمراكش.',
      cityCode: 'MARRAKECH',
      catCode: 'CARPENTRY',
      subcatCodes: ['CARP_KITCHENS', 'CARP_DOORS', 'CARP_FURNITURE'],
      yearsExperience: 15,
      rating: 4.6,
      reviewCount: 2,
      isVerified: true,
    },
    {
      email: 'said.clim@gmail.com',
      name: 'Saïd Ouali',
      phone: '+212665555555',
      whatsapp: '+212665555555',
      businessName: 'ClimExpert Tanger',
      bio: 'HVAC specialist for all major AC brands. Installations, maintenance and repairs in Tanger.',
      bioFr: 'Spécialiste climatisation toutes marques. Installation, entretien et réparation à Tanger.',
      bioAr: 'متخصص في التكييف لجميع الماركات. تركيب، صيانة وإصلاح بطنجة.',
      cityCode: 'TANGER',
      catCode: 'HVAC',
      subcatCodes: ['HVAC_INSTALL', 'HVAC_MAINTENANCE', 'HVAC_REPAIR'],
      yearsExperience: 10,
      rating: 4.5,
      reviewCount: 2,
      isVerified: false,
    },
    {
      email: 'rachid.carwash@gmail.com',
      name: 'Rachid Ziani',
      phone: '+212666666666',
      whatsapp: '+212666666666',
      businessName: 'ShineCar Agadir',
      bio: 'Premium mobile car wash service. We come to you in Agadir and surrounding areas.',
      bioFr: 'Service de lavage auto mobile premium. Nous venons chez vous à Agadir et environs.',
      bioAr: 'خدمة غسيل سيارات متنقلة مميزة. نأتي إليك في أكادير والمناطق المجاورة.',
      cityCode: 'AGADIR',
      catCode: 'CAR_WASH',
      subcatCodes: ['CARWASH_BASIC', 'CARWASH_FULL', 'CARWASH_POLISH'],
      yearsExperience: 4,
      rating: 4.4,
      reviewCount: 2,
      isVerified: true,
    },
    {
      email: 'driss.peinture@gmail.com',
      name: 'Driss Mansouri',
      phone: '+212667777777',
      whatsapp: '+212667777777',
      businessName: 'Peintures Mansouri Fès',
      bio: 'Interior and exterior painting specialist with attention to detail and quality finishes.',
      bioFr: 'Spécialiste peinture intérieure et extérieure avec finitions soignées à Fès.',
      bioAr: 'متخصص في الدهن الداخلي والخارجي مع الاهتمام بالتفاصيل والتشطيبات الجيدة بفاس.',
      cityCode: 'FES',
      catCode: 'PAINTING',
      subcatCodes: ['PAINT_INTERIOR', 'PAINT_EXTERIOR'],
      yearsExperience: 7,
      rating: 4.3,
      reviewCount: 2,
      isVerified: false,
    },
    {
      email: 'mourad.securite@gmail.com',
      name: 'Mourad Benhaddou',
      phone: '+212668888888',
      whatsapp: '+212668888888',
      businessName: 'SecureHome Casablanca',
      bio: 'CCTV and alarm systems installation for homes and businesses across Casablanca.',
      bioFr: 'Installation caméras et alarmes pour maisons et commerces à Casablanca.',
      bioAr: 'تركيب كاميرات المراقبة وأنظمة الإنذار للمنازل والمحلات التجارية بالدار البيضاء.',
      cityCode: 'CASA',
      catCode: 'SECURITY',
      subcatCodes: ['SECURITY_CCTV', 'SECURITY_ALARM'],
      yearsExperience: 6,
      rating: 4.7,
      reviewCount: 1,
      isVerified: true,
    },
  ]

  const createdProviders: { id: number; email: string }[] = []

  for (const p of providerInputs) {
    const existingUser = await prisma.user.findUnique({ where: { email: p.email } })
    const user = existingUser ?? await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        password: providerPassword,
        role: 'PROVIDER',
        cityId: cities[p.cityCode],
      },
    })

    const existingProvider = await prisma.provider.findUnique({ where: { userId: user.id } })
    if (!existingProvider) {
      const provider = await prisma.provider.create({
        data: {
          userId: user.id,
          businessName: p.businessName,
          bio: p.bio,
          bioFr: p.bioFr,
          bioAr: p.bioAr,
          phone: p.phone,
          whatsapp: p.whatsapp,
          cityId: cities[p.cityCode],
          categoryId: categoryIds[p.catCode],
          yearsExperience: p.yearsExperience,
          status: 'ACTIVE',
          availability: 'AVAILABLE',
          isVerified: p.isVerified,
          profileViews: Math.floor(Math.random() * 200) + 50,
          rating: p.rating,
          reviewCount: p.reviewCount,
          subcategories: {
            create: p.subcatCodes.map(sc => ({ subcategoryId: subcatIds[sc] })),
          },
        },
      })
      createdProviders.push({ id: provider.id, email: p.email })
    } else {
      createdProviders.push({ id: existingProvider.id, email: p.email })
    }
  }
  console.log(`✅ ${createdProviders.length} providers`)

  // -------------------------------------------------------------------------
  // SAMPLE REVIEWS
  // -------------------------------------------------------------------------
  const reviewsData = [
    // Hassan (plumber, CASA) — 3 reviews, avg 4.8
    { providerId: createdProviders[0].id, userId: customers[0].id, rating: 5, comment: 'Excellent travail, rapide et propre. Je recommande vivement!' },
    { providerId: createdProviders[0].id, userId: customers[1].id, rating: 5, comment: 'Hassan a réparé une fuite urgente en 1h. Très professionnel.' },
    { providerId: createdProviders[0].id, userId: customers[2].id, rating: 4, comment: 'Bon plombier, prix raisonnable.' },
    // Kamal (electrician, RABAT) — 2 reviews, avg 4.9
    { providerId: createdProviders[1].id, userId: customers[1].id, rating: 5, comment: 'Installation solaire parfaite. Kamal explique bien son travail.' },
    { providerId: createdProviders[1].id, userId: customers[3].id, rating: 5, comment: 'Câblage fait proprement, dans les délais. Très satisfaite.' },
    // Naïma (cleaning, CASA) — 2 reviews, avg 4.7
    { providerId: createdProviders[2].id, userId: customers[0].id, rating: 5, comment: 'Appartement impeccable après son passage. Sérieuse et efficace.' },
    { providerId: createdProviders[2].id, userId: customers[4].id, rating: 4, comment: 'Bon service, tapis parfaitement nettoyés.' },
    // Amine (carpentry, MARRAKECH) — 2 reviews, avg 4.6
    { providerId: createdProviders[3].id, userId: customers[2].id, rating: 5, comment: 'Cuisine magnifique, travail soigné. Merci Amine!' },
    { providerId: createdProviders[3].id, userId: customers[3].id, rating: 4, comment: 'Bonne qualité, livraison dans les temps.' },
    // Saïd (HVAC, TANGER) — 2 reviews, avg 4.5
    { providerId: createdProviders[4].id, userId: customers[4].id, rating: 5, comment: 'Climatisation installée en quelques heures. Très compétent.' },
    { providerId: createdProviders[4].id, userId: customers[0].id, rating: 4, comment: 'Bonne maintenance annuelle, prix correct.' },
    // Rachid (car wash, AGADIR) — 2 reviews, avg 4.4
    { providerId: createdProviders[5].id, userId: customers[1].id, rating: 4, comment: 'Voiture comme neuve! Service mobile très pratique.' },
    { providerId: createdProviders[5].id, userId: customers[2].id, rating: 5, comment: 'Polissage parfait sur ma voiture noire. Bravo!' },
    // Driss (painting, FES) — 2 reviews, avg 4.3
    { providerId: createdProviders[6].id, userId: customers[3].id, rating: 4, comment: 'Bonne peinture, finitions soignées.' },
    { providerId: createdProviders[6].id, userId: customers[4].id, rating: 4, comment: 'Travail sérieux, salon repeint nickel.' },
    // Mourad (security, CASA) — 1 review, avg 4.7
    { providerId: createdProviders[7].id, userId: customers[0].id, rating: 5, comment: 'Caméras bien installées, application mobile impeccable.' },
  ]

  for (const r of reviewsData) {
    await prisma.review.upsert({
      where: { providerId_userId: { providerId: r.providerId, userId: r.userId } },
      update: {},
      create: { ...r, isVisible: true },
    })
  }
  console.log(`✅ ${reviewsData.length} reviews`)

  console.log('\n🎉 Seeding complete!')
  console.log('\nDefault credentials:')
  console.log('  Admin  → admin@khdimti.com / Admin@khdimti2025!')
  console.log('  Provider test → hassan.plombier@gmail.com / Provider@123')
  console.log('  Customer test → karim.benali@gmail.com / Customer@123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
