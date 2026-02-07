
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ThemeConfig } from '../../types';
import { manualTheme } from './manualTheme';

export interface CodeBlockData {
    language?: string;
    title?: string;
    content: string;
}

interface Props {
  code: CodeBlockData;
  theme: ThemeConfig;
}

export const ManualCodeBlock: React.FC<Props> = ({ code, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 rounded-xl overflow-hidden border" style={{ borderColor: manualTheme.border.subtle }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          backgroundColor: manualTheme.bg.secondary,
          borderColor: manualTheme.border.subtle,
        }}>
        <span className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: manualTheme.text.secondary }}>
          {code.title || code.language || 'Ejemplo'}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg transition-all hover:bg-white/10 active:scale-95"
          style={{ color: theme.text }}
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto"
        style={{
          backgroundColor: manualTheme.bg.card,
        }}>
        <pre className="text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap"
          style={{ color: manualTheme.text.primary, fontFamily: "'JetBrains Mono', monospace" }}>
          {code.content}
        </pre>
      </div>
    </div>
  );
};
