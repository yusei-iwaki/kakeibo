import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家計簿",
  description: "カレンダー入力と収支グラフで管理する個人用家計簿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
