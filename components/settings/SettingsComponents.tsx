/**
 * Shared primitive components for SettingsDrawer.
 * SectionContainer, SectionHeader, ContentCard, SettingRow, PremiumToggle, AudioWaveform
 */
import React, { useRef } from 'react';
import { ThemeConfig } from '../../types';
import { Volume2, VolumeX } from 'lucide-react';

// ---------------------------------------------------------------------------
// SectionContainer
// ---------------------------------------------------------------------------
export const SectionContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children, className = ''
}) => <section className={`space-y-4 ${className}`}>{children}</section>;

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------
export const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: string;
    theme: ThemeConfig;
}> = ({ icon, title, subtitle, badge, theme }) => (
    <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-3">
            <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
            >
                {icon}
            </div>
            <div className="flex flex-col">
                <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: theme.text }}>
                    {title}
                </h3>
                {subtitle && (
                    <span className="text-[9px] font-mono opacity-60" style={{ color: theme.sub }}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
        {badge && (
            <div
                className="px-2 py-1 rounded-lg text-[8px] font-black uppercase"
                style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
            >
                {badge}
            </div>
        )}
    </div>
);

// ---------------------------------------------------------------------------
// ContentCard
// ---------------------------------------------------------------------------
export const ContentCard: React.FC<{
    children: React.ReactNode;
    theme: ThemeConfig;
    variant?: 'default' | 'glass' | 'solid';
}> = ({ children, theme, variant = 'default' }) => (
    <div
        className="p-5 rounded-[24px] border backdrop-blur-2xl relative overflow-hidden"
        style={{
            backgroundColor: variant === 'glass' ? `${theme.cardBg}40` : `${theme.cardBg}F5`,
            borderColor: theme.border,
            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
    >
        <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${theme.accent}, transparent 70%)` }}
        />
        <div className="relative z-10">{children}</div>
    </div>
);

// ---------------------------------------------------------------------------
// SettingRow
// ---------------------------------------------------------------------------
export const SettingRow: React.FC<{
    icon?: React.ReactNode;
    iconColor?: string;
    title: string;
    subtitle?: string;
    action: React.ReactNode;
    theme: ThemeConfig;
    noBorder?: boolean;
}> = ({ icon, iconColor, title, subtitle, action, theme, noBorder = false }) => (
    <div
        className={`flex items-center justify-between gap-4 py-3 ${!noBorder ? 'border-b' : ''} last:border-0`}
        style={{ borderColor: `${theme.border}30` }}
    >
        <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon && (
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${iconColor || theme.accent}15`, color: iconColor || theme.accent }}
                >
                    {icon}
                </div>
            )}
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold truncate" style={{ color: theme.text }}>{title}</span>
                {subtitle && (
                    <span className="text-[10px] font-medium opacity-60 truncate" style={{ color: theme.sub }}>
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
        <div className="shrink-0">{action}</div>
    </div>
);

// ---------------------------------------------------------------------------
// PremiumToggle
// ---------------------------------------------------------------------------
export const PremiumToggle: React.FC<{
    active: boolean;
    onClick: () => void;
    theme: ThemeConfig;
}> = ({ active, onClick, theme }) => (
    <button
        onClick={onClick}
        className="relative w-12 h-7 rounded-full transition-all duration-300 shadow-inner focus:outline-none group"
        style={{
            backgroundColor: active ? theme.accent : 'rgba(255,255,255,0.1)',
            boxShadow: active
                ? `inset 0 2px 4px rgba(0,0,0,0.3), 0 0 10px ${theme.accent}40`
                : 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}
    >
        <div
            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.2)] group-active:scale-90 flex items-center justify-center ${
                active ? 'left-6' : 'left-1'
            }`}
        >
            {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" style={{ color: theme.accent }} />
            )}
        </div>
    </button>
);

// ---------------------------------------------------------------------------
// AudioWaveform  — fixed: supports touch events for mobile
// ---------------------------------------------------------------------------
const getPctFromEvent = (el: HTMLElement, clientX: number): number => {
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
};

export const AudioWaveform: React.FC<{
    volume: number;
    onChange: (v: number) => void;
    theme: ThemeConfig;
}> = ({ volume, onChange, theme }) => {
    const ref = useRef<HTMLDivElement>(null);

    const handlePointer = (clientX: number) => {
        if (ref.current) onChange(getPctFromEvent(ref.current, clientX));
    };

    return (
        <div
            ref={ref}
            className="relative h-8 w-full flex items-center gap-1 cursor-pointer select-none"
            // Mouse
            onClick={e => handlePointer(e.clientX)}
            onMouseMove={e => { if (e.buttons === 1) handlePointer(e.clientX); }}
            // Touch — fixed for mobile
            onTouchStart={e => handlePointer(e.touches[0].clientX)}
            onTouchMove={e => { e.preventDefault(); handlePointer(e.touches[0].clientX); }}
        >
            {[...Array(20)].map((_, i) => {
                const isActive = volume * 20 > i;
                const height = 4 + Math.sin(i * 0.5) * 4 + (isActive ? 8 : 0);
                return (
                    <div
                        key={i}
                        className="flex-1 rounded-full transition-all duration-200"
                        style={{
                            height: `${height}px`,
                            backgroundColor: isActive ? theme.accent : 'rgba(255,255,255,0.1)',
                            opacity: isActive ? 1 : 0.3,
                            boxShadow: isActive ? `0 0 8px ${theme.accent}60` : 'none'
                        }}
                    />
                );
            })}
        </div>
    );
};

// ---------------------------------------------------------------------------
// SegmentedControl  — reusable pill selector
// ---------------------------------------------------------------------------
export const SegmentedControl = <T extends string>({
    options, value, onChange, labels, theme
}: {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
    labels: Record<string, string>;
    theme: ThemeConfig;
}) => (
    <div
        className="flex gap-1.5 p-1.5 rounded-xl border"
        style={{ backgroundColor: `${theme.bg}40`, borderColor: `${theme.border}40` }}
    >
        {options.map(opt => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className="flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all duration-200"
                style={{
                    backgroundColor: value === opt ? `${theme.accent}25` : 'transparent',
                    color: value === opt ? theme.accent : theme.sub,
                    boxShadow: value === opt ? `0 4px 12px -4px ${theme.accent}40` : 'none'
                }}
            >
                {labels[opt] ?? opt}
            </button>
        ))}
    </div>
);
