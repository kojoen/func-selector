import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "RouteX | Modular EVM Function Selector & Calldata Gateway",
  description:
    "Production-grade EVM Calldata Router, Dynamic Selector Registry, Facet Studio, and Security Auditor.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen antialiased bg-bg text-text selection:bg-accent/30 selection:text-white">
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
