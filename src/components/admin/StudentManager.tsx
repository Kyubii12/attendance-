"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus, Search, Trash2, ToggleLeft,
  ToggleRight, X, CheckCircle, ScanFace
} from "lucide-react";
import toast from "react-hot-toast";
import FaceCapture from "@/components/admin/FaceCapture";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Student = Database["public"]["Tables"]["students"]["Row"];

const DEPARTMENTS = ["BSMT", "BSCS", "BSIT", "BSMar.E", "BSECE", "BSN", "BSBA"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const schema = z.object({
  student_id: z.string().min(4, "Student ID required"),
  name:       z.string().min(2, "Full name required"),
  department: z.string().min(1, "Department required"),
  year_level: z.string().min(1, "Year level required"),
  email:      z.string().email("Valid email required").or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

// Registration steps
type Step = "info" | "face" | "done";

export default function StudentManager({ initialStudents }: { initialStudents: Student[] }) {
  const router = useRouter();

  const [students, setStudents]     = useState<Student[]>(initialStudents);
  const [showForm, setShowForm]     = useState(false);
  const [step, setStep]             = useState<Step>("info");
  const [faceData, setFaceData]     = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const closeModal = () => {
    setShowForm(false);
    setStep("info");
    setFaceData(null);
    setPendingData(null);
    reset();
  };

  // Step 1 — info form submitted → move to face capture
  const onInfoSubmit = (data: FormData) => {
    setPendingData(data);
    setStep("face");
  };

  // Step 2 — face captured → save to DB
  const onFinalSubmit = async (skipFace = false) => {
    if (!pendingData) return;
    setSubmitting(true);

    const { data: inserted, error } = await supabase
      .from("students")
      .insert({
        student_id: pendingData.student_id,
        name:       pendingData.name,
        department: pendingData.department,
        year_level: pendingData.year_level,
        email:      pendingData.email || null,
        is_active:  true,
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast.error(error.message.includes("unique") ? "Student ID already exists." : error.message);
      setStep("info");
      return;
    }

    setStudents(prev => [inserted as Student, ...prev]);
    toast.success(`${pendingData.name} registered${skipFace ? "" : " with face data"}.`);
    setStep("done");
    router.refresh();
  };

  const toggleActive = async (s: Student) => {
    const { error } = await supabase.from("students").update({ is_active: !s.is_active }).eq("id", s.id);
    if (error) { toast.error("Update failed."); return; }
    setStudents(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x));
    toast.success(`${s.name} ${!s.is_active ? "activated" : "deactivated"}.`);
  };

  const deleteStudent = async (s: Student) => {
    if (!confirm(`Delete ${s.name}? This will also remove all their attendance records.`)) return;
    setDeleting(s.id);
    const { error } = await supabase.from("students").delete().eq("id", s.id);
    setDeleting(null);
    if (error) { toast.error("Delete failed."); return; }
    setStudents(prev => prev.filter(x => x.id !== s.id));
    toast.success(`${s.name} removed.`);
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q))
      && (deptFilter === "All" || s.department === deptFilter);
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c]"
            placeholder="Search by name or ID..." />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]">
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button onClick={() => { setShowForm(true); setStep("info"); }}
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-4 py-2 rounded-lg text-sm transition-colors">
          <UserPlus size={16} /> Register Student
        </button>
      </div>

      {/* ── Registration Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-bold flex items-center gap-2">
                <UserPlus size={18} className="text-[#c9a84c]" />
                Register New Student
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0 px-6 pt-4">
              {[
                { n: 1, label: "Student Info", key: "info" },
                { n: 2, label: "Face Capture", key: "face" },
                { n: 3, label: "Done",         key: "done" },
              ].map((s, i) => (
                <div key={s.key} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${
                    step === s.key ? "text-[#c9a84c]" :
                    (step === "face" && s.key === "info") || step === "done" ? "text-green-400" :
                    "text-gray-600"
                  }`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      step === s.key ? "border-[#c9a84c] text-[#c9a84c] bg-[#c9a84c]/10" :
                      (step === "face" && s.key === "info") || step === "done" ? "border-green-500 bg-green-500/10 text-green-400" :
                      "border-white/10 text-gray-600"
                    }`}>{s.n}</span>
                    <span className="hidden sm:block">{s.label}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-white/10 mx-2" />}
                </div>
              ))}
            </div>

            {/* ── STEP 1: Info ── */}
            {step === "info" && (
              <form onSubmit={handleSubmit(onInfoSubmit)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Student ID *</label>
                    <input {...register("student_id")}
                      className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                      placeholder="e.g. 2024-0001" />
                    {errors.student_id && <p className="text-red-400 text-xs mt-1">{errors.student_id.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Department *</label>
                    <select {...register("department")}
                      className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]">
                      <option value="">Select...</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
                  <input {...register("name")}
                    className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                    placeholder="Last Name, First Name M." />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Year Level *</label>
                    <select {...register("year_level")}
                      className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]">
                      <option value="">Select...</option>
                      {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
                    </select>
                    {errors.year_level && <p className="text-red-400 text-xs mt-1">{errors.year_level.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                    <input {...register("email")} type="email"
                      className="w-full bg-[#1a2f4e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c9a84c]"
                      placeholder="student@npcmst.edu.ph" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal}
                    className="flex-1 border border-white/10 text-gray-400 hover:text-white py-2.5 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-60 text-[#0a1628] font-bold py-2.5 rounded-lg text-sm transition-colors">
                    Next: Capture Face →
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 2: Face Capture ── */}
            {step === "face" && (
              <div className="p-6 space-y-4">
                <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-4 flex items-center gap-3 mb-2">
                  <ScanFace size={20} className="text-[#c9a84c] flex-shrink-0" />
                  <div>
                    <div className="text-white text-sm font-semibold">{pendingData?.name}</div>
                    <div className="text-gray-400 text-xs">{pendingData?.student_id} · {pendingData?.department}</div>
                  </div>
                </div>

                <FaceCapture
                  captured={faceData}
                  onCapture={(url) => setFaceData(url)}
                  onClear={() => setFaceData(null)}
                />

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep("info")}
                    className="border border-white/10 text-gray-400 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors">
                    ← Back
                  </button>
                  <button type="button" onClick={() => onFinalSubmit(true)}
                    disabled={submitting}
                    className="flex-1 border border-white/10 text-gray-400 hover:text-white py-2.5 rounded-lg text-sm transition-colors">
                    Skip Face Capture
                  </button>
                  <button type="button"
                    onClick={() => onFinalSubmit(false)}
                    disabled={!faceData || submitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-50 text-[#0a1628] font-bold py-2.5 rounded-lg text-sm transition-colors">
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                    ) : <><CheckCircle size={16} /> Register Student</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Done ── */}
            {step === "done" && (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h3 className="text-white font-bold text-lg">Student Registered!</h3>
                <p className="text-gray-400 text-sm">
                  <span className="text-[#c9a84c] font-semibold">{pendingData?.name}</span> has been added to the system
                  {faceData ? " with face data captured." : "."}
                </p>
                {faceData && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={faceData} alt="Captured" className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-[#c9a84c]/40" />
                )}
                <div className="flex gap-3 justify-center pt-2">
                  <button onClick={closeModal}
                    className="border border-white/10 text-gray-400 hover:text-white px-5 py-2.5 rounded-lg text-sm transition-colors">
                    Close
                  </button>
                  <button onClick={() => { setStep("info"); setFaceData(null); setPendingData(null); reset(); }}
                    className="bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors">
                    Register Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students table */}
      <div className="bg-[#1a2f4e] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 text-xs text-gray-500">
          {filtered.length} of {students.length} students
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wide border-b border-white/5">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">ID</th>
                <th className="text-left px-5 py-3">Department</th>
                <th className="text-left px-5 py-3">Year</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Enrolled</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.student_id}</td>
                  <td className="px-5 py-3 text-gray-300">{s.department}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{s.year_level}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{s.email ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(s.enrolled_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      s.is_active ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-500"
                    }`}>{s.is_active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(s)} title={s.is_active ? "Deactivate" : "Activate"}
                        className="text-gray-500 hover:text-[#c9a84c] transition-colors">
                        {s.is_active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => deleteStudent(s)} disabled={deleting === s.id}
                        className="text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-600 text-sm">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
