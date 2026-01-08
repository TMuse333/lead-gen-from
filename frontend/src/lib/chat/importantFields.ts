// lib/chat/importantFields.ts
// Defines which mapping keys require the important info modal

export const IMPORTANT_FIELDS = [
  'email',
  'phone',
  'contact',
  'contactEmail',
  'contactPhone',
  'emailAddress',
  'phoneNumber',
  'propertyAddress',
  'address',
] as const;

export type ImportantFieldType = typeof IMPORTANT_FIELDS[number];

export function isImportantField(mappingKey?: string): boolean {
  if (!mappingKey) return false;
  
  // Normalize to lowercase for comparison
  const normalized = mappingKey.toLowerCase().trim();
  
  // Check against normalized important fields
  const normalizedImportantFields = IMPORTANT_FIELDS.map(f => f.toLowerCase());
  
  // Check if it's an important field
  if (normalizedImportantFields.includes(normalized)) {
    return true;
  }
  
  // Also check for common variations and partial matches
  return normalized.includes('email') ||
         normalized.includes('phone') ||
         normalized.includes('contact') ||
         normalized.includes('propertyaddress') ||
         normalized.includes('property_address') ||
         normalized.includes('address');
}

export function getFieldType(mappingKey?: string): 'email' | 'phone' | 'address' | 'text' {
  if (!mappingKey) return 'text';
  
  const normalized = mappingKey.toLowerCase();
  
  // Check for email-related fields
  if (normalized.includes('email') || normalized === 'contact') {
    return 'email';
  }
  
  // Check for phone-related fields
  if (normalized.includes('phone')) {
    return 'phone';
  }
  
  // Check for address-related fields
  if (normalized.includes('address') || normalized.includes('property')) {
    return 'address';
  }
  
  return 'text';
}

export function getFieldLabel(mappingKey?: string): string {
  if (!mappingKey) return 'Information';
  
  const normalized = mappingKey.toLowerCase();
  
  // Email-related
  if (normalized.includes('email') || normalized === 'contact') {
    return "You're Almost There!";
  }
  
  // Phone-related
  if (normalized.includes('phone')) {
    return "Let's Connect!";
  }
  
  // Address-related
  if (normalized.includes('address') || normalized.includes('property')) {
    return "Almost Ready!";
  }
  
  return 'Information';
}

export function getFieldDescription(mappingKey?: string): string {
  if (!mappingKey) return 'You\'re one step away from your personalized experience!';
  
  const normalized = mappingKey.toLowerCase();
  
  // Email-related
  if (normalized.includes('email') || normalized === 'contact') {
    return 'You\'re one step away from receiving your unique, personalized offer! Just share your email and we\'ll send it right over.';
  }
  
  // Phone-related
  if (normalized.includes('phone')) {
    return 'You\'re almost there! Share your phone number and we\'ll connect you with the perfect opportunity.';
  }
  
  // Address-related
  if (normalized.includes('address') || normalized.includes('property')) {
    return 'You\'re one step away from your personalized home estimate! Just share your property address and we\'ll generate it instantly.';
  }
  
  return 'You\'re one step away from your personalized experience!';
}

