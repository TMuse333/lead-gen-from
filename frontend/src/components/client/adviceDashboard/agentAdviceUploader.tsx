'use client';
import { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';

export default function AgentAdviceUploader() {
  const [scenario, setScenario] = useState('');
  const [advice, setAdvice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [sellingReasons, setSellingReasons] = useState<string[]>([]);
  const [timelines, setTimelines] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Predefined options
  const PROPERTY_TYPE_OPTIONS = ['house', 'condo', 'townhouse', 'multi_unit'];
  const SELLING_REASON_OPTIONS = [
    'upsizing',
    'downsizing',
    'relocating',
    'investment',
    'lifestyle',
    'exploring',
  ];
  const TIMELINE_OPTIONS = ['0-3', '3-6', '6-12', 'exploring'];

  const handleSubmit = async () => {
    if (!scenario.trim() || !advice.trim()) {
      setStatus('❌ Please fill in both scenario and advice.');
      return;
    }

    setIsUploading(true);
    setStatus('⏳ Generating embedding and uploading...');

    try {
      const res = await axios.post('/api/add-agent-advice', {
        scenario: scenario.trim(),
        advice: advice.trim(),
        tags,
        propertyTypes,
        sellingReasons,
        timelines,
      });

      if (res.data.success) {
        setStatus('✅ Advice uploaded successfully!');
        // Reset form
        setScenario('');
        setAdvice('');
        setTags([]);
        setPropertyTypes([]);
        setSellingReasons([]);
        setTimelines([]);
        setNewTag('');
      } else {
        setStatus(`❌ Upload failed: ${res.data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleSelection = (
    value: string,
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (array.includes(value)) {
      setter(array.filter((v) => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg text-black">
      {/* Help button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 text-gray-600 hover:text-black transition"
      >
        <HelpCircle size={22} />
      </button>

      <h1 className="text-2xl font-bold mb-4">Add Your Expertise</h1>
      <p className="mb-6 text-gray-700">
        Share your advice for different seller situations. This will be used to personalize the
        AI-generated analysis for your leads.
      </p>

      {/* Scenario Input */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">
          Scenario / Situation
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="e.g., First-time seller worried about market timing"
          className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Describe the seller's situation or concern in one sentence
        </p>
      </div>

      {/* Advice Textarea */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">
          Your Advice
          <span className="text-red-500">*</span>
        </label>
        <textarea
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          placeholder="What would you tell this seller? Share your expertise, strategies, and guidance..."
          className="w-full border-2 border-gray-300 p-3 rounded-lg h-48 focus:border-blue-500 focus:outline-none resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          The more specific and detailed, the better! This will be woven into personalized analysis.
        </p>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag (e.g., timing, renovations, urgent)"
            className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={addTag}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Optional: Add keywords to help categorize this advice
        </p>
      </div>

      {/* When to Apply This Advice */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">When to use this advice?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select which situations this advice applies to (optional but recommended)
        </p>

        {/* Property Types */}
        <div className="mb-4">
          <p className="font-medium mb-2">Property Types:</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() => toggleSelection(type, propertyTypes, setPropertyTypes)}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  propertyTypes.includes(type)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Selling Reasons */}
        <div className="mb-4">
          <p className="font-medium mb-2">Selling Reasons:</p>
          <div className="flex flex-wrap gap-2">
            {SELLING_REASON_OPTIONS.map((reason) => (
              <button
                key={reason}
                onClick={() => toggleSelection(reason, sellingReasons, setSellingReasons)}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  sellingReasons.includes(reason)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {/* Timelines */}
        <div>
          <p className="font-medium mb-2">Timelines:</p>
          <div className="flex flex-wrap gap-2">
            {TIMELINE_OPTIONS.map((timeline) => (
              <button
                key={timeline}
                onClick={() => toggleSelection(timeline, timelines, setTimelines)}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  timelines.includes(timeline)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                }`}
              >
                {timeline === '0-3'
                  ? '0-3 months'
                  : timeline === '3-6'
                  ? '3-6 months'
                  : timeline === '6-12'
                  ? '6-12 months'
                  : 'exploring'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isUploading || !scenario.trim() || !advice.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
      >
        {isUploading ? '⏳ Uploading...' : '✅ Add Advice to Knowledge Base'}
      </button>

      {/* Status Message */}
      {status && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            status.includes('✅')
              ? 'bg-green-100 text-green-800'
              : status.includes('❌')
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {status}
        </div>
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-lg m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">How This Works</h2>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-black mb-1">🎯 What is this for?</h3>
                  <p className="text-sm">
                    This tool lets you add your expertise to the AI system. When sellers fill out
                    the form, the AI will find and use YOUR advice that's most relevant to their
                    situation.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-1">💡 What to write?</h3>
                  <p className="text-sm">
                    Think about common questions or concerns your clients have. Write the advice
                    you'd give them in person. Be specific, personal, and helpful.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-1">🔍 How it's used?</h3>
                  <p className="text-sm">
                    When a seller describes their situation, the AI searches through all your advice
                    and finds the 2-3 most relevant pieces. It then weaves your expertise into a
                    personalized analysis for that specific seller.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-black mb-1">📝 Examples:</h3>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>"First-time seller worried about timing"</li>
                    <li>"Empty nesters downsizing with emotional attachment"</li>
                    <li>"Investor looking to maximize rental property profit"</li>
                    <li>"Urgent sale needed within 3 months"</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}