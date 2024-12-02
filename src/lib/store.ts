import { create } from 'zustand';

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

// Mock user for development
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  username: 'demo',
  subscriptionTier: 'pro',
  subscriptionEndsAt: new Date('2025-12-31'),
  usageThisMonth: {
    pdfConversions: 0,
    imageCompressions: 0,
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: MOCK_USER, // Use mock user by default
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      // Mock successful login
      set({ user: MOCK_USER });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    try {
      set({ loading: true, error: null });
      // Mock successful registration
      set({ user: MOCK_USER });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
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
    return TIER_LIMITS[feature][user.subscriptionTier];
  },

  upgradeSubscription: async (tier: SubscriptionTier) => {
    const user = get().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });
      set({
        user: {
          ...user,
          subscriptionTier: tier,
          subscriptionEndsAt: new Date('2025-12-31'),
        },
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));