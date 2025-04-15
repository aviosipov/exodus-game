import type { Metadata } from "next";
import { Rubik, Amatic_SC, Noto_Serif_Hebrew } from 'next/font/google';
import "./globals.css";
import GameMenu from "@/components/GameMenu"; // Import the GameMenu

// Rubik (variable font)
const rubik = Rubik({
  subsets: ['latin', 'hebrew'],
  variable: '--font-rubik',
  display: 'swap',
});

// Amatic SC (non-variable font)
const amaticSC = Amatic_SC({
  weight: ['400', '700'], // Weights from user request
  subsets: ['latin', 'hebrew'],
  variable: '--font-amatic',
  display: 'swap',
});

// Noto Serif Hebrew (variable font)
const notoSerif = Noto_Serif_Hebrew({
  subsets: ['hebrew', 'latin'],
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "יציאת מצרים: הרפתקה אינטראקטיבית",
  description: "An interactive Exodus game experience.",
  // Add other icons/manifest links if needed
  icons: {
    icon: '/favicon.ico', // Link to the favicon in the public directory
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rubik.variable} ${amaticSC.variable} ${notoSerif.variable}`}>
      {/* The <head> tag is implicitly managed by Next.js metadata,
          but we ensure the favicon link is included via the 'icons' property above. */}
      <body className="antialiased">
        <GameMenu /> {/* Add the GameMenu component */}
        {children}
      </body>
    </html>
  );
}
