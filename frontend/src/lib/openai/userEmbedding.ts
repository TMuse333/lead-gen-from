// lib/embeddings.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * Generate an embedding vector from user input for semantic search
 * This creates a text summary of the user's situation and converts it to a vector
 */
export async function generateUserEmbedding(
  flow: string,
  userInput: Record<string, string>
): Promise<number[]> {
  // Create a natural language summary of the user's situation
  const textToEmbed = buildUserSummary(flow, userInput);

  // Generate embedding using OpenAI
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: textToEmbed,
  });
  
  return response.data[0].embedding;
}

/**
 * Build a natural language summary of the user's situation
 * This is what gets converted to an embedding vector
 */
function buildUserSummary(flow: string, userInput: Record<string, string>): string {
  const parts: string[] = [];

  // Add flow context
  if (flow === 'sell') {
    parts.push('I want to sell my home.');
  } else if (flow === 'buy') {
    parts.push('I want to buy a home.');
  } else {
    parts.push('I am browsing the real estate market.');
  }

  // Add timeline context
  if (userInput.timeline) {
    const timelineMap: Record<string, string> = {
      '0-3': 'I need to move within 3 months',
      '3-6': 'I am planning to move in 3-6 months',
      '6-12': 'I am planning to move in 6-12 months',
      '12+': 'I am just exploring for the future',
      '24+': 'I am gathering information for the long term',
    };
    const timelineText = timelineMap[userInput.timeline] || `Timeline: ${userInput.timeline}`;
    parts.push(timelineText);
  }

  // Add selling-specific context
  if (flow === 'sell') {
    if (userInput.propertyType) {
      parts.push(`I have a ${userInput.propertyType}.`);
    }
    if (userInput.sellingReason) {
      const reasonMap: Record<string, string> = {
        'relocating': 'I am relocating',
        'upsizing': 'I need a bigger home',
        'downsizing': 'I want to downsize',
        'investment': 'I am selling an investment property',
      };
      parts.push(reasonMap[userInput.sellingReason] || userInput.sellingReason);
    }
    if (userInput.renovations && userInput.renovations !== 'none') {
      parts.push(`I recently renovated my ${userInput.renovations}.`);
    }
  }

  // Add buying-specific context
  if (flow === 'buy') {
    if (userInput.propertyType && userInput.propertyType !== 'any') {
      parts.push(`I am looking for a ${userInput.propertyType}.`);
    }
    if (userInput.budget) {
      parts.push(`My budget is ${userInput.budget}.`);
    }
    if (userInput.bedrooms) {
      parts.push(`I need ${userInput.bedrooms} bedrooms.`);
    }
    if (userInput.buyingReason) {
      const reasonMap: Record<string, string> = {
        'first-home': 'This is my first home purchase',
        'upgrade': 'I am upgrading to a better home',
        'downsize': 'I want to downsize',
        'investment': 'I am looking for an investment property',
      };
      parts.push(reasonMap[userInput.buyingReason] || userInput.buyingReason);
    }
  }

  // Add browsing-specific context
  if (flow === 'browse') {
    if (userInput.interest) {
      const interestMap: Record<string, string> = {
        'market-trends': 'I want to understand market trends',
        'investment': 'I am interested in investment opportunities',
        'neighborhood': 'I want to learn about different neighborhoods',
        'general': 'I am just curious about real estate',
      };
      parts.push(interestMap[userInput.interest] || userInput.interest);
    }
    if (userInput.location && userInput.location !== 'other') {
      parts.push(`I am interested in ${userInput.location}.`);
    }
    if (userInput.goal) {
      const goalMap: Record<string, string> = {
        'buy-future': 'I am planning to buy in the future',
        'sell-future': 'I am planning to sell in the future',
        'invest': 'I want to invest in real estate',
        'learn': 'I am just learning about real estate',
      };
      parts.push(goalMap[userInput.goal] || userInput.goal);
    }
  }

  return parts.join(' ');
}

/**
 * Example outputs:
 * 
 * Seller (urgent):
 * "I want to sell my home. I need to move within 3 months. I have a single-family house. 
 *  I am relocating. I recently renovated my kitchen."
 * 
 * Buyer (first-time):
 * "I want to buy a home. I am planning to move in 3-6 months. I am looking for a condo. 
 *  My budget is $400K-$600K. I need 3 bedrooms. This is my first home purchase."
 * 
 * Browser:
 * "I am browsing the real estate market. I want to understand market trends. 
 *  I am interested in downtown Halifax. I am planning to buy in the future."
 */