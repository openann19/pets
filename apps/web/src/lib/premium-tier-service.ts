export type PremiumTier = 'free' | 'premium' | 'ultra';

export interface UserSubscription {
  tier: PremiumTier;
  status: 'active' | 'inactive' | 'cancelled';
  expiresAt?: Date;
}

class PremiumTierService {
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    return { tier: 'free', status: 'inactive' };
  }

  async upgradeTier(userId: string, tier: PremiumTier): Promise<UserSubscription> {
    return { tier, status: 'active' };
  }

  async cancelSubscription(userId: string): Promise<void> {
    // Stub
  }
}

export const premiumTierService = new PremiumTierService();
