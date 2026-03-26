export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string; student_id: string; name: string; department: string;
          year_level: string; email: string | null; enrolled_at: string; is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "enrolled_at">;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      attendance_logs: {
        Row: {
          id: string; student_id: string; status: "Present" | "Late" | "Absent";
          confidence: number; logged_at: string; subject: string | null; faculty_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["attendance_logs"]["Row"], "id" | "logged_at">;
        Update: Partial<Database["public"]["Tables"]["attendance_logs"]["Insert"]>;
      };
      demo_requests: {
        Row: {
          id: string; name: string; email: string; role: string;
          department: string; message: string | null; created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["demo_requests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["demo_requests"]["Insert"]>;
      };
      contact_messages: {
        Row: {
          id: string; name: string; email: string; subject: string;
          message: string; created_at: string; is_read: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_messages"]["Row"], "id" | "created_at" | "is_read">;
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
      };
      profiles: {
        Row: { id: string; email: string; full_name: string | null; role: string; created_at: string; };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
  };
}
