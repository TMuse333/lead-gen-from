import { User, Shield } from 'lucide-react';

interface UserProfileProps {
  userInput: Record<string, string>;
}

export function UserProfile({ userInput }: UserProfileProps) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {Object.entries(userInput).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-text text-gray-900 truncate">{value}</p>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t-2 border-blue-200">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="font-medium">
            {Object.keys(userInput).length} data points analyzed to create your personalized experience
          </span>
        </p>
      </div>
    </div>
  );
}