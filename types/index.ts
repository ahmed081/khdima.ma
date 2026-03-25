// ============================================================
//  Shared TypeScript types for khdimti.com
// ============================================================

export type Locale = 'fr' | 'en' | 'ar'

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'

export interface AuthUser {
  id:    number
  name:  string
  email: string
  role:  UserRole
  phone?: string | null
}

// ---------------------------------------------------------------------------
// Geography
// ---------------------------------------------------------------------------
export interface City {
  id:   number
  code: string
  name: string   // pre-resolved for current locale
}

export interface Country {
  id:   number
  code: string
  name: string
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export interface ServiceCategory {
  id:           number
  code:         string
  slug:         string
  icon?:        string | null
  name:         string   // pre-resolved for current locale
  providerCount?: number
}

export interface ServiceSubcategory {
  code: string
  slug: string
  name: string   // pre-resolved
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
export type ProviderStatus     = 'PENDING' | 'ACTIVE' | 'SUSPENDED'
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'INACTIVE'
export type ContactType        = 'WHATSAPP' | 'CALL' | 'PROFILE_VIEW'

export interface ProviderSummary {
  id:              number
  businessName:    string
  avatarUrl?:      string | null
  rating:          number
  reviewCount:     number
  yearsExperience?: number | null
  isVerified:      boolean
  availability:    AvailabilityStatus
  phone:           string
  whatsapp?:       string | null
  city:            City
  category:        ServiceCategory
}

export interface ProviderDetail extends ProviderSummary {
  bio?:            string | null
  website?:        string | null
  profileViews:    number
  status:          ProviderStatus
  subcategories:   ServiceSubcategory[]
  portfolioImages: PortfolioImage[]
  reviews:         Review[]
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------
export interface PortfolioImage {
  id:       number
  url:      string
  caption?: string | null
  isBefore: boolean
  pairId?:  string | null
  order:    number
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export interface Review {
  id:        number
  rating:    number
  comment?:  string | null
  createdAt: string | Date
  user:      { name: string }
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export interface AdminTranslationGroup {
  code:      string
  namespace: string
  locales:   Partial<Record<Locale, string>>
}

export interface AdminCategoryRow {
  id:               number
  code:             string
  slug:             string
  icon?:            string | null
  order:            number
  isActive:         boolean
  translations:     Partial<Record<Locale, string>>
  providerCount:    number
  subcategoryCount: number
}

// ---------------------------------------------------------------------------
// API responses
// ---------------------------------------------------------------------------
export interface ProvidersApiResponse {
  providers: ProviderSummary[]
  total:     number
  page:      number
  limit:     number
}

export interface DashboardStats {
  profileViews: number
  rating:       number
  reviewCount:  number
}

export interface ContactStats {
  whatsapp: number
  call:     number
}
