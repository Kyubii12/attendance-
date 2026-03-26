"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Message = {
  id: string; name: string; email: string; subject: string;
  message: string; created_at: string; is_read: boolean;
};

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selected, setSelected] = useState<Message | null>(null);

  const markRead = async (m: Message) => {
    if (m.is_read) return;
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", m.id);
    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, is_read: true } : x));
  };

  const deleteMsg = async (m: Message) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", m.id);
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    if (selected?.id === m.id) setSelected(null);
    toast.success("Message deleted.");
  };

  const open = (m: Message) => {
    setSelected(m);
    markRead(m);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* List */}
      <div className="lg:col-span-2 space-y-2">
        {messages.length === 0 && (
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-8 text-center text-gray-600 text-sm">
            No messages yet.
          </div>
        )}
        {messages.map((m) => (
          <button key={m.id} onClick={() => open(m)}
            className={`w-full text-left bg-[#1a2f4e] border rounded-xl p-4 transition-colors ${
              selected?.id === m.id ? "border-[#c9a84c]/50" : "border-white/5 hover:border-white/10"
            }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {m.is_read
                  ? <MailOpen size={14} className="text-gray-500 flex-shrink-0" />
                  : <Mail size={14} className="text-[#c9a84c] flex-shrink-0" />}
                <span className={`text-sm truncate ${m.is_read ? "text-gray-400" : "text-white font-semibold"}`}>
                  {m.name}
                </span>
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0">
                {new Date(m.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate pl-5">{m.subject}</div>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {!selected ? (
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl h-64 flex items-center justify-center text-gray-600 text-sm">
            Select a message to read
          </div>
        ) : (
          <div className="bg-[#1a2f4e] border border-white/5 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">{selected.subject}</h3>
                <div className="text-xs text-gray-400 mt-1">
                  From: <span className="text-gray-300">{selected.name}</span> &lt;{selected.email}&gt;
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {new Date(selected.created_at).toLocaleString("en-PH")}
                </div>
              </div>
              <button onClick={() => deleteMsg(selected)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="bg-[#0a1628] rounded-lg p-4 text-gray-300 text-sm leading-relaxed border border-white/5">
              {selected.message}
            </div>
            <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
              className="mt-4 inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] text-[#0a1628] font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
              <Mail size={14} /> Reply via Email
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
