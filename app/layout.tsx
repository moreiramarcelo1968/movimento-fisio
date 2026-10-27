import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { PwaBridge } from "@/components/pwa/pwa-bridge";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Movimento · Gestão de fisioterapia",
    template: "%s · Movimento",
  },
  description:
    "Controle de pacientes, atendimentos e faturamento para clínicas de fisioterapia.",
  applicationName: "Movimento",
  appleWebApp: {
    capable: true,
    title: "Movimento",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0D4F47",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <PwaBridge />
      </body>
    </html>
  );
}
