// scripts/update-chris-colors.ts
// Update Chris Crowell's chatbot colors to black and red (Keller Williams branding)

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri';

const CHRIS_COLORS = {
  name: 'Keller Williams - Black & Red',
  // Primary red (Keller Williams brand)
  primary: '#CC0000',
  secondary: '#CC0000',
  // Dark backgrounds
  background: '#000000',
  surface: '#1a1a1a',
  // Text colors
  text: '#ffffff',
  textSecondary: '#cccccc',
  // Accent (red)
  accent: '#CC0000',
  border: '#333333',
  // Status colors
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  // Interactive states
  buttonHover: '#A30000', // Darker red for hover
  // Gradients
  gradientFrom: '#CC0000',
  gradientTo: '#990000', // Darker red gradient
};

async function updateChrisColors() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('agent_lead_gen');
    const collection = db.collection('client_configs');

    // Find Chris's config
    const chris = await collection.findOne({ businessName: 'chris-crowell-real-estate' });

    if (!chris) {
      console.log('❌ Chris Crowell config not found');
      return;
    }

    console.log('\n📋 Current colors:');
    console.log(JSON.stringify(chris.colorConfig, null, 2));

    // Update colors
    const result = await collection.updateOne(
      { businessName: 'chris-crowell-real-estate' },
      {
        $set: {
          colorConfig: CHRIS_COLORS,
          updatedAt: new Date(),
        },
      }
    );

    console.log('\n✅ Updated colorConfig for Chris Crowell');
    console.log(`   Modified ${result.modifiedCount} document(s)`);

    console.log('\n🎨 New colors:');
    console.log(JSON.stringify(CHRIS_COLORS, null, 2));

    console.log('\n✅ Colors updated successfully!');
    console.log('   Chatbot will use new colors on next load.');
    console.log('   Results page will also use these colors.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

updateChrisColors();
