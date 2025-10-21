import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/portal/',
        '/crm/',
        '/_next/',
        '/private/',
        '*.json',
        '/dashboard/',
        '/settings/',
        '/account/',
      ],
    },
    sitemap: 'https://www.warmeleads.eu/sitemap.xml',
    host: 'https://www.warmeleads.eu',
  }
}
