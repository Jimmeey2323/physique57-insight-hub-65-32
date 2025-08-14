
import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Info, Calculator } from 'lucide-react';

interface MetricTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  formula?: string;
  example?: string;
  importance?: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({
  children,
  title,
  description,
  formula,
  example,
  importance
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-help inline-flex items-center gap-1 group">
          {children}
          <Info className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 bg-white border shadow-lg rounded-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-slate-800">{title}</h4>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
          
          {formula && (
            <div className="bg-slate-50 rounded-md p-3">
              <h5 className="text-xs font-medium text-slate-700 mb-1">Formula:</h5>
              <code className="text-xs font-mono text-slate-800 bg-white px-2 py-1 rounded border">
                {formula}
              </code>
            </div>
          )}
          
          {example && (
            <div className="bg-blue-50 rounded-md p-3">
              <h5 className="text-xs font-medium text-blue-700 mb-1">Example:</h5>
              <p className="text-xs text-blue-600">{example}</p>
            </div>
          )}
          
          {importance && (
            <div className="bg-amber-50 rounded-md p-3">
              <h5 className="text-xs font-medium text-amber-700 mb-1">Why it matters:</h5>
              <p className="text-xs text-amber-600">{importance}</p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
