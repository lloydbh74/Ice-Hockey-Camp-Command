import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swedish Camp Command",
  description: "Management system for Swedish Ice Hockey Camps",
};

export const runtime = 'edge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  );
}
