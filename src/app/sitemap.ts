import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://vinechurch.ca' // Update with your actual domain

  return [
    {
      url: `${baseUrl}/pt`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          pt: `${baseUrl}/pt`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          pt: `${baseUrl}/pt`,
        },
      },
    },
    {
      url: `${baseUrl}/pt/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/about`,
          pt: `${baseUrl}/pt/about`,
        },
      },
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/about`,
          pt: `${baseUrl}/pt/about`,
        },
      },
    },
    {
      url: `${baseUrl}/pt/schedule`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/schedule`,
          pt: `${baseUrl}/pt/schedule`,
        },
      },
    },
    {
      url: `${baseUrl}/en/schedule`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/schedule`,
          pt: `${baseUrl}/pt/schedule`,
        },
      },
    },
    {
      url: `${baseUrl}/pt/vine-kids`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/vine-kids`,
          pt: `${baseUrl}/pt/vine-kids`,
        },
      },
    },
    {
      url: `${baseUrl}/en/vine-kids`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/vine-kids`,
          pt: `${baseUrl}/pt/vine-kids`,
        },
      },
    },
    {
      url: `${baseUrl}/pt/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/en/contact`,
          pt: `${baseUrl}/pt/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/en/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${baseUrl}/en/contact`,
          pt: `${baseUrl}/pt/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/pt/sermons`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/sermons`,
          pt: `${baseUrl}/pt/sermons`,
        },
      },
    },
    {
      url: `${baseUrl}/en/sermons`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/sermons`,
          pt: `${baseUrl}/pt/sermons`,
        },
      },
    },
    {
      url: `${baseUrl}/pt/cells`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/cells`,
          pt: `${baseUrl}/pt/cells`,
        },
      },
    },
    {
      url: `${baseUrl}/en/cells`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/cells`,
          pt: `${baseUrl}/pt/cells`,
        },
      },
    },
  ]
}