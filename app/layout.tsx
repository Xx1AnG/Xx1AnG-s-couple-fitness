import type { Metadata } from "next";

import { TimezoneCookie } from "@/components/timezone-cookie";
import "./globals.css";

export const metadata: Metadata = {
  title: "双人健身打卡",
  description: "移动优先的情侣健身打卡 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <TimezoneCookie />
        {children}
      </body>
    </html>
  );
}
