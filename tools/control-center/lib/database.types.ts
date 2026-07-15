export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          status: "open" | "later" | "done";
          priority: "very_high" | "high" | "medium" | "low";
          todo: string;
          definition_of_done: string;
          agent_prompt: string;
          preferred_agent: "claude" | "codex" | "open";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          status?: "open" | "later" | "done";
          priority?: "very_high" | "high" | "medium" | "low";
          todo?: string;
          definition_of_done?: string;
          agent_prompt?: string;
          preferred_agent?: "claude" | "codex" | "open";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      ideas: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          idea: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          idea?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ideas"]["Insert"]>;
        Relationships: [];
      };
      milestones: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          short_description: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          short_description?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["milestones"]["Insert"]>;
        Relationships: [];
      };
      vision_items: {
        Row: {
          id: string;
          owner_id: string;
          text: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          text: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vision_items"]["Insert"]>;
        Relationships: [];
      };
      workspace_links: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          url: string;
          group_name: "project" | "external";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          url?: string;
          group_name: "project" | "external";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspace_links"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      convert_idea_to_task: {
        Args: { p_idea_id: string; p_title: string; p_status: string; p_priority: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
