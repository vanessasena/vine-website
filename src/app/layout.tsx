import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Vine Church Cambridge - Igreja Videira",
    template: "%s | Vine Church Cambridge"
  },
  description: "Igreja Videira Cambridge - Uma Igreja de Vencedores. Cultos aos domingos 10AM. Células, Vine Kids, Comunidade Cristã em Cambridge, Ontario, Canadá.",
  keywords: [
    "Igreja Cambridge",
    "Church Cambridge Ontario",
    "Igreja Brasileira Cambridge",
    "Brazilian Church Cambridge",
    "Vine Church",
    "Igreja Videira",
    "Comunidade Cristã",
    "Christian Community",
    "Célula",
    "Life Groups",
    "Vine Kids",
    "Cambridge ON",
    "Dickson Street",
    "Pastor Boris Carvalho",
    "Igreja de Vencedores",
    "Church of Overcomers"
  ],
  authors: [{ name: "Vine Church Cambridge" }],
  creator: "Vine Church Cambridge",
  publisher: "Vine Church Cambridge",
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
    url: 'https://vinechurchcambridge.com',
    siteName: 'Vine Church Cambridge',
    title: 'Vine Church Cambridge - Igreja Videira',
    description: 'Igreja Videira Cambridge - Uma Igreja de Vencedores. Cultos aos domingos 10AM. Células, Vine Kids, Comunidade Cristã em Cambridge, Ontario.',
    images: [
      {
        url: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png',
        width: 1200,
        height: 630,
        alt: 'Vine Church Cambridge Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vine Church Cambridge - Igreja Videira',
    description: 'Igreja Videira Cambridge - Uma Igreja de Vencedores. Cultos aos domingos 10AM.',
    images: ['https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png'],
  },
  verification: {
    google: 'your-google-site-verification-code', // Replace with actual code when you get it
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
  metadataBase: new URL('https://vinechurchcambridge.com'), // Update with your actual domain
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Church",
    "name": "Vine Church Cambridge",
    "alternateName": "Igreja Videira Cambridge",
    "description": "Igreja Videira Cambridge - Uma Igreja de Vencedores. Comunidade cristã brasileira em Cambridge, Ontario.",
    "url": "https://vinechurchcambridge.com",
    "logo": "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png",
    "image": "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png",
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
        "urlTemplate": "https://vinechurchcambridge.com/contact"
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
        "name": "Vine Church Cambridge",
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
      "https://www.instagram.com/vine_cambridge/"
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
      </body>
    </html>
  );
}