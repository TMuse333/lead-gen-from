// components/dashboard/user/offers/editor/tabs/FeedbackTab.tsx
/**
 * Feedback Tab - Collect MVP feedback from users
 * Helps improve the product based on real user experience
 */

'use client';

import { useState } from 'react';
import {
  Send,
  MessageSquareHeart,
  Loader2,
  ThumbsUp,
  Lightbulb,
  Wrench,
  Clock,
  Sparkles,
  Heart,
} from 'lucide-react';

interface FeedbackRating {
  setupEasy: number | null; // 1-5
  setupTime: number | null; // 1-5
}

interface FeedbackData {
  ratings: FeedbackRating;
  ratingDetails: {
    setupEasyDetail: string;
    setupTimeDetail: string;
  };
  futureFeatures: string;
  improvements: string;
  favoriteFeature: string;
  additionalComments: string;
}

const INITIAL_FEEDBACK: FeedbackData = {
  ratings: {
    setupEasy: null,
    setupTime: null,
  },
  ratingDetails: {
    setupEasyDetail: '',
    setupTimeDetail: '',
  },
  futureFeatures: '',
  improvements: '',
  favoriteFeature: '',
  additionalComments: '',
};

// Question-specific rating options with descriptive language
const SETUP_EASY_OPTIONS = [
  { value: 1, label: 'Took a while to figure out', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
  { value: 2, label: 'Needed some guidance', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
  { value: 3, label: 'Figured it out eventually', color: 'text-lime-400 bg-lime-500/20 border-lime-500/30' },
  { value: 4, label: 'Pretty straightforward', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
  { value: 5, label: 'Got it right away!', color: 'text-green-400 bg-green-500/20 border-green-500/30' },
];

const SETUP_TIME_OPTIONS = [
  { value: 1, label: 'Felt like forever', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
  { value: 2, label: 'Longer than expected', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
  { value: 3, label: 'About what I expected', color: 'text-lime-400 bg-lime-500/20 border-lime-500/30' },
  { value: 4, label: 'Quicker than expected', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' },
  { value: 5, label: 'Super quick!', color: 'text-green-400 bg-green-500/20 border-green-500/30' },
];


export function FeedbackTab() {
  const [feedback, setFeedback] = useState<FeedbackData>(INITIAL_FEEDBACK);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (field: keyof FeedbackRating, value: number) => {
    setFeedback((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [field]: value },
    }));
  };

  const handleRatingDetailChange = (field: keyof FeedbackData['ratingDetails'], value: string) => {
    setFeedback((prev) => ({
      ...prev,
      ratingDetails: { ...prev.ratingDetails, [field]: value },
    }));
  };

  const handleTextChange = (field: keyof Omit<FeedbackData, 'ratings' | 'ratingDetails'>, value: string) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnyInput =
    feedback.ratings.setupEasy !== null ||
    feedback.ratings.setupTime !== null ||
    feedback.ratingDetails.setupEasyDetail.trim() ||
    feedback.ratingDetails.setupTimeDetail.trim() ||
    feedback.futureFeatures.trim() ||
    feedback.improvements.trim() ||
    feedback.favoriteFeature.trim() ||
    feedback.additionalComments.trim();

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <Heart className="h-10 w-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-3">
          Thank You for Your Feedback!
        </h2>
        <p className="text-slate-400 max-w-md mb-6">
          Your input helps us improve the product and build features that matter to you.
          We truly appreciate you taking the time!
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFeedback(INITIAL_FEEDBACK);
          }}
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          Submit more feedback
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 mb-4">
          <MessageSquareHeart className="h-8 w-8 text-pink-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          Help Us Improve
        </h2>
        <p className="text-slate-400">
          This is an MVP and your feedback shapes what we build next.
          Be honest - we can take it!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Rating Questions */}
      <div className="space-y-6">
        {/* Setup Easy */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-cyan-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">
                Was the setup process easy to understand?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Could you figure out what to do at each step?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {SETUP_EASY_OPTIONS.map((option) => {
              const isSelected = feedback.ratings.setupEasy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleRatingChange('setupEasy', option.value)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all text-sm font-medium
                    ${isSelected
                      ? option.color
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={feedback.ratingDetails.setupEasyDetail}
            onChange={(e) => handleRatingDetailChange('setupEasyDetail', e.target.value)}
            placeholder="Which part of setup made you feel this way? (optional)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        {/* Setup Time */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">
                Did the setup take a reasonable amount of time?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                How did the time investment feel?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {SETUP_TIME_OPTIONS.map((option) => {
              const isSelected = feedback.ratings.setupTime === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleRatingChange('setupTime', option.value)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all text-sm font-medium
                    ${isSelected
                      ? option.color
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={feedback.ratingDetails.setupTimeDetail}
            onChange={(e) => handleRatingDetailChange('setupTimeDetail', e.target.value)}
            placeholder="What took the most time? (optional)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

      </div>

      {/* Open-ended Questions */}
      <div className="space-y-6">
        {/* Favorite Feature */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <ThumbsUp className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">
                What's your favorite feature so far?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                What made you go "oh, that's nice!"?
              </p>
            </div>
          </div>
          <textarea
            value={feedback.favoriteFeature}
            onChange={(e) => handleTextChange('favoriteFeature', e.target.value)}
            placeholder="I really liked..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Improvements */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <Wrench className="h-5 w-5 text-orange-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">
                What could be better?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Confusing parts, frustrations, things that felt clunky
              </p>
            </div>
          </div>
          <textarea
            value={feedback.improvements}
            onChange={(e) => handleTextChange('improvements', e.target.value)}
            placeholder="It would be better if..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Future Features */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">
                What features would you love to see?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Dream big - what would make this a must-have tool?
              </p>
            </div>
          </div>
          <textarea
            value={feedback.futureFeatures}
            onChange={(e) => handleTextChange('futureFeatures', e.target.value)}
            placeholder="I wish it could..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Additional Comments */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start gap-3 mb-4">
            <MessageSquareHeart className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-slate-200">
                Anything else on your mind?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Rants, raves, random thoughts - all welcome
              </p>
            </div>
          </div>
          <textarea
            value={feedback.additionalComments}
            onChange={(e) => handleTextChange('additionalComments', e.target.value)}
            placeholder="Also, I wanted to mention..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSubmit}
          disabled={!hasAnyInput || isSubmitting}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all
            ${hasAnyInput && !isSubmitting
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-pink-500/25'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send Feedback
            </>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Your feedback is anonymous and helps us build a better product.
      </p>
    </div>
  );
}
