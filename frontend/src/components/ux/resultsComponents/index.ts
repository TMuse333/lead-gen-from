// Export schemas
export * from './herobanner/';  // ✅ Already correct
export * from './personalMessage/';  // ✅ Already correct
export * from './profileSummary/';  // ✅ Already correct
export * from './actionPlan/';  // ⚠️ Change from 'component' to 'schema'
export * from './marketAnalysis/';  // ✅ Already correct
export * from './nextStepsCta/';  // ✅ Already correct

// Also export components if needed
