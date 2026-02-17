import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Vine Church KWC - Igreja Videira",
    template: "%s | Vine Church KWC"
  },
  description: "Igreja Brasileira em Kitchener - Vine Church KWC (Igreja Videira). Comunidade cristã brasileira na região de Waterloo, Ontario, Canadá. Cultos aos domingos 10AM em português e inglês. Células, Vine Kids e muito mais.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  keywords: [
    "igreja brasileira perto de mim",
    "brazilian church near me",
    "igreja brasileira no Canadá",
    "brazilian church in Canada",
    "igreja brasileira em Ontario",
    "igreja brasileira Kitchener",
    "igreja brasileira Waterloo",
    "igreja brasileira Cambridge",
    "igreja brasileira Guelph",
    "Brazilian Church Kitchener",
    "Brazilian Church Waterloo",
    "Brazilian Church Cambridge",
    "Brazilian Church Ontario",
    "igreja evangélica brasileira Canadá",
    "Brazilian evangelical church Canada",
    "comunidade brasileira Kitchener",
    "comunidade brasileira Waterloo",
    "brasileiros em Kitchener",
    "brasileiros em Waterloo",
    "Igreja Cambridge",
    "Igreja Kitchener",
    "Igreja Waterloo",
    "Church Cambridge Ontario",
    "Church Kitchener Ontario",
    "Church Waterloo Ontario",
    "Vine Church",
    "Igreja Videira",
    "Igreja Videira KWC",
    "Comunidade Cristã",
    "Christian Community",
    "Célula",
    "Life Groups",
    "Vine Kids",
    "Cambridge ON",
    "Kitchener ON",
    "Waterloo ON",
    "Pastor Boris Carvalho",
    "Igreja de Vencedores",
    "Church of Overcomers",
    "igreja em português Canadá",
    "Portuguese church Canada",
    "culto em português Ontario"
  ],
  authors: [{ name: "Vine Church KWC" }],
  creator: "Vine Church KWC",
  publisher: "Vine Church KWC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    alternateLocale: ['en_CA'],
    url: 'https://vinechurch.ca',
    siteName: 'Vine Church KWC',
    title: 'Vine Church KWC - Igreja Videira',
    description: 'Igreja Brasileira em Kitchener - Vine Church KWC (Igreja Videira). Comunidade cristã brasileira na região de Waterloo, Ontario, Canadá. Cultos em português aos domingos 10AM.',
    images: [
      {
        url: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logo_vine.png',
        width: 1200,
        height: 630,
        alt: 'Vine Church KWC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vine Church KWC - Igreja Videira',
    description: 'Igreja Brasileira em Kitchener, Ontario - Vine Church KWC. Cultos em português aos domingos 10AM. Comunidade cristã brasileira.',
    images: ['https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logo_vine.png'],
  },
  verification: {
    google: 'AI-edjltYyq3qb7qKFg0j0YqFFpqkokHXbgrVgpHoHg', // Replace with actual code when you get it
  },
  category: 'religion',
  classification: 'Church, Religious Organization, Community',
  metadataBase: new URL('https://vinechurch.ca'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Church",
    "name": "Vine Church KWC",
    "alternateName": ["Igreja Videira KWC", "Igreja Brasileira Kitchener", "Brazilian Church Kitchener"],
    "description": "Igreja brasileira em Kitchener, Ontario, Canadá. Vine Church KWC (Igreja Videira) é uma comunidade cristã brasileira na região de Waterloo. Cultos em português e inglês aos domingos às 10AM.",
    "url": "https://vinechurch.ca",
    "logo": "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logo_vine.png",
    "image": "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logo_vine.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "417 King St W",
      "addressLocality": "Kitchener",
      "addressRegion": "ON",
      "postalCode": "N2G 1C2",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "43.4516",
      "longitude": "-80.4925"
    },
    "hasMap": "https://maps.app.goo.gl/hHUA4zo7fRg8vHJj6",
    "telephone": "+1-365-228-2980",
    "email": "prboris@vinechurch.ca",
    "knowsLanguage": ["pt", "en"],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "10:00",
        "closes": "12:00",
        "description": "Sunday Worship Service / Culto Dominical"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Tuesday",
        "opens": "19:30",
        "closes": "21:00",
        "description": "Maturity Course / Curso de Maturidade"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "20:00",
        "closes": "22:00",
        "description": "Life Groups / Células"
      }
    ],
    "founder": {
      "@type": "Person",
      "name": "Pastor Boris Carvalho"
    },
    "serviceArea": [
      {
        "@type": "City",
        "name": "Kitchener",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Ontario, Canada"
        }
      },
      {
        "@type": "City",
        "name": "Waterloo",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Ontario, Canada"
        }
      },
      {
        "@type": "City",
        "name": "Cambridge",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Ontario, Canada"
        }
      },
      {
        "@type": "City",
        "name": "Guelph",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Ontario, Canada"
        }
      }
    ],
    "areaServed": ["Cambridge", "Kitchener", "Waterloo", "Guelph", "Tri-Cities", "Waterloo Region"],
    "priceRange": "Free",
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vinechurch.ca/contact"
      }
    },
    "event": [
      {
        "@type": "Event",
        "name": "Sunday Worship Service / Culto Dominical",
        "description": "Weekly bilingual worship service (Portuguese and English) at Vine Church KWC. Igreja brasileira em Kitchener - venha nos visitar! Brazilian church in Kitchener - come visit us!",
        "startDate": "2026-02-22T10:00:00-05:00",
        "endDate": "2026-02-22T12:00:00-05:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "inLanguage": ["pt", "en"],
        "image": [
          "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logo_vine.png",
          "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/vine-blue.jpg"
        ],
        "location": {
          "@type": "Place",
          "name": "Vine Church KWC",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "417 King St W",
            "addressLocality": "Kitchener",
            "addressRegion": "ON",
            "postalCode": "N2G 1C2",
            "addressCountry": "CA"
          }
        },
        "performer": {
          "@type": "PerformingGroup",
          "name": "Vine Church KWC Worship Team"
        },
        "organizer": {
          "@type": "Organization",
          "name": "Vine Church KWC",
          "url": "https://vinechurch.ca"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://vinechurch.ca/pt/schedule",
          "price": "0",
          "priceCurrency": "CAD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2026-01-01"
        },
        "eventSchedule": {
          "@type": "Schedule",
          "scheduleTimezone": "America/Toronto",
          "byDay": "Sunday",
          "repeatFrequency": "P1W",
          "startTime": "10:00",
          "endTime": "12:00"
        }
      }
    ],
    "sameAs": [
      "https://www.instagram.com/vinechurch_kwc/"
    ],
    "additionalType": "https://schema.org/ReligiousOrganization"
  };

  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}