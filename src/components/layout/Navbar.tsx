"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ScanFace, UserPlus, ShieldCheck } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0a1628] shadow-lg" : "bg-[#0a1628]/95 backdrop-blur-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <ScanFace className="text-[#c9a84c]" size={28} />
            <span className="hidden sm:block">
              NPCMST <span className="text-[#c9a84c]">AttendAI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(l.href)
                    ? "text-[#c9a84c] bg-[#c9a84c]/10"
                    : "text-gray-300 hover:text-[#c9a84c] hover:bg-white/5"
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/register"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors">
              <UserPlus size={15} /> Register
            </Link>
            <Link href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] transition-colors">
              <ShieldCheck size={15} /> Admin
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#0a1628] border-t border-[#1a2f4e] px-4 pb-4 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(l.href)
                  ? "text-[#c9a84c] bg-[#c9a84c]/10"
                  : "text-gray-300 hover:text-[#c9a84c]"
              }`}>
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/register" onClick={() => setOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-sm px-3 py-2 rounded-lg text-center">
              <UserPlus size={14} /> Register
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#c9a84c] text-[#0a1628] font-semibold text-sm px-3 py-2 rounded-lg text-center">
              <ShieldCheck size={14} /> Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
