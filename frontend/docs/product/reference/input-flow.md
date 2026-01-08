[User Input] 
    ↓
[Normalize Input] → BaseLeadContext
    ↓
[Parallel AI Modules]
    ├── MarketSummaryPrompt → marketSummary
    ├── PersonalizedAdvicePrompt → advice[]
    ├── ActionPlanPrompt → actions[]
    └── FlowSpecificPrompt → unique fields
    ↓
[Combine + Validate] → FlowAnalysisOutput