import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Campus Buzz",
  description: "The campus coordination platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar />

          <main className="min-w-0 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}