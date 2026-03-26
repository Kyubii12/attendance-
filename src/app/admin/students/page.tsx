import { createSupabaseServerClient } from "@/lib/supabase-server";
import StudentManager from "@/components/admin/StudentManager";

export default async function StudentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("enrolled_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Students</h1>
        <p className="text-gray-400 text-sm mt-1">Register and manage enrolled students.</p>
      </div>
      <StudentManager initialStudents={students ?? []} />
    </div>
  );
}
