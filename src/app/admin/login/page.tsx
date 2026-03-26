import { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { ScanFace } from "lucide-react";

export const metadata: Metadata = { title: "Admin Login | NPCMST AttendAI" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 mb-4">
            <ScanFace size={32} className="text-[#c9a84c]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">NPCMST AttendAI — Restricted Access</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
