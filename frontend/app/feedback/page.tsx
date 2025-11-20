// app/feedback/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, MessageSquare, Phone, User } from 'lucide-react';
import logo from '../../public/logo.png'
import Navbar from '@/components/landingPage/navbar';
import Image from 'next/image';


export default function FeedbackPage() {
    const [formData, setFormData] = useState({
        name: '',
        services: [] as string[],
        otherServices: '',
        resultsPage: [] as string[],
        otherResults: '',
        leadData: [] as string[],
        otherLeadData: '',
        contentAssets: [] as string[],
        otherAssets: '',
        comments: '',
      });
  const [submitted, setSubmitted] = useState(false);

  const toggleOption = (category: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category] as string[]).includes(value)
        ? (prev[category] as string[]).filter(v => v !== value)
        : [...(prev[category] as string[]), value],
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
        <>

<Navbar/>


      <div className="min-h-screen bg-[#0a1525] flex items-center justify-center px-6">
    
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 12, -8, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 4 }}
          >
            <Image
            src={logo}
            className=' object-contain mb-8 mx-auto'
            width={130}
            height={130}
            alt='brain'
            />
          </motion.div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-6">
            Thank You
          </h1>
          <p className="text-xl text-cyan-100/80 leading-relaxed">
            This is the first step toward launching <strong className="text-cyan-300">your own neural engine</strong> —
            a chatbot that thinks, speaks, and converts like you do.
          </p>
          <p className="text-cyan-200 mt-8 text-lg">
          I&apos;ll look into the feedback make adjustments and follow up with you.
          We should be able to get your own version up and running soon.
          </p>
          <p className="text-cyan-300/70 mt-6 flex items-center justify-center gap-2">
            <Phone size={18} /> Prefer to talk it through? Just call me anytime.
          </p>
        </motion.div>
      </div>
      </>
    );
  }

  return (
    <>
  <Navbar/>
    <div className="min-h-screen bg-[#0a1525] py-16 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute bottom-32 right-1/3 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-md mb-6">
            <Brain className="h-6 w-6 text-cyan-300" />
            <span className="text-cyan-200 font-semibold">Your Neural Engine – Phase 1</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Let’s Build Your AI Agent
          </h1>
          <p className="mt-6 text-xl text-cyan-100/70 max-w-3xl mx-auto leading-relaxed">
            This chatbot will be the <strong className="text-cyan-300">first public implementation of your own neural engine</strong> — one that understands your expertise and converts visitors 24/7.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl p-8 md:p-12 space-y-12"
        >
            <Section title="Your Name" icon={<User className="h-6 w-6" />}>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-5 py-4 bg-slate-800/80 border border-cyan-600/50 rounded-xl text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
              />
            </Section>
          {/* Services */}
          <Section title="What outcomes do you deliver to clients?" icon={<Target className="h-6 w-6" />}>\n            <CheckboxGroup
              options={[
                'Home selling (listing + marketing)',
                'Buyer representation',
                'Instant home valuations',
                'Market reports & insights',
                'Investment property analysis',
                'First-time buyer guidance',
                'Luxury or commercial real estate',
              ]}
              selected={formData.services}
              onToggle={(v) => toggleOption('services', v)}
            />

            <OtherInput
              value={formData.otherServices}
              onChange={(e) => setFormData({ ...formData, otherServices: e.target.value })}
              placeholder="Other services/outcomes (please specify)"
              show={true}
            />
          </Section>

          {/* Results Page */}
          <Section title="What should users see after completing the chat?" icon={<Sparkles className="h-6 w-6" />}>\n            <CheckboxGroup
              options={[
                'Personalized action plan (next steps)',
                'Instant home valuation or pricing',
                'Custom offer or incentive',
                'Schedule consultation CTA',
                'Market insights & trends',
                'Testimonials / social proof',
                'Your bio & credibility',
                'Sample listings or success stories',
              ]}
              selected={formData.resultsPage}
              onToggle={(v) => toggleOption('resultsPage', v)}
            />

            <OtherInput
              value={formData.otherResults}
              onChange={(e) => setFormData({ ...formData, otherResults: e.target.value })}
              placeholder="Other elements you'd like included"
              show={true}
            />
          </Section>

          {/* Lead Data */}
          <Section title="Any additional info you need from leads?" icon={<MessageSquare className="h-6 w-6" />}>\n            <p className="text-cyan-300/70 text-sm mb-4">We already capture: name, email, property address, timeline, budget</p>

            <CheckboxGroup
              options={[
                'Price range (more detailed)',
                'Property type (condo, house, etc.)',
                'Preferred neighborhoods',
                'Financing status',
                'Urgency level',
                'Referral source',
              ]}
              selected={formData.leadData}
              onToggle={(v) => toggleOption('leadData', v)}
            />

            <OtherInput
              value={formData.otherLeadData}
              onChange={(e) => setFormData({ ...formData, otherLeadData: e.target.value })}
              placeholder="Other fields needed"
              show={true}
            />
          </Section>

          {/* Assets */}
          <Section title="Content & branding assets you can provide" icon={<Brain className="h-6 w-6" />}>\n            <CheckboxGroup
              options={[
                'Professional headshot & bio',
                'Client testimonials',
                'Before/after case studies',
                'Video walkthroughs',
                'Logo & brand colors',
                'Sample listings',
                'Awards or certifications',
              ]}
              selected={formData.contentAssets}
              onToggle={(v) => toggleOption('contentAssets', v)}
            />

            <OtherInput
              value={formData.otherAssets}
              onChange={(e) => setFormData({ ...formData, otherAssets: e.target.value })}
              placeholder="Anything else?"
              show={true}
            />
          </Section>

          {/* Final CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all flex items-center justify-center gap-3"
          >
            <Sparkles size={28} />
            Send & Let’s Build Your Neural Engine
          </motion.button>

          <p className="text-center text-cyan-300/60 text-sm">
           Let&apos;s get you some leads and enhance your business!
           Thank you so much for your cooperation in this new
           product! It will be something great.
          </p>
        </motion.form>
      </div>
    </div>
    </>
  );
}

// Reusable UI components
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">{icon}</div>
        <h3 className="text-2xl font-bold text-cyan-50">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function CheckboxGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-slate-800/50 border border-cyan-700/40 hover:border-cyan-500/60 transition-all">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400/50"
          />
          <span className="text-cyan-100">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function OtherInput({ value, onChange, placeholder, show }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; show: boolean }) {
  return show ? (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-4 w-full px-5 py-4 bg-slate-800/80 border border-cyan-600/50 rounded-xl text-white placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
    />
  ) : null;
}
