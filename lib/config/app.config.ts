// Application Configuration - All values from environment variables

export const appConfig = {
  // Site Information
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'E-Commerce Store',
  siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Your trusted online store',
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Logo & Branding
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '/logo.png',
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || '/favicon.ico',
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR || '#000000',
  
  // SEO
  seoKeywords: process.env.NEXT_PUBLIC_SEO_KEYWORDS || 'ecommerce, online store',
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
  
  // Features
  enableCart: process.env.NEXT_PUBLIC_ENABLE_CART !== 'false',
  enableWishlist: process.env.NEXT_PUBLIC_ENABLE_WISHLIST !== 'false',
  enableReviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS !== 'false',
  
  // Rate Limiting
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
  
  // Pagination
  productsPerPage: parseInt(process.env.PRODUCTS_PER_PAGE || '12'),
  ordersPerPage: parseInt(process.env.ORDERS_PER_PAGE || '20'),
  
  // Currency
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'Rs.',
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rs.',
  
  // Contact
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@store.com',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '',
  
  // Social Media
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  twitterUrl: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  
  // Admin
  adminEmail: process.env.ADMIN_EMAIL || '',
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default appConfig;
