// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      sermons: {
        Row: {
          id: string
          title_pt: string
          title_en: string
          preacher: string
          date: string
          excerpt_pt: string
          excerpt_en: string
          content_pt: string
          content_en: string
          scripture: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_pt: string
          title_en: string
          preacher: string
          date: string
          excerpt_pt: string
          excerpt_en: string
          content_pt: string
          content_en: string
          scripture?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_pt?: string
          title_en?: string
          preacher?: string
          date?: string
          excerpt_pt?: string
          excerpt_en?: string
          content_pt?: string
          content_en?: string
          scripture?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
