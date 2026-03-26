"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  ScanFace, LayoutDashboard, Users, ClipboardList,
  MessageSquare, FileText, LogOut, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const nav = [
  { href: "/admin",           label: "Overview",        icon: <LayoutDashboard size={18} /> },
  { href: "/admin/students",  label: "Students",        icon: <Users size={18} /> },
  { href: "/admin/attendance",label: "Attendance",      icon: <ClipboardList size={18} /> },
  { href: "/admin/requests",  label: "Demo Requests",   icon: <FileText size={18} /> },
  { href: "/admin/messages",  label: "Messages",        icon: <MessageSquare size={18} /> },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-60 bg-[#0a1628] border-r border-white/5 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <ScanFace size={24} className="text-[#c9a84c]" />
          <span className="text-white font-bold text-sm">NPCMST <span className="text-[#c9a84c]">Admin</span></span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
              isActive(item.href)
                ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}>
            {item.icon}
            {item.label}
            {isActive(item.href) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-3 py-2 mb-2">
          <div className="text-xs text-gray-500 truncate">{userEmail}</div>
          <div className="text-xs text-[#c9a84c] font-medium">Administrator</div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
