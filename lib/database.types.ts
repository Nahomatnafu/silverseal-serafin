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
      clients: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      sites: {
        Row: {
          id: string
          name: string
          address: string
          latitude: number
          longitude: number
          client_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude: number
          longitude: number
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          role: string
          profile_photo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          status: string
          notes: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          tour: string | null
          current_position: string | null
          fireguard: boolean
          training_start_date: string | null
          official_start_date: string | null
          date_inactive: string | null
          date_reactivated: string | null
          notice_file_url: string | null
          rdo_monday: boolean
          rdo_tuesday: boolean
          rdo_wednesday: boolean
          rdo_thursday: boolean
          rdo_friday: boolean
          rdo_saturday: boolean
          rdo_sunday: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          role: string
          profile_photo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          status?: string
          notes?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          tour?: string | null
          current_position?: string | null
          fireguard?: boolean
          training_start_date?: string | null
          official_start_date?: string | null
          date_inactive?: string | null
          date_reactivated?: string | null
          notice_file_url?: string | null
          rdo_monday?: boolean
          rdo_tuesday?: boolean
          rdo_wednesday?: boolean
          rdo_thursday?: boolean
          rdo_friday?: boolean
          rdo_saturday?: boolean
          rdo_sunday?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          role?: string
          profile_photo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          status?: string
          notes?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          tour?: string | null
          current_position?: string | null
          fireguard?: boolean
          training_start_date?: string | null
          official_start_date?: string | null
          date_inactive?: string | null
          date_reactivated?: string | null
          notice_file_url?: string | null
          rdo_monday?: boolean
          rdo_tuesday?: boolean
          rdo_wednesday?: boolean
          rdo_thursday?: boolean
          rdo_friday?: boolean
          rdo_saturday?: boolean
          rdo_sunday?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          employee_id: string | null
          site_id: string | null
          shift_label: string
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          site_id?: string | null
          shift_label: string
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          site_id?: string | null
          shift_label?: string
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          employee_id: string | null
          cert_type: string
          issued_date: string
          expiry_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          cert_type: string
          issued_date: string
          expiry_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          cert_type?: string
          issued_date?: string
          expiry_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          file_url: string
          document_type: string
          employee_id: string | null
          site_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          file_url: string
          document_type: string
          employee_id?: string | null
          site_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_url?: string
          document_type?: string
          employee_id?: string | null
          site_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

