import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { QueryProvider } from "@/lib/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Biriyani Map | Iftar Spots Tracker",
  description: "Real-time community-driven Iftar and Biriyani distribution map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased flex`}>
        <QueryProvider>
          <Sidebar />
          <div className="flex-1 ml-16 relative h-screen">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}