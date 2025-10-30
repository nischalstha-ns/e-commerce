import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ClientInit from "./components/ClientInit";
import NoSSRWrapper from "./components/NoSSRWrapper";
import HydrationFix from "./components/HydrationFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "E-Commerce Store",
  description: "Your trusted online store for quality products",
  openGraph: {
    type: "website",
    siteName: "E-Commerce Store",
    title: "E-Commerce Store",
    description: "Your trusted online store for quality products",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <div id="__next" suppressHydrationWarning>
          <HydrationFix>
            <Providers>
              <NoSSRWrapper>
                <ClientInit />
              </NoSSRWrapper>
              {children}
            </Providers>
          </HydrationFix>
        </div>
      </body>
    </html>
  );
}