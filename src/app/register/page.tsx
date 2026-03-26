import { Metadata } from "next";
import PublicRegisterForm from "@/components/PublicRegisterForm";
import { UserPlus, ScanFace } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Register Student | NPCMST AttendAI" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a1628] pt-24 pb-16 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#c9a84c] text-sm font-semibold mb-6">
            <ScanFace size={18} /> NPCMST AttendAI
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 mb-4">
            <UserPlus size={32} className="text-[#c9a84c]" />
          </div>
          <h1 className="text-3xl font-bold text-white">Student Registration</h1>
          <p className="text-gray-400 text-sm mt-2">
            Fill in your details to register for the NPCMST AttendAI attendance system.
          </p>
        </div>

        {/* Form */}
        <PublicRegisterForm />

        {/* Footer note */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Already registered?{" "}
          <Link href="/dashboard" className="text-[#c9a84c] hover:underline">
            View attendance dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
