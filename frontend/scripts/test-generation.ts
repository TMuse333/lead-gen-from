/**
 * Test script for offer generation API
 * Run with: npx ts-node scripts/test-generation.ts
 * Or: npx tsx scripts/test-generation.ts
 */

const BASE_URL = 'http://localhost:3000';

// Sample data matching what the chatbot sends for "sell" intent
const testData = {
  offer: 'real-estate-timeline',
  intent: 'sell',
  flow: 'sell',
  userInput: {
    intent: 'sell',
    sellingReason: 'upsizing',
    location: 'sackville',
    budget: 'over $800,000',
    timeline: '6-12 months',
    contactName: 'Test User',
    contactEmail: 'test@example.com',
    contactPhone: '555-555-5555',
    email: 'test@example.com',
  },
  conversationId: undefined,
  clientId: 'bob real estate',
  clientIdentifier: 'bob real estate',
};

async function testGeneration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 TESTING GENERATION API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Request body:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    const response = await fetch(`${BASE_URL}/api/offers/generate-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.body) {
      console.error('No response body');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    console.log('\n📥 SSE Events:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) {
              console.log('❌ ERROR:', JSON.stringify(data, null, 2));
            } else if (data.step === 'complete') {
              console.log('✅ COMPLETE');
            } else {
              console.log(`📥 ${data.step || 'event'}:`, data.message || data);
            }
          } catch (e) {
            console.log('Raw:', line);
          }
        } else if (line.startsWith('event: ')) {
          // Skip event type lines
        }
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏁 Stream ended');

  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Run the test
testGeneration();
