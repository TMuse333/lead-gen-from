import { PropertyProfile, UserProfile, SellUserProfile, BuyUserProfile, BrowseUserProfile } from '@/types';
import { FlowType } from '@/types'; // assuming you have FlowType = 'sell' | 'buy' | 'browse'

/**
 * Build a user profile object for AI analysis based on property profile and flow type.
 */
export function buildUserProfile(
  propertyProfile: PropertyProfile,
  flow: FlowType
): UserProfile {
  const baseProfile = {
    propertyType: propertyProfile.type,
    timeline: propertyProfile.timeline,
    concerns: propertyProfile.specificConcerns,
  };

  switch (flow) {
    case 'sell': {
      const sellProfile: SellUserProfile = {
        ...baseProfile,
        sellingReason: propertyProfile.sellingReason,
      };
      return sellProfile;
    }
    case 'buy': {
      const buyProfile: BuyUserProfile = {
        ...baseProfile,
        budget: propertyProfile.budget,
        desiredFeatures: propertyProfile.desiredFeatures,
        neighborhood: (propertyProfile as any).neighborhood, // optional, if you added it to PropertyProfile
      };
      return buyProfile;
    }
    case 'browse': {
      const browseProfile: BrowseUserProfile = {
        ...baseProfile,
      };
      return browseProfile;
    }
    default:
      throw new Error(`Unsupported flow type: ${flow}`);
  }
}
