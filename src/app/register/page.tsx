import { Metadata } from "next";
import PublicRegisterForm from "@/components/PublicRegisterForm";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = { title: "Register Student | NPCMST AttendAI" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 mb-4">
            <UserPlus size={32} className="text-[#c9a84c]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Student Registration</h1>
          <p className="text-gray-400 text-sm mt-1">Register for the NPCMST AttendAI system</p>
        </div>
        <PublicRegisterForm />
      </div>
    </div>
  );
}
