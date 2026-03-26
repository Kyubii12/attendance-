import { createSupabaseServerClient } from "@/lib/supabase-server";
import { FileText, Mail, Building } from "lucide-react";

export default async function DemoRequestsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: requests } = await supabase
    .from("demo_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Demo Requests</h1>
        <p className="text-gray-400 text-sm mt-1">{requests?.length ?? 0} total requests received.</p>
      </div>

      <div className="space-y-4">
        {(requests ?? []).length === 0 && (
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-10 text-center text-gray-600">
            No demo requests yet.
          </div>
        )}
        {(requests ?? []).map((r) => (
          <div key={r.id} className="bg-[#1a2f4e] border border-white/5 rounded-xl p-5 hover:border-[#c9a84c]/20 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{r.name}</div>
                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Mail size={12} />{r.email}</span>
                  <span className="flex items-center gap-1"><Building size={12} />{r.department}</span>
                  <span className="capitalize bg-[#c9a84c]/10 text-[#c9a84c] px-2 py-0.5 rounded-full">{r.role}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(r.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {r.message && (
              <p className="mt-3 text-sm text-gray-400 bg-[#0a1628] rounded-lg px-4 py-3 border border-white/5">
                {r.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
