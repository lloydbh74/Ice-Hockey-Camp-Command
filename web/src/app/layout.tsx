import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swedish Camp Command | Elite Ice Hockey Training Management",
  description: "The definitive management system for Swedish Ice Hockey Camps. Professional coaching, elite facilities, and seamless camp coordination.",
  keywords: ["Ice Hockey", "Swedish hockey", "hockey training", "camp management", "scouting"],
  authors: [{ name: "Swedish Camp Command" }],
  openGraph: {
    title: "Swedish Camp Command | Elite Ice Hockey Training Management",
    description: "Manage and coordinate elite ice hockey camps in Sweden with ease.",
    type: "website",
    locale: "en_GB",
    url: "https://swedish-camp-command.com", // Placeholder URL
    siteName: "Swedish Camp Command",
  },
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
