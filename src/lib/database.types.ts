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
        Relationships: []
      }
      vine_kids_gallery: {
        Row: {
          id: string
          image_url: string
          alt_text_pt: string
          alt_text_en: string
          orientation: 'portrait' | 'landscape'
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_url: string
          alt_text_pt: string
          alt_text_en: string
          orientation: 'portrait' | 'landscape'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          alt_text_pt?: string
          alt_text_en?: string
          orientation?: 'portrait' | 'landscape'
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
