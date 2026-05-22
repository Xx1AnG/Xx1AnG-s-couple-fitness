export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          partner_code: string;
          partner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          partner_code?: string;
          partner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          partner_code?: string;
          partner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_date: string;
          workout_type: string;
          duration_minutes: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_date: string;
          workout_type: string;
          duration_minutes: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_date?: string;
          workout_type?: string;
          duration_minutes?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      connect_partner: {
        Args: {
          code_input: string;
        };
        Returns: {
          partner_id: string;
          partner_display_name: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type WorkoutLog = Database["public"]["Tables"]["workout_logs"]["Row"];
