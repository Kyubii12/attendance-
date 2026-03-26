import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | NPCMST AttendAI",
  description: "Get in touch with the NPCMST AttendAI team.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#0a1628] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">Contact</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">Get in Touch</h1>
          <p className="text-gray-300 text-lg">
            Have questions? We&apos;re here to help. Reach out and we&apos;ll respond within one business day.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-[#0a1628] mb-6">Contact Information</h2>
              <ul className="space-y-5 mb-8">
                {[
                  { icon: <MapPin size={20} />, label: "Address", value: "Laoag City, Ilocos Norte, Philippines" },
                  { icon: <Mail size={20} />, label: "Email", value: "info@npcmst.edu.ph" },
                  { icon: <Phone size={20} />, label: "Phone", value: "+63 (077) 123-4567" },
                  { icon: <Clock size={20} />, label: "Support Hours", value: "Mon–Fri, 8:00 AM – 5:00 PM" },
                ].map((c) => (
                  <li key={c.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0a1628] text-[#c9a84c] flex items-center justify-center flex-shrink-0">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">{c.label}</div>
                      <div className="text-[#0a1628] font-medium text-sm mt-0.5">{c.value}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Google Maps embed — Laoag City, Ilocos Norte */}
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30726.37!2d120.5936!3d18.1977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3339b5c3e3e3e3e3%3A0x0!2sLaoag+City%2C+Ilocos+Norte!5e0!3m2!1sen!2sph!4v1700000000000"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="NPCMST Location — Laoag City, Ilocos Norte"
                />
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
