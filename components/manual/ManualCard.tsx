
import React, { useRef, useState } from 'react';
import { Check, X, AlertTriangle, Info, Zap } from 'lucide-react';
import { ThemeConfig } from '../../types';

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
  
  // 3D Tilt Logic
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-5deg to 5deg)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 5;
    const rotateX = ((y - centerY) / centerY) * -5;

    setRotation({ x: rotateX, y: rotateY });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setOpacity(0);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="mb-6 p-4 sm:p-5 rounded-xl border backdrop-blur-xl group transition-transform duration-200 ease-out transform-gpu perspective-1000"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
        transition: 'transform 0.1s ease-out'
      }}>
      
      {/* Light Glare Effect */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-xl"
        style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)`,
            opacity: opacity,
            zIndex: 10
        }}
      />

      <div className="flex items-start gap-3 relative z-20">
        {/* Icon */}
        <div className="shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110" style={{ color: style.iconColor }}>
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
                <p key={idx} className="text-xs sm:text-sm leading-relaxed opacity-90"
                style={{ color: theme.text }}>
                {text}
                </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
