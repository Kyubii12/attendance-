import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || key === "your-anon-key-here") {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
        <div className="bg-[#1a2f4e] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2 className="text-white font-bold text-lg mb-2">Supabase Not Configured</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Add your Supabase credentials to{" "}
            <code className="text-[#c9a84c] bg-[#0a1628] px-1.5 py-0.5 rounded">.env.local</code>
          </p>
          <div className="bg-[#0a1628] rounded-lg p-4 text-left text-xs font-mono text-gray-300 border border-white/10">
            <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
            <div className="mt-1">NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</div>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            Get these from your{" "}
            <a href="https://supabase.com/dashboard/project/ovdxvzlhffdfeghjcsem/settings/api"
              target="_blank" rel="noreferrer" className="text-[#c9a84c] underline">
              Supabase project settings → API
            </a>
          </p>
        </div>
      </div>
    );
  }

  let user = null;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // auth failure → redirect to login
  }

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#070f1e] flex">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
