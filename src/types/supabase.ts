export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          action_type: string | null
          created_at: string | null
          details: string | null
          id: number
          resource_id: string | null
          resource_type: string | null
          severity: string | null
          status: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: number
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          created_at?: string | null
          details?: string | null
          id?: number
          resource_id?: string | null
          resource_type?: string | null
          severity?: string | null
          status?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          exam_id: string | null
          id: string
          options: Json
          order_index: number | null
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          exam_id?: string | null
          id?: string
          options: Json
          order_index?: number | null
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          exam_id?: string | null
          id?: string
          options?: Json
          order_index?: number | null
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          answers: Json | null
          completed_at: string | null
          exam_id: string | null
          id: string
          score: number | null
          student_id: string | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          exam_id?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          exam_id?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          section_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          section_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          section_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      section_contents: {
        Row: {
          created_at: string | null
          external_link: string
          id: string
          order_index: number | null
          section_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          external_link: string
          id?: string
          order_index?: number | null
          section_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          external_link?: string
          id?: string
          order_index?: number | null
          section_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          status: string
          thumbnail: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          status?: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          status?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_section_access: {
        Row: {
          granted_at: string | null
          id: string
          section_id: string | null
          student_id: string | null
        }
        Insert: {
          granted_at?: string | null
          id?: string
          section_id?: string | null
          student_id?: string | null
        }
        Update: {
          granted_at?: string | null
          id?: string
          section_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_section_access_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_section_access_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          account_expires_at: string | null
          auth_user_id: string | null
          bio: string | null
          certificates_earned: number | null
          city: string | null
          completed_courses: number | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          education_level: string | null
          email: string
          enrollment_date: string | null
          full_name: string
          id: string
          last_activity: string | null
          parent_phone: string | null
          phone: string | null
          profile_image_url: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          study_hours: number | null
          total_courses: number | null
          updated_at: string | null
        }
        Insert: {
          account_expires_at?: string | null
          auth_user_id?: string | null
          bio?: string | null
          certificates_earned?: number | null
          city?: string | null
          completed_courses?: number | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          education_level?: string | null
          email: string
          enrollment_date?: string | null
          full_name: string
          id?: string
          last_activity?: string | null
          parent_phone?: string | null
          phone?: string | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          study_hours?: number | null
          total_courses?: number | null
          updated_at?: string | null
        }
        Update: {
          account_expires_at?: string | null
          auth_user_id?: string | null
          bio?: string | null
          certificates_earned?: number | null
          city?: string | null
          completed_courses?: number | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          education_level?: string | null
          email?: string
          enrollment_date?: string | null
          full_name?: string
          id?: string
          last_activity?: string | null
          parent_phone?: string | null
          phone?: string | null
          profile_image_url?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          study_hours?: number | null
          total_courses?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          completed_courses: string[] | null
          created_at: string | null
          device_fingerprint: string | null
          email: string | null
          enrollment_date: string | null
          expires_at: string | null
          full_name: string | null
          id: string
          last_activity: string | null
          login_code: string | null
          name: string
          parent_phone: string | null
          phone: string | null
          role: string
          status: string | null
          study_hours: number | null
          total_courses: number | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          completed_courses?: string[] | null
          created_at?: string | null
          device_fingerprint?: string | null
          email?: string | null
          enrollment_date?: string | null
          expires_at?: string | null
          full_name?: string | null
          id?: string
          last_activity?: string | null
          login_code?: string | null
          name: string
          parent_phone?: string | null
          phone?: string | null
          role: string
          status?: string | null
          study_hours?: number | null
          total_courses?: number | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          completed_courses?: string[] | null
          created_at?: string | null
          device_fingerprint?: string | null
          email?: string | null
          enrollment_date?: string | null
          expires_at?: string | null
          full_name?: string | null
          id?: string
          last_activity?: string | null
          login_code?: string | null
          name?: string
          parent_phone?: string | null
          phone?: string | null
          role?: string
          status?: string | null
          study_hours?: number | null
          total_courses?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          section_id: string | null
          status: string
          thumbnail: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          section_id?: string | null
          status?: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          section_id?: string | null
          status?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      student_stats: {
        Row: {
          active_students: number | null
          expired_accounts: number | null
          inactive_students: number | null
          new_this_month: number | null
          pending_students: number | null
          suspended_students: number | null
          total_students: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_suspend_expired_accounts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_expired_students: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_expires_at: string
          email: string
          full_name: string
          id: string
        }[]
      }
    }
    Enums: {
      user_status: "active" | "suspended" | "pending" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_status: ["active", "suspended", "pending", "inactive"],
    },
  },
} as const
