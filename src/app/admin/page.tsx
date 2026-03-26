import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Users, ClipboardList, FileText, MessageSquare, TrendingUp } from "lucide-react";
import Link from "next/link";

type LogRow = {
  id: string; student_id: string; status: string;
  logged_at: string; subject: string | null;
  students: { name: string; department: string } | null;
};

export default async function AdminOverviewPage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalStudents },
    { count: totalLogs },
    { count: presentToday },
    { count: demoRequests },
    { count: unreadMessages },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("attendance_logs").select("*", { count: "exact", head: true }),
    supabase.from("attendance_logs").select("*", { count: "exact", head: true })
      .eq("status", "Present")
      .gte("logged_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
    supabase.from("demo_requests").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
  ]);

  const { data: rawLogs } = await supabase
    .from("attendance_logs")
    .select("*, students(name, department)")
    .order("logged_at", { ascending: false })
    .limit(8);

  const recentLogs = (rawLogs ?? []) as LogRow[];

  const cards = [
    { label: "Total Students",  value: totalStudents ?? 0,  icon: <Users size={22} />,         color: "text-blue-400",   bg: "bg-blue-500/10",   href: "/admin/students"   },
    { label: "Attendance Logs", value: totalLogs ?? 0,      icon: <ClipboardList size={22} />, color: "text-green-400",  bg: "bg-green-500/10",  href: "/admin/attendance" },
    { label: "Present Today",   value: presentToday ?? 0,   icon: <TrendingUp size={22} />,    color: "text-[#c9a84c]",  bg: "bg-[#c9a84c]/10",  href: "/admin/attendance" },
    { label: "Demo Requests",   value: demoRequests ?? 0,   icon: <FileText size={22} />,      color: "text-purple-400", bg: "bg-purple-500/10", href: "/admin/requests"   },
    { label: "Unread Messages", value: unreadMessages ?? 0, icon: <MessageSquare size={22} />, color: "text-red-400",    bg: "bg-red-500/10",    href: "/admin/messages"   },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-[#1a2f4e] border border-white/5 rounded-xl p-5 hover:border-[#c9a84c]/30 transition-colors group">
            <div className={`inline-flex p-2 rounded-lg ${c.bg} ${c.color} mb-3 group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="text-gray-400 text-xs mt-0.5">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-[#1a2f4e] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Recent Attendance</h2>
          <Link href="/admin/attendance" className="text-[#c9a84c] text-xs hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-white/5">
                <th className="text-left px-6 py-3">Student</th>
                <th className="text-left px-6 py-3">Dept</th>
                <th className="text-left px-6 py-3">Subject</th>
                <th className="text-left px-6 py-3">Time</th>
                <th className="text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-6 py-3 text-white font-medium">{l.students?.name ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-400">{l.students?.department ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-400 text-xs">{l.subject ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {new Date(l.logged_at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      l.status === "Present" ? "bg-green-500/10 text-green-400" :
                      l.status === "Late"    ? "bg-yellow-500/10 text-yellow-400" :
                                               "bg-red-500/10 text-red-400"
                    }`}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
