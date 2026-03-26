import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628] mb-4">
          Ready to Modernize Attendance at NPCMST?
        </h2>
        <p className="text-[#0a1628]/70 text-lg mb-8 max-w-xl mx-auto">
          Join the departments already using AttendAI. Request a demo today and see it live in your classroom.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demo"
            className="flex items-center justify-center gap-2 bg-[#0a1628] hover:bg-[#1a2f4e] text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Request a Demo <ArrowRight size={18} />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 border-2 border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
