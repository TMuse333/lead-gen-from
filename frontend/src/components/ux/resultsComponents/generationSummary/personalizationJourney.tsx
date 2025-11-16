import { Workflow } from 'lucide-react';

interface JourneyStep {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PersonalizationJourneyProps {
  journey: JourneyStep[];
}

export function PersonalizationJourney({ journey }: PersonalizationJourneyProps) {
  return (
    <div className="relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300 rounded-full"></div>
      
      <div className="space-y-6">
        {journey.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-4 pl-2">
            {/* Step Number Badge */}
            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold shadow-lg ring-4 ring-white`}>
              {step.step}
            </div>
            
            {/* Step Content */}
            <div className="flex-1 bg-white border-2 border-indigo-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <step.icon className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}