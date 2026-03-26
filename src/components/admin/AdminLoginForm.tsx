"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="bg-[#1a2f4e] border border-white/10 rounded-2xl p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors"
          placeholder="admin@npcmst.edu.ph"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"} required value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c9a84c] transition-colors pr-10"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-60 text-[#0a1628] font-bold py-3 rounded-lg transition-colors">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
            Signing in...
          </span>
        ) : <><LogIn size={16} /> Sign In</>}
      </button>

      <p className="text-center text-xs text-gray-600">
        Admin accounts are created by the system administrator.
      </p>
    </form>
  );
}
