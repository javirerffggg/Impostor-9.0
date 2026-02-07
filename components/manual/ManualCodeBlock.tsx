


import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ThemeConfig } from '../../types';

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
    <div className="mb-6 rounded-xl overflow-hidden border" style={{ borderColor: theme.border }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
        }}>
        <span className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: theme.sub }}>
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
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
        <pre className="text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap"
          style={{ color: theme.text, fontFamily: "'JetBrains Mono', monospace" }}>
          {code.content}
        </pre>
      </div>
    </div>
  );
};