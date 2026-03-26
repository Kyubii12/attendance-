import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NPCMST AttendAI — Facial Recognition Attendance System",
  description:
    "Automated facial recognition attendance system for Northern Philippines College for Maritime, Science and Technology — accurate, fast, and paperless.",
  keywords: ["attendance system", "facial recognition", "NPCMST", "Northern Philippines", "maritime college"],
  openGraph: {
    title: "NPCMST AttendAI",
    description: "Automated, accurate, and paperless attendance tracking for NPCMST.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#0a1628", color: "#fff", border: "1px solid #c9a84c" },
            success: { iconTheme: { primary: "#c9a84c", secondary: "#0a1628" } },
          }}
        />
      </body>
    </html>
  );
}
