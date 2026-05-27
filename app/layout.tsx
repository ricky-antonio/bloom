import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "bloom",
  description: "Every idea has roots.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#FFF8F0',
              border: '1px solid #FFDBBB',
              color: '#C07040',
              fontSize: '12px',
              borderRadius: '12px',
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
