// // ============================================
// // MONGODB CLIENT - Store Lead Submissions
// // ============================================


// // ============================================
// // MONGODB CLIENT - Store Lead Submissions
// // ============================================

// import { MongoClient, Db, Collection } from 'mongodb';
// import { LeadSubmission, FormConfig } from '@/types';
// import dotenv from 'dotenv'


// dotenv.config({ path: '../../../.env' });
// if (!process.env.MONGODB_URI) {
//   throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
// }

// const uri = process.env.MONGODB_URI;
// const dbName = process.env.MONGODB_DB_NAME || 'real_estate_leads';
// const options = {};

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// // Use global caching in development to prevent hot reload issues
// if (process.env.NODE_ENV === 'development') {
//   const globalWithMongo = global as typeof globalThis & {
//     _mongoClientPromise?: Promise<MongoClient>;
//   };

//   if (!globalWithMongo._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     globalWithMongo._mongoClientPromise = client.connect();
//   }
//   clientPromise = globalWithMongo._mongoClientPromise;
// } else {
//   // In production, create a new client
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// /**
//  * Get the database instance
//  */
// async function getDatabase(): Promise<Db> {
//   const client = await clientPromise;
//   return client.db(dbName);
// }

// /**
//  * Get leads collection
//  */
// export async function getLeadsCollection(): Promise<Collection<LeadSubmission>> {
//   const db = await getDatabase();
//   return db.collection<LeadSubmission>('leads');
// }

// /**
//  * Get form configs collection
//  */
// export async function getFormConfigsCollection(): Promise<Collection<FormConfig>> {
//   const db = await getDatabase();
//   return db.collection<FormConfig>('form_configs');
// }

// /**
//  * Save a new lead submission
//  */
// export async function saveLeadSubmission(
//   leadData: Omit<LeadSubmission, '_id'>
// ): Promise<string> {
//   try {
//     const collection = await getLeadsCollection();
//     const result = await collection.insertOne(leadData as LeadSubmission);
    
//     console.log('✅ Lead saved to MongoDB:', result.insertedId);
//     return result.insertedId.toString();
//   } catch (error) {
//     console.error('Error saving lead:', error);
//     throw error;
//   }
// }

// /**
//  * Update lead with analysis results
//  */
// export async function updateLeadAnalysis(
//   leadId: string,
//   analysis: any
// ) {
//   try {
//     const collection = await getLeadsCollection();
//     const { ObjectId } = require('mongodb');
    
//     await collection.updateOne(
//       { _id: new ObjectId(leadId) },
//       { 
//         $set: { 
//           analysis: analysis // Set the entire analysis object at once
//         } 
//       }
//     );
    
//     console.log('✅ Lead analysis updated:', leadId);
//   } catch (error) {
//     console.error('Error updating lead analysis:', error);
//     throw error;
//   }
// }

// /**
//  * Get lead by ID
//  */
// export async function getLeadById(leadId: string): Promise<LeadSubmission | null> {
//   try {
//     const collection = await getLeadsCollection();
//     const { ObjectId } = require('mongodb');
    
//     const lead = await collection.findOne({ _id: new ObjectId(leadId) });
//     return lead;
//   } catch (error) {
//     console.error('Error fetching lead:', error);
//     return null;
//   }
// }

// /**
//  * Get all leads for an agent
//  */
// export async function getAgentLeads(
//   agentId: string,
//   limit: number = 50
// ): Promise<LeadSubmission[]> {
//   try {
//     const collection = await getLeadsCollection();
    
//     const leads = await collection
//       .find({ agentId })
//       .sort({ submittedAt: -1 })
//       .limit(limit)
//       .toArray();
    
//     return leads;
//   } catch (error) {
//     console.error('Error fetching agent leads:', error);
//     return [];
//   }
// }

// /**
//  * Save form configuration
//  */
// export async function saveFormConfig(config: FormConfig): Promise<string> {
//   try {
//     const collection = await getFormConfigsCollection();
//     const result = await collection.insertOne(config);
    
//     console.log('✅ Form config saved:', result.insertedId);
//     return result.insertedId.toString();
//   } catch (error) {
//     console.error('Error saving form config:', error);
//     throw error;
//   }
// }

// /**
//  * Get form config by agent ID
//  */
// export async function getFormConfigByAgentId(
//   agentId: string
// ): Promise<FormConfig | null> {
//   try {
//     const collection = await getFormConfigsCollection();
//     const config = await collection.findOne({ agentId, isActive: true });
//     return config;
//   } catch (error) {
//     console.error('Error fetching form config:', error);
//     return null;
//   }
// }

// // Export the client promise for direct usage if needed
// export default clientPromise;


export const ten = 20