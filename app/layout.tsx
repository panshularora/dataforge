import type { Metadata } from "next";
import { Syne, Atkinson_Hyperlegible, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Zero tokens. More compute. — BDH-CQ inference-time scaling",
  description:
    "Interactive explainer of latent test-time compute in BDH-CQ. A 150M model reaches 29.5% ARC-AGI-1 pass@2 at $0.0007/task with no verbal chain of thought. DataForge 2026, Pathway track.",
  openGraph: {
    title: "Zero tokens. More compute.",
    description:
      "BDH-CQ allocates extra inference compute inside a latent workspace. 21% → 29.5% pass@2. $0.0007/task. 0 CoT tokens.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
