export type LeadStatus = 'pending' | 'contacted' | 'interested' | 'not_interested' | 'converted'

export interface Database {
  public: {
    Tables: {
      lead_status: {
        Row: {
          id: string
          lead_id: number
          status: LeadStatus
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: number
          status?: LeadStatus
          updated_at?: string
        }
        Update: {
          status?: LeadStatus
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          lead_id: number
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: number
          content: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      generated_prompts: {
        Row: {
          id: string
          lead_id: number
          type: 'whatsapp' | 'web'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: number
          type: 'whatsapp' | 'web'
          content: string
          created_at?: string
        }
        Update: never
      }
    }
  }
}
