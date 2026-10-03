import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

import CommandPalette from "@/components/CommandPalette";
import CursorGlow from "@/components/CursorGlow";
import SectionRail from "@/components/SectionRail";
import Toast from "@/components/Toast";
import Nav from "@/components/Nav";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/lib/content";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    images: ["/hero/frames/frame_0001.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#cdcac5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <SmoothScroll>
          <ScrollProgress />
          <CursorGlow />
          <Nav />
          {children}
          <SectionRail />
          <CommandPalette />
          <Toast />
        </SmoothScroll>
      </body>
    </html>
  );
}
