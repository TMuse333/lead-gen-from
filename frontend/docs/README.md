# Documentation Index

Welcome to the project documentation! This folder contains all guides, references, and implementation details for the Agent Lead Gen application.

## 📚 Quick Navigation

### 🚀 [Setup & Installation](./setup/)
Step-by-step guides for setting up core features:
- **[Complete Sign-In Implementation](./setup/complete-signin-implementation.md)** - Full NextAuth email magic link setup
- **[Onboarding Implementation](./setup/onboarding-implementation.md)** - User onboarding flow setup
- **[Onboarding Next Steps](./setup/onboarding-next-steps.md)** - Post-onboarding configuration

### ✨ [Features](./features/)
Feature-specific documentation and implementation guides:

#### Core Features
- **[Admin Dashboard](./features/admin-docs.md)** - Admin panel documentation
- **[Conversation Tracking](./features/conversation-tracking-overview.md)** - User interaction tracking system
- **[Color Configuration](./features/color-config-implementation.md)** - Theme and color customization
- **[Document Extraction Design](./features/document-extraction-design.md)** - Document processing architecture

#### Feature Modules
- **[Document Extraction](./features/document-extraction/)** - Complete document extraction system
  - Installation guide
  - Migration guide
  - Component structure
  - PDF solutions

- **[Offers System](./features/offers/)** - Offer generation and management
  - **[Phase 1](./features/offers/phase-1/)** - Core offer generation
  - **[Phase 2](./features/offers/phase-2/)** - Advanced offer types
  - **[Offer Editor](./features/offers/offer-editor/)** - Visual offer editor
  - **[Legacy Docs](./features/offers/legacy/)** - Historical documentation

- **[Onboarding](./features/onboarding/)** - User onboarding flows
  - Validation system guide

- **[Rules System](./features/rules/)** - Business rules and logic

- **[Deployment](./features/deployment/)** - Deployment guides
  - Payment multi-domain iframe guide

### 🏗️ [Architecture](./architecture/)
System architecture, design patterns, and technical decisions:

- **[Overview](./architecture/overview.md)** - System architecture overview
- **[Refactor Documentation](./architecture/refactor.md)** - Chat form refactor details
- **[Zustand LocalStorage Pattern](./architecture/zustand-localStorage-pattern.md)** - State management patterns

#### Design Patterns
- **[Authentication](./architecture/patterns/authentication.md)** - Auth patterns and best practices
- **[Database Operations](./architecture/patterns/database-operations.md)** - Database interaction patterns
- **[Domain Models](./architecture/patterns/domain-models.md)** - Data modeling patterns
- **[Multi-Step Flows](./architecture/patterns/multi-step-flows.md)** - Form and flow patterns
- **[Payment Integration](./architecture/patterns/payment-integration.md)** - Payment system patterns

#### Market Analysis
- **[Architecture](./architecture/market-analysis/architecture.md)** - Market analysis system design
- **[Implementation](./architecture/market-analysis/implementation.md)** - Implementation details
- **[Reference](./architecture/market-analysis/reference.md)** - Reference materials
- **[Recaps](./architecture/market-analysis/recaps/)** - Development recaps

### 🔧 [Troubleshooting](./troubleshooting/)
Debugging guides and issue resolution:

- **[Cache Reset Guide](./troubleshooting/cache-reset-guide.md)** - How to reset application cache
- **[NextAuth Issues](./troubleshooting/next-auth-issues)** - Common NextAuth problems and solutions

### 📖 [Reference](./reference/)
Schemas, types, and technical references:

- **[Example Schema](./reference/example-schema.md)** - Database schema examples
- **[Flow Configuration](./reference/flowconfig.md)** - Flow configuration reference
- **[Generic Output Types](./reference/generic-output-types.md)** - TypeScript type definitions
- **[Input Flow](./reference/input-flow.md)** - Input processing flow

### 📦 [Archive](./archive/)
Historical documentation and deprecated guides:

- API reorganization docs
- Old implementation ideas
- Legacy rules documentation
- SVG implementation strategies

### 📄 Other Files

- **[Instructions](./instructions.md)** - General project instructions
- **[Sample Input](./sample-input/)** - Example files for testing

---

## 🗂️ Folder Structure

```
docs/
├── README.md (this file)
├── setup/                    # Setup & installation guides
├── features/                 # Feature-specific documentation
│   ├── document-extraction/  # Document extraction system
│   ├── offers/               # Offers system
│   ├── onboarding/           # Onboarding flows
│   ├── rules/                # Rules system
│   └── deployment/           # Deployment guides
├── architecture/             # Architecture & design patterns
│   ├── patterns/             # Design patterns
│   └── market-analysis/      # Market analysis system
├── troubleshooting/          # Debugging guides
├── reference/                # Technical references
├── archive/                  # Historical docs
└── sample-input/             # Example files
```

---

## 🔍 Finding What You Need

### I want to...
- **Set up authentication** → [Setup: Sign-In Implementation](./setup/complete-signin-implementation.md)
- **Understand the architecture** → [Architecture Overview](./architecture/overview.md)
- **Implement a feature** → Check [Features](./features/) folder
- **Debug an issue** → Check [Troubleshooting](./troubleshooting/)
- **See code patterns** → Check [Architecture Patterns](./architecture/patterns/)
- **Find type definitions** → Check [Reference](./reference/)

---

## 📝 Contributing to Docs

When adding new documentation:

1. **Setup guides** → Add to `setup/`
2. **Feature docs** → Add to `features/[feature-name]/`
3. **Architecture docs** → Add to `architecture/`
4. **Troubleshooting** → Add to `troubleshooting/`
5. **Reference materials** → Add to `reference/`
6. **Deprecated docs** → Move to `archive/`

Update this README when adding new major sections!

---

## 🔗 Quick Links

- [Sign-In Setup Guide](./setup/complete-signin-implementation.md) - Most commonly needed
- [Architecture Overview](./architecture/overview.md) - System design
- [Document Extraction](./features/document-extraction/README.md) - Document processing
- [Offers System](./features/offers/phase-1/startHere.md) - Offer generation

---

*Last updated: 2024*

