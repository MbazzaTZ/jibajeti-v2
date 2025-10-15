import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types based on your schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone_number: string | null;
          monthly_income: number | null;
          target_savings: number | null;
          currency: string | null;
          language: string | null;
          budget_categories: string[] | null;
          notification_preferences: Json | null;
          address: Json | null;
          profile_picture_url: string | null;
          two_factor_enabled: boolean | null;
          account_created: string;
          last_updated: string;
          profile_visibility: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone_number?: string | null;
          monthly_income?: number | null;
          target_savings?: number | null;
          currency?: string | null;
          language?: string | null;
          budget_categories?: string[] | null;
          notification_preferences?: Json | null;
          address?: Json | null;
          profile_picture_url?: string | null;
          two_factor_enabled?: boolean | null;
          account_created?: string;
          last_updated?: string;
          profile_visibility?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone_number?: string | null;
          monthly_income?: number | null;
          target_savings?: number | null;
          currency?: string | null;
          language?: string | null;
          budget_categories?: string[] | null;
          notification_preferences?: Json | null;
          address?: Json | null;
          profile_picture_url?: string | null;
          two_factor_enabled?: boolean | null;
          account_created?: string;
          last_updated?: string;
          profile_visibility?: string | null;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          description: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          description: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'income' | 'expense';
          amount?: number;
          category?: string;
          description?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      planned_expenses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          amount: number;
          due_date: string;
          frequency: 'one-time' | 'daily' | 'weekly' | 'monthly';
          priority: 'high' | 'medium' | 'low';
          notes: string | null;
          paid: boolean;
          status: 'pending' | 'paid' | 'overdue';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category: string;
          amount: number;
          due_date: string;
          frequency: 'one-time' | 'daily' | 'weekly' | 'monthly';
          priority: 'high' | 'medium' | 'low';
          notes?: string | null;
          paid?: boolean;
          status?: 'pending' | 'paid' | 'overdue';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: string;
          amount?: number;
          due_date?: string;
          frequency?: 'one-time' | 'daily' | 'weekly' | 'monthly';
          priority?: 'high' | 'medium' | 'low';
          notes?: string | null;
          paid?: boolean;
          status?: 'pending' | 'paid' | 'overdue';
          created_at?: string;
          updated_at?: string;
        };
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          type: 'stocks' | 'bonds' | 'real-estate' | 'business' | 'crypto' | 'mutual-funds' | 'other';
          initial_amount: number;
          current_value: number;
          purchase_date: string;
          return_rate: number;
          profit_loss: number;
          status: 'active' | 'sold' | 'closed';
          notes: string | null;
          created_at: string;
          updated_at: string;
          is_business: boolean;
          operation_costs: number;
          profit_margin: number;
          monthly_revenue: number;
          business_type: string | null;
          risk_level: 'low' | 'medium' | 'high';
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          type: 'stocks' | 'bonds' | 'real-estate' | 'business' | 'crypto' | 'mutual-funds' | 'other';
          initial_amount: number;
          current_value: number;
          purchase_date: string;
          return_rate?: number;
          profit_loss?: number;
          status?: 'active' | 'sold' | 'closed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          is_business?: boolean;
          operation_costs?: number;
          profit_margin?: number;
          monthly_revenue?: number;
          business_type?: string | null;
          risk_level?: 'low' | 'medium' | 'high';
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          type?: 'stocks' | 'bonds' | 'real-estate' | 'business' | 'crypto' | 'mutual-funds' | 'other';
          initial_amount?: number;
          current_value?: number;
          purchase_date?: string;
          return_rate?: number;
          profit_loss?: number;
          status?: 'active' | 'sold' | 'closed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          is_business?: boolean;
          operation_costs?: number;
          profit_margin?: number;
          monthly_revenue?: number;
          business_type?: string | null;
          risk_level?: 'low' | 'medium' | 'high';
        };
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          amount: number;
          interest_rate: number;
          term: number;
          start_date: string;
          lender: string;
          status: 'active' | 'paid' | 'defaulted' | 'overdue';
          notes: string | null;
          remaining_balance: number;
          created_at: string;
          updated_at: string;
          installment_frequency: 'daily' | 'weekly' | 'monthly';
          installment_amount: number;
          purpose: string | null;
          penalty_rate: number;
          grace_period: number;
          total_amount: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          amount: number;
          interest_rate: number;
          term: number;
          start_date: string;
          lender: string;
          status?: 'active' | 'paid' | 'defaulted' | 'overdue';
          notes?: string | null;
          remaining_balance?: number;
          created_at?: string;
          updated_at?: string;
          installment_frequency?: 'daily' | 'weekly' | 'monthly';
          installment_amount: number;
          purpose?: string | null;
          penalty_rate?: number;
          grace_period?: number;
          total_amount?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          amount?: number;
          interest_rate?: number;
          term?: number;
          start_date?: string;
          lender?: string;
          status?: 'active' | 'paid' | 'defaulted' | 'overdue';
          notes?: string | null;
          remaining_balance?: number;
          created_at?: string;
          updated_at?: string;
          installment_frequency?: 'daily' | 'weekly' | 'monthly';
          installment_amount?: number;
          purpose?: string | null;
          penalty_rate?: number;
          grace_period?: number;
          total_amount?: number;
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
