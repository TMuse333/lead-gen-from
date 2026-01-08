# Dual Claude Development Workflow

**Information Theory-Driven Development**
*Track patterns • Document learnings • Build smarter*

## Overview

This document outlines the dual-terminal Claude workflow designed to capture development patterns, document learnings in real-time, and reduce entropy in the development process.

---

## System Architecture

### Terminal 1: Development Claude (Active)
**Purpose**: Execute development tasks, build features, fix bugs

**Activities**:
- Write/modify code
- Run builds and tests
- Debug issues
- Implement features
- Provide checkpoints when substantial work is done

**Checkpoint Triggers**:
- Major feature completion
- Bug fix with interesting pattern
- New architectural decision
- Every 3-4 substantial changes
- Before context switching

**Example Checkpoint**:
```
💡 Tracker Checkpoint: Hybrid layout implementation complete

Suggested prompt for Terminal 2:
"Analyze the mobile responsive pattern we just implemented.
Document why collapsible panels didn't work and what we used instead."
```

---

### Terminal 2: Tracker Claude (Observer/Documenter)
**Purpose**: Analyze development sessions, extract patterns, document learnings

**Activities**:
1. **Session Analysis**: Review what was built/changed
2. **Pattern Detection**: Identify recurring solutions
3. **Success/Failure Documentation**: Track what worked vs what didn't
4. **Architecture Documentation**: Update system docs
5. **Learning Extraction**: Create reusable patterns

**Key Documents Maintained**:
- `docs/patterns/` - Reusable code patterns
- `docs/architecture/` - System design decisions
- `docs/tracking/sessions/` - Session logs
- `docs/troubleshooting/` - Common issues & solutions

---

## Workflow Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT CYCLE                         │
└─────────────────────────────────────────────────────────────┘

Terminal 1 (Dev)                    Terminal 2 (Tracker)
─────────────────                   ────────────────────

1. Build Feature
   │
   ├── Write code
   ├── Test & debug
   ├── Iterate
   │
2. Checkpoint Reached ──────────────→ 3. Analyze Changes
   │                                   │
   │                                   ├── Read modified files
   │                                   ├── Extract patterns
   │                                   ├── Document decisions
   │                                   │
4. Continue Development ←──────────── 5. Update Docs
                                      │
                                      ├── Create pattern doc
                                      ├── Update architecture
                                      └── Log session notes
```

---

## Information Theory Principles

### 1. Entropy Reduction
**Problem**: Knowledge is lost between sessions, patterns aren't captured
**Solution**: Real-time documentation of decisions and patterns

### 2. Signal vs Noise
**Problem**: Too much code, hard to find patterns
**Solution**: Tracker extracts signals (what worked) from noise (what didn't)

### 3. Pattern Recognition
**Problem**: Reinventing solutions for similar problems
**Solution**: Build pattern library from actual development

### 4. Knowledge Compression
**Problem**: Complex codebases are hard to understand
**Solution**: Distill into architecture docs and decision records

---

## Terminal 2 Analysis Framework

When prompted with a checkpoint, Terminal 2 should:

### Step 1: Change Analysis
```bash
# Read the modified files
Read file1.tsx, file2.ts

# Understand what changed
- What was added?
- What was removed?
- What was refactored?
```

### Step 2: Pattern Extraction
```
Identify:
- New patterns introduced
- Existing patterns used
- Anti-patterns avoided
```

### Step 3: Decision Documentation
```
Document WHY:
- Why this approach?
- What alternatives were considered?
- What didn't work?
- What constraints existed?
```

### Step 4: Classification
```
Categorize the work:
□ New Feature Pattern
□ Bug Fix Pattern
□ Performance Optimization
□ UX Improvement
□ Architecture Decision
□ Integration Pattern
```

### Step 5: Documentation Update
```
Update relevant docs:
- Add to patterns/
- Update architecture/
- Create troubleshooting entry if needed
- Log in session tracker
```

---

## Example Session

### Checkpoint from Terminal 1:
```
💡 Tracker Checkpoint: Mobile layout optimization complete

Changes:
- ValuePreviewPanel.tsx (mobile responsive)
- Changed from collapsible panel to compact sticky bar
- Reduced mobile screen usage from 75% to ~10%

Context:
- Desktop shows full sidebar
- Mobile was unusable with expanded panel
- Solution: Compact horizontal progress dots
```

### Terminal 2 Response:
1. **Read Files**: ValuePreviewPanel.tsx
2. **Extract Pattern**: "Mobile Compact Pattern"
3. **Document Decision**:
   - ❌ What didn't work: Collapsible panels on mobile (too much space)
   - ✅ What worked: Sticky compact bar with horizontal dots
   - 💡 Pattern: When mobile space is limited, use horizontal compact layouts with icons instead of vertical expanded lists
4. **Create Document**: `docs/patterns/mobile-compact-layouts.md`
5. **Update**: `docs/architecture/responsive-design-strategy.md`

---

## Output Structure

Terminal 2 maintains this structure:

```
docs/
├── patterns/
│   ├── mobile-compact-layouts.md
│   ├── modal-driven-ux.md
│   ├── full-screen-iframe-pattern.md
│   └── ...
├── architecture/
│   ├── responsive-design-strategy.md
│   ├── state-management.md
│   └── ...
├── tracking/
│   └── sessions/
│       ├── 2026-01-05-hybrid-layout.md
│       ├── 2026-01-05-mobile-optimization.md
│       └── ...
└── troubleshooting/
    ├── build-errors.md
    ├── typescript-issues.md
    └── ...
```

---

## Benefits

### For Current Development
- **Faster debugging**: Documented solutions to common issues
- **Consistent patterns**: Reusable solutions reduce decision fatigue
- **Better handoffs**: Clear documentation of "why"

### For Future Development
- **Onboarding**: New developers understand patterns quickly
- **Maintenance**: Know why things were built a certain way
- **Refactoring**: Documented trade-offs help inform changes

### For Learning
- **Pattern library**: Build personal/team knowledge base
- **Success metrics**: Track what actually works
- **Avoid repetition**: Don't make same mistakes twice

---

## Getting Started

### 1. Open Terminal 2
```bash
claude-code
```

### 2. Initial Setup Prompt
```
I am Terminal 2 - the Tracker Claude. My role is to analyze development
sessions from Terminal 1 and maintain pattern documentation.

When given a checkpoint, I will:
1. Read the changed files
2. Extract patterns and decisions
3. Document what worked vs what didn't
4. Update relevant documentation
5. Create new pattern docs as needed

I maintain docs in:
- docs/patterns/
- docs/architecture/
- docs/tracking/sessions/
- docs/troubleshooting/

Ready to track development patterns.
```

### 3. Wait for Checkpoints
Terminal 1 will provide checkpoints with context about what was built.

---

## Best Practices

### For Terminal 1 (Development)
- ✅ Provide clear checkpoint context
- ✅ Include WHY decisions were made
- ✅ Mention what didn't work
- ✅ Checkpoint after substantial changes
- ❌ Don't checkpoint trivial changes

### For Terminal 2 (Tracker)
- ✅ Ask clarifying questions if needed
- ✅ Extract reusable patterns
- ✅ Document trade-offs
- ✅ Keep docs concise and actionable
- ❌ Don't just summarize - extract insights

---

## Metrics to Track

Terminal 2 can maintain a session log with:
- Features implemented
- Patterns discovered
- Problems solved
- Time to solution (before vs after pattern exists)
- Reuse count (how many times pattern was referenced)

---

## Future Enhancements

### Phase 1 (Current)
- Manual checkpoints from Terminal 1
- File-based documentation
- Pattern extraction

### Phase 2 (Future)
- Automated git hook triggers
- Pattern similarity detection
- Cross-session pattern analysis

### Phase 3 (Advanced)
- MCP server for shared state
- Real-time pattern suggestion
- AI-driven refactoring recommendations based on patterns

---

**Status**: Active
**Last Updated**: 2026-01-05
**Next Review**: After 10 tracked sessions
