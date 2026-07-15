import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
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
