import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Platform — View, Share & AR",
  description: "Upload 3D files, view in browser, share with a link, and view in AR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
