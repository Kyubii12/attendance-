import { createSupabaseServerClient } from "@/lib/supabase-server";
import MessagesClient from "@/components/admin/MessagesClient";

type Message = {
  id: string; name: string; email: string; subject: string;
  message: string; created_at: string; is_read: boolean;
};

export default async function MessagesPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as Message[];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
        <p className="text-gray-400 text-sm mt-1">
          {messages.filter((m) => !m.is_read).length} unread messages.
        </p>
      </div>
      <MessagesClient initialMessages={messages} />
    </div>
  );
}
