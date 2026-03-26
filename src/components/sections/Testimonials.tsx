import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Prof. Maria Santos",
    role: "Faculty, BSMT Department",
    quote:
      "I used to spend the first 10 minutes of every class taking attendance. Now it's done before I even start my lecture. This system is a game changer.",
  },
  {
    name: "Dr. Ramon Cruz",
    role: "Academic Affairs Director",
    quote:
      "The accuracy and reliability of the system exceeded our expectations. Attendance data is now consistent, auditable, and instantly accessible.",
  },
  {
    name: "Ana Reyes",
    role: "Student, BSCS-2A",
    quote:
      "It's so fast. I just walk in and I'm marked present. No more worrying about the teacher missing my name during roll call.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">What the Campus Is Saying</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[#1a2f4e] border border-[#c9a84c]/10 rounded-xl p-6">
              <Quote size={24} className="text-[#c9a84c] mb-4" />
              <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-gray-500 text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
