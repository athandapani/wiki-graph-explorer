import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
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
      className={`${inter.variable} ${manrope.variable} dark h-full antialiased`}
      // The anti-flash script below mutates this element's class before React hydrates
      // (removing "dark" for a stored light preference), which is an intentional,
      // expected mismatch — not a bug to patch up.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so a stored light-mode preference never flashes dark first. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}",
          }}
        />
      </head>
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
