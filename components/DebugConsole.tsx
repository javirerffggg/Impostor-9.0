import React, { useState, useEffect } from 'react';
import { 
    Bug, X, Eye, EyeOff, Zap, Users, Brain, Download, 
    Upload, RotateCcw, Play, Pause, SkipForward, Trash2,
    ChevronDown, ChevronUp, Settings, Terminal, BarChart3
} from 'lucide-react';
import { GameState, TrollScenario, ThemeConfig } from '../types';

interface Props {
    gameState: GameState;
    theme: ThemeConfig;
    onClose: () => void;
    onForceTroll: (scenario: TrollScenario | null) => void;
    onForceArchitect: (force: boolean) => void;
    onForceRenuncia: (force: boolean) => void;
    onExportState: () => void;
    onImportState: (state: string) => void;
    onResetStats: () => void;
    onSimulateRound: () => void;
}

type TabType = 'override' | 'telemetry' | 'state' | 'tools';

export const DebugConsole: React.FC<Props> = ({
    gameState,
    theme,
    onClose,
    onForceTroll,
    onForceArchitect,
    onForceRenuncia,
    onExportState,
    onImportState,
    onResetStats,
    onSimulateRound
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('override');
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Shift + D = Toggle Debug Console
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                onClose();
            }
            // Ctrl/Cmd + Shift + 1-4 = Switch tabs
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                const tabs: TabType[] = ['override', 'telemetry', 'state', 'tools'];
                const num = parseInt(e.key);
                if (num >= 1 && num <= 4) {
                    e.preventDefault();
                    setActiveTab(tabs[num - 1]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [onClose]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            // Force re-render
            setActiveTab(prev => prev);
        }, 1000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const tabs = [
        { id: 'override' as TabType, label: 'Overrides', icon: <Zap size={14} /> },
        { id: 'telemetry' as TabType, label: 'Telemetría', icon: <BarChart3 size={14} /> },
        { id: 'state' as TabType, label: 'Estado', icon: <Brain size={14} /> },
        { id: 'tools' as TabType, label: 'Tools', icon: <Settings size={14} /> }
    ];

    return (
        <div 
            className={`fixed z-[9999] ${isMinimized ? 'w-auto' : 'w-[90vw] max-w-2xl'}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                maxHeight: isMinimized ? 'auto' : '80vh'
            }}>
            
            {/* Header - Draggable */}
            <div 
                className="flex items-center justify-between px-4 py-2 cursor-move rounded-t-xl border-2"
                style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.accent,
                    boxShadow: `0 0 20px ${theme.accent}50`
                }}
                onMouseDown={(e) => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}>
                
                <div className="flex items-center gap-2">
                    <Bug size={16} style={{ color: theme.accent }} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider"
                        style={{ color: theme.text }}>
                        🛡️ Modo Centinela
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ 
                            backgroundColor: `${theme.accent}20`,
                            color: theme.accent 
                        }}>
                        v9.0
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Auto-refresh toggle */}
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                        style={{ 
                            backgroundColor: autoRefresh ? `${theme.accent}30` : 'transparent',
                            color: theme.text 
                        }}
                        title="Auto-refresh cada 1s">
                        {autoRefresh ? <Play size={14} /> : <Pause size={14} />}
                    </button>

                    {/* Minimize */}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                        style={{ color: theme.text }}
                        title={isMinimized ? 'Expandir' : 'Minimizar'}>
                        {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95 hover:bg-red-500/20"
                        style={{ color: theme.text }}
                        title="Cerrar (Ctrl+Shift+D)">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div 
                    className="border-2 border-t-0 rounded-b-xl overflow-hidden"
                    style={{
                        backgroundColor: `${theme.cardBg}f5`,
                        borderColor: theme.accent,
                        backdropFilter: 'blur(20px)'
                    }}>
                    
                    {/* Tabs */}
                    <div className="flex border-b" style={{ borderColor: theme.border }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all"
                                style={{
                                    backgroundColor: activeTab === tab.id ? `${theme.accent}20` : 'transparent',
                                    color: activeTab === tab.id ? theme.accent : theme.sub,
                                    borderBottom: activeTab === tab.id ? `2px solid ${theme.accent}` : 'none'
                                }}>
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 overflow-y-auto max-h-[60vh]">
                        {activeTab === 'override' && (
                            <OverrideTab
                                gameState={gameState}
                                theme={theme}
                                onForceTroll={onForceTroll}
                                onForceArchitect={onForceArchitect}
                                onForceRenuncia={onForceRenuncia}
                            />
                        )}

                        {activeTab === 'telemetry' && (
                            <TelemetryTab
                                gameState={gameState}
                                theme={theme}
                            />
                        )}

                        {activeTab === 'state' && (
                            <StateTab
                                gameState={gameState}
                                theme={theme}
                            />
                        )}

                        {activeTab === 'tools' && (
                            <ToolsTab
                                theme={theme}
                                onExportState={onExportState}
                                onImportState={onImportState}
                                onResetStats={onResetStats}
                                onSimulateRound={onSimulateRound}
                            />
                        )}
                    </div>

                    {/* Footer - Shortcuts */}
                    <div className="px-4 py-2 border-t text-[10px] font-mono"
                        style={{ 
                            borderColor: theme.border,
                            color: theme.sub,
                            backgroundColor: `${theme.bg}80`
                        }}>
                        <div className="flex flex-wrap gap-3">
                            <span>⌘⇧D: Toggle</span>
                            <span>⌘⇧1-4: Tabs</span>
                            <span>Round: {gameState.history.roundCounter}</span>
                            <span>Phase: {gameState.phase}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// TAB: OVERRIDES
// ============================================================

const OverrideTab: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
    onForceTroll: (scenario: TrollScenario | null) => void;
    onForceArchitect: (force: boolean) => void;
    onForceRenuncia: (force: boolean) => void;
}> = ({ gameState, theme, onForceTroll, onForceArchitect, onForceRenuncia }) => {
    
    const trollScenarios: { value: TrollScenario; label: string; desc: string }[] = [
        { value: 'espejo_total', label: '🪞 Espejo Total', desc: 'Todos impostores' },
        { value: 'civil_solitario', label: '👤 Civil Solitario', desc: 'Solo 1 civil' },
        { value: 'falsa_alarma', label: '😴 Falsa Alarma', desc: 'Todos civiles' }
    ];

    return (
        <div className="space-y-4">
            {/* Troll Events */}
            <div>
                <h3 className="text-sm font-black uppercase mb-2" style={{ color: theme.text }}>
                    🎭 Eventos Troll
                </h3>
                <div className="space-y-2">
                    {trollScenarios.map(scenario => (
                        <button
                            key={scenario.value}
                            onClick={() => onForceTroll(
                                gameState.debugState.forceTroll === scenario.value ? null : scenario.value
                            )}
                            className="w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                backgroundColor: gameState.debugState.forceTroll === scenario.value 
                                    ? `${theme.accent}20` 
                                    : theme.cardBg,
                                borderColor: gameState.debugState.forceTroll === scenario.value
                                    ? theme.accent
                                    : theme.border
                            }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold" style={{ color: theme.text }}>
                                        {scenario.label}
                                    </div>
                                    <div className="text-[10px] opacity-70" style={{ color: theme.sub }}>
                                        {scenario.desc}
                                    </div>
                                </div>
                                {gameState.debugState.forceTroll === scenario.value && (
                                    <Zap size={14} style={{ color: theme.accent }} className="animate-pulse" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Protocolos */}
            <div>
                <h3 className="text-sm font-black uppercase mb-2" style={{ color: theme.text }}>
                    ⚡ Forzar Protocolos
                </h3>
                <div className="space-y-2">
                    <ToggleButton
                        label="🏛️ Arquitecto"
                        active={gameState.debugState.forceArchitect}
                        onClick={() => onForceArchitect(!gameState.debugState.forceArchitect)}
                        theme={theme}
                    />
                    <ToggleButton
                        label="🛡️ Renuncia"
                        active={gameState.debugState.forceRenuncia || false}
                        onClick={() => onForceRenuncia(!gameState.debugState.forceRenuncia)}
                        theme={theme}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
                <StatCard
                    label="Jugadores"
                    value={gameState.players.length}
                    theme={theme}
                />
                <StatCard
                    label="Impostores"
                    value={gameState.impostorCount}
                    theme={theme}
                />
                <StatCard
                    label="Ronda"
                    value={gameState.history.roundCounter}
                    theme={theme}
                />
                <StatCard
                    label="Paranoia"
                    value={`${gameState.history.paranoiaLevel}%`}
                    theme={theme}
                />
            </div>
        </div>
    );
};

// ============================================================
// TAB: TELEMETRY
// ============================================================

const TelemetryTab: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
}> = ({ gameState, theme }) => {
    
    const lastLog = gameState.history.matchLogs[0];
    
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase" style={{ color: theme.text }}>
                📊 Última Ronda
            </h3>

            {lastLog ? (
                <div className="space-y-3">
                    {/* Basic Info */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.accent}10` }}>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="opacity-70" style={{ color: theme.sub }}>Categoría:</span>
                                <span className="font-bold ml-2" style={{ color: theme.text }}>
                                    {lastLog.category}
                                </span>
                            </div>
                            <div>
                                <span className="opacity-70" style={{ color: theme.sub }}>Palabra:</span>
                                <span className="font-bold ml-2" style={{ color: theme.text }}>
                                    {lastLog.word}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Players */}
                    <div>
                        <div className="text-xs font-bold mb-1" style={{ color: theme.text }}>
                            💀 Impostores ({lastLog.impostors.length})
                        </div>
                        <div className="text-xs opacity-70" style={{ color: theme.sub }}>
                            {lastLog.impostors.join(', ')}
                        </div>
                    </div>

                    {/* Telemetry */}
                    {lastLog.telemetry && lastLog.telemetry.length > 0 && (
                        <div>
                            <div className="text-xs font-bold mb-2" style={{ color: theme.text }}>
                                🎯 Probabilidades de Selección
                            </div>
                            <div className="space-y-1">
                                {lastLog.telemetry
                                    .sort((a, b) => b.probabilityPercent - a.probabilityPercent)
                                    .slice(0, 5)
                                    .map((t, i) => (
                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-20 truncate" style={{ color: theme.text }}>
                                            {t.playerName}
                                        </span>
                                        <div className="flex-1 h-2 rounded-full overflow-hidden"
                                            style={{ backgroundColor: theme.border }}>
                                            <div className="h-full transition-all"
                                                style={{
                                                    width: `${t.probabilityPercent}%`,
                                                    backgroundColor: theme.accent
                                                }} />
                                        </div>
                                        <span className="w-10 text-right font-mono" style={{ color: theme.accent }}>
                                            {t.probabilityPercent.toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Renuncia Telemetry */}
                    {lastLog.renunciaTelemetry && (
                        <div className="p-3 rounded-lg border"
                            style={{ 
                                backgroundColor: `${theme.accent}10`,
                                borderColor: `${theme.accent}30`
                            }}>
                            <div className="text-xs font-bold mb-2" style={{ color: theme.accent }}>
                                🛡️ Renuncia v2.0
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                <div>
                                    <span className="opacity-70">Base:</span>
                                    <span className="ml-2">{(lastLog.renunciaTelemetry.finalProbability * 100).toFixed(0)}%</span>
                                </div>
                                <div>
                                    <span className="opacity-70">Karma:</span>
                                    <span className="ml-2">{(lastLog.renunciaTelemetry.karmaBonus * 100).toFixed(0)}%</span>
                                </div>
                                <div>
                                    <span className="opacity-70">Sesión:</span>
                                    <span className="ml-2">{(lastLog.renunciaTelemetry.sessionBonus * 100).toFixed(0)}%</span>
                                </div>
                                <div>
                                    <span className="opacity-70">Streak:</span>
                                    <span className="ml-2">{lastLog.renunciaTelemetry.candidateStreak}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 opacity-50" style={{ color: theme.sub }}>
                    <Terminal size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No hay datos de telemetría aún</p>
                </div>
            )}
        </div>
    );
};

// ============================================================
// TAB: STATE
// ============================================================

const StateTab: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
}> = ({ gameState, theme }) => {
    
    const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
    
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase" style={{ color: theme.text }}>
                👥 Estado de Jugadores
            </h3>

            <div className="space-y-2">
                {Object.entries(gameState.history.playerStats || {}).map(([key, vault]) => (
                    <div key={key}>
                        <button
                            onClick={() => setExpandedPlayer(expandedPlayer === key ? null : key)}
                            className="w-full text-left p-2 rounded-lg transition-all"
                            style={{
                                backgroundColor: theme.cardBg,
                                borderWidth: '1px',
                                borderColor: theme.border
                            }}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold" style={{ color: theme.text }}>
                                    {key}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                        style={{ 
                                            backgroundColor: `${theme.accent}20`,
                                            color: theme.accent 
                                        }}>
                                        Streak: {vault.metrics.civilStreak}
                                    </span>
                                    {expandedPlayer === key ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </div>
                            </div>
                        </button>

                        {expandedPlayer === key && (
                            <div className="mt-2 p-3 rounded-lg text-[10px] font-mono space-y-1"
                                style={{ 
                                    backgroundColor: `${theme.bg}80`,
                                    borderWidth: '1px',
                                    borderColor: theme.border
                                }}>
                                <div className="grid grid-cols-2 gap-2" style={{ color: theme.sub }}>
                                    <div>Sesiones: {vault.metrics.totalSessions}</div>
                                    <div>Ratio Imp: {(vault.metrics.impostorRatio * 100).toFixed(0)}%</div>
                                    <div>Victorias Imp: {vault.metrics.totalImpostorWins}</div>
                                    <div>Cuarentenas: {vault.metrics.quarantineRounds}</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================
// TAB: TOOLS
// ============================================================

const ToolsTab: React.FC<{
    theme: ThemeConfig;
    onExportState: () => void;
    onImportState: (state: string) => void;
    onResetStats: () => void;
    onSimulateRound: () => void;
}> = ({ theme, onExportState, onImportState, onResetStats, onSimulateRound }) => {
    
    return (
        <div className="space-y-3">
            <ActionButton
                icon={<Download size={14} />}
                label="Exportar Estado"
                desc="Descargar JSON del estado actual"
                onClick={onExportState}
                theme={theme}
            />

            <ActionButton
                icon={<Upload size={14} />}
                label="Importar Estado"
                desc="Cargar estado desde JSON"
                onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            onImportState(event.target?.result as string);
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                }}
                theme={theme}
            />

            <ActionButton
                icon={<SkipForward size={14} />}
                label="Simular Ronda"
                desc="Avanzar sin jugar"
                onClick={onSimulateRound}
                theme={theme}
            />

            <ActionButton
                icon={<Trash2 size={14} />}
                label="Reset Estadísticas"
                desc="⚠️ Borrar todo el historial"
                onClick={() => {
                    if (confirm('¿Seguro? Esto borrará todas las estadísticas INFINITUM')) {
                        onResetStats();
                    }
                }}
                theme={theme}
                danger
            />
        </div>
    );
};

// ============================================================
// HELPER COMPONENTS
// ============================================================

const ToggleButton: React.FC<{
    label: string;
    active: boolean;
    onClick: () => void;
    theme: ThemeConfig;
}> = ({ label, active, onClick, theme }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-2 rounded-lg border transition-all"
        style={{
            backgroundColor: active ? `${theme.accent}20` : theme.cardBg,
            borderColor: active ? theme.accent : theme.border
        }}>
        <span className="text-xs font-bold" style={{ color: theme.text }}>
            {label}
        </span>
        <div className={`w-8 h-4 rounded-full transition-all ${active ? 'justify-end' : 'justify-start'} flex items-center px-0.5`}
            style={{ backgroundColor: active ? theme.accent : theme.border }}>
            <div className="w-3 h-3 rounded-full bg-white" />
        </div>
    </button>
);

const StatCard: React.FC<{
    label: string;
    value: string | number;
    theme: ThemeConfig;
}> = ({ label, value, theme }) => (
    <div className="p-2 rounded-lg text-center"
        style={{ backgroundColor: `${theme.accent}10` }}>
        <div className="text-[10px] opacity-70 uppercase" style={{ color: theme.sub }}>
            {label}
        </div>
        <div className="text-lg font-black" style={{ color: theme.accent }}>
            {value}
        </div>
    </div>
);

const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    desc: string;
    onClick: () => void;
    theme: ThemeConfig;
    danger?: boolean;
}> = ({ icon, label, desc, onClick, theme, danger }) => (
    <button
        onClick={onClick}
        className="w-full flex items-start gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
            backgroundColor: theme.cardBg,
            borderColor: danger ? '#ef4444' : theme.border
        }}>
        <div className="shrink-0 p-1.5 rounded-lg"
            style={{ backgroundColor: danger ? 'rgba(239, 68, 68, 0.2)' : `${theme.accent}20` }}>
            <div style={{ color: danger ? '#ef4444' : theme.accent }}>
                {icon}
            </div>
        </div>
        <div className="flex-1 text-left">
            <div className="text-xs font-bold" style={{ color: theme.text }}>
                {label}
            </div>
            <div className="text-[10px] opacity-70" style={{ color: theme.sub }}>
                {desc}
            </div>
        </div>
    </button>
);