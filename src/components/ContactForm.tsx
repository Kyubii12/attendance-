"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  name:    z.string().min(2, "Name is required"),
  email:   z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("contact_messages").insert({
      name:    data.name,
      email:   data.email,
      subject: data.subject,
      message: data.message,
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Message sent! We'll get back to you within one business day.");
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-4"
    >
      <h3 className="text-xl font-bold text-[#0a1628] mb-2">Send a Message</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input {...register("name")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]"
          placeholder="Your full name" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input {...register("email")} type="email"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]"
          placeholder="your@email.com" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input {...register("subject")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c]"
          placeholder="What is this about?" />
        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea {...register("message")} rows={5}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] resize-none"
          placeholder="Tell us how we can help..." />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-[#e8c96a] disabled:opacity-60 text-[#0a1628] font-bold py-3 rounded-lg transition-colors">
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
            Sending...
          </span>
        ) : <><Send size={16} /> Send Message</>}
      </button>
    </form>
  );
}
