#!/bin/bash

# Docs Reorganization Script
# Separates Terminal 2 meta-docs from product docs

echo "🔄 Starting docs reorganization..."

# Create new structure
echo "📁 Creating new directory structure..."
mkdir -p docs/meta/{tracking,patterns,decisions,metrics}
mkdir -p docs/product/{architecture,features,setup,integrations,reference,troubleshooting,flow-diagrams,planning,archive}

# ============================================
# TERMINAL 2 (META) DOCS
# ============================================

echo "📊 Moving Terminal 2 meta-docs to docs/meta/..."

# Move tracking (already exists, just verify)
if [ -d "docs/tracking" ]; then
  echo "  ✓ docs/tracking already in place"
  mv docs/tracking/* docs/meta/tracking/ 2>/dev/null || true
  rm -rf docs/tracking
fi

# Move patterns (already exists)
if [ -d "docs/patterns" ]; then
  echo "  ✓ Moving patterns/"
  mv docs/patterns/* docs/meta/patterns/ 2>/dev/null || true
  rm -rf docs/patterns
fi

# Move decision docs
echo "  ✓ Moving decision documents..."
[ -f "docs/DECISION_PROCESS_INFORMATION_THEORY.md" ] && mv docs/DECISION_PROCESS_INFORMATION_THEORY.md docs/meta/decisions/

# ============================================
# PRODUCT DOCS
# ============================================

echo "📱 Moving product docs to docs/product/..."

# Move architecture
if [ -d "docs/architecture" ]; then
  echo "  ✓ Moving architecture/"
  mv docs/architecture/* docs/product/architecture/ 2>/dev/null || true
  rm -rf docs/architecture
fi

# Move features
if [ -d "docs/features" ]; then
  echo "  ✓ Moving features/"
  mv docs/features/* docs/product/features/ 2>/dev/null || true
  rm -rf docs/features
fi

# Move setup
if [ -d "docs/setup" ]; then
  echo "  ✓ Moving setup/"
  mv docs/setup/* docs/product/setup/ 2>/dev/null || true
  rm -rf docs/setup
fi

# Move reference
if [ -d "docs/reference" ]; then
  echo "  ✓ Moving reference/"
  mv docs/reference/* docs/product/reference/ 2>/dev/null || true
  rm -rf docs/reference
fi

# Move troubleshooting
if [ -d "docs/troubleshooting" ]; then
  echo "  ✓ Moving troubleshooting/"
  mv docs/troubleshooting/* docs/product/troubleshooting/ 2>/dev/null || true
  rm -rf docs/troubleshooting
fi

# Move flow-diagrams
if [ -d "docs/flow-diagrams" ]; then
  echo "  ✓ Moving flow-diagrams/"
  mv docs/flow-diagrams/* docs/product/flow-diagrams/ 2>/dev/null || true
  rm -rf docs/flow-diagrams
fi

# Move planning docs
echo "  ✓ Moving planning docs..."
[ -f "docs/MVP_TIMELINE_PLAN.md" ] && mv docs/MVP_TIMELINE_PLAN.md docs/product/planning/
if [ -d "docs/plans" ]; then
  mv docs/plans/* docs/product/planning/ 2>/dev/null || true
  rm -rf docs/plans
fi

# Move integrations
echo "  ✓ Moving integration docs..."
[ -f "docs/qdrant-implementation-guide.md" ] && mv docs/qdrant-implementation-guide.md docs/product/integrations/
[ -f "docs/qdrant-integration.md" ] && mv docs/qdrant-integration.md docs/product/integrations/

# Move archive
if [ -d "docs/archive" ]; then
  echo "  ✓ Moving archive/"
  mv docs/archive/* docs/product/archive/ 2>/dev/null || true
  rm -rf docs/archive
fi

# Move sample-input (keep at root or move to product?)
if [ -d "docs/sample-input" ]; then
  echo "  ✓ Moving sample-input to product/"
  mv docs/sample-input docs/product/
fi

# ============================================
# CREATE README FILES
# ============================================

echo "📝 Creating README files..."

# Meta README
cat > docs/meta/README.md << 'EOF'
# Terminal 2: Meta-Documentation

**Purpose**: Information theory tracking, pattern extraction, and architectural decision documentation.

**Maintained by**: Terminal 2 (Tracker Claude)

---

## Directory Structure

- **`tracking/`** - Session logs and checkpoints from development
  - `sessions/` - Detailed session analysis with IT metrics
  - `checkpoints/` - Checkpoint files from Terminal 1

- **`patterns/`** - Reusable patterns extracted from development
  - Analyzed through information theory lens
  - Include when to use, examples, and IT principles

- **`decisions/`** - Major architectural decisions
  - Why decisions were made (not just what)
  - Information theory rationale
  - Trade-off analysis

- **`metrics/`** - System metrics over time
  - Entropy reduction tracking
  - System score history
  - Complexity metrics

---

## Key Files

- **`context.md`** - Terminal 2 operational context (roles, patterns, system assessment)

---

## Information Theory Scoring

**Current System Score**: 9.2/10 (as of 2026-01-06)

See `tracking/sessions/` for detailed analysis of improvements over time.

---

**Note**: This documentation is meta-level (about the development process), not product documentation. For app/product docs, see `docs/product/`.
EOF

# Product README
cat > docs/product/README.md << 'EOF'
# Lead Generation Platform - Product Documentation

**Purpose**: Documentation for the information theory-driven lead generation platform.

---

## Quick Links

- **[Architecture Overview](architecture/intent-based-offers.md)** - System design and data flow
- **[Getting Started](setup/quickstart.md)** - Setup and deployment
- **[Feature Docs](features/)** - Detailed feature documentation
- **[Troubleshooting](troubleshooting/)** - Common issues and solutions

---

## Directory Structure

- **`architecture/`** - System architecture and design
- **`features/`** - Feature-specific documentation
- **`setup/`** - Getting started guides
- **`integrations/`** - Third-party service integrations
- **`reference/`** - API and component reference
- **`troubleshooting/`** - Common issues and solutions
- **`flow-diagrams/`** - Visual system diagrams
- **`planning/`** - Active planning documents and roadmap
- **`archive/`** - Historical/obsolete documentation

---

## Core Concepts

### Information Theory-Driven Design

This platform treats lead generation as an **entropy reduction system**:

- **Entropy (H)**: Measure of uncertainty about a prospect
- **Information Gain (I)**: Reduction in uncertainty from each question
- **Signal-to-Noise Ratio**: Quality signal vs irrelevant noise
- **Compression**: Simplifying complex data while preserving meaning

### Intent-Based Offers

The system uses **intent classification** (buy/sell/browse) to filter applicable offers, which are **self-contained entities** that own their questions and generation logic.

See [Architecture: Intent-Based Offers](architecture/intent-based-offers.md) for details.

---

## For Developers

- Start with [Setup Guide](setup/)
- Review [Architecture Docs](architecture/)
- Check [Reference](reference/) for APIs
- See [Troubleshooting](troubleshooting/) when stuck

## For Product/Business

- See [Features](features/) for capabilities
- Review [Planning](planning/) for roadmap
- Check [Flow Diagrams](flow-diagrams/) for visual overview

---

**Note**: For meta-documentation about the development process and information theory analysis, see `docs/meta/`.
EOF

echo "✅ Reorganization complete!"
echo ""
echo "New structure:"
echo "  docs/meta/     - Terminal 2 meta-docs"
echo "  docs/product/  - App/product docs"
echo ""
echo "📖 Created README files in both directories"
echo ""
echo "Next steps:"
echo "  1. Review the new structure: ls -la docs/"
echo "  2. Update any hardcoded paths in code/docs"
echo "  3. Git add and commit the reorganization"
