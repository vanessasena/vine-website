import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vine Church Cambridge",
  description: "Igreja Videira - Uma Igreja de Vencedores - A Church of Overcomers",
  icons: {
    icon: [
      {
        url: "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: {
      url: "https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}