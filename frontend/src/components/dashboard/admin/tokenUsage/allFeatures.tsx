'use client';

import { 
  Sparkles,
  MessageSquare,
  Brain,
  FileText,
  Zap,
  Target,
  Mic,
  BookOpen,
  Settings,
  Code
} from 'lucide-react';

interface FeatureInfo {
  id: string;
  name: string;
  description: string;
  category: 'chat' | 'generation' | 'embeddings' | 'rules' | 'onboarding';
  icon: any;
  models: string[];
}

const ALL_FEATURES: FeatureInfo[] = [
  {
    id: 'embeddings.adviceUpload',
    name: 'Advice Upload Embeddings',
    description: 'Generates embeddings for user-uploaded advice/knowledge base items',
    category: 'embeddings',
    icon: Brain,
    models: ['text-embedding-3-small'],
  },
  {
    id: 'embeddings.userQuery',
    name: 'User Query Embeddings',
    description: 'Generates embeddings for user queries to search Qdrant vector database',
    category: 'embeddings',
    icon: Brain,
    models: ['text-embedding-ada-002'],
  },
  {
    id: 'chat.intentClassification',
    name: 'Intent Classification',
    description: 'Analyzes user messages to classify intent (clarification, objection, answer, etc.)',
    category: 'chat',
    icon: MessageSquare,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'chat.replyGeneration',
    name: 'Reply Generation',
    description: 'Generates warm, natural replies to user answers during conversation',
    category: 'chat',
    icon: MessageSquare,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'chat.answerExtraction',
    name: 'Answer Extraction',
    description: 'Extracts structured answers from user input using function calling',
    category: 'chat',
    icon: Code,
    models: ['gpt-4o'],
  },
  {
    id: 'chat.instantReaction',
    name: 'Instant Reaction',
    description: 'Generates instant reactions/feedback based on user answers',
    category: 'chat',
    icon: Zap,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'offerGeneration',
    name: 'Offer Generation',
    description: 'Generates personalized offers/reports based on user conversation and Qdrant retrieval',
    category: 'generation',
    icon: Sparkles,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'rulesGeneration',
    name: 'Rules Generation',
    description: 'AI-generated rule recommendations based on user flows and fields',
    category: 'rules',
    icon: Target,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'rulesTranslation',
    name: 'Rules Translation',
    description: 'Translates natural language rule descriptions into structured rule groups',
    category: 'rules',
    icon: Target,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'voiceScriptGeneration',
    name: 'Voice Script Generation',
    description: 'Generates questions for voice script/recording uploads',
    category: 'onboarding',
    icon: Mic,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'onboarding.generateQuestions',
    name: 'Onboarding Questions Generation',
    description: 'Generates advice questions during onboarding based on business info',
    category: 'onboarding',
    icon: BookOpen,
    models: ['gpt-4o-mini'],
  },
  {
    id: 'onboarding.generateFlow',
    name: 'Onboarding Flow Generation',
    description: 'Generates conversation flows during onboarding setup',
    category: 'onboarding',
    icon: Settings,
    models: ['gpt-4o-mini'],
  },
];

const CATEGORY_COLORS = {
  chat: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  generation: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
  embeddings: 'bg-green-500/20 border-green-500/50 text-green-200',
  rules: 'bg-orange-500/20 border-orange-500/50 text-orange-200',
  onboarding: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
};

const CATEGORY_LABELS = {
  chat: 'Chat & Conversation',
  generation: 'Content Generation',
  embeddings: 'Embeddings & Search',
  rules: 'Rules & Logic',
  onboarding: 'Onboarding & Setup',
};

export default function AllFeatures() {
  const featuresByCategory = ALL_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureInfo[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-cyan-200 mb-2">All LLM Features</h2>
        <p className="text-cyan-200/70">
          Complete list of all LLM-powered features available in the SaaS platform
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20">
          <div className="text-sm text-cyan-200/70 mb-1">Total Features</div>
          <div className="text-2xl font-bold text-cyan-200">{ALL_FEATURES.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20">
          <div className="text-sm text-cyan-200/70 mb-1">Categories</div>
          <div className="text-2xl font-bold text-cyan-200">{Object.keys(featuresByCategory).length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20">
          <div className="text-sm text-cyan-200/70 mb-1">Unique Models</div>
          <div className="text-2xl font-bold text-cyan-200">
            {new Set(ALL_FEATURES.flatMap(f => f.models)).size}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20">
          <div className="text-sm text-cyan-200/70 mb-1">API Types</div>
          <div className="text-2xl font-bold text-cyan-200">
            {new Set([
              ...ALL_FEATURES.filter(f => f.category === 'chat' || f.category === 'generation' || f.category === 'rules' || f.category === 'onboarding').map(() => 'chat'),
              ...ALL_FEATURES.filter(f => f.category === 'embeddings').map(() => 'embedding'),
            ]).size}
          </div>
        </div>
      </div>

      {/* Features by Category */}
      <div className="space-y-6">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg mb-4 ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}>
              <span className="text-sm font-semibold">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </span>
              <span className="text-xs opacity-70">({features.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="bg-white/5 rounded-lg p-4 border border-cyan-500/10 hover:border-cyan-500/30 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-cyan-200 mb-1">{feature.name}</h3>
                        <p className="text-sm text-cyan-200/70 mb-3">{feature.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.models.map((model) => (
                            <span
                              key={model}
                              className="px-2 py-1 bg-cyan-500/10 text-cyan-300 text-xs rounded font-mono"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2">
                          <span className="text-xs text-cyan-200/50 font-mono">
                            {feature.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Models Used */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-cyan-500/20">
        <h3 className="text-lg font-bold text-cyan-200 mb-4">Models Used</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(ALL_FEATURES.flatMap(f => f.models))).map((model) => {
            const featuresUsingModel = ALL_FEATURES.filter(f => f.models.includes(model));
            return (
              <div
                key={model}
                className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
              >
                <div className="font-mono text-cyan-300 font-semibold">{model}</div>
                <div className="text-xs text-cyan-200/50 mt-1">
                  {featuresUsingModel.length} feature{featuresUsingModel.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

