import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StructuredData } from "@/components/StructuredData";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Leads Kopen Nederland | Thuisbatterijen, Zonnepanelen, Warmtepompen | WarmeLeads",
  description: "Koop verse leads voor thuisbatterijen, zonnepanelen, warmtepompen, airco's en financial lease. Exclusieve en gedeelde leads uit onze campagnes. Nederlandse prospects, realtime delivery, 15 minuten garantie.",
  keywords: "leads kopen, leads thuisbatterijen, zonnepanelen leads, warmtepomp leads, airco leads, financial lease leads, exclusieve leads, gedeelde leads, leadgeneratie Nederland, verse leads, prospects kopen",
  authors: [{ name: "WarmeLeads" }],
  creator: "WarmeLeads",
  publisher: "WarmeLeads",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://warmeleads.eu"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Leads Kopen Nederland | Verse Leads Thuisbatterijen, Zonnepanelen, Warmtepompen",
    description: "Koop exclusieve en gedeelde leads voor thuisbatterijen, zonnepanelen, warmtepompen, airco's en financial lease. Nederlandse prospects uit onze campagnes, realtime delivery in 15 minuten.",
    url: "https://www.warmeleads.eu",
    siteName: "WarmeLeads - Leadgeneratie Nederland",
    locale: "nl_NL",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WarmeLeads - Leadgeneratie Expert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WarmeLeads - Verse Leads Binnen 15 Minuten",
    description: "Krijg exclusieve of gedeelde leads voor thuisbatterijen, zonnepanelen, warmtepompen, airco's en financial lease.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google03b6b9ca45bfab2e",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B2F75" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WarmeLeads" />
        <meta name="msapplication-TileColor" content="#3B2F75" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        <StructuredData />
        <ErrorBoundary>
          <div id="root">
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}