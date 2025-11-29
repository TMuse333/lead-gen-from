# Database Operations Pattern

## Overview

This pattern covers MongoDB operations using Mongoose, including CRUD operations, query patterns, and optimization strategies.

## When to Use

- Storing user data
- Persisting application state
- User authentication data
- Content management
- Any data that needs persistence

## Implementation

### Mongoose Connection

**File:** `frontend/src/lib/mongodb/mongoose.ts`

```typescript
import mongoose from 'mongoose';

let cachedConnection: mongoose.Connection | null = null;

export async function connectMongoose(): Promise<mongoose.Connection> {
  if (cachedConnection) {
    return cachedConnection;
  }
  
  const connection = await mongoose.connect(process.env.MONGODB_URI!);
  cachedConnection = connection.connection;
  return cachedConnection;
}
```

### Model Definition

**File:** `frontend/src/lib/mongodb/models/websiteMaster.model.ts`

```typescript
import mongoose, { Schema } from 'mongoose';

const WebsiteMasterSchema = new Schema({
  owner: { type: String, required: true, index: true },
  websiteName: { type: String, required: true },
  templateName: { type: String, required: true },
  formData: { type: Map, of: Schema.Types.Mixed },
  pages: [{
    id: String,
    slug: String,
    pageName: String,
    components: [Schema.Types.Mixed],
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.WebsiteMaster || 
  mongoose.model('WebsiteMaster', WebsiteMasterSchema);
```

## Code Examples

### Create Operation

```typescript
export async function POST(req: NextRequest) {
  await connectMongoose();
  
  const websiteMaster = await WebsiteMasterModel.create({
    owner: userEmail,
    websiteName: "My Website",
    templateName: "generalLandingPage",
    pages: [],
    status: 'draft',
  });
  
  return NextResponse.json({
    success: true,
    id: websiteMaster._id.toString(),
  });
}
```

### Read Operations

```typescript
// Find all by owner
const websites = await WebsiteMasterModel.find({ 
  owner: userEmail 
}).sort({ updatedAt: -1 });

// Find one by ID
const website = await WebsiteMasterModel.findById(id);

// Find with conditions
const drafts = await WebsiteMasterModel.find({
  owner: userEmail,
  status: 'draft',
});
```

### Update Operations

```typescript
// Update by ID
const updated = await WebsiteMasterModel.findByIdAndUpdate(
  id,
  {
    websiteName: "New Name",
    updatedAt: new Date(),
  },
  { new: true } // Return updated document
);

// Update component
await WebsiteMasterModel.findOneAndUpdate(
  { _id: id, 'pages.components.id': componentId },
  {
    $set: {
      'pages.$[page].components.$[comp].props': newProps,
      updatedAt: new Date(),
    },
  },
  {
    arrayFilters: [
      { 'page.id': pageId },
      { 'comp.id': componentId },
    ],
  }
);
```

### Delete Operations

```typescript
// Delete by ID
await WebsiteMasterModel.findByIdAndDelete(id);

// Delete with conditions
await WebsiteMasterModel.deleteOne({
  _id: new ObjectId(id),
  owner: userEmail, // Verify ownership
});
```

## Real Example: Delete Website

**File:** `frontend/src/app/api/userActions/delete-website/route.ts`

```typescript
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  if (!id || !email) {
    return NextResponse.json(
      { error: "Missing id or email" },
      { status: 400 }
    );
  }

  try {
    await connectMongoose();
    
    const result = await WebsiteMasterModel.deleteOne({
      _id: new ObjectId(id),
      owner: email, // Verify ownership
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Website not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Website deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting website:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
```

## Query Optimization

### Indexing
```typescript
// Add index for frequent queries
WebsiteMasterSchema.index({ owner: 1, updatedAt: -1 });
```

### Select Specific Fields
```typescript
// Only get needed fields
const websites = await WebsiteMasterModel.find(
  { owner: userEmail },
  'websiteName templateName status updatedAt' // Only these fields
);
```

### Pagination
```typescript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const websites = await WebsiteMasterModel.find({ owner: userEmail })
  .skip(skip)
  .limit(limit)
  .sort({ updatedAt: -1 });
```

## Common Pitfalls

1. **Not handling connection errors**
   - Always wrap in try-catch
   - Implement connection retry logic
   - Cache connections to avoid reconnecting

2. **Not verifying ownership**
   - Always check `owner` field on updates/deletes
   - Don't trust client-provided IDs alone

3. **Not using transactions**
   - Use transactions for multi-document operations
   - Rollback on errors

4. **Not updating timestamps**
   - Always update `updatedAt` on modifications
   - Use Mongoose middleware for automatic updates

## Variations

### Using MongoDB Native Client

```typescript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db('database_name');
const collection = db.collection('websitemasters');

await collection.insertOne(websiteMaster);
```

### Aggregation Pipelines

```typescript
const stats = await WebsiteMasterModel.aggregate([
  { $match: { owner: userEmail } },
  { $group: {
      _id: '$status',
      count: { $sum: 1 },
    },
  },
]);
```

## Related Patterns

- [API Route Patterns](./api-routes.md) - Database operations in API routes
- [Domain Models](./domain-models.md) - Data structure definitions
- [State Management](./state-management.md) - Syncing with database
