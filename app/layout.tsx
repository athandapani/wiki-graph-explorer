import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, Inter, Manrope, Source_Sans_3, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Loaded for the Indigo and Plum theme presets (lib/theme-presets.ts) — all fonts are loaded
// upfront at build time (next/font/google can't load a font selected at runtime) and switched
// via the --font-heading/--font-sans CSS custom properties in app/globals.css.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiki Graph Explorer",
  description: "Explore a wiki's backlink structure as a clickable, force-directed graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${fraunces.variable} ${sourceSans3.variable} dark h-full antialiased`}
      // The anti-flash script below mutates this element's class/attributes/inline style before
      // React hydrates (removing "dark" for a stored light preference, applying a stored theme
      // preset or custom accent), which is an intentional, expected mismatch — not a bug to
      // patch up.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so a stored light preference, theme preset, or custom accent color
            never flashes the default (dark, teal) theme first. The preset->accent map is
            duplicated from lib/theme-presets.ts's THEME_PRESETS — this must run as a plain
            inline script (no module import) so it executes before hydration; keep both in sync
            if a preset's accent ever changes. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}try{var p=localStorage.getItem('themePreset');var accents={teal:['#0088a3','#109cc6'],indigo:['#2a78d6','#5b93e0'],plum:['#a13d8f','#bd6cb3']};var dark=document.documentElement.classList.contains('dark');if(p){document.documentElement.setAttribute('data-theme-preset',p)}if(p==='custom'){var c=localStorage.getItem('customAccent');if(c){document.documentElement.style.setProperty('--accent',c)}}else if(p&&accents[p]){document.documentElement.style.setProperty('--accent',accents[p][dark?1:0])}}catch(e){}",
          }}
        />
      </head>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
