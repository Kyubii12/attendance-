import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CameraScanner from "@/components/admin/CameraScanner";

export const metadata: Metadata = { title: "Camera Scan | NPCMST AttendAI" };

export default async function ScanPage() {
  const supabase = await createSupabaseServerClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Camera Attendance Scanner</h1>
        <p className="text-gray-400 text-sm mt-1">
          Use the camera to scan and log student attendance in real-time.
        </p>
      </div>
      <CameraScanner students={students ?? []} />
    </div>
  );
}
