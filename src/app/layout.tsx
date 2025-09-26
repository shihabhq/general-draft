import type React from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import "../styles/globals.css";
import { Navigation } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Football Scorecard & Timer",
  description: "Track football games with timer and scorecard functionality",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Navigation />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
