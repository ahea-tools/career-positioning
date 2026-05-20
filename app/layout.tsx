import type { Metadata } from "next";
import { Inter, Marcellus, PT_Serif } from "next/font/google";
import "./globals.css";

const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus" });
const ptSerif = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pt-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Career Positioning Tool",
  description:
    "Reframe your experience and communicate your value for evolving roles, sectors, and opportunities in a rapidly changing public health and health equity landscape."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${marcellus.variable} ${ptSerif.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
