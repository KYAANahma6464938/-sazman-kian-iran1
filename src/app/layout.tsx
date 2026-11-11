import type { Metadata } from "next";
import { Vazirmatn, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
});

const jetMono = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سازمان کیان | سپاه سایبری ایران",
  description:
    "شبیه‌ساز هکری و دروازه دارک وب مختص ایران. نقشه زنده حملات سایبری، اهداف نفوذ، اسناد نشت‌شده و کارت‌ساز بانکی. KIAN Organization - Iran Cyber Army Simulator.",
  keywords: ["سازمان کیان", "Kian", "hacker", "terminal", "dark web", "ایران", "سپاه سایبری", "شبیه‌ساز هکری"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='black'/><text y='.9em' x='10' font-size='70' fill='%2300ff41'>K</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazir.variable} ${jetMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
