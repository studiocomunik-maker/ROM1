import type { Metadata } from "next";
import { Inter, Archivo_Black, Anton } from "next/font/google";
import "./globals.css";
import TransitionProvider from "./components/TransitionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Romain Renoux — Direction artistique, image & web · Beaujolais",
  description:
    "20 ans à donner une image aux marques. Direction artistique, photo, vidéo & drone, motion design, print et web. Beaujolais · Lyon · Rhône.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${archivoBlack.variable} ${anton.variable} antialiased`}
    >
      <body>
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
