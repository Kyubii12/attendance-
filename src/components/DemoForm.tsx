"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  name:       z.string().min(2, "Name is required"),
  email:      z.string().email("Enter a valid email"),
  role:       z.string().min(1, "Please select your role"),
  department: z.string().min(2, "Department is required"),
  message:    z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DemoForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("demo_requests").insert({
      name:       data.name,
      email:      data.email,
      role:       data.role,
      department: data.department,
      message:    data.message ?? null,
    });

    if (error) {
      toast.error("Failed to submit. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Demo request received! We'll reach out within 1–2 business days.");
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-4"
    >
      <h3 className="text-xl font-bold text-[#0a1628] mb-2">Request a Demo</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input {...register("name")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]"
          placeholder="Your full name" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input {...register("email")} type="email"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]"
          placeholder="your@email.edu.ph" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select {...register("role")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] bg-white">
          <option value="">Select your role</option>
          <option value="admin">Administrator</option>
          <option value="faculty">Faculty</option>
          <option value="student">Student</option>
          <option value="other">Other</option>
        </select>
        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <input {...register("department")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]"
          placeholder="e.g. BSMT, BSCS, Administration" />
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
        <textarea {...register("message")} rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] resize-none"
          placeholder="Any specific questions or requirements?" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-60 text-[#0a1628] font-bold py-3 rounded-lg transition-colors">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
            Sending...
          </span>
        ) : <><Send size={16} /> Submit Request</>}
      </button>
    </form>
  );
}
