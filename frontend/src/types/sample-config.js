"use strict";
// ============================================
// DEFAULT & SAMPLE CONFIG
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_QUESTIONS = exports.DEFAULT_FORM_CONFIG = void 0;
exports.DEFAULT_FORM_CONFIG = {
    name: "Seller Lead Form - Halifax",
    targetArea: "Halifax Regional Municipality",
    emailCaptureAfter: 6,
    branding: {
        primaryColor: "#2563eb",
        secondaryColor: "#10b981",
        agentName: "Your Agent Name",
    },
    resultConfig: {
        showComparableHomes: true,
        showMarketTrends: true,
        showAgentAdvice: true,
        showEstimatedValue: true,
        emailReportSubject: "Your Personalized Home Value Analysis",
    },
    isActive: true,
};
exports.SAMPLE_QUESTIONS = [ /* ... same as original ... */];
// (Keep full array here or move to a separate file if too large)
