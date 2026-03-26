"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How accurate is the facial recognition?",
    a: "The system achieves 99.7% recognition accuracy under normal lighting conditions. It uses deep learning models trained on diverse datasets and includes anti-spoofing liveness detection.",
  },
  {
    q: "What happens if a student is not recognized?",
    a: "If a face is not recognized after 3 attempts, the system flags the entry for manual review by the faculty. The student can also be manually marked by the instructor.",
  },
  {
    q: "Is student biometric data stored securely?",
    a: "Yes. All facial data is AES-256 encrypted at rest and in transit. The system is fully compliant with the Philippine Data Privacy Act of 2012. Raw images are never stored — only encrypted facial embeddings.",
  },
  {
    q: "Does it work without internet?",
    a: "Yes. The system has an offline mode that continues logging attendance locally. All data syncs automatically to the server once the connection is restored.",
  },
  {
    q: "How long does student enrollment take?",
    a: "The one-time enrollment process takes approximately 30 seconds per student. The system captures multiple facial angles to ensure accuracy across different lighting and angles.",
  },
  {
    q: "Can faculty access attendance records on mobile?",
    a: "Yes. The dashboard is fully responsive and works on any device — desktop, tablet, or smartphone. Faculty can view live attendance, export reports, and manage records from anywhere.",
  },
  {
    q: "How do I request a demo or deployment for my department?",
    a: "Fill out the demo request form on the Demo page or contact us directly via the Contact page. Our team will reach out within 1–2 business days to schedule a walkthrough.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="text-3xl font-bold text-[#0a1628] mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#0a1628] text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#c9a84c] flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
