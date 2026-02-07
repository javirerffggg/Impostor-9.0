
import React from 'react';
import { Check, X, AlertTriangle, Info, Zap } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { manualTheme } from './manualTheme';

export interface CardData {
  type: 'success' | 'warning' | 'danger' | 'info' | 'highlight';
  title?: string;
  content: string | string[];
  icon?: React.ReactNode;
}

interface Props {
  card: CardData;
  theme: ThemeConfig;
}

const cardStyles = {
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: <Check size={20} />,
    iconColor: '#10B981',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: <AlertTriangle size={20} />,
    iconColor: '#F59E0B',
  },
  danger: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: <X size={20} />,
    iconColor: '#EF4444',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: <Info size={20} />,
    iconColor: '#3B82F6',
  },
  highlight: {
    bg: 'rgba(139, 92, 246, 0.1)',
    border: 'rgba(139, 92, 246, 0.3)',
    icon: <Zap size={20} />,
    iconColor: '#8B5CF6',
  },
};

export const ManualCard: React.FC<Props> = ({ card, theme }) => {
  const style = cardStyles[card.type];
  const content = Array.isArray(card.content) ? card.content : [card.content];

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-xl border backdrop-blur-xl"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}>
      
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 mt-0.5" style={{ color: style.iconColor }}>
          {card.icon || style.icon}
        </div>

        <div className="flex-1">
          {/* Title */}
          {card.title && (
            <p className="font-bold text-sm sm:text-base mb-2 uppercase tracking-wide"
              style={{ color: style.iconColor }}>
              {card.title}
            </p>
          )}

          {/* Content */}
          <div className="space-y-1">
            {content.map((text, idx) => (
                <p key={idx} className="text-xs sm:text-sm leading-relaxed"
                style={{ color: manualTheme.text.primary }}>
                {text}
                </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
