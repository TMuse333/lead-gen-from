interface FlowBadgeProps {
    currentFlow: string | undefined;
  }
  
  export function FlowBadge({ currentFlow }: FlowBadgeProps) {
    if (!currentFlow) return null;
  
    return (
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium from-cyan-400 to-blue-600 text-white">
          {currentFlow.charAt(0).toUpperCase() + currentFlow.slice(1)} Journey
        </span>
      </div>
    );
  }