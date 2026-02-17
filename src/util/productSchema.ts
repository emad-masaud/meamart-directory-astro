// Product JSON-LD Schema Generator

interface ProductSchemaData {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  availability?: string;
  condition?: string;
  link: string;
  brand?: string;
  gtin?: string;
  mpn?: string;
}

export function generateProductSchema(product: ProductSchemaData, siteUrl: string) {
  const productUrl = product.link || `${siteUrl}/products/${encodeURIComponent(product.title)}`;
  
  // Map availability to schema.org format
  const availabilityMap: Record<string, string> = {
    'in_stock': 'https://schema.org/InStock',
    'out_of_stock': 'https://schema.org/OutOfStock',
    'preorder': 'https://schema.org/PreOrder',
    'backorder': 'https://schema.org/BackOrder'
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    ...(product.description && { description: product.description }),
    ...(product.image_url && { image: product.image_url }),
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.gtin && { gtin: product.gtin }),
    ...(product.mpn && { mpn: product.mpn }),
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      ...(product.price && { price: product.price.toString() }),
      ...(product.currency && { priceCurrency: product.currency }),
      availability: availabilityMap[product.availability || 'in_stock'] || 'https://schema.org/InStock',
      ...(product.condition && {
        itemCondition: `https://schema.org/${
          product.condition === 'new' ? 'NewCondition' :
          product.condition === 'used' ? 'UsedCondition' :
          'RefurbishedCondition'
        }`
      })
    }
  };

  return JSON.stringify(schema, null, 2);
}

export function generateProductListSchema(products: ProductSchemaData[], siteUrl: string) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        ...(product.description && { description: product.description }),
        ...(product.image_url && { image: product.image_url }),
        url: product.link || `${siteUrl}/products/${encodeURIComponent(product.title)}`
      }
    }))
  };

  return JSON.stringify(schema, null, 2);
}
