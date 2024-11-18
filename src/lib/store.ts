import { create } from 'zustand';
import { supabase } from './supabase';
import { addDays, isPast } from 'date-fns';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

interface User {
  id: string;
  email: string;
  username: string;
  subscriptionTier: SubscriptionTier;
  subscriptionEndsAt: Date | null;
  usageThisMonth: {
    pdfConversions: number;
    imageCompressions: number;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUsage: (type: 'pdfConversions' | 'imageCompressions') => Promise<boolean>;
  checkSubscriptionAccess: (feature: keyof typeof TIER_LIMITS) => boolean;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<void>;
}

export const TIER_LIMITS = {
  pdfConversions: {
    free: 5,
    pro: Infinity,
    enterprise: Infinity,
  },
  imageCompressions: {
    free: 10,
    pro: Infinity,
    enterprise: Infinity,
  },
  maxFileSize: {
    free: 10 * 1024 * 1024, // 10MB
    pro: 50 * 1024 * 1024, // 50MB
    enterprise: 100 * 1024 * 1024, // 100MB
  },
  batchProcessing: {
    free: false,
    pro: true,
    enterprise: true,
  },
  apiAccess: {
    free: false,
    pro: true,
    enterprise: true,
  },
  customExports: {
    free: false,
    pro: true,
    enterprise: true,
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      // First, check if the user exists in auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user found');
      }

      // Then, check if the user has a profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        // If no profile exists, sign out and show error
        await supabase.auth.signOut();
        throw new Error('Account not found. Please sign up first.');
      }

      set({
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          username: profileData.username,
          subscriptionTier: profileData.subscription_tier || 'free',
          subscriptionEndsAt: profileData.subscription_ends_at ? new Date(profileData.subscription_ends_at) : null,
          usageThisMonth: profileData.usage_this_month || {
            pdfConversions: 0,
            imageCompressions: 0,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error; // Re-throw to handle in the component
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true, error: null });

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Failed to create account');

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: data.user.id,
            username,
            email,
            subscription_tier: 'free',
            subscription_ends_at: null,
            usage_this_month: {
              pdfConversions: 0,
              imageCompressions: 0,
            },
          },
        ]);

      if (profileError) {
        // If profile creation fails, attempt to delete the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create profile. Please try again.');
      }

      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
          username,
          subscriptionTier: 'free',
          subscriptionEndsAt: null,
          usageThisMonth: {
            pdfConversions: 0,
            imageCompressions: 0,
          },
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error; // Re-throw to handle in the component
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUsage: async (type: 'pdfConversions' | 'imageCompressions') => {
    const user = get().user;
    if (!user) return false;

    const currentUsage = user.usageThisMonth[type];
    const limit = TIER_LIMITS[type][user.subscriptionTier];

    if (currentUsage >= limit) {
      set({ error: `You've reached your ${type} limit for this month` });
      return false;
    }

    try {
      const newUsage = {
        ...user.usageThisMonth,
        [type]: currentUsage + 1,
      };

      const { error } = await supabase
        .from('user_profiles')
        .update({ usage_this_month: newUsage })
        .eq('id', user.id);

      if (error) throw error;

      set({
        user: {
          ...user,
          usageThisMonth: newUsage,
        },
      });

      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    }
  },

  checkSubscriptionAccess: (feature: keyof typeof TIER_LIMITS) => {
    const user = get().user;
    if (!user) return false;

    if (user.subscriptionTier !== 'free' && user.subscriptionEndsAt && isPast(user.subscriptionEndsAt)) {
      return TIER_LIMITS[feature].free;
    }

    return TIER_LIMITS[feature][user.subscriptionTier];
  },

  upgradeSubscription: async (tier: SubscriptionTier) => {
    const user = get().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });

      const subscriptionEndsAt = addDays(new Date(), 30);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: tier,
          subscription_ends_at: subscriptionEndsAt.toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      set({
        user: {
          ...user,
          subscriptionTier: tier,
          subscriptionEndsAt,
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));