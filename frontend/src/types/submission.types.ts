// ============================================
// LEAD SUBMISSION & USER DATA
// ============================================

export interface FormAnswer {
    questionId: string;
    question: string;
    value: string | string[] | number;
    answeredAt: Date;
  }
  
  export interface LeadSubmission {
    _id?: string;
    formId: string;
    agentId: string;
    email: string;
    phoneNumber?:number
    answers: FormAnswer[];
    propertyProfile: {
      type?: string;
      estimatedAge?: number;
      hasRenovations?: boolean;
      renovationTypes?: string[];
      mortgageStatus?: string;
      sellingReason?: string;
      timeline?: string;
      specificConcerns?: string;
    };
    analysis?: {
      estimatedValue?: {
        low: number;
        high: number;
        confidence: number;
      };
      comparableHomes?: any[]; // Will import ComparableHome later
      marketInsights?: string;
      agentAdvice?: string;
      generatedAt: Date;
    };
    submittedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    pageUrl: string;
    status: 'new' | 'contacted' | 'qualified' | 'closed' | 'dead';
    agentNotes?: string[];
    lastContactedAt?: Date;
  }