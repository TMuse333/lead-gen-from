// lib/rules/concepts.ts
// Predefined real estate concepts and their mappings

export interface RealEstateConcept {
  concept: string;
  label: string;
  description: string;
  aliases: string[]; // Field name variations
  valueType: 'categorical' | 'numeric' | 'text';
  commonValues?: string[]; // Standard values
  valueNormalizations?: Record<string, string>; // Map user values to standard
  examples: string[]; // Example questions that match this concept
}

export const REAL_ESTATE_CONCEPTS: RealEstateConcept[] = [
  {
    concept: 'property-type',
    label: 'Property Type',
    description: 'The type of property (house, condo, townhouse, etc.)',
    aliases: ['propertyType', 'property', 'homeType', 'home', 'dwelling', 'propertyKind', 'propKind'],
    valueType: 'categorical',
    commonValues: ['single-family house', 'condo', 'townhouse', 'multi-family'],
    valueNormalizations: {
      'house': 'single-family house',
      'home': 'single-family house',
      'single family': 'single-family house',
      'sfh': 'single-family house',
      'apartment': 'condo',
      'apt': 'condo',
      'condominium': 'condo',
      'townhome': 'townhouse',
      'duplex': 'multi-family',
      'triplex': 'multi-family',
    },
    examples: [
      'What type of property',
      'What kind of home',
      'Property type',
      'Type of dwelling',
    ],
  },
  {
    concept: 'timeline',
    label: 'Timeline',
    description: 'How quickly the user wants to buy/sell (urgency)',
    aliases: ['timeline', 'timeframe', 'when', 'urgency', 'timing', 'timeToSell', 'timeToBuy'],
    valueType: 'categorical',
    commonValues: ['0-3', '3-6', '6-12', '12+'],
    valueNormalizations: {
      'urgent': '0-3',
      'asap': '0-3',
      'quick': '0-3',
      'immediately': '0-3',
      'soon': '3-6',
      'within 6 months': '3-6',
      'flexible': '6-12',
      'no rush': '12+',
      'not urgent': '12+',
    },
    examples: [
      'When do you want to',
      'How quickly',
      'What is your timeline',
      'Timeframe',
    ],
  },
  {
    concept: 'selling-reason',
    label: 'Selling Reason',
    description: 'Why the user wants to sell their property',
    aliases: ['sellingReason', 'reason', 'why', 'motivation', 'sellReason', 'whySelling'],
    valueType: 'categorical',
    commonValues: ['upsizing', 'downsizing', 'relocating', 'investment'],
    valueNormalizations: {
      'moving up': 'upsizing',
      'bigger home': 'upsizing',
      'growing family': 'upsizing',
      'moving down': 'downsizing',
      'smaller home': 'downsizing',
      'empty nest': 'downsizing',
      'relocation': 'relocating',
      'moving': 'relocating',
      'job transfer': 'relocating',
      'investing': 'investment',
      'flip': 'investment',
    },
    examples: [
      'Why are you selling',
      'What is your reason',
      'Selling motivation',
    ],
  },
  {
    concept: 'buying-reason',
    label: 'Buying Reason',
    description: 'Why the user wants to buy a property',
    aliases: ['buyingReason', 'reason', 'why', 'motivation', 'buyReason', 'whyBuying'],
    valueType: 'categorical',
    commonValues: ['first-home', 'upgrade', 'downsize', 'investment'],
    valueNormalizations: {
      'first time': 'first-home',
      'first home': 'first-home',
      'first-time buyer': 'first-home',
      'moving up': 'upgrade',
      'bigger': 'upgrade',
      'moving down': 'downsize',
      'smaller': 'downsize',
      'investing': 'investment',
      'rental': 'investment',
    },
    examples: [
      'Why are you buying',
      'What is your reason',
      'Buying motivation',
    ],
  },
  {
    concept: 'budget',
    label: 'Budget',
    description: 'The user\'s price range or budget',
    aliases: ['budget', 'price', 'priceRange', 'affordability', 'maxPrice', 'budgetRange'],
    valueType: 'numeric',
    examples: [
      'What is your budget',
      'Price range',
      'How much can you afford',
    ],
  },
  {
    concept: 'location',
    label: 'Location',
    description: 'Geographic location or area preference',
    aliases: ['location', 'area', 'neighborhood', 'city', 'region', 'where'],
    valueType: 'text',
    examples: [
      'Where are you looking',
      'What area',
      'Location preference',
    ],
  },
  {
    concept: 'property-age',
    label: 'Property Age',
    description: 'How old the property is',
    aliases: ['propertyAge', 'age', 'yearBuilt', 'homeAge', 'houseAge'],
    valueType: 'categorical',
    commonValues: ['0-10', '10-20', '20-30', '30+'],
    valueNormalizations: {
      'new': '0-10',
      'newer': '0-10',
      'recent': '10-20',
      'older': '30+',
      'historic': '30+',
    },
    examples: [
      'How old is your home',
      'Property age',
      'Year built',
    ],
  },
  {
    concept: 'bedrooms',
    label: 'Bedrooms',
    description: 'Number of bedrooms',
    aliases: ['bedrooms', 'beds', 'bedroomCount', 'bedroom'],
    valueType: 'numeric',
    commonValues: ['1', '2', '3', '4', '5+'],
    examples: [
      'How many bedrooms',
      'Number of beds',
    ],
  },
  {
    concept: 'renovations',
    label: 'Renovations',
    description: 'Renovations or updates needed/wanted',
    aliases: ['renovations', 'updates', 'improvements', 'renovated', 'remodel'],
    valueType: 'categorical',
    commonValues: ['kitchen', 'bathroom', 'kitchen and bathroom', 'none'],
    valueNormalizations: {
      'kitchen update': 'kitchen',
      'bath update': 'bathroom',
      'both': 'kitchen and bathroom',
      'no updates': 'none',
      'move-in ready': 'none',
    },
    examples: [
      'What renovations',
      'Updates needed',
      'Improvements',
    ],
  },
];

/**
 * Find a concept by field name or question text
 */
export function findConceptByField(fieldId: string, questionText?: string): RealEstateConcept | null {
  // First try exact alias match
  for (const concept of REAL_ESTATE_CONCEPTS) {
    if (concept.aliases.some(alias => 
      alias.toLowerCase() === fieldId.toLowerCase()
    )) {
      return concept;
    }
  }
  
  // Then try question text matching
  if (questionText) {
    const lowerQuestion = questionText.toLowerCase();
    for (const concept of REAL_ESTATE_CONCEPTS) {
      if (concept.examples.some(example => 
        lowerQuestion.includes(example.toLowerCase())
      )) {
        return concept;
      }
    }
  }
  
  return null;
}

/**
 * Normalize a value to standard format
 */
export function normalizeValue(concept: RealEstateConcept, value: string): string {
  const normalized = concept.valueNormalizations?.[value.toLowerCase()];
  return normalized || value;
}

/**
 * Get all concepts as a simple list for display
 */
export function getAllConcepts(): RealEstateConcept[] {
  return REAL_ESTATE_CONCEPTS;
}

