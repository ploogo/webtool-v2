export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          subscription_tier: 'free' | 'pro' | 'enterprise';
          subscription_ends_at: string | null;
          usage_this_month: {
            pdfConversions: number;
            imageCompressions: number;
          };
          created_at: string;
          updated_at: string;
          avatar_url: string | null;
          company: string | null;
          api_key: string | null;
          api_requests_count: number;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_ends_at?: string | null;
          usage_this_month?: {
            pdfConversions: number;
            imageCompressions: number;
          };
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
          company?: string | null;
          api_key?: string | null;
          api_requests_count?: number;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          subscription_tier?: 'free' | 'pro' | 'enterprise';
          subscription_ends_at?: string | null;
          usage_this_month?: {
            pdfConversions: number;
            imageCompressions: number;
          };
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
          company?: string | null;
          api_key?: string | null;
          api_requests_count?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          public: boolean | null;
        };
        Insert: {
          id: string;
          name: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          public?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          public?: boolean | null;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string | null;
          name: string | null;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          bucket_id?: string | null;
          name?: string | null;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          bucket_id?: string | null;
          name?: string | null;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Record<string, any> | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}