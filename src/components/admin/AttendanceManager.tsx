"use client";
import { useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ClipboardCheck, Download, Search, Filter,
  CheckCircle, Clock, XCircle, Save, History, Plus, Camera
} from "lucide-react";
import toast from "react-hot-toast";
import type { Database } from "@/lib/database.types";
import type { AttendanceLogWithStudent } from "@/app/admin/attendance/page";
import CameraScanner from "@/components/admin/CameraScanner";

type Student = Database["public"]["Tables"]["students"]["Row"];
type Status = "Present" | "Late" | "Absent";

const SUBJECTS = [
  "Marine Engineering", "Ship Operations", "Data Structures",
  "Web Development", "Circuit Theory", "Ship Stability",
  "Navigation", "Marine Electrical", "Programming", "Mathematics",
];

const STATUS_STYLES: Record<Status, string> = {
  Present: "bg-green-500/10 text-green-400 border-green-500/30",
  Late:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Absent:  "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function AttendanceManager({
  initialStudents,
  initialLogs,
}: {
  initialStudents: Student[];
  initialLogs: AttendanceLogWithStudent[];
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Tab state ──────────────────────────────────────────────
  const [tab, setTab] = useState<"take" | "camera" | "history">("take");

  // ── Take Attendance state ──────────────────────────────────
  const [subject, setSubject]     = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [date, setDate]           = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  // Map: student.id → status (default Absent)
  const [marks, setMarks] = useState<Record<string, Status>>(() =>
    Object.fromEntries(initialStudents.map((s) => [s.id, "Absent"]))
  );

  // ── History state ──────────────────────────────────────────
  const [logs, setLogs]             = useState<AttendanceLogWithStudent[]>(initialLogs);
  const [histSearch, setHistSearch] = useState("");
  const [histStatus, setHistStatus] = useState("All");
  const [histDept, setHistDept]     = useState("All");

  const departments = ["All", ...Array.from(new Set(initialStudents.map((s) => s.department))).sort()];

  // ── Filtered students for take-attendance ─────────────────
  const filteredStudents = useMemo(() => initialStudents.filter((s) => {
    const q = search.toLowerCase();
    const matchQ    = s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q);
    const matchDept = deptFilter === "All" || s.department === deptFilter;
    return matchQ && matchDept;
  }), [initialStudents, search, deptFilter]);

  // ── Mark all helpers ──────────────────────────────────────
  const markAll = (status: Status) =>
    setMarks(Object.fromEntries(filteredStudents.map((s) => [s.id, status])));

  const setMark = (id: string, status: Status) =>
    setMarks((prev) => ({ ...prev, [id]: status }));

  // ── Summary counts ────────────────────────────────────────
  const counts = useMemo(() => ({
    present: Object.values(marks).filter((v) => v === "Present").length,
    late:    Object.values(marks).filter((v) => v === "Late").length,
    absent:  Object.values(marks).filter((v) => v === "Absent").length,
  }), [marks]);

  // ── Save attendance ───────────────────────────────────────
  const saveAttendance = async () => {
    const finalSubject = customSubject.trim() || subject;
    if (!finalSubject) { toast.error("Please select or enter a subject."); return; }

    setSaving(true);
    const rows = initialStudents.map((s) => ({
      student_id: s.student_id,
      status:     marks[s.id] ?? "Absent",
      confidence: 0,
      subject:    finalSubject,
      logged_at:  new Date(`${date}T${new Date().toTimeString().slice(0, 8)}`).toISOString(),
    }));

    const { error } = await supabase.from("attendance_logs").insert(rows);
    setSaving(false);

    if (error) { toast.error("Failed to save: " + error.message); return; }

    toast.success(`Attendance saved — ${counts.present} present, ${counts.late} late, ${counts.absent} absent.`);
    setSaved(true);

    // Refresh logs
    const { data } = await supabase
      .from("attendance_logs")
      .select("*, students(name, department)")
      .order("logged_at", { ascending: false })
      .limit(200);
    if (data) setLogs(data as AttendanceLogWithStudent[]);
  };

  // ── Export CSV ────────────────────────────────────────────
  const exportCSV = () => {
    const finalSubject = customSubject.trim() || subject || "—";
    const rows = [
      ["Student ID", "Name", "Department", "Subject", "Date", "Status"],
      ...initialStudents.map((s) => [
        s.student_id, s.name, s.department, finalSubject, date, marks[s.id] ?? "Absent",
      ]),
    ];
    const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `attendance_${date}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── History filtered ──────────────────────────────────────
  const filteredLogs = useMemo(() => logs.filter((l) => {
    const q = histSearch.toLowerCase();
    const matchQ      = (l.students?.name ?? "").toLowerCase().includes(q) || l.student_id.includes(q);
    const matchStatus = histStatus === "All" || l.status === histStatus;
    const matchDept   = histDept === "All" || l.students?.department === histDept;
    return matchQ && matchStatus && matchDept;
  }), [logs, histSearch, histStatus, histDept]);

  const exportHistoryCSV = () => {
    const rows = [
      ["Student ID", "Name", "Department", "Subject", "Date & Time", "Status"],
      ...filteredLogs.map((l) => [
        l.student_id,
        l.students?.name ?? "—",
        l.students?.department ?? "—",
        l.subject ?? "—",
        new Date(l.logged_at).toLocaleString("en-PH"),
        l.status,
      ]),
    ];
    const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `attendance_history_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("History exported.");
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
        {[
          { key: "take",    label: "Take Attendance", icon: <ClipboardCheck size={16} /> },
          { key: "camera",  label: "Camera Scan",     icon: <Camera size={16} /> },
          { key: "history", label: "History",         icon: <History size={16} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as "take" | "camera" | "history")}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-[#c9a84c] text-[#c9a84c]"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── CAMERA SCAN ── */}
      {tab === "camera" && (
        <CameraScanner students={initialStudents} />
      )}

      {/* ── TAKE ATTENDANCE ── */}
      {tab === "take" && (
        <div>
          {/* Session setup */}
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-5 mb-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Session Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Subject *</label>
                <select value={subject} onChange={(e) => { setSubject(e.target.value); setCustomSubject(""); }}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]">
                  <option value="">Select subject...</option>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  <option value="__custom">+ Custom subject</option>
                </select>
              </div>
              {subject === "__custom" && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Custom Subject</label>
                  <input value={customSubject} onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                    placeholder="Enter subject name" />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]" />
              </div>
            </div>
          </div>

          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Present", count: counts.present, color: "text-green-400",  bg: "bg-green-500/10"  },
              { label: "Late",    count: counts.late,    color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Absent",  count: counts.absent,  color: "text-red-400",    bg: "bg-red-500/10"    },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border border-white/5 rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]"
                placeholder="Search student..." />
            </div>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]">
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => markAll("Present")}
                className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-2 rounded-lg text-xs font-semibold transition-colors">
                <CheckCircle size={13} /> All Present
              </button>
              <button onClick={() => markAll("Absent")}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-xs font-semibold transition-colors">
                <XCircle size={13} /> All Absent
              </button>
            </div>
          </div>

          {/* Student list */}
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-white/5">
                    <th className="text-left px-5 py-3">Student</th>
                    <th className="text-left px-5 py-3">ID</th>
                    <th className="text-left px-5 py-3">Dept</th>
                    <th className="text-left px-5 py-3">Year</th>
                    <th className="text-center px-5 py-3">Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.student_id}</td>
                      <td className="px-5 py-3 text-gray-300 text-xs">{s.department}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{s.year_level}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {(["Present", "Late", "Absent"] as Status[]).map((st) => (
                            <button key={st} onClick={() => setMark(s.id, st)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                marks[s.id] === st
                                  ? STATUS_STYLES[st] + " scale-105"
                                  : "border-white/10 text-gray-600 hover:border-white/20 hover:text-gray-400"
                              }`}>
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-600 text-sm">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={saveAttendance} disabled={saving || saved}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-50 text-[#0a1628] font-bold px-6 py-3 rounded-lg text-sm transition-colors">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                  Saving...
                </span>
              ) : saved ? (
                <><CheckCircle size={16} /> Saved!</>
              ) : (
                <><Save size={16} /> Save Attendance</>
              )}
            </button>
            {saved && (
              <button onClick={() => { setSaved(false); setMarks(Object.fromEntries(initialStudents.map((s) => [s.id, "Absent"]))); }}
                className="flex items-center gap-2 bg-[#1a2f4e] hover:bg-[#243d5e] text-white border border-white/10 font-semibold px-5 py-3 rounded-lg text-sm transition-colors">
                <Plus size={16} /> New Session
              </button>
            )}
            <button onClick={exportCSV}
              className="flex items-center gap-2 bg-[#1a2f4e] hover:bg-[#243d5e] text-white border border-white/10 font-semibold px-5 py-3 rounded-lg text-sm transition-colors ml-auto">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === "history" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={histSearch} onChange={(e) => setHistSearch(e.target.value)}
                className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]"
                placeholder="Search student..." />
            </div>
            <select value={histDept} onChange={(e) => setHistDept(e.target.value)}
              className="bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]">
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <div className="flex gap-2">
              {["All", "Present", "Late", "Absent"].map((s) => (
                <button key={s} onClick={() => setHistStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    histStatus === s ? "bg-[#c9a84c] text-[#0a1628]" : "bg-[#1a2f4e] text-gray-400 hover:text-white"
                  }`}>{s}</button>
              ))}
            </div>
            <button onClick={exportHistoryCSV}
              className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-semibold px-4 py-2 rounded-lg text-sm ml-auto transition-colors">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* History table */}
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-white/5">
                    <th className="text-left px-5 py-3">Student</th>
                    <th className="text-left px-5 py-3">ID</th>
                    <th className="text-left px-5 py-3">Dept</th>
                    <th className="text-left px-5 py-3">Subject</th>
                    <th className="text-left px-5 py-3">Date & Time</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((l) => (
                    <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-5 py-3 text-white font-medium">{l.students?.name ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{l.student_id}</td>
                      <td className="px-5 py-3 text-gray-300 text-xs">{l.students?.department ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{l.subject ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(l.logged_at).toLocaleString("en-PH", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[l.status]}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-600 text-sm">No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-600">
              {filteredLogs.length} of {logs.length} records
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
