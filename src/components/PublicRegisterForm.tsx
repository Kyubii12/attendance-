"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useState } from "react";

const DEPARTMENTS = ["BSMT", "BSCS", "BSIT", "BSMar.E", "BSECE", "BSN", "BSBA"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const schema = z.object({
  student_id: z.string().min(4, "Student ID is required"),
  name:       z.string().min(2, "Full name is required"),
  department: z.string().min(1, "Department is required"),
  year_level: z.string().min(1, "Year level is required"),
  email:      z.string().email("Enter a valid email").or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export default function PublicRegisterForm() {
  const [done, setDone] = useState(false);
  const [regName, setRegName] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("students").insert({
      student_id: data.student_id,
      name:       data.name,
      department: data.department,
      year_level: data.year_level,
      email:      data.email || null,
      is_active:  true,
    });

    if (error) {
      if (error.message.includes("unique") || error.code === "23505") {
        toast.error("Student ID already registered.");
      } else {
        toast.error(`Registration failed: ${error.message}`);
      }
      console.error("Supabase error:", error);
      return;
    }

    setRegName(data.name);
    setDone(true);
    reset();
  };

  if (done) {
    return (
      <div className="bg-[#1a2f4e] border border-white/10 rounded-2xl p-10 text-center">
        <CheckCircle size={52} className="text-green-400 mx-auto mb-4" />
        <h2 className="text-white font-bold text-xl mb-2">Registration Successful!</h2>
        <p className="text-gray-400 text-sm mb-6">
          <span className="text-[#c9a84c] font-semibold">{regName}</span> has been registered in the NPCMST AttendAI system.
        </p>
        <button onClick={() => setDone(false)}
          className="bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
          Register Another Student
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}
      className="bg-[#1a2f4e] border border-white/10 rounded-2xl p-8 space-y-4">

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Student ID *</label>
          <input {...register("student_id")}
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
            placeholder="e.g. 2024-0001" />
          {errors.student_id && <p className="text-red-400 text-xs mt-1">{errors.student_id.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Department *</label>
          <select {...register("department")}
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-colors">
            <option value="">Select...</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          {errors.department && <p className="text-red-400 text-xs mt-1">{errors.department.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
        <input {...register("name")}
          className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
          placeholder="Last Name, First Name M." />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Year Level *</label>
          <select {...register("year_level")}
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-colors">
            <option value="">Select...</option>
            {YEAR_LEVELS.map((y) => <option key={y}>{y}</option>)}
          </select>
          {errors.year_level && <p className="text-red-400 text-xs mt-1">{errors.year_level.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email (optional)</label>
          <input {...register("email")} type="email"
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
            placeholder="student@npcmst.edu.ph" />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-60 text-[#0a1628] font-bold py-3 rounded-lg transition-colors mt-2">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
            Registering...
          </span>
        ) : <><UserPlus size={16} /> Register Student</>}
      </button>
    </form>
  );
}
