"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Building2,
  MessageSquare,
  Brain,
  Gift,
  Database,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";

interface ClientConfig {
  id: string;
  userId: string;
  businessName: string;
  industry: string;
  selectedIntentions: string[];
  selectedOffers: string[];
  conversationFlowsCount: number;
  knowledgeBaseItemsCount: number;
  qdrantCollectionName: string;
  isActive: boolean;
  onboardingCompletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface FullClientConfig extends ClientConfig {
  conversationFlows?: Record<string, any>;
  customOffer?: string;
  dataCollection?: string[];
  knowledgeBaseItems?: Array<{
    id: string;
    title: string;
    advice: string;
    flows: string[];
    tags: string[];
    source: string;
  }>;
}

interface QdrantItem {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  flow: string[];
  conditions: Record<string, any>;
  source: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export default function AdminConfigsList() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<ClientConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<FullClientConfig | null>(null);
  const [fullConfigData, setFullConfigData] = useState<FullClientConfig | null>(null);
  const [qdrantItems, setQdrantItems] = useState<QdrantItem[]>([]);
  const [loadingFullConfig, setLoadingFullConfig] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    offers: boolean;
    qdrant: boolean;
    flows: boolean;
  }>({
    offers: false,
    qdrant: false,
    flows: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      fetchFullConfig(selectedConfig.id);
    }
  }, [selectedConfig]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/client-configs");
      
      if (!response.ok) {
        throw new Error("Failed to fetch configurations");
      }

      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (err) {
      console.error("Error fetching configs:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullConfig = async (configId: string) => {
    try {
      setLoadingFullConfig(true);
      setQdrantItems([]);
      setFullConfigData(null);

      // Fetch full config from MongoDB
      const configResponse = await fetch(`/api/admin/client-configs/${configId}`);
      if (!configResponse.ok) throw new Error("Failed to fetch config");
      const configData = await configResponse.json();
      setFullConfigData(configData.config);

      // Fetch Qdrant items if collection exists
      if (configData.config.qdrantCollectionName) {
        const qdrantResponse = await fetch(
          `/api/admin/qdrant-items?collection=${encodeURIComponent(configData.config.qdrantCollectionName)}`
        );
        if (qdrantResponse.ok) {
          const qdrantData = await qdrantResponse.json();
          setQdrantItems(qdrantData.items || []);
        }
      }
    } catch (err) {
      console.error("Error fetching full config:", err);
      setError(err instanceof Error ? err.message : "Failed to load details");
    } finally {
      setLoadingFullConfig(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (configId: string, businessName: string) => {
    try {
      setDeletingId(configId);
      setError(null);

      const response = await fetch(`/api/admin/client-configs/${configId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete configuration');
      }

      setConfigs((prev) => prev.filter((c) => c.id !== configId));
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null);
        setFullConfigData(null);
        setQdrantItems([]);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting config:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteConfirm = (config: ClientConfig) => {
    setDeleteConfirm({ id: config.id, name: config.businessName });
  };

  const toggleSection = (section: 'offers' | 'qdrant' | 'flows') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-cyan-200/70">Total Clients</span>
          </div>
          <p className="text-2xl font-bold text-cyan-200">{configs.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm text-cyan-200/70">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {configs.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-cyan-200/70">Total Flows</span>
          </div>
          <p className="text-2xl font-bold text-cyan-200">
            {configs.reduce((sum, c) => sum + c.conversationFlowsCount, 0)}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md rounded-lg border border-cyan-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            <span className="text-sm text-cyan-200/70">Knowledge Items</span>
          </div>
          <p className="text-2xl font-bold text-cyan-200">
            {configs.reduce((sum, c) => sum + c.knowledgeBaseItemsCount, 0)}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-cyan-200">Client Configurations</h2>
          <button
            onClick={fetchConfigs}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {configs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cyan-200/70">No client configurations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedConfig(config)}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-cyan-200">
                        {config.businessName}
                      </h3>
                      {config.isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm text-cyan-200/60 mb-3 capitalize">
                      {config.industry}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-cyan-200/80">
                          {config.conversationFlowsCount} Flow{config.conversationFlowsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-cyan-200/80">
                          {config.selectedOffers.length} Offer{config.selectedOffers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-cyan-200/80">
                          {config.knowledgeBaseItemsCount} KB Item{config.knowledgeBaseItemsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-cyan-400" />
                        <span className="text-xs text-cyan-200/60 font-mono truncate">
                          {config.qdrantCollectionName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-cyan-200/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Completed: {formatDate(config.onboardingCompletedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConfig(config);
                      }}
                      className="p-2 text-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirm(config);
                      }}
                      disabled={deletingId === config.id}
                      className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete Configuration"
                    >
                      {deletingId === config.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedConfig && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedConfig(null);
              setFullConfigData(null);
              setQdrantItems([]);
              setExpandedSections({ offers: false, qdrant: false, flows: false });
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-cyan-200">
                  {selectedConfig.businessName}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConfig(null);
                      openDeleteConfirm(selectedConfig);
                    }}
                    disabled={deletingId === selectedConfig.id}
                    className="p-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Configuration"
                  >
                    {deletingId === selectedConfig.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedConfig(null);
                      setFullConfigData(null);
                      setQdrantItems([]);
                      setExpandedSections({ offers: false, qdrant: false, flows: false });
                    }}
                    className="text-cyan-200/70 hover:text-cyan-200 p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {loadingFullConfig ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-200/70 mb-2">Industry</h4>
                      <p className="text-cyan-200 capitalize">{selectedConfig.industry}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-200/70 mb-2">Status</h4>
                      <div className="flex items-center gap-2">
                        {selectedConfig.isActive ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <span className="text-green-400">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Intentions */}
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-200/70 mb-2">Intentions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedConfig.selectedIntentions.map((intention) => (
                        <span
                          key={intention}
                          className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm capitalize"
                        >
                          {intention}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Offers - Expandable */}
                  <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                    <button
                      onClick={() => toggleSection('offers')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-cyan-400" />
                        <h4 className="text-lg font-semibold text-cyan-200">
                          Offers ({selectedConfig.selectedOffers.length})
                        </h4>
                      </div>
                      {expandedSections.offers ? (
                        <ChevronUp className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-cyan-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections.offers && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-3">
                            {selectedConfig.selectedOffers.map((offer) => (
                              <div
                                key={offer}
                                className="bg-slate-900/50 rounded-lg p-3 border border-slate-600"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Gift className="h-4 w-4 text-blue-400" />
                                  <span className="font-semibold text-cyan-200 capitalize">
                                    {offer.replace('-', ' ')}
                                  </span>
                                </div>
                                {fullConfigData?.customOffer && offer === 'custom' && (
                                  <p className="text-sm text-cyan-200/70 mt-2">
                                    {fullConfigData.customOffer}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Qdrant Knowledge Base - Expandable */}
                  <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                    <button
                      onClick={() => toggleSection('qdrant')}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-cyan-400" />
                        <h4 className="text-lg font-semibold text-cyan-200">
                          Qdrant Knowledge Base ({qdrantItems.length} items)
                        </h4>
                        <span className="text-xs text-cyan-200/50 font-mono">
                          {selectedConfig.qdrantCollectionName}
                        </span>
                      </div>
                      {expandedSections.qdrant ? (
                        <ChevronUp className="h-5 w-5 text-cyan-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-cyan-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections.qdrant && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-3 max-h-96 overflow-y-auto">
                            {qdrantItems.length === 0 ? (
                              <p className="text-cyan-200/70 text-sm">No items in Qdrant collection</p>
                            ) : (
                              qdrantItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-600"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-semibold text-cyan-200">{item.title}</h5>
                                    <span className="text-xs text-cyan-200/50 capitalize">
                                      {item.source}
                                    </span>
                                  </div>
                                  <p className="text-sm text-cyan-200/80 mb-3">{item.advice}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs"
                                      >
                                        <Tag className="h-3 w-3 inline mr-1" />
                                        {tag}
                                      </span>
                                    ))}
                                    {item.flow.length > 0 && (
                                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                        Flow: {item.flow.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Conversation Flows - Expandable */}
                  {fullConfigData?.conversationFlows && (
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                      <button
                        onClick={() => toggleSection('flows')}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-cyan-400" />
                          <h4 className="text-lg font-semibold text-cyan-200">
                            Conversation Flows ({Object.keys(fullConfigData.conversationFlows).length})
                          </h4>
                        </div>
                        {expandedSections.flows ? (
                          <ChevronUp className="h-5 w-5 text-cyan-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-cyan-400" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedSections.flows && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 space-y-3 max-h-96 overflow-y-auto">
                              {Object.entries(fullConfigData.conversationFlows).map(([flowType, flow]: [string, any]) => (
                                <div
                                  key={flowType}
                                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-600"
                                >
                                  <h5 className="font-semibold text-cyan-200 mb-2 capitalize">
                                    {flowType} Flow
                                  </h5>
                                  <p className="text-sm text-cyan-200/70 mb-3">
                                    {flow.questions?.length || 0} Questions
                                  </p>
                                  {flow.systemPrompt && (
                                    <details className="mt-2">
                                      <summary className="text-xs text-cyan-200/60 cursor-pointer">
                                        View System Prompt
                                      </summary>
                                      <p className="text-xs text-cyan-200/50 mt-2 p-2 bg-slate-800 rounded">
                                        {flow.systemPrompt}
                                      </p>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-200/70 mb-2">Timestamps</h4>
                    <div className="space-y-1 text-sm text-cyan-200/80">
                      <p>Completed: {formatDate(selectedConfig.onboardingCompletedAt)}</p>
                      <p>Created: {formatDate(selectedConfig.createdAt)}</p>
                      <p>Updated: {formatDate(selectedConfig.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  Delete Configuration?
                </h3>
                <p className="text-cyan-200/80 text-sm mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-cyan-200/70 text-sm space-y-1 list-disc list-inside mb-4">
                  <li>Configuration: <span className="font-semibold text-cyan-200">{deleteConfirm.name}</span></li>
                  <li>MongoDB document</li>
                  <li>Qdrant collection and all knowledge base items</li>
                </ul>
                <p className="text-red-300/80 text-sm font-medium">
                  This action cannot be undone!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-cyan-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.name)}
                disabled={deletingId === deleteConfirm.id}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deletingId === deleteConfirm.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

