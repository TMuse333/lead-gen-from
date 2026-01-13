// src/components/dashboard/user/offers/editor/tabs/InstructionsTab.tsx
/**
 * Instructions Tab - Landing page style guide for timeline configuration
 */

'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  Layers,
  CheckSquare,
  BookOpen,
  ArrowRight,
  Wand2,
  Target,
  Users,
  Lightbulb,
  ArrowDown,
  Zap,
} from 'lucide-react';
import JourneyProgress from '@/components/dashboard/shared/svg/JourneyProgress';
import StoryToTrust from '@/components/dashboard/shared/svg/StoryToTrust';
import StoryBridge from '@/components/dashboard/shared/svg/StoryBridge';
import PhaseStoryFlow from '@/components/dashboard/shared/svg/PhaseStoryFlow';

interface InstructionsTabProps {
  onOpenWizard?: () => void;
}

export function InstructionsTab({ onOpenWizard }: InstructionsTabProps) {
  return (
    <div className="space-y-16 max-w-5xl mx-auto pb-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">Getting Started Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4">
          Build Your Personalized Client Experience
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Configure your chatbot to ask the right questions, guide clients through your proven process,
          and share your expertise at the perfect moment.
        </p>

        {onOpenWizard && (
          <button
            onClick={onOpenWizard}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/25 inline-flex items-center gap-3"
          >
            <Wand2 className="w-5 h-5" />
            Launch Setup Wizard
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </motion.section>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <ArrowDown className="w-6 h-6 text-slate-600 animate-bounce" />
      </motion.div>

      {/* Section 1: Why This Matters */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={Zap}
          color="cyan"
          label="The Why"
          title="Why Personalization Matters"
          subtitle="Connect with every client's unique situation"
        />

        <div className="grid md:grid-cols-2 gap-12 items-center mt-8">
          <div className="space-y-6">
            <p className="text-lg text-slate-300 leading-relaxed">
              Every client walks in with different circumstances. A first-time buyer has completely
              different concerns than someone downsizing after 30 years.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              <span className="text-white font-semibold">Your chatbot should recognize
              and respond to these differences.</span> By configuring your questions and phases, you ensure
              every interaction feels personal.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <FeatureCard icon={Users} text="Clients feel understood" color="cyan" />
              <FeatureCard icon={Target} text="Adapted timelines" color="blue" />
              <FeatureCard icon={BookOpen} text="Relevant stories" color="amber" />
              <FeatureCard icon={Sparkles} text="Automatic guidance" color="purple" />
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 overflow-hidden">
              <StoryBridge size={340} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Stories & Trust */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={BookOpen}
          color="amber"
          label="Your Secret Weapon"
          title="The Power of Your Stories"
          subtitle="Build trust by sharing real experiences"
        />

        <div className="grid md:grid-cols-2 gap-12 items-center mt-8">
          <div className="flex justify-center order-2 md:order-1">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 overflow-hidden">
              <StoryToTrust size={300} />
            </div>
          </div>

          <div className="space-y-6 order-1 md:order-2">
            <p className="text-lg text-slate-300 leading-relaxed">
              Your stories are your secret weapon. When a client says they're nervous about inspections,
              your bot can share that time you helped a first-time buyer navigate a tricky inspection report.
            </p>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-amber-500/20">
              <p className="text-amber-400 font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Story Format
              </p>
              <div className="space-y-3">
                <StoryFormatItem label="Situation" description="The challenge or context your client faced" />
                <StoryFormatItem label="Action" description="What you did to help them succeed" />
                <StoryFormatItem label="Result" description="The positive outcome they achieved" />
              </div>
            </div>

            <p className="text-slate-400">
              Link stories to specific phases and steps to ensure they appear at the most impactful moment.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 3: Bot Questions */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={MessageSquare}
          color="cyan"
          label="Step 1"
          title="Setting Up Bot Questions"
          subtitle="Ask the right questions to understand your clients"
        />

        <div className="mt-8 space-y-8">
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Questions are the foundation of personalization. Each question you configure helps
            the bot understand your client better and tailor their experience.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <QuestionTypeCard
              title="Button Questions"
              description="Quick tap responses for common scenarios"
              example={`What's your timeline?\n• ASAP\n• 3-6 months\n• Just exploring`}
              color="cyan"
            />
            <QuestionTypeCard
              title="Text Questions"
              description="Open-ended responses for specific details"
              example={`What neighborhoods\nare you interested in?\n\n[________________]`}
              color="blue"
            />
            <QuestionTypeCard
              title="Lead Capture"
              description="Email/phone to follow up with qualified leads"
              example={`Where should we send\nyour timeline?\n\n[email@example.com]`}
              color="purple"
            />
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 flex items-start gap-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-cyan-400 font-semibold">Pro Tip</p>
              <p className="text-slate-300 mt-1">
                Questions can be linked to specific phases. When a client answers a question,
                the bot knows exactly which phase and advice to highlight in their timeline.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 4: Timeline Phases */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={Layers}
          color="blue"
          label="Step 2"
          title="Defining Timeline Phases"
          subtitle="Create a roadmap for your client's journey"
        />

        <div className="grid md:grid-cols-2 gap-12 items-center mt-8">
          <div className="space-y-6">
            <p className="text-lg text-slate-300 leading-relaxed">
              Phases break down the real estate journey into manageable chunks.
              <span className="text-white font-semibold"> Each phase represents a milestone in your client's process.</span>
            </p>

            <div className="space-y-4">
              <PhaseExample
                number={1}
                phase="Financial Preparation"
                timeline="Week 1-2"
                description="Get pre-approved and understand buying power"
              />
              <PhaseExample
                number={2}
                phase="House Hunting"
                timeline="Week 2-7"
                description="Search for properties that match needs"
              />
              <PhaseExample
                number={3}
                phase="Make an Offer"
                timeline="Week 7-9"
                description="Submit competitive offers and negotiate"
              />
              <PhaseExample
                number={4}
                phase="Under Contract"
                timeline="Week 9-13"
                description="Due diligence, inspections, and financing"
              />
            </div>

            <p className="text-sm text-slate-500">
              You can have 5-10 phases per journey. The wizard helps you set these up based on
              proven templates or completely custom flows.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <JourneyProgress
                width={200}
                height={320}
                currentStep={2}
                steps={[
                  { name: 'Pre-Approval', timeline: 'Week 1' },
                  { name: 'House Hunting', timeline: 'Week 2-7' },
                  { name: 'Make Offer', timeline: 'Week 7' },
                  { name: 'Under Contract', timeline: 'Week 8-12' },
                  { name: 'Closing', timeline: 'Week 13' },
                ]}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 5: Actionable Steps */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={CheckSquare}
          color="emerald"
          label="Step 3"
          title="Actionable Steps"
          subtitle="Specific tasks for each phase"
        />

        <div className="mt-8 space-y-8">
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Within each phase, actionable steps give clients concrete tasks to complete.
            <span className="text-white font-semibold"> These turn your expertise into a checklist they can follow.</span>
          </p>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="font-semibold text-slate-200">Financial Preparation Phase</span>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Week 1-2</span>
            </div>
            <div className="space-y-3 pl-6">
              <ActionStep priority="high" text="Get pre-approved for a mortgage" />
              <ActionStep priority="high" text="Review credit score and fix any issues" />
              <ActionStep priority="medium" text="Calculate total budget including closing costs" />
              <ActionStep priority="medium" text="Gather financial documents (tax returns, pay stubs)" />
              <ActionStep priority="low" text="Research down payment assistance programs" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500/30 border-2 border-red-500"></div>
              <span className="text-slate-300">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500/30 border-2 border-yellow-500"></div>
              <span className="text-slate-300">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500/30 border-2 border-green-500"></div>
              <span className="text-slate-300">Low Priority</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 6: How It All Comes Together */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={Target}
          color="purple"
          label="The Result"
          title="How It All Merges Together"
          subtitle="From question to personalized timeline"
        />

        <div className="mt-8 space-y-8">
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            Here's the magic: when a client interacts with your chatbot, all these pieces work together
            to create a uniquely tailored experience.
          </p>

          {/* Phase Story Flow Visualization */}
          <div className="flex justify-center">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 overflow-hidden">
              <PhaseStoryFlow width={450} height={280} filledPhases={[0, 1, 2, 3]} />
            </div>
          </div>

          {/* Flow diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FlowStep
              number={1}
              title="Client Answers"
              description="Timeline, budget, goals"
              color="cyan"
            />
            <FlowStep
              number={2}
              title="Bot Identifies"
              description="Buyer, seller, or browser"
              color="blue"
            />
            <FlowStep
              number={3}
              title="Timeline Generated"
              description="Phases + steps + stories"
              color="purple"
            />
            <FlowStep
              number={4}
              title="Lead Captured"
              description="Qualified & informed"
              color="emerald"
            />
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-6">
            <p className="text-purple-400 font-semibold mb-2">The Result</p>
            <p className="text-slate-300 text-lg">
              Your client receives a personalized timeline with your expert advice embedded at every step.
              They see exactly what they need to do, when to do it, and have access to your stories
              that show you understand their situation.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 7: Add Your Personal Touch */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <SectionHeader
          icon={Users}
          color="emerald"
          label="Personal Touch"
          title="Make It Uniquely Yours"
          subtitle="Add your branding and contact info"
        />

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* Hero Section Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Hero Section Tab</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Customize what clients see at the top of their timeline. Add your headshot,
                  name, title, and a personal welcome message.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Your Photo</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Name & Title</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Welcome Message</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ending CTA Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-100 mb-2">Ending CTA Tab</h4>
                <p className="text-slate-400 text-sm mb-4">
                  Configure the call-to-action clients see after their timeline. Set up your
                  contact info so qualified leads can reach you directly.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Phone Number</span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Email</span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">CTA Message</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <p className="text-slate-400 text-sm flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              These tabs are located right after the Setup Wizard in the navigation above.
              Complete them to give your timeline a professional, personalized look that
              builds trust with clients before they even reach out.
            </span>
          </p>
        </div>
      </motion.section>

      {/* Bottom CTA */}
      {onOpenWizard && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 border-t border-slate-800"
        >
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            The Setup Wizard will walk you through each step, helping you configure your
            questions, phases, and stories in just a few minutes.
          </p>
          <button
            onClick={onOpenWizard}
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-cyan-500/25 inline-flex items-center gap-3"
          >
            <Wand2 className="w-6 h-6" />
            Launch Setup Wizard
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.section>
      )}
    </div>
  );
}

// Helper Components

interface SectionHeaderProps {
  icon: React.ElementType;
  color: 'cyan' | 'blue' | 'amber' | 'emerald' | 'purple';
  label: string;
  title: string;
  subtitle: string;
}

const colorStyles = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
};

function SectionHeader({ icon: Icon, color, label, title, subtitle }: SectionHeaderProps) {
  const styles = colorStyles[color];

  return (
    <div className="text-center">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${styles.bg} border ${styles.border} rounded-full mb-4`}>
        <Icon className={`w-4 h-4 ${styles.text}`} />
        <span className={`text-sm font-medium ${styles.text}`}>{label}</span>
      </div>
      <h2 className="text-3xl font-bold text-slate-100 mb-2">{title}</h2>
      <p className="text-lg text-slate-400">{subtitle}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, text, color = 'cyan' }: {
  icon: React.ElementType;
  text: string;
  color?: 'cyan' | 'blue' | 'amber' | 'purple' | 'emerald';
}) {
  const colorMap = {
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  };
  const styles = colorMap[color];

  return (
    <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700/50">
      <div className={`p-2 ${styles.bg} rounded-lg`}>
        <Icon className={`w-4 h-4 ${styles.text}`} />
      </div>
      <span className="text-slate-200 font-medium text-sm">{text}</span>
    </div>
  );
}

function StoryFormatItem({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-amber-400 text-xs font-bold">{label[0]}</span>
      </div>
      <div>
        <span className="text-white font-medium">{label}:</span>
        <span className="text-slate-400 ml-1">{description}</span>
      </div>
    </div>
  );
}

function QuestionTypeCard({ title, description, example, color }: {
  title: string;
  description: string;
  example: string;
  color: 'cyan' | 'blue' | 'purple';
}) {
  const borderColor = {
    cyan: 'border-cyan-500/30 hover:border-cyan-500/50',
    blue: 'border-blue-500/30 hover:border-blue-500/50',
    purple: 'border-purple-500/30 hover:border-purple-500/50',
  }[color];

  const textColor = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  }[color];

  return (
    <div className={`bg-slate-800/50 rounded-xl p-5 border ${borderColor} transition-colors`}>
      <h4 className={`font-semibold ${textColor} mb-2`}>{title}</h4>
      <p className="text-sm text-slate-400 mb-4">{description}</p>
      <div className="bg-slate-900/70 rounded-lg px-4 py-3">
        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{example}</pre>
      </div>
    </div>
  );
}

function PhaseExample({ number, phase, timeline, description }: {
  number: number;
  phase: string;
  timeline: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-800/30 rounded-xl px-5 py-4 border border-slate-700/50">
      <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center flex-shrink-0">
        <span className="text-blue-400 font-bold">{number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-slate-100">{phase}</span>
          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded flex-shrink-0">{timeline}</span>
        </div>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ActionStep({ priority, text }: { priority: 'high' | 'medium' | 'low'; text: string }) {
  const colors = {
    high: 'border-red-500 bg-red-500/20',
    medium: 'border-yellow-500 bg-yellow-500/20',
    low: 'border-green-500 bg-green-500/20',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded border-2 ${colors[priority]} flex items-center justify-center`}>
        <CheckSquare className="w-3 h-3 text-slate-400" />
      </div>
      <span className="text-slate-300">{text}</span>
    </div>
  );
}

function FlowStep({ number, title, description, color }: {
  number: number;
  title: string;
  description: string;
  color: 'cyan' | 'blue' | 'purple' | 'emerald';
}) {
  const styles = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', ring: 'bg-cyan-500/20' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', ring: 'bg-blue-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', ring: 'bg-purple-500/20' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', ring: 'bg-emerald-500/20' },
  }[color];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-5 text-center relative`}>
      <div className={`w-10 h-10 rounded-full ${styles.ring} border border-${color}-500/50 flex items-center justify-center mx-auto mb-3`}>
        <span className={`${styles.text} font-bold`}>{number}</span>
      </div>
      <h4 className="font-semibold text-slate-100 mb-1">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>

      {/* Arrow connector (hidden on last item and mobile) */}
      {number < 4 && (
        <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </div>
      )}
    </div>
  );
}

export default InstructionsTab;
