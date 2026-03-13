import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  className?: string;
}

export function HelpTooltip({ content, className = '' }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {visible && (
        <span
          className="absolute left-full top-1/2 z-50 ml-1.5 min-w-[180px] max-w-[240px] -translate-y-1/2 rounded border border-gray-200 bg-gray-900 px-2.5 py-1.5 text-xs font-normal text-white shadow-lg"
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
