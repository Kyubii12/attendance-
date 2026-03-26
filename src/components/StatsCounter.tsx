"use client";
import { useEffect, useRef, useState } from "react";

type Stat = { value: number; suffix: string; label: string; prefix?: string };

const stats: Stat[] = [
  { value: 2000, suffix: "+", label: "Students Enrolled" },
  { value: 99.7, suffix: "%", label: "Recognition Accuracy" },
  { value: 120, suffix: "+", label: "Faculty Members" },
  { value: 8, suffix: "", label: "Departments" },
];

function useCountUp(target: number, duration = 1800, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, 1800, active);
  const display = Number.isInteger(stat.value) ? Math.round(count) : count.toFixed(1);
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white mb-1">
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div className="text-gray-400 text-sm">{stat.label}</div>
    </div>
  );
}

export default function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-[#0a1628]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => <StatItem key={s.label} stat={s} active={active} />)}
        </div>
      </div>
    </section>
  );
}
