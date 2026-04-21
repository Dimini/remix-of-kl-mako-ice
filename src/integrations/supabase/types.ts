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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          city: string | null
          created_at: string
          id: string
          incumbent: boolean | null
          is_approved: boolean
          is_independent: boolean
          name: string
          party: string
          photo_url: string | null
          position: Database["public"]["Enums"]["position_type"]
          questionnaire_responded: boolean
          questionnaire_uuid: string | null
          region: Database["public"]["Enums"]["kraj_id"]
          state: Database["public"]["Enums"]["candidate_state"]
          updated_at: string
          year: number
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          incumbent?: boolean | null
          is_approved?: boolean
          is_independent?: boolean
          name: string
          party: string
          photo_url?: string | null
          position: Database["public"]["Enums"]["position_type"]
          questionnaire_responded?: boolean
          questionnaire_uuid?: string | null
          region: Database["public"]["Enums"]["kraj_id"]
          state?: Database["public"]["Enums"]["candidate_state"]
          updated_at?: string
          year?: number
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          incumbent?: boolean | null
          is_approved?: boolean
          is_independent?: boolean
          name?: string
          party?: string
          photo_url?: string | null
          position?: Database["public"]["Enums"]["position_type"]
          questionnaire_responded?: boolean
          questionnaire_uuid?: string | null
          region?: Database["public"]["Enums"]["kraj_id"]
          state?: Database["public"]["Enums"]["candidate_state"]
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      documented_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["evidence_type"]
          candidate_id: string
          citation_text: string
          climate_relevance_tier: number
          created_at: string
          date: string
          description: string
          entered_by: string | null
          id: string
          is_ai_generated: boolean
          points: number | null
          requires_second_reviewer: boolean
          reviewer_note: string | null
          source_url: string
          updated_at: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["evidence_type"]
          candidate_id: string
          citation_text: string
          climate_relevance_tier: number
          created_at?: string
          date: string
          description: string
          entered_by?: string | null
          id?: string
          is_ai_generated?: boolean
          points?: number | null
          requires_second_reviewer?: boolean
          reviewer_note?: string | null
          source_url: string
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["evidence_type"]
          candidate_id?: string
          citation_text?: string
          climate_relevance_tier?: number
          created_at?: string
          date?: string
          description?: string
          entered_by?: string | null
          id?: string
          is_ai_generated?: boolean
          points?: number | null
          requires_second_reviewer?: boolean
          reviewer_note?: string | null
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documented_actions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      jurisdictions: {
        Row: {
          base_url: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          kraj_id: Database["public"]["Enums"]["kraj_id"] | null
          name: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          kraj_id?: Database["public"]["Enums"]["kraj_id"] | null
          name: string
          notes?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          kraj_id?: Database["public"]["Enums"]["kraj_id"] | null
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          agent_version: string | null
          candidate_id: string
          citations_json: Json | null
          confidence: number | null
          created_at: string
          id: string
          normalized_score: number | null
          processed_at: string | null
          raw_score: number | null
          raw_text: string | null
          source_url: string
          updated_at: string
        }
        Insert: {
          agent_version?: string | null
          candidate_id: string
          citations_json?: Json | null
          confidence?: number | null
          created_at?: string
          id?: string
          normalized_score?: number | null
          processed_at?: string | null
          raw_score?: number | null
          raw_text?: string | null
          source_url: string
          updated_at?: string
        }
        Update: {
          agent_version?: string | null
          candidate_id?: string
          citations_json?: Json | null
          confidence?: number | null
          created_at?: string
          id?: string
          normalized_score?: number | null
          processed_at?: string | null
          raw_score?: number | null
          raw_text?: string | null
          source_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_responses: {
        Row: {
          agent_version: string | null
          analysis_json: Json | null
          candidate_id: string
          candidate_name: string | null
          created_at: string
          email: string | null
          id: string
          link_uuid: string
          processed_at: string | null
          questionnaire_score: number | null
          responded_at: string | null
          response_json: Json
          sent_at: string | null
          status: Database["public"]["Enums"]["questionnaire_status"]
          updated_at: string
        }
        Insert: {
          agent_version?: string | null
          analysis_json?: Json | null
          candidate_id: string
          candidate_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          link_uuid?: string
          processed_at?: string | null
          questionnaire_score?: number | null
          responded_at?: string | null
          response_json?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["questionnaire_status"]
          updated_at?: string
        }
        Update: {
          agent_version?: string | null
          analysis_json?: Json | null
          candidate_id?: string
          candidate_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          link_uuid?: string
          processed_at?: string | null
          questionnaire_score?: number | null
          responded_at?: string | null
          response_json?: Json
          sent_at?: string | null
          status?: Database["public"]["Enums"]["questionnaire_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_responses_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      review_audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          adjustments: Json | null
          at: string
          candidate_id: string
          from_state: string | null
          id: string
          note: string | null
          reviewer: string
          reviewer_user_id: string | null
          to_state: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          adjustments?: Json | null
          at?: string
          candidate_id: string
          from_state?: string | null
          id?: string
          note?: string | null
          reviewer: string
          reviewer_user_id?: string | null
          to_state?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          adjustments?: Json | null
          at?: string
          candidate_id?: string
          from_state?: string | null
          id?: string
          note?: string | null
          reviewer?: string
          reviewer_user_id?: string | null
          to_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_audit_log_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          badge: Database["public"]["Enums"]["badge_color"]
          badge_subtype: Database["public"]["Enums"]["grey_subtype"] | null
          candidate_id: string
          created_at: string
          formula_version: string
          id: string
          is_approved: boolean
          pillar1_score: number | null
          pillar2_score: number | null
          total_score: number | null
          updated_at: string
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          badge?: Database["public"]["Enums"]["badge_color"]
          badge_subtype?: Database["public"]["Enums"]["grey_subtype"] | null
          candidate_id: string
          created_at?: string
          formula_version?: string
          id?: string
          is_approved?: boolean
          pillar1_score?: number | null
          pillar2_score?: number | null
          total_score?: number | null
          updated_at?: string
          version_number?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          badge?: Database["public"]["Enums"]["badge_color"]
          badge_subtype?: Database["public"]["Enums"]["grey_subtype"] | null
          candidate_id?: string
          created_at?: string
          formula_version?: string
          id?: string
          is_approved?: boolean
          pillar1_score?: number | null
          pillar2_score?: number | null
          total_score?: number | null
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "scores_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      source_citations: {
        Row: {
          candidate_id: string
          citation_text: string
          climate_relevance_tier: number
          confidence: number | null
          created_at: string
          date_accessed: string
          id: string
          pillar: Database["public"]["Enums"]["pillar"]
          reviewer_note: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          url: string
        }
        Insert: {
          candidate_id: string
          citation_text: string
          climate_relevance_tier: number
          confidence?: number | null
          created_at?: string
          date_accessed?: string
          id?: string
          pillar: Database["public"]["Enums"]["pillar"]
          reviewer_note?: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url: string
        }
        Update: {
          candidate_id?: string
          citation_text?: string
          climate_relevance_tier?: number
          confidence?: number | null
          created_at?: string
          date_accessed?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"]
          reviewer_note?: string | null
          source_type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_citations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          candidate_id: string
          climate_relevance_tier: number
          confidence: number | null
          created_at: string
          date: string
          entered_by: string | null
          id: string
          is_ai_generated: boolean
          jurisdiction_id: string | null
          meeting_id: string | null
          points: number | null
          requires_second_reviewer: boolean
          reviewer_note: string | null
          source_url: string
          topic: string
          updated_at: string
          vote_direction: Database["public"]["Enums"]["vote_direction"]
        }
        Insert: {
          candidate_id: string
          climate_relevance_tier: number
          confidence?: number | null
          created_at?: string
          date: string
          entered_by?: string | null
          id?: string
          is_ai_generated?: boolean
          jurisdiction_id?: string | null
          meeting_id?: string | null
          points?: number | null
          requires_second_reviewer?: boolean
          reviewer_note?: string | null
          source_url: string
          topic: string
          updated_at?: string
          vote_direction: Database["public"]["Enums"]["vote_direction"]
        }
        Update: {
          candidate_id?: string
          climate_relevance_tier?: number
          confidence?: number | null
          created_at?: string
          date?: string
          entered_by?: string | null
          id?: string
          is_ai_generated?: boolean
          jurisdiction_id?: string | null
          meeting_id?: string | null
          points?: number | null
          requires_second_reviewer?: boolean
          reviewer_note?: string | null
          source_url?: string
          topic?: string
          updated_at?: string
          vote_direction?: Database["public"]["Enums"]["vote_direction"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_jurisdiction_id_fkey"
            columns: ["jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_grant_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          roles: Database["public"]["Enums"]["app_role"][]
          user_id: string
        }[]
      }
      admin_revoke_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      candidate_id_for_questionnaire_uuid: {
        Args: { p_uuid: string }
        Returns: string
      }
      get_candidate_for_questionnaire: {
        Args: { p_uuid: string }
        Returns: {
          city: string | null
          created_at: string
          id: string
          incumbent: boolean | null
          is_approved: boolean
          is_independent: boolean
          name: string
          party: string
          photo_url: string | null
          position: Database["public"]["Enums"]["position_type"]
          questionnaire_responded: boolean
          questionnaire_uuid: string | null
          region: Database["public"]["Enums"]["kraj_id"]
          state: Database["public"]["Enums"]["candidate_state"]
          updated_at: string
          year: number
        }[]
        SetofOptions: {
          from: "*"
          to: "candidates"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      questionnaire_already_submitted: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "user"
      audit_action:
        | "STATE_CHANGE"
        | "APPROVED"
        | "NEEDS_REVISION"
        | "SCORE_SAVED"
        | "ADJUSTMENT"
        | "QUESTIONNAIRE_SUBMITTED"
      badge_color: "green" | "yellow" | "orange" | "red" | "grey"
      candidate_state:
        | "REGISTERED"
        | "DATA_COLLECTION"
        | "ANALYZED"
        | "IN_REVIEW"
        | "NEEDS_REVISION"
        | "APPROVED"
        | "PUBLISHED"
      evidence_type:
        | "project_implementation"
        | "public_statement"
        | "attended_protest"
        | "membership"
        | "op_ed"
        | "interview"
        | "other"
      grey_subtype:
        | "GREY_NO_DATA"
        | "GREY_REFUSED"
        | "GREY_NEW_CANDIDATE"
        | "GREY_LOW_CONFIDENCE"
      kraj_id: "BA" | "TT" | "TN" | "NR" | "ZA" | "BB" | "PO" | "KE"
      pillar: "slova" | "skutky"
      position_type: "zupan" | "primator"
      questionnaire_status: "draft" | "submitted"
      source_type:
        | "council_vote"
        | "resolution"
        | "initiative"
        | "program"
        | "questionnaire"
        | "social_post"
        | "manual_entry"
      vote_direction: "for" | "against" | "abstain" | "absent"
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
      app_role: ["admin", "reviewer", "user"],
      audit_action: [
        "STATE_CHANGE",
        "APPROVED",
        "NEEDS_REVISION",
        "SCORE_SAVED",
        "ADJUSTMENT",
        "QUESTIONNAIRE_SUBMITTED",
      ],
      badge_color: ["green", "yellow", "orange", "red", "grey"],
      candidate_state: [
        "REGISTERED",
        "DATA_COLLECTION",
        "ANALYZED",
        "IN_REVIEW",
        "NEEDS_REVISION",
        "APPROVED",
        "PUBLISHED",
      ],
      evidence_type: [
        "project_implementation",
        "public_statement",
        "attended_protest",
        "membership",
        "op_ed",
        "interview",
        "other",
      ],
      grey_subtype: [
        "GREY_NO_DATA",
        "GREY_REFUSED",
        "GREY_NEW_CANDIDATE",
        "GREY_LOW_CONFIDENCE",
      ],
      kraj_id: ["BA", "TT", "TN", "NR", "ZA", "BB", "PO", "KE"],
      pillar: ["slova", "skutky"],
      position_type: ["zupan", "primator"],
      questionnaire_status: ["draft", "submitted"],
      source_type: [
        "council_vote",
        "resolution",
        "initiative",
        "program",
        "questionnaire",
        "social_post",
        "manual_entry",
      ],
      vote_direction: ["for", "against", "abstain", "absent"],
    },
  },
} as const
