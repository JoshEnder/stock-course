import type { Metadata } from "next";
import { AppProviders } from "./components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Course",
  description: "A stock-learning project being rebuilt from Figma.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={
        {
          "--font-cormorant":
            "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
          "--font-dm-serif": "'DM Serif Display', Georgia, serif",
          "--font-dm-sans": "'DM Sans', system-ui, sans-serif",
        } as React.CSSProperties
      }
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
