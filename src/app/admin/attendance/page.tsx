import { createSupabaseServerClient } from "@/lib/supabase-server";
import AttendanceManager from "@/components/admin/AttendanceManager";

export default async function AdminAttendancePage() {
  const supabase = await createSupabaseServerClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const { data: logs } = await supabase
    .from("attendance_logs")
    .select("*, students(name, department)")
    .order("logged_at", { ascending: false })
    .limit(200);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
        <p className="text-gray-400 text-sm mt-1">Take attendance manually, via camera scan, or view history.</p>
      </div>
      <AttendanceManager
        initialStudents={students ?? []}
        initialLogs={(logs ?? []) as AttendanceLogWithStudent[]}
      />
    </div>
  );
}

export type AttendanceLogWithStudent = {
  id: string;
  student_id: string;
  status: "Present" | "Late" | "Absent";
  confidence: number;
  logged_at: string;
  subject: string | null;
  faculty_id: string | null;
  students: { name: string; department: string } | null;
};
