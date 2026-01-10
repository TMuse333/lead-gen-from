// src/components/dashboard/user/knowledgeBase/StoriesDashboard.tsx
/**
 * Stories Dashboard
 *
 * Central hub for managing client stories:
 * - View all stories (unassigned and assigned)
 * - Upload new stories
 * - Manage placements (assign to offers/phases)
 * - Edit and delete stories
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  MapPin,
  Pencil,
  Calendar,
  FileText,
  BarChart3,
  Inbox,
  CheckCircle2,
  Wand2,
  Heart,
  Zap,
  Users,
  ArrowRight,
  Star,
  X,
  ChevronLeft,
} from 'lucide-react';
import StoryUploader from './StoryUploader';
import StoryPlacementManager from './StoryPlacementManager';
import { StoryImpactIntro, StoryBridge } from '@/components/svg/stories';

interface Story {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  kind: 'story';
  placements?: Record<string, string[]>;
  createdAt?: string;
}

const OFFER_LABELS: Record<string, string> = {
  'real-estate-timeline': 'Timeline',
  pdf: 'PDF',
  video: 'Video',
  'home-estimate': 'Home Estimate',
};

const OFFER_ICONS: Record<string, React.ReactNode> = {
  'real-estate-timeline': <Calendar className="w-3 h-3" />,
  pdf: <FileText className="w-3 h-3" />,
  video: <FileText className="w-3 h-3" />,
  'home-estimate': <BarChart3 className="w-3 h-3" />,
};

export default function StoriesDashboard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'unassigned' | 'assigned'>('all');

  // Modal states
  const [showUploader, setShowUploader] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [placementStory, setPlacementStory] = useState<Story | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [populateResult, setPopulateResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Intro slideshow state
  const [showIntro, setShowIntro] = useState(false);
  const [introStep, setIntroStep] = useState(1);
  const TOTAL_INTRO_STEPS = 4;

  // Check if user has seen intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('stories-intro-seen');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  const handleCloseIntro = () => {
    localStorage.setItem('stories-intro-seen', 'true');
    setShowIntro(false);
    setIntroStep(1);
  };

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent-advice/get');
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      const allItems = data.advice || [];

      // Filter for stories only
      const storiesOnly = allItems.filter((item: Story) => item.kind === 'story');
      setStories(storiesOnly);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const toggleExpanded = (id: string) => {
    setExpandedStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agent-advice/get?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      fetchStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handlePopulateSampleStories = async () => {
    setIsPopulating(true);
    setPopulateResult(null);
    try {
      const response = await fetch('/api/agent-advice/populate-sample-stories', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to populate stories');
      }

      setPopulateResult({ message: data.message, type: 'success' });
      fetchStories();

      // Clear success message after 5 seconds
      setTimeout(() => setPopulateResult(null), 5000);
    } catch (err) {
      setPopulateResult({
        message: err instanceof Error ? err.message : 'Failed to populate stories',
        type: 'error',
      });
    } finally {
      setIsPopulating(false);
    }
  };

  // Parse story content
  const parseStoryContent = (advice: string) => {
    if (!advice.includes('[CLIENT STORY]')) {
      return { raw: advice };
    }

    const lines = advice.split('\n');
    let situation = '';
    let whatIDid = '';
    let outcome = '';

    for (const line of lines) {
      if (line.startsWith('Situation:')) {
        situation = line.replace('Situation:', '').trim();
      } else if (line.startsWith('What I did:')) {
        whatIDid = line.replace('What I did:', '').trim();
      } else if (line.startsWith('Outcome:')) {
        outcome = line.replace('Outcome:', '').trim();
      }
    }

    return { situation, whatIDid, outcome };
  };

  // Check if story has placements
  const hasPlacement = (story: Story) => {
    if (!story.placements) return false;
    return Object.keys(story.placements).some(
      (key) => story.placements![key] && story.placements![key].length > 0
    );
  };

  // Filter and group stories
  const filteredStories = stories.filter((story) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches =
        story.title.toLowerCase().includes(query) ||
        story.advice.toLowerCase().includes(query) ||
        story.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matches) return false;
    }

    // View mode filter
    if (viewMode === 'unassigned') return !hasPlacement(story);
    if (viewMode === 'assigned') return hasPlacement(story);
    return true;
  });

  const unassignedCount = stories.filter((s) => !hasPlacement(s)).length;
  const assignedCount = stories.filter((s) => hasPlacement(s)).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Why Stories Matter Banner */}
      <div className="mb-8 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-xl border border-amber-500/30 p-6">
        <div className="flex items-start gap-4">
          {/* StoryBridge SVG */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <StoryBridge className="scale-[0.65]" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Stories Are What Make This Work</h2>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              When a lead sees that you helped someone <span className="text-amber-300 font-medium">just like them</span>,
              trust happens instantly. Your stories bridge the gap between "stranger" and "trusted advisor."
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowIntro(true)}
                className="text-sm text-amber-400 hover:text-amber-300 underline underline-offset-2"
              >
                Learn why stories matter →
              </button>
              <span className="text-slate-500 text-sm">|</span>
              <span className="text-slate-400 text-sm">
                Aim for <span className="text-amber-300 font-medium">3-5 stories</span> per flow (buy/sell/browse)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Heart className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Client Stories</h1>
            <p className="text-slate-400 mt-1">
              Real experiences that build trust and convert leads
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStories}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePopulateSampleStories}
            disabled={isPopulating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            title="Add sample real estate stories for testing"
          >
            {isPopulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isPopulating ? 'Adding...' : 'Auto-Populate'}
          </button>
          <button
            onClick={() => {
              setEditingStory(null);
              setShowUploader(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Story
          </button>
        </div>
      </div>

      {/* Populate Result Message */}
      {populateResult && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            populateResult.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {populateResult.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{populateResult.message}</span>
          </div>
        </div>
      )}

      {/* Stats & Filters */}
      <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold text-amber-400">{stories.length}</div>
            <div className="text-sm text-slate-400">Total Stories</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-xl font-bold text-slate-300">{assignedCount}</div>
            <div className="text-sm text-slate-500">Assigned</div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-500">{unassignedCount}</div>
            <div className="text-sm text-slate-500">Unassigned</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'unassigned', label: 'Unassigned' },
            { id: 'assigned', label: 'Assigned' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                viewMode === mode.id
                  ? 'bg-slate-600 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stories by title, content, or tags..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && stories.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No stories yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Share your client experiences to build trust and connection.
            Stories help potential clients relate to real situations.
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
          >
            Add Your First Story
          </button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && stories.length > 0 && filteredStories.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700">
          <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No stories match your search</p>
        </div>
      )}

      {/* Stories List */}
      {!isLoading && !error && filteredStories.length > 0 && (
        <div className="space-y-4">
          {filteredStories.map((story) => {
            const isExpanded = expandedStories.has(story.id);
            const parsed = parseStoryContent(story.advice);
            const isAssigned = hasPlacement(story);
            const placementCount = story.placements
              ? Object.values(story.placements).flat().length
              : 0;

            return (
              <div
                key={story.id}
                className={`bg-slate-800/50 rounded-lg border overflow-hidden transition-all ${
                  isAssigned ? 'border-slate-700' : 'border-amber-500/30 border-dashed'
                }`}
              >
                {/* Story Header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleExpanded(story.id)}
                    className="flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-medium truncate">{story.title}</span>
                      {!isAssigned && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Unassigned
                        </span>
                      )}
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {story.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {story.tags.length > 3 && (
                        <span className="text-xs text-slate-500">+{story.tags.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Placements Badge */}
                  {isAssigned && story.placements && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{placementCount} placement{placementCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setPlacementStory(story)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Manage placements"
                    >
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingStory(story);
                        setShowUploader(true);
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ id: story.id, title: story.title })}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-700/50">
                    <div className="pt-4 space-y-4">
                      {'situation' in parsed ? (
                        <>
                          {parsed.situation && (
                            <div>
                              <div className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-1">
                                Situation
                              </div>
                              <div className="text-slate-300 text-sm">{parsed.situation}</div>
                            </div>
                          )}
                          {parsed.whatIDid && (
                            <div>
                              <div className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-1">
                                What I Did
                              </div>
                              <div className="text-slate-300 text-sm">{parsed.whatIDid}</div>
                            </div>
                          )}
                          {parsed.outcome && (
                            <div>
                              <div className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-1">
                                Outcome
                              </div>
                              <div className="text-slate-300 text-sm">{parsed.outcome}</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-slate-300 text-sm whitespace-pre-wrap">{parsed.raw}</div>
                      )}

                      {/* Current Placements */}
                      {isAssigned && story.placements && (
                        <div className="pt-3 border-t border-slate-700/50">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            Placed In
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(story.placements).map(([offerType, phases]) =>
                              phases.map((phase) => (
                                <span
                                  key={`${offerType}-${phase}`}
                                  className="flex items-center gap-1 text-xs px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded"
                                >
                                  {OFFER_ICONS[offerType]}
                                  {OFFER_LABELS[offerType] || offerType} → {phase}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Assign Button */}
                      {!isAssigned && (
                        <button
                          onClick={() => setPlacementStory(story)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg text-sm font-medium transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          Assign to Offers
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Story Uploader Modal */}
      <StoryUploader
        isOpen={showUploader}
        onClose={() => {
          setShowUploader(false);
          setEditingStory(null);
        }}
        onSuccess={fetchStories}
        editingStory={editingStory}
      />

      {/* Placement Manager Modal */}
      {placementStory && (
        <StoryPlacementManager
          isOpen={true}
          onClose={() => setPlacementStory(null)}
          storyId={placementStory.id}
          storyTitle={placementStory.title}
          currentPlacements={placementStory.placements || {}}
          onSuccess={fetchStories}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Delete Story?</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.title}"? This will remove it from
              all offers.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stories Intro Slideshow Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseIntro} />
          <div className="relative bg-slate-800 rounded-2xl border border-amber-500/30 shadow-2xl w-full max-w-2xl p-8 mx-4">
            {/* Close button */}
            <button
              onClick={handleCloseIntro}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slideshow Content */}
            <div className="min-h-[350px]">
              {/* StoryImpactIntro SVG that changes based on step */}
              <div className="flex items-center justify-center mb-4">
                <StoryImpactIntro step={introStep} />
              </div>

              {introStep === 1 && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">Every Lead Starts as a Stranger</h3>
                  <p className="text-slate-300 max-w-md mx-auto">
                    They don't know you. They don't trust you yet. There's a gap between their situation and your expertise.
                  </p>
                </div>
              )}

              {introStep === 2 && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">Stories Bridge the Gap</h3>
                  <p className="text-slate-300 max-w-md mx-auto">
                    When you share a story about helping someone <span className="text-amber-300">just like them</span>,
                    suddenly you're not a stranger anymore. You're the person who solved their exact problem.
                  </p>
                </div>
              )}

              {introStep === 3 && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">Trust Happens Instantly</h3>
                  <p className="text-slate-300 max-w-md mx-auto">
                    "You helped a first-time buyer in my exact situation? You understand me!"
                    <br /><br />
                    <span className="text-amber-300 font-medium">That's the power of a well-placed story.</span>
                  </p>
                </div>
              )}

              {introStep === 4 && (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-3">Add Your Stories Now</h3>
                  <p className="text-slate-300 max-w-md mx-auto mb-6">
                    Think of 3-5 clients you've helped in each flow (buying, selling, browsing).
                    What was their situation? What did you do? What was the outcome?
                  </p>
                  <button
                    onClick={handleCloseIntro}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors"
                  >
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => setIntroStep((s) => Math.max(1, s - 1))}
                disabled={introStep === 1}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setIntroStep(step)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      step === introStep ? 'bg-amber-400' : 'bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              {introStep < TOTAL_INTRO_STEPS ? (
                <button
                  onClick={() => setIntroStep((s) => Math.min(TOTAL_INTRO_STEPS, s + 1))}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-lg"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCloseIntro}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 hover:bg-amber-400 rounded-lg font-medium"
                >
                  Done
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
