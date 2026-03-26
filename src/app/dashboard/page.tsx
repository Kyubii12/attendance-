import { Metadata } from "next";
import AttendanceDashboard from "@/components/AttendanceDashboard";

export const metadata: Metadata = {
  title: "Live Dashboard | NPCMST AttendAI",
  description: "Real-time attendance dashboard for NPCMST.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] pt-16">
      <AttendanceDashboard />
    </div>
  );
}
