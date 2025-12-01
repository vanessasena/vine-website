import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Vine Church KWC - Igreja Videira",
    template: "%s | Vine Church KWC"
  },
  description: "Igreja Videira KWC - Uma Igreja de Vencedores. Cultos aos domingos 10AM. Células, Vine Kids, Comunidade Cristã na região de Waterloo, Ontario, Canadá.",
  keywords: [
    "Igreja Cambridge",
    "Igreja Kitchener",
    "Igreja Waterloo",
    "Church Cambridge Ontario",
    "Church Kitchener Ontario",
    "Church Waterloo Ontario",
    "Igreja Brasileira Cambridge",
    "Igreja Brasileira Kitchener",
    "Igreja Brasileira Waterloo",
    "Brazilian Church Cambridge",
    "Brazilian Church Kitchener",
    "Brazilian Church Waterloo",
    "Vine Church",
    "Igreja Videira",
    "Comunidade Cristã",
    "Christian Community",
    "Célula",
    "Life Groups",
    "Vine Kids",
    "Cambridge ON",
    "Kitchener ON",
    "Waterloo ON",
    "Dickson Street",
    "Pastor Boris Carvalho",
    "Igreja de Vencedores",
    "Church of Overcomers"
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
    description: 'Igreja Videira KWC - Uma Igreja de Vencedores. Cultos aos domingos 10AM. Células, Vine Kids, Comunidade Cristã na região de Waterloo, Ontario.',
    images: [
      {
        url: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png',
        width: 1200,
        height: 630,
        alt: 'Vine Church KWC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vine Church KWC - Igreja Videira',
    description: 'Igreja Videira KWC - Uma Igreja de Vencedores. Cultos aos domingos 10AM.',
    images: ['https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png'],
  },
  verification: {
    google: 'AI-edjltYyq3qb7qKFg0j0YqFFpqkokHXbgrVgpHoHg', // Replace with actual code when you get it
  },
  category: 'religion',
  classification: 'Church, Religious Organization, Community',
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
  },
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
    "alternateName": "Igreja Videira KWC",
    "description": "Igreja Videira KWC - Uma Igreja de Vencedores. Comunidade cristã brasileira na região de Waterloo, Ontario.",
    "url": "https://vinechurch.ca",
    "logo": "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png",
    "image": "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "55 Dickson Street, 8 Petty Pl",
      "addressLocality": "Cambridge",
      "addressRegion": "ON",
      "postalCode": "N1R 7A5",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "43.3616",
      "longitude": "-80.3144"
    },
    "telephone": "+1-365-228-2980",
    "email": "videiracanada@gmail.com",
    "founder": {
      "@type": "Person",
      "name": "Pastor Boris Carvalho"
    },
    "serviceArea": {
      "@type": "Place",
      "name": "Cambridge, Ontario, Canada"
    },
    "areaServed": ["Cambridge", "Kitchener", "Waterloo", "Guelph"],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vinechurch.ca/contact"
      }
    },
    "event": {
      "@type": "Event",
      "name": "Sunday Service",
      "description": "Weekly worship service",
      "startTime": "10:00",
      "endTime": "12:00",
      "eventSchedule": {
        "@type": "Schedule",
        "scheduleTimezone": "America/Toronto",
        "byDay": "Sunday"
      },
      "location": {
        "@type": "Place",
        "name": "Vine Church KWC",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "55 Dickson Street, 8 Petty Pl",
          "addressLocality": "Cambridge",
          "addressRegion": "ON",
          "postalCode": "N1R 7A5",
          "addressCountry": "CA"
        }
      }
    },
    "sameAs": [
      "https://www.instagram.com/vinechurch_kwc/"
    ]
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
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}