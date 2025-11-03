"use client"

import ConversationalForm from "@/components/conversationalForm/conversationalForm";
import { FormQuestion, FormAnswer } from "@/types";
import { useRouter } from 'next/navigation';

const FormPage = () => {
  const router = useRouter();

  // Sample questions
  const sampleQuestions: FormQuestion[] = [
    {
      id: "property_type",
      type: "button-select",
      question: "What type of property do you own?",
      required: true,
      weight: 9,
      aiContext: "Property type significantly affects valuation",
      choices: [
        { id: "house", label: "Single Family House", value: "house", icon: "🏠" },
        { id: "condo", label: "Condo/Apartment", value: "condo", icon: "🏢" },
        { id: "townhouse", label: "Townhouse", value: "townhouse", icon: "🏘️" },
        { id: "multi", label: "Multi-Unit", value: "multi_unit", icon: "🏬" },
      ],
    },
    {
      id: "property_age",
      type: "button-select",
      question: "Approximately how old is your property?",
      required: true,
      weight: 7,
      aiContext: "Age affects condition assumptions",
      choices: [
        { id: "new", label: "Less than 5 years", value: "0-5" },
        { id: "recent", label: "5-15 years", value: "5-15" },
        { id: "established", label: "15-30 years", value: "15-30" },
        { id: "older", label: "30+ years", value: "30+" },
      ],
    },
    {
      id: "renovations",
      type: "button-select",
      question: "Have you done any major renovations in the last 5 years?",
      required: true,
      weight: 8,
      aiContext: "Recent renovations can significantly increase value",
      choices: [
        { id: "yes", label: "Yes, major renovations", value: "yes", triggerFollowUp: "renovation_types" },
        { id: "minor", label: "Minor updates only", value: "minor" },
        { id: "no", label: "No renovations", value: "no" },
      ],
    },
    {
      id: "renovation_types",
      type: "multi-select",
      question: "Which areas did you renovate?",
      subtext: "Select all that apply",
      required: false,
      weight: 7,
      aiContext: "Specific renovation types have different ROI",
      showIf: {
        questionId: "renovations",
        hasValue: "yes",
      },
      choices: [
        { id: "kitchen", label: "Kitchen", value: "kitchen", icon: "🍳" },
        { id: "bathroom", label: "Bathroom(s)", value: "bathroom", icon: "🚿" },
        { id: "flooring", label: "Flooring", value: "flooring", icon: "🪵" },
        { id: "roof", label: "Roof", value: "roof", icon: "🏠" },
        { id: "windows", label: "Windows", value: "windows", icon: "🪟" },
        { id: "basement", label: "Basement Finish", value: "basement", icon: "⬇️" },
      ],
    },
    {
      id: "mortgage_status",
      type: "button-select",
      question: "What's your current mortgage situation?",
      required: true,
      weight: 5,
      aiContext: "Indicates seller urgency",
      choices: [
        { id: "paid", label: "Paid off", value: "paid_off" },
        { id: "low", label: "Less than 50% remaining", value: "under_50" },
        { id: "high", label: "More than 50% remaining", value: "over_50" },
        { id: "prefer", label: "Prefer not to say", value: "no_answer" },
      ],
    },
    {
      id: "selling_reason",
      type: "button-select",
      question: "What's your main reason for considering selling?",
      required: true,
      weight: 8,
      aiContext: "Motivation affects timeline",
      choices: [
        { id: "upsize", label: "Need more space", value: "upsizing", icon: "📈" },
        { id: "downsize", label: "Downsizing", value: "downsizing", icon: "📉" },
        { id: "relocate", label: "Relocating for work", value: "relocating", icon: "✈️" },
        { id: "investment", label: "Investment opportunity", value: "investment", icon: "💰" },
        { id: "lifestyle", label: "Lifestyle change", value: "lifestyle", icon: "🌟" },
        { id: "exploring", label: "Just exploring", value: "exploring", icon: "🤔" },
      ],
    },
    {
      id: "email",
      type: "email",
      question: "Where should we send your personalized analysis?",
      placeholder: "your.email@example.com",
      required: true,
      weight: 10,
      aiContext: "Email capture",
    },
    {
      id: "timeline",
      type: "button-select",
      question: "What's your ideal timeline for selling?",
      required: true,
      weight: 9,
      aiContext: "Timeline urgency",
      choices: [
        { id: "asap", label: "ASAP (0-3 months)", value: "0-3" },
        { id: "soon", label: "Soon (3-6 months)", value: "3-6" },
        { id: "planning", label: "Planning ahead (6-12 months)", value: "6-12" },
        { id: "exploring", label: "Just exploring", value: "exploring" },
      ],
    },
    {
      id: "concerns",
      type: "textarea",
      question: "Any specific concerns or questions? (Optional)",
      placeholder: "e.g., worried about market timing, need to coordinate with new purchase, etc.",
      required: false,
      weight: 6,
      aiContext: "Specific concerns",
    },
  ];

  // Handle form completion with redirect
  const handleComplete = async (answers: FormAnswer[]) => {
    console.log("Form completed! Submitting...");
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          pageUrl: window.location.href,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Success! Redirecting to results...");
        
        // Get user email from answers
        const email = answers.find(a => a.questionId === 'email')?.value as string;
        
        // Redirect to results page with data in URL params
        const params = new URLSearchParams({
          analysis: encodeURIComponent(JSON.stringify(data.analysis)),
          comparableHomes: encodeURIComponent(JSON.stringify(data.comparableHomes)),
          email: encodeURIComponent(email),
        });
        
        router.push(`/results?${params.toString()}`);
      } else {
        alert('Something went wrong. Please try again.');
        console.error('Submission failed:', data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <main className="min-h-screen">
      <ConversationalForm
        questions={sampleQuestions}
        onComplete={handleComplete}
        agentName="Chris Crowell"
        primaryColor="#2563eb"
      />
    </main>
  );
};

export default FormPage;