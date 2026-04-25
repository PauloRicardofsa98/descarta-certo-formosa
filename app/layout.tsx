import type { Metadata } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";

import { Toaster } from "@/app/_components/ui/sonner";

import "./globals.css";

const fontSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const fontHeading = Lexend({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Descarta Certo Formosa",
    template: "%s · Descarta Certo Formosa",
  },
  description:
    "Saiba onde descartar corretamente cada tipo de resíduo em Formosa-GO. Pontos de coleta, instruções e orientações para a comunidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fontSans.variable} ${fontHeading.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
