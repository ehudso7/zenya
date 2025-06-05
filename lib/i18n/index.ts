import { i18nConfig, type Locale } from '@/i18n.config'

// Dictionary type for translations
export type Dictionary = {
  common: {
    appName: string
    tagline: string
    loading: string
    error: string
    retry: string
    cancel: string
    save: string
    delete: string
    edit: string
    back: string
    next: string
    previous: string
    close: string
    search: string
    filter: string
    sort: string
    noResults: string
  }
  auth: {
    signIn: string
    signUp: string
    signOut: string
    email: string
    password: string
    name: string
    forgotPassword: string
    resetPassword: string
    confirmEmail: string
    continueWith: string
    orContinueWith: string
    alreadyHaveAccount: string
    dontHaveAccount: string
    termsAgreement: string
    privacyPolicy: string
    termsOfService: string
  }
  navigation: {
    home: string
    learn: string
    profile: string
    settings: string
    help: string
    about: string
    contact: string
  }
  landing: {
    hero: {
      title: string
      subtitle: string
      cta: string
      ctaSecondary: string
    }
    features: {
      title: string
      adaptive: {
        title: string
        description: string
      }
      microLessons: {
        title: string
        description: string
      }
      gamification: {
        title: string
        description: string
      }
      accessibility: {
        title: string
        description: string
      }
    }
  }
  learn: {
    choosePathTitle: string
    continueWhere: string
    lessonsCompleted: string
    minutesLearned: string
    currentStreak: string
    selectMood: string
    moods: {
      energetic: string
      focused: string
      relaxed: string
      tired: string
    }
    lessonComplete: string
    greatJob: string
    nextLesson: string
    simplify: string
    explainMore: string
    example: string
    practice: string
    hint: string
  }
  profile: {
    title: string
    stats: string
    achievements: string
    settings: string
    subscription: string
    totalXP: string
    level: string
    joinedDate: string
    completedLessons: string
    learningTime: string
    longestStreak: string
  }
  errors: {
    generic: string
    network: string
    unauthorized: string
    notFound: string
    serverError: string
    validationError: string
    fieldRequired: string
    invalidEmail: string
    passwordTooShort: string
    passwordMismatch: string
  }
  accessibility: {
    skipToContent: string
    mainNavigation: string
    userMenu: string
    darkMode: string
    lightMode: string
    systemMode: string
    language: string
    closeMenu: string
    openMenu: string
  }
}

// Load dictionary for a locale
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    const dictionary = await import(`@/locales/${locale}.json`)
    return dictionary.default
  } catch (_error) {
    // Failed to load dictionary for locale - fallback to English
    const dictionary = await import(`@/locales/en.json`)
    return dictionary.default
  }
}

// Get all dictionaries (for static generation)
export async function getAllDictionaries(): Promise<Record<Locale, Dictionary>> {
  const dictionaries: Record<string, Dictionary> = {}
  
  for (const locale of i18nConfig.locales) {
    dictionaries[locale] = await getDictionary(locale)
  }
  
  return dictionaries as Record<Locale, Dictionary>
}

// Locale detection
export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return i18nConfig.defaultLocale
  
  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, priority = '1'] = lang.trim().split(';q=')
      return { code: code.split('-')[0], priority: parseFloat(priority) }
    })
    .sort((a, b) => b.priority - a.priority)
  
  // Find first matching locale
  for (const { code } of languages) {
    const locale = i18nConfig.locales.find(l => l === code)
    if (locale) return locale
  }
  
  return i18nConfig.defaultLocale
}

// Format date according to locale
export function formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(date)
}

// Format number according to locale
export function formatNumber(number: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(number)
}

// Format relative time
export function formatRelativeTime(date: Date, locale: Locale): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const now = new Date()
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)
  
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2628000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffInSeconds) >= secondsInUnit) {
      const value = Math.floor(diffInSeconds / secondsInUnit)
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit)
    }
  }
  
  return rtf.format(0, 'second')
}

// Pluralization rules
export function pluralize(
  count: number,
  locale: Locale,
  options: { zero?: string; one: string; other: string }
): string {
  const pr = new Intl.PluralRules(locale)
  const rule = pr.select(count)
  
  if (count === 0 && options.zero) return options.zero
  if (rule === 'one') return options.one
  return options.other
}

// Currency formatting
export function formatCurrency(amount: number, locale: Locale, currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Get text direction for locale
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr'
}