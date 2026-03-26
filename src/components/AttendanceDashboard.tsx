"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ScanFace, Users, Clock, AlertCircle, Download, RefreshCw, Filter, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";

type LogRow = {
  id: string;
  student_id: string;
  status: "Present" | "Late" | "Absent";
  confidence: number;
  logged_at: string;
  subject: string | null;
  students: { name: string; department: string } | null;
};

const DEPARTMENTS = ["All", "BSMT", "BSCS", "BSIT", "BSMar.E", "BSECE"];

export default function AttendanceDashboard() {
  const [logs, setLogs]               = useState<LogRow[]>([]);
  const [loading, setLoading]         = useState(true);
  const [connected, setConnected]     = useState(false);
  const [filter, setFilter]           = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [flash, setFlash]             = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*, students(name, department)")
      .order("logged_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Failed to load attendance data.");
      console.error(error);
    } else {
      setLogs((data as LogRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("attendance_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attendance_logs" },
        async (payload) => {
          // Fetch the full row with student join
          const { data } = await supabase
            .from("attendance_logs")
            .select("*, students(name, department)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setLogs((prev) => [data as LogRow, ...prev]);
            setFlash(data.id);
            toast.success(`${(data as LogRow).students?.name ?? "Student"} marked ${data.status}`);
            setTimeout(() => setFlash(null), 2000);
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = logs.filter((l) => {
    const deptMatch   = filter === "All" || l.students?.department === filter;
    const statusMatch = statusFilter === "All" || l.status === statusFilter;
    return deptMatch && statusMatch;
  });

  const present = logs.filter((l) => l.status === "Present").length;
  const late    = logs.filter((l) => l.status === "Late").length;
  const absent  = logs.filter((l) => l.status === "Absent").length;
  const total   = logs.length;

  const exportCSV = () => {
    const rows = [
      ["ID", "Name", "Department", "Time", "Status", "Confidence", "Subject"],
      ...logs.map((l) => [
        l.student_id,
        l.students?.name ?? "—",
        l.students?.department ?? "—",
        new Date(l.logged_at).toLocaleString("en-PH"),
        l.status,
        l.confidence > 0 ? `${l.confidence}%` : "—",
        l.subject ?? "—",
      ]),
    ];
    const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully.");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScanFace className="text-[#c9a84c]" size={28} />
            Live Attendance Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-1.5">
            {connected
              ? <><Wifi size={12} className="text-green-400" /> Realtime connected</>
              : <><WifiOff size={12} className="text-gray-500" /> Connecting...</>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-[#1a2f4e] hover:bg-[#243d5e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-50 text-[#0a1628] font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total",   value: total,   icon: <Users size={20} />,       color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Present", value: present, icon: <ScanFace size={20} />,    color: "text-green-400",  bg: "bg-green-500/10"  },
          { label: "Late",    value: late,    icon: <Clock size={20} />,        color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Absent",  value: absent,  icon: <AlertCircle size={20} />, color: "text-red-400",    bg: "bg-red-500/10"    },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a2f4e] rounded-xl p-5 border border-white/5">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-3`}>{s.icon}</div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-gray-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Attendance rate */}
      <div className="bg-[#1a2f4e] rounded-xl p-5 mb-6 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium text-sm">Attendance Rate</span>
          <span className="text-[#c9a84c] font-bold">
            {total > 0 ? Math.round(((present + late) / total) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-[#0a1628] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] rounded-full transition-all duration-700"
            style={{ width: `${total > 0 ? ((present + late) / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" />Present: {present}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full" />Late: {late}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Absent: {absent}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <Filter size={14} className="text-gray-500" />
        <div className="flex gap-2 flex-wrap">
          {DEPARTMENTS.map((d) => (
            <button key={d} onClick={() => setFilter(d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === d ? "bg-[#c9a84c] text-[#0a1628]" : "bg-[#1a2f4e] text-gray-400 hover:text-white"
              }`}>{d}</button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {["All", "Present", "Late", "Absent"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-[#c9a84c] text-[#0a1628]" : "bg-[#1a2f4e] text-gray-400 hover:text-white"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a2f4e] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 gap-3">
            <RefreshCw size={18} className="animate-spin" /> Loading attendance data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">ID</th>
                  <th className="text-left px-5 py-3">Dept</th>
                  <th className="text-left px-5 py-3">Subject</th>
                  <th className="text-left px-5 py-3">Time</th>
                  <th className="text-left px-5 py-3">Confidence</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id}
                    className={`border-b border-white/5 last:border-0 transition-colors ${
                      flash === l.id ? "bg-[#c9a84c]/10" : "hover:bg-white/5"
                    }`}
                  >
                    <td className="px-5 py-3 text-white font-medium">{l.students?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{l.student_id}</td>
                    <td className="px-5 py-3 text-gray-300">{l.students?.department ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{l.subject ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs whitespace-nowrap">
                      {new Date(l.logged_at).toLocaleString("en-PH", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      {l.confidence > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-[#0a1628] rounded-full overflow-hidden">
                            <div className="h-full bg-[#c9a84c] rounded-full" style={{ width: `${l.confidence}%` }} />
                          </div>
                          <span className="text-gray-400 text-xs">{l.confidence}%</span>
                        </div>
                      ) : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        l.status === "Present" ? "bg-green-500/10 text-green-400" :
                        l.status === "Late"    ? "bg-yellow-500/10 text-yellow-400" :
                                                 "bg-red-500/10 text-red-400"
                      }`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-600 text-sm">
                      No records match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-white/5 text-xs text-gray-600">
          {filtered.length} of {logs.length} records
        </div>
      </div>
    </div>
  );
}
