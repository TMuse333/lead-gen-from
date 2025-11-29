# Domain Models Pattern

## Overview

Domain models represent the core business entities in your application. In this app, `WebsiteMaster` is the primary domain model representing a user's website project.

## When to Use

- Representing core business entities
- Structuring complex data relationships
- Defining data contracts between frontend and backend
- Template systems
- Data validation and type safety

## Implementation

### WebsiteMaster Structure

**File:** `frontend/src/types/websiteDataTypes.ts`

```typescript
export interface WebsiteMaster {
  _id?: string;
  owner: string; // User email
  websiteName: string;
  templateName: string;
  formData: Record<string, WebsiteFormAnswer>;
  pages: WebsitePage[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsitePage {
  id: string;
  slug: string;
  pageName: string;
  components: PageComponentInstance[];
  text?: StandardText[];
}

export interface PageComponentInstance {
  id: string;
  type: ComponentType;
  props?: ComponentPropsMap[ComponentType];
  order: number;
  context?: string;
  sectionId?: string;
  componentCategory: ComponentCategory;
}
```

## Code Examples

### Creating a WebsiteMaster

```typescript
const createWebsiteMaster = (
  formAnswers: Record<string, WebsiteFormAnswer>,
  template: WebsiteTemplate,
  userEmail: string
): WebsiteMaster => {
  return {
    owner: userEmail,
    websiteName: formAnswers.businessName?.answer || "Untitled",
    templateName: template.name,
    formData: formAnswers,
    pages: template.pages.map((page, index) => ({
      id: `page-${index}`,
      slug: page.slug,
      pageName: page.pageName,
      components: page.components.map((comp, compIndex) => ({
        id: `${comp.type}-${compIndex}`,
        type: comp.type,
        props: comp.defaultProps,
        order: compIndex,
        componentCategory: comp.category,
      })),
    })),
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
```

### Template System

**File:** `frontend/src/templates/singlePage/generalLandingPage.ts`

```typescript
export const generalLandingPage: WebsiteTemplate = {
  name: "generalLandingPage",
  price: 199,
  pages: [
    {
      slug: "index",
      pageName: "Home",
      components: [
        {
          type: "auroraImageHero",
          defaultProps: {
            title: "Welcome",
            description: "Your description here",
            image: { src: "", alt: "" },
          },
          category: "hero",
        },
        {
          type: "featureBoxes",
          defaultProps: {
            title: "Features",
            array: [],
          },
          category: "textComponent",
        },
      ],
    },
  ],
};
```

## MongoDB Integration

### Mongoose Model

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
    text: [Schema.Types.Mixed],
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

### CRUD Operations

```typescript
// Create
const website = await WebsiteMasterModel.create(websiteMaster);

// Read
const websites = await WebsiteMasterModel.find({ owner: userEmail });

// Update
await WebsiteMasterModel.findByIdAndUpdate(id, {
  ...updates,
  updatedAt: new Date(),
});

// Delete
await WebsiteMasterModel.findByIdAndDelete(id);
```

## Type Safety

### Type Guards

```typescript
function isWebsiteMaster(obj: any): obj is WebsiteMaster {
  return (
    typeof obj === 'object' &&
    typeof obj.owner === 'string' &&
    Array.isArray(obj.pages) &&
    obj.pages.every(isWebsitePage)
  );
}

function isWebsitePage(obj: any): obj is WebsitePage {
  return (
    typeof obj === 'object' &&
    typeof obj.slug === 'string' &&
    Array.isArray(obj.components)
  );
}
```

## Common Pitfalls

1. **Not validating data structure**
   - Always validate before saving to database
   - Use type guards for runtime validation

2. **Mixing concerns**
   - Keep domain models separate from UI state
   - Don't add UI-specific properties to domain models

3. **Not handling optional fields**
   - Use optional chaining: `websiteMaster?.pages?.[0]`
   - Provide defaults for required fields

4. **Not updating timestamps**
   - Always update `updatedAt` on modifications
   - Use Mongoose middleware for automatic updates

## Variations

### Nested Models
For complex relationships:

```typescript
interface WebsiteMaster {
  pages: WebsitePage[];
  settings: WebsiteSettings;
  analytics: WebsiteAnalytics;
}
```

### Versioned Models
For tracking changes:

```typescript
interface WebsiteMaster {
  version: number;
  history: WebsiteMasterVersion[];
}
```

## Related Patterns

- [State Management](./state-management.md) - Storing domain models in Zustand
- [Database Operations](./database-operations.md) - CRUD operations
- [Form Processing Pipeline](./form-processing-pipeline.md) - Creating from form data