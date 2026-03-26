import Link from "next/link";
import { ScanFace, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-gray-400 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <ScanFace className="text-[#c9a84c]" size={24} />
              <span>NPCMST <span className="text-[#c9a84c]">AttendAI</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Automated facial recognition attendance system for Northern Philippines College for Maritime, Science and Technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["/about", "/features", "/how-it-works", "/demo", "/contact"].map((href) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#c9a84c] transition-colors capitalize">
                    {href.replace("/", "").replace(/-/g, " ") || "Home"}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-[#c9a84c]" />
                Laoag City, Ilocos Norte, Philippines
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#c9a84c]" />
                info@npcmst.edu.ph
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#c9a84c]" />
                +63 (077) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a2f4e] pt-4 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} NPCMST. All rights reserved. | Automated Facial Recognition Attendance System
        </div>
      </div>
    </footer>
  );
}
