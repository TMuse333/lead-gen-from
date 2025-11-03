'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Home, TrendingUp, MessageSquare, ArrowRight, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface ValueEstimation {
  low: number;
  high: number;
  confidence: number;
  reasoning: string;
}

interface ComparableHome {
  id: string;
  address: string;
  city: string;
  propertyDetails: {
    type: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet?: number;
  };
  saleInfo: {
    soldPrice?: number;
    listPrice?: number;
    status: string;
  };
}

interface Analysis {
  estimatedValue: ValueEstimation;
  marketSummary: string;
  personalizedAdvice: string;
  recommendedActions: string[];
  comparablesSummary: string;
}

interface ResultsPageProps {
  analysis: Analysis;
  comparableHomes: ComparableHome[];
  userEmail: string;
}

export default function ResultsPage({ analysis, comparableHomes, userEmail }: ResultsPageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const agentInfo = {
    name: 'Chris Crowell',
    email: process.env.NEXT_PUBLIC_AGENT_EMAIL || 'agent@example.com',
    phone: '(902) 555-0123',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-green-500"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Analysis Complete!</h2>
              <p className="text-gray-600">
                We've sent a detailed report to <span className="font-semibold">{userEmail}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Estimated Value Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-xl p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Home size={32} />
            <h2 className="text-2xl font-bold">Estimated Property Value</h2>
          </div>
          <div className="text-center my-6">
            <div className="text-5xl font-bold mb-2">
              ${analysis.estimatedValue.low.toLocaleString()} - ${analysis.estimatedValue.high.toLocaleString()}
            </div>
            <div className="text-blue-100 text-lg">
              {Math.round(analysis.estimatedValue.confidence * 100)}% Confidence
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-blue-50">{analysis.estimatedValue.reasoning}</p>
          </div>
        </motion.div>

        {/* Market Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-blue-600" size={28} />
            <h3 className="text-xl font-bold text-gray-900">Current Market Conditions</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.marketSummary}</p>
        </motion.div>

        {/* Personalized Advice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="text-blue-600" size={28} />
            <h3 className="text-xl font-bold text-gray-900">Personalized Advice from {agentInfo.name}</h3>
          </div>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {analysis.personalizedAdvice}
          </div>
        </motion.div>

        {/* Recommended Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-green-500"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Next Steps</h3>
          <div className="space-y-3">
            {analysis.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1">{action}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Comparable Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-3">Similar Properties in Your Area</h3>
          <p className="text-gray-600 mb-4">{analysis.comparablesSummary}</p>
          
          <div className="grid gap-4">
            {comparableHomes.slice(0, 3).map((comp) => (
              <div
                key={comp.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{comp.address}</h4>
                    <p className="text-gray-600 text-sm">
                      {comp.propertyDetails.type} • {comp.propertyDetails.bedrooms} bed • {comp.propertyDetails.bathrooms} bath
                      {comp.propertyDetails.squareFeet && ` • ${comp.propertyDetails.squareFeet.toLocaleString()} sqft`}
                    </p>
                  </div>
                  <div className="text-right">
                    {comp.saleInfo.soldPrice ? (
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          ${comp.saleInfo.soldPrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Sold</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          ${comp.saleInfo.listPrice?.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Listed</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Take the Next Step?</h3>
          <p className="text-gray-600 mb-6">
            Let's discuss your unique situation and create a customized selling strategy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${agentInfo.phone}`}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg"
            >
              <Phone size={20} />
              Call {agentInfo.phone}
            </a>
            <a
              href={`mailto:${agentInfo.email}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold border-2 border-blue-600 shadow-lg"
            >
              <Mail size={20} />
              Email Me
            </a>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-500">
              A detailed copy of this analysis has been sent to your email.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} {agentInfo.name}. All rights reserved.</p>
          <p className="mt-2">
            This analysis was generated using AI and current market data. For a detailed, in-person assessment, please contact {agentInfo.name}.
          </p>
        </div>
      </div>
    </div>
  );
}