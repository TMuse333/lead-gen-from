// ============================================
// COMPARABLE HOMES
// ============================================

export interface ComparableHome {
    id: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    propertyDetails: {
      type: string;
      bedrooms: number;
      bathrooms: number;
      squareFeet?: number;
      lotSize?: number;
      yearBuilt?: number;
    };
    saleInfo: {
      listPrice?: number;
      soldPrice?: number;
      soldDate?: Date;
      daysOnMarket?: number;
      status: 'active' | 'sold' | 'pending';
    };
    similarityScore?: number;
    matchReason?: string;
  }