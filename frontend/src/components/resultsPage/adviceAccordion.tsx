import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function AdviceAccordion({ 
  advice, 
  agentName 
}: { 
  advice: string; 
  agentName: string 
}) {
  const [open, setOpen] = useState(false);
  
  // Split into paragraphs and extract key points
  const paragraphs = advice.split('\n\n').filter(p => p.trim());
  
  // Get first paragraph as preview
  const preview = paragraphs[0]?.substring(0, 120) + '...';
  
  // Extract sentences that look like actionable advice (contain "should", "consider", "recommend")
  const keyPoints = paragraphs
    .flatMap(p => p.split(/[.!?]+/))
    .filter(s => 
      s.trim().length > 20 && 
      (s.toLowerCase().includes('should') || 
       s.toLowerCase().includes('consider') || 
       s.toLowerCase().includes('recommend') ||
       s.toLowerCase().includes('important'))
    )
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden mb-6"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 flex-1">
          <MessageSquare className="text-blue-600 flex-shrink-0" size={28} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Personalized Advice from {agentName}
            </h3>
            {!open && (
              <p className="text-sm text-gray-600 line-clamp-1">
                {preview}
              </p>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`transition-transform flex-shrink-0 text-gray-400 ${open ? 'rotate-180' : ''}`} 
          size={24}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-6">
              
              {/* Key Takeaways */}
              {keyPoints.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="text-blue-600" size={18} />
                    <h4 className="font-semibold text-blue-900">Key Takeaways</h4>
                  </div>
                  <ul className="space-y-2">
                    {keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                        <span className="text-blue-600 font-bold mt-0.5">•</span>
                        <span>{point.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Advice */}
              <div className="space-y-4">
                {paragraphs.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {/* Bold first sentence */}
                      <span className="font-semibold">
                        {p.split(/[.!?]/)[0]}.
                      </span>
                      {p.substring(p.indexOf('.') + 1)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}