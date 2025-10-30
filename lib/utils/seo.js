// SEO utilities
export function generateMetadata(page, data = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourstore.com';
  
  const defaults = {
    title: 'E-Commerce Store',
    description: 'Your trusted online store for quality products',
    image: `${baseUrl}/logo.jpg`,
    url: baseUrl
  };

  const metadata = {
    shop: {
      title: 'Shop - Premium Products Online',
      description: 'Discover our wide range of premium products with fast shipping and excellent customer service.',
    },
    product: {
      title: `${data.name} - Buy Online`,
      description: data.description?.slice(0, 160) || defaults.description,
      image: data.imageURLs?.[0] || defaults.image,
    },
    category: {
      title: `${data.name} Category - Shop Now`,
      description: `Browse our ${data.name} collection with the best prices and quality.`,
    }
  };

  return {
    ...defaults,
    ...metadata[page],
    url: `${baseUrl}/${page}${data.id ? `/${data.id}` : ''}`
  };
}

export function generateStructuredData(type, data) {
  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': type
  };

  switch (type) {
    case 'Product':
      return {
        ...baseStructure,
        name: data.name,
        description: data.description,
        image: data.imageURLs,
        offers: {
          '@type': 'Offer',
          price: data.salePrice || data.price,
          priceCurrency: 'USD',
          availability: data.stock > 0 ? 'InStock' : 'OutOfStock'
        }
      };
    case 'Organization':
      return {
        ...baseStructure,
        name: 'E-Commerce Store',
        url: process.env.NEXT_PUBLIC_BASE_URL,
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.jpg`
      };
    default:
      return baseStructure;
  }
}