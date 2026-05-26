import type { Metadata, Viewport } from "next";
import "./globals.css";

const appName = "暮らしのお金";
const appDescription = "カレンダー入力と収支グラフで管理する、共有できる個人用家計簿";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: appName,
  description: appDescription,
  applicationName: appName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: appName,
    description: appDescription,
    siteName: appName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: appName,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: appName,
    description: appDescription,
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#c77a3d",
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
