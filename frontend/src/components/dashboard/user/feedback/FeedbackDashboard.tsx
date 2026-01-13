// components/dashboard/user/feedback/FeedbackDashboard.tsx
/**
 * Feedback Dashboard - Main dashboard section for MVP feedback collection
 */

'use client';

import { FeedbackTab } from '../offers/editor/tabs/FeedbackTab';

export default function FeedbackDashboard() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <FeedbackTab />
      </div>
    </div>
  );
}
