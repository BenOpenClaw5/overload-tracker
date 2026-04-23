import type { Metadata, Viewport } from "next";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TimerProvider } from "@/components/TimerProvider";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import { SwRegister } from "@/components/SwRegister";
import { InstallHint } from "@/components/InstallHint";

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OVERLOAD — Progressive Overload Tracker",
  description: "Tactical telemetry for progressive overload. PPL 6-day split.",
  applicationName: "OVERLOAD",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OVERLOAD",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <TimerProvider>
          {children}
          <RestTimerOverlay />
          <InstallHint />
          <SwRegister />
        </TimerProvider>
      </body>
    </html>
  );
}
