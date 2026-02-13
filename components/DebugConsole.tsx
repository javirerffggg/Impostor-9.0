

import React, { useState, useEffect } from 'react';
import { 
    Bug, X, Eye, EyeOff, Zap, Users, Brain, Download, 
    Upload, RotateCcw, Play, Pause, SkipForward, Trash2,
    ChevronDown, ChevronUp, Settings, Terminal, BarChart3,
    Infinity, Gavel, Crown
} from 'lucide-react';
import { GameState, TrollScenario, ThemeConfig, InfinityVault, Player } from '../types';
import { generateGameData } from '../utils/gameLogic'; // Assuming we can use this for simulation
import { PLAYER_COLORS } from '../constants';

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

type TabType = 'override' | 'infinitum' | 'telemetry' | 'state' | 'tools' | 'godmode';

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
    const [overlayMode, setOverlayMode] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            // Ctrl/Cmd + Shift + D = Toggle Debug Console
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                onClose();
            }
            // Ctrl/Cmd + Shift + 1-6 = Switch tabs
            if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                const tabs: TabType[] = ['override', 'infinitum', 'telemetry', 'state', 'tools', 'godmode'];
                const num = parseInt(e.key);
                if (num >= 1 && num <= 6) {
                    e.preventDefault();
                    setActiveTab(tabs[num - 1]);
                }
            }
            // Ctrl+Shift+T = Forzar Troll aleatorio
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                const scenarios: TrollScenario[] = ['espejo_total', 'civil_solitario', 'falsa_alarma'];
                const random = scenarios[Math.floor(Math.random() * scenarios.length)];
                onForceTroll(random);
            }
            
            // Ctrl+Shift+A = Toggle Architect
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                onForceArchitect(!gameState.debugState.forceArchitect);
            }
            
            // Ctrl+Shift+H = Mostrar ayuda de shortcuts
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
                e.preventDefault();
                setShowShortcuts(true);
            }
            
            // Esc = Cerrar debug console
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [onClose, gameState.debugState.forceArchitect, onForceArchitect, onForceTroll]);

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
        { id: 'infinitum' as TabType, label: 'INFINITUM', icon: <Infinity size={14} /> },
        { id: 'godmode' as TabType, label: 'God Mode', icon: <Crown size={14} /> },
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
                className="flex items-center justify-between px-4 py-2 cursor-move rounded-t-xl border-2 transition-all duration-300"
                style={{
                    backgroundColor: overlayMode ? `${theme.cardBg}40` : theme.cardBg,
                    backdropFilter: overlayMode ? 'blur(4px)' : 'none',
                    borderColor: theme.accent,
                    boxShadow: `0 0 20px ${theme.accent}50`
                }}
                onMouseDown={(e) => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseEnter={() => overlayMode && setOverlayMode(false)}
            >
                
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
                        v9.5
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Overlay Toggle */}
                    <button
                        onClick={() => setOverlayMode(!overlayMode)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
                        style={{ 
                            backgroundColor: overlayMode ? `${theme.accent}30` : 'transparent',
                            color: theme.text 
                        }}
                        title={overlayMode ? 'Modo Sólido' : 'Modo Overlay'}>
                        {overlayMode ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

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
                    className={`border-2 border-t-0 rounded-b-xl overflow-hidden transition-all duration-300 ${overlayMode ? 'pointer-events-none' : ''}`}
                    style={{
                        backgroundColor: overlayMode ? `${theme.cardBg}40` : `${theme.cardBg}f5`,
                        borderColor: theme.accent,
                        backdropFilter: overlayMode ? 'blur(4px)' : 'blur(20px)',
                        opacity: overlayMode ? 0.85 : 1
                    }}
                    onMouseEnter={() => overlayMode && setOverlayMode(false)}
                >
                    
                    {/* Tabs */}
                    <div className="flex border-b overflow-x-auto no-scrollbar" style={{ borderColor: theme.border }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap min-w-fit"
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

                        {activeTab === 'infinitum' && (
                            <InfinitumTab
                                gameState={gameState}
                                theme={theme}
                            />
                        )}

                        {activeTab === 'godmode' && (
                            <GodModeTab
                                gameState={gameState}
                                theme={theme}
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
                                gameState={gameState}
                                theme={theme}
                                onExportState={onExportState}
                                onImportState={onImportState}
                                onResetStats={onResetStats}
                                onSimulateRound={onSimulateRound}
                            />
                        )}
                    </div>

                    {/* Footer - Shortcuts */}
                    <div className="px-4 py-2 border-t text-[10px] font-mono flex justify-between items-center"
                        style={{ 
                            borderColor: theme.border,
                            color: theme.sub,
                            backgroundColor: `${theme.bg}80`
                        }}>
                        <div className="flex flex-wrap gap-3">
                            <span>⌘⇧D: Toggle</span>
                            <span>Round: {gameState.history.roundCounter}</span>
                            <span>Phase: {gameState.phase}</span>
                        </div>
                        <button 
                            onClick={() => setShowShortcuts(true)}
                            className="text-[9px] underline hover:text-white"
                        >
                            Ver Atajos (⌘⇧H)
                        </button>
                    </div>
                </div>
            )}

            {/* Shortcuts Modal */}
            {showShortcuts && (
                <div 
                    className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowShortcuts(false)}>
                    <div 
                        className="w-full max-w-md rounded-2xl border-2 p-6"
                        style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.accent
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        
                        <h3 className="text-lg font-black uppercase mb-4" style={{ color: theme.text }}>
                            ⌨️ Atajos de Teclado
                        </h3>
                        
                        <div className="space-y-2 text-xs">
                            {[
                                { keys: 'Ctrl+Shift+D', desc: 'Toggle Debug Console' },
                                { keys: 'Ctrl+Shift+1-6', desc: 'Cambiar de Tab' },
                                { keys: 'Ctrl+Shift+T', desc: 'Troll Aleatorio' },
                                { keys: 'Ctrl+Shift+A', desc: 'Toggle Arquitecto' },
                                { keys: 'Ctrl+Shift+H', desc: 'Esta Ayuda' },
                                { keys: 'Esc', desc: 'Cerrar Console' }
                            ].map((shortcut, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg"
                                    style={{ backgroundColor: `${theme.bg}80` }}>
                                    <kbd 
                                        className="px-2 py-1 rounded font-mono text-[10px]"
                                        style={{ 
                                            backgroundColor: theme.accent,
                                            color: '#ffffff'
                                        }}>
                                        {shortcut.keys}
                                    </kbd>
                                    <span style={{ color: theme.sub }}>
                                        {shortcut.desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setShowShortcuts(false)}
                            className="w-full mt-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: theme.accent,
                                color: '#ffffff'
                            }}>
                            Cerrar
                        </button>
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
// TAB: INFINITUM
// ============================================================

const InfinitumTab: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
}> = ({ gameState, theme }) => {
    
    // Simulate probability calculation based on current stats
    const calculateCurrentProbabilities = () => {
        const stats = gameState.history.playerStats;
        return gameState.players.map(player => {
            const vault = stats[player.name.trim().toLowerCase()];
            if (!vault) return { name: player.name, probability: 0, factors: [] };
            
            // Simplified factors for visualization
            const factors = [
                { 
                    name: 'Racha Civil', 
                    value: vault.metrics.civilStreak,
                    impact: vault.metrics.civilStreak * 15, // Approx +15% per round
                    color: '#10b981'
                },
                {
                    name: 'Ratio Impostor',
                    value: `${(vault.metrics.impostorRatio * 100).toFixed(0)}%`,
                    impact: vault.metrics.impostorRatio < 0.3 ? 20 : -10,
                    color: '#ef4444'
                },
                {
                    name: 'Cuarentena',
                    value: vault.metrics.quarantineRounds,
                    impact: vault.metrics.quarantineRounds > 0 ? -50 : 0,
                    color: '#f59e0b'
                }
            ];
            
            const totalImpact = Math.max(0, 50 + factors.reduce((sum, f) => sum + f.impact, 0)); // Base 50 + impact
            
            return {
                name: player.name,
                probability: Math.min(100, totalImpact),
                factors
            };
        }).sort((a, b) => b.probability - a.probability);
    };
    
    const probabilities = calculateCurrentProbabilities();
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase" style={{ color: theme.text }}>
                    ⚖️ Motor INFINITUM
                </h3>
                <div className="text-[10px] font-mono px-2 py-1 rounded-full"
                    style={{ 
                        backgroundColor: `${theme.accent}20`,
                        color: theme.accent 
                    }}>
                    Paranoia: {gameState.history.paranoiaLevel}%
                </div>
            </div>
            
            {/* Gráfico de probabilidades */}
            <div className="space-y-2">
                {probabilities.map((p, i) => (
                    <div key={i}>
                        <button
                            onClick={() => setSelectedPlayer(selectedPlayer === p.name ? null : p.name)}
                            className="w-full text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold w-24 truncate" style={{ color: theme.text }}>
                                    {p.name}
                                </span>
                                <div className="flex-1 h-3 rounded-full overflow-hidden relative"
                                    style={{ backgroundColor: theme.border }}>
                                    {/* Barra de probabilidad */}
                                    <div 
                                        className="h-full transition-all duration-1000 relative overflow-hidden"
                                        style={{
                                            width: `${p.probability}%`,
                                            backgroundColor: theme.accent
                                        }}>
                                        {/* Efecto shimmer */}
                                        <div 
                                            className="absolute inset-0 opacity-50 animate-shimmer"
                                            style={{
                                                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Threshold de activación (70%) */}
                                    <div 
                                        className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                                        style={{ left: '70%' }}
                                    />
                                </div>
                                <span className="text-xs font-mono w-12 text-right" style={{ color: theme.accent }}>
                                    {p.probability.toFixed(0)}%
                                </span>
                            </div>
                        </button>
                        
                        {/* Detalles expandibles */}
                        {selectedPlayer === p.name && (
                            <div className="mt-2 p-3 rounded-lg space-y-2 animate-in slide-in-from-top-2 duration-200"
                                style={{ 
                                    backgroundColor: `${theme.bg}80`,
                                    border: `1px solid ${theme.border}`
                                }}>
                                {p.factors.map((factor, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[10px]">
                                        <span style={{ color: theme.sub }}>{factor.name}:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono" style={{ color: theme.text }}>
                                                {factor.value}
                                            </span>
                                            <span 
                                                className="font-bold"
                                                style={{ color: factor.color }}
                                            >
                                                {factor.impact > 0 ? '+' : ''}{factor.impact}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Leyenda */}
            <div className="p-3 rounded-lg space-y-1 text-[10px]"
                style={{ 
                    backgroundColor: `${theme.accent}10`,
                    border: `1px solid ${theme.border}`
                }}>
                <div className="font-bold mb-2" style={{ color: theme.text }}>
                    💡 Cómo Funciona
                </div>
                <div style={{ color: theme.sub }}>
                    • <strong>Racha Civil:</strong> +15% por cada ronda sin ser impostor
                </div>
                <div style={{ color: theme.sub }}>
                    • <strong>Ratio Bajo:</strong> +20% si has sido impostor menos del 30%
                </div>
                <div style={{ color: theme.sub }}>
                    • <strong>Cuarentena:</strong> -50% durante penalización
                </div>
                <div style={{ color: theme.sub }}>
                    • <strong>Threshold:</strong> Línea blanca marca el 70% de activación
                </div>
            </div>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

// ============================================================
// TAB: GOD MODE
// ============================================================

const GodModeTab: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
}> = ({ gameState, theme }) => {
    
    // Note: In a real implementation, we would need a callback to set these assignments in GameState
    // For now, this is a UI prototype as requested.
    const [assignments, setAssignments] = useState<Record<string, string>>({});
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase" style={{ color: theme.text }}>
                    👑 Modo Dios
                </h3>
                <span className="text-[8px] px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold">
                    EXPERIMENTAL
                </span>
            </div>
            
            <p className="text-[10px] opacity-70" style={{ color: theme.sub }}>
                Asigna manualmente los roles para la próxima ronda. Deja vacío para asignación automática.
            </p>
            
            {/* Lista de jugadores */}
            <div className="space-y-2">
                {gameState.players.map(player => (
                    <div 
                        key={player.id}
                        className="flex items-center gap-3 p-2 rounded-lg"
                        style={{ backgroundColor: `${theme.bg}80` }}>
                        
                        <span className="text-xs font-bold flex-1" style={{ color: theme.text }}>
                            {player.name}
                        </span>
                        
                        {/* Selector de rol */}
                        <select
                            value={assignments[player.id] || 'auto'}
                            onChange={(e) => setAssignments(prev => ({
                                ...prev,
                                [player.id]: e.target.value
                            }))}
                            className="text-xs px-2 py-1 rounded border"
                            style={{
                                backgroundColor: theme.cardBg,
                                borderColor: theme.border,
                                color: theme.text
                            }}>
                            <option value="auto">🎲 Auto</option>
                            <option value="civil">🛡️ Civil</option>
                            <option value="impostor">💀 Impostor</option>
                            <option value="architect">👑 Arquitecto</option>
                            <option value="oracle">🔮 Oráculo</option>
                            <option value="magistrado">⚖️ Magistrado</option>
                        </select>
                    </div>
                ))}
            </div>
            
            {/* Validación */}
            {(() => {
                const impostorCount = Object.values(assignments).filter(r => r === 'impostor').length;
                const hasConflict = impostorCount > gameState.impostorCount;
                
                return (
                    <div 
                        className="p-3 rounded-lg border"
                        style={{
                            backgroundColor: hasConflict ? 'rgba(239, 68, 68, 0.1)' : `${theme.accent}10`,
                            borderColor: hasConflict ? '#ef4444' : theme.accent
                        }}>
                        <div className="text-xs font-bold mb-1" style={{ color: hasConflict ? '#ef4444' : theme.text }}>
                            {hasConflict ? '⚠️ Conflicto Detectado' : '✅ Configuración Válida'}
                        </div>
                        <div className="text-[10px]" style={{ color: hasConflict ? '#ef4444' : theme.sub }}>
                            {hasConflict 
                                ? `Tienes ${impostorCount} impostores asignados pero el límite es ${gameState.impostorCount}`
                                : `${impostorCount} impostor(es) asignado(s) de ${gameState.impostorCount} máximo`
                            }
                        </div>
                    </div>
                );
            })()}
            
            {/* Botones de acción */}
            <div className="flex gap-2">
                <button
                    onClick={() => setAssignments({})}
                    className="flex-1 py-2 rounded-lg border text-xs font-bold"
                    style={{
                        backgroundColor: theme.cardBg,
                        borderColor: theme.border,
                        color: theme.text
                    }}>
                    Resetear
                </button>
                <button
                    onClick={() => alert("Asignación guardada para la próxima ronda (Simulación)")}
                    className="flex-1 py-2 rounded-lg text-xs font-bold"
                    style={{
                        backgroundColor: theme.accent,
                        color: '#ffffff'
                    }}>
                    Aplicar
                </button>
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
    const [showTimeline, setShowTimeline] = useState(false);
    
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black uppercase" style={{ color: theme.text }}>
                📊 Telemetría
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

                    {/* Timeline Toggle */}
                    <button
                        onClick={() => setShowTimeline(!showTimeline)}
                        className="w-full p-2 rounded-lg border text-xs font-bold"
                        style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.border,
                            color: theme.text
                        }}>
                        {showTimeline ? 'Ocultar' : 'Ver'} Timeline Histórico
                    </button>

                    {showTimeline && (
                        <div className="mt-4 p-4 rounded-xl border"
                            style={{
                                backgroundColor: `${theme.bg}80`,
                                borderColor: theme.border
                            }}>
                            <h4 className="text-xs font-bold mb-3" style={{ color: theme.text }}>
                                📈 Últimas 20 Rondas
                            </h4>
                            
                            {/* Mini gráfico de quién ha sido impostor */}
                            <div className="space-y-1">
                                {gameState.history.matchLogs.slice(0, 20).reverse().map((log, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[9px] w-8 font-mono opacity-50" style={{ color: theme.sub }}>
                                            #{log.round || i + 1}
                                        </span>
                                        <div className="flex-1 flex gap-0.5">
                                            {gameState.players.map((player, j) => {
                                                const wasImpostor = log.impostors.includes(player.name);
                                                return (
                                                    <div
                                                        key={j}
                                                        className="flex-1 h-4 rounded-sm transition-colors"
                                                        style={{
                                                            backgroundColor: wasImpostor 
                                                                ? '#ef4444' 
                                                                : `${theme.border}`,
                                                            opacity: wasImpostor ? 1 : 0.3
                                                        }}
                                                        title={`${player.name}: ${wasImpostor ? 'Impostor' : 'Civil'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Leyenda */}
                            <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                                {gameState.players.map((player, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                                        <span style={{ color: theme.sub }}>{player.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Telemetry Details */}
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
                {Object.entries(gameState.history.playerStats || {}).map(([key, vault]) => {
                    // Type assertion to ensure TS understands the shape of vault
                    const v = vault as InfinityVault;
                    return (
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
                                            Streak: {v.metrics.civilStreak}
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
                                        <div>Sesiones: {v.metrics.totalSessions}</div>
                                        <div>Ratio Imp: {(v.metrics.impostorRatio * 100).toFixed(0)}%</div>
                                        <div>Victorias Imp: {v.metrics.totalImpostorWins}</div>
                                        <div>Cuarentenas: {v.metrics.quarantineRounds}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================
// TAB: TOOLS
// ============================================================

const ToolsTab: React.FC<{
    gameState: GameState;
    theme: ThemeConfig;
    onExportState: () => void;
    onImportState: (state: string) => void;
    onResetStats: () => void;
    onSimulateRound: () => void;
}> = ({ gameState, theme, onExportState, onImportState, onResetStats, onSimulateRound }) => {
    
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');
    const [showSimulator, setShowSimulator] = useState(false);
    const [simulationResults, setSimulationResults] = useState<any[]>([]);

    const exportData = () => {
        const data = gameState.history;
        
        if (exportFormat === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `impostor_state_${Date.now()}.json`;
            a.click();
        } else if (exportFormat === 'csv') {
            let csv = 'Ronda,Palabra,Categoría,Impostores,Fecha\n';
            data.matchLogs.forEach(log => {
                csv += `${log.round || '?'},${log.word},${log.category},"${log.impostors.join(', ')}",${new Date().toISOString()}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `impostor_history_${Date.now()}.csv`;
            a.click();
        } else if (exportFormat === 'txt') {
            let txt = '═══════════════════════════════════\n';
            txt += '  IMPOSTOR 9.0 - HISTORIAL\n';
            txt += `  Total Rondas: ${data.roundCounter}\n`;
            txt += `  Fecha: ${new Date().toLocaleString()}\n`;
            txt += '═══════════════════════════════════\n\n';
            data.matchLogs.forEach((log, i) => {
                txt += `RONDA #${log.round || i + 1}\n`;
                txt += `├─ Palabra: ${log.word}\n`;
                txt += `├─ Categoría: ${log.category}\n`;
                txt += `└─ Impostores: ${log.impostors.join(', ')}\n\n`;
            });
            const blob = new Blob([txt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `impostor_history_${Date.now()}.txt`;
            a.click();
        }
    };

    const runSimulation = (rounds: number) => {
        // Simplified Simulation Logic for UI Demo
        const results = [];
        const players = gameState.players.map(p => p.name);
        
        for (let i = 0; i < rounds; i++) {
            const impostor = players[Math.floor(Math.random() * players.length)];
            results.push({
                round: gameState.history.roundCounter + i + 1,
                impostors: [impostor],
                word: "Simulación",
                category: "Test"
            });
        }
        setSimulationResults(results);
    };

    return (
        <div className="space-y-4">
            
            {/* Simulator Button */}
            <button
                onClick={() => setShowSimulator(true)}
                className="w-full p-3 rounded-lg border"
                style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border
                }}>
                <div className="flex items-center gap-3">
                    <SkipForward size={14} style={{ color: theme.accent }} />
                    <div className="text-left">
                        <div className="text-xs font-bold" style={{ color: theme.text }}>
                            Simulador de Rondas
                        </div>
                        <div className="text-[10px] opacity-70" style={{ color: theme.sub }}>
                            Ver probabilidades futuras
                        </div>
                    </div>
                </div>
            </button>

            {/* Export Section */}
            <div className="space-y-2 p-3 rounded-lg border" style={{ borderColor: theme.border }}>
                <div className="text-xs font-bold" style={{ color: theme.text }}>
                    Formato de Exportación
                </div>
                <div className="flex gap-2">
                    {(['json', 'csv', 'txt'] as const).map(format => (
                        <button
                            key={format}
                            onClick={() => setExportFormat(format)}
                            className="flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all"
                            style={{
                                backgroundColor: exportFormat === format ? `${theme.accent}20` : theme.cardBg,
                                borderColor: exportFormat === format ? theme.accent : theme.border,
                                color: exportFormat === format ? theme.accent : theme.text
                            }}>
                            {format}
                        </button>
                    ))}
                </div>
                
                <button
                    onClick={exportData}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg mt-2 active:scale-95 transition-all"
                    style={{
                        backgroundColor: theme.accent,
                        color: '#ffffff'
                    }}>
                    <Download size={14} />
                    <span className="text-xs font-bold">Descargar Historial</span>
                </button>
            </div>

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

            {/* Simulator Modal */}
            {showSimulator && (
                <div 
                    className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowSimulator(false)}>
                    <div 
                        className="w-full max-w-lg rounded-2xl border-2 p-6 max-h-[80vh] overflow-y-auto"
                        style={{
                            backgroundColor: theme.cardBg,
                            borderColor: theme.accent
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black uppercase" style={{ color: theme.text }}>
                                🔮 Simulador de Rondas
                            </h3>
                            <button onClick={() => setShowSimulator(false)}>
                                <X size={20} style={{ color: theme.text }} />
                            </button>
                        </div>
                        
                        {/* Controles */}
                        <div className="flex gap-2 mb-4">
                            {[5, 10, 20, 50].map(n => (
                                <button
                                    key={n}
                                    onClick={() => runSimulation(n)}
                                    className="flex-1 py-2 rounded-lg border text-xs font-bold"
                                    style={{
                                        backgroundColor: `${theme.accent}20`,
                                        borderColor: theme.accent,
                                        color: theme.text
                                    }}>
                                    {n} R
                                </button>
                            ))}
                        </div>
                        
                        {/* Resultados */}
                        {simulationResults.length > 0 && (
                            <div className="space-y-2">
                                {/* Análisis estadístico */}
                                <div className="mb-4 p-4 rounded-xl border-2"
                                    style={{
                                        backgroundColor: `${theme.accent}10`,
                                        borderColor: theme.accent
                                    }}>
                                    <h4 className="text-sm font-bold mb-2" style={{ color: theme.text }}>
                                        📊 Análisis de Simulación
                                    </h4>
                                    {(() => {
                                        const counts: Record<string, number> = {};
                                        simulationResults.forEach(r => {
                                            r.impostors.forEach((name: string) => {
                                                counts[name] = (counts[name] || 0) + 1;
                                            });
                                        });
                                        
                                        return Object.entries(counts)
                                            .sort(([,a], [,b]) => b - a)
                                            .slice(0, 5)
                                            .map(([name, count]) => (
                                                <div key={name} className="flex items-center gap-2 text-xs mb-1">
                                                    <span className="w-20 truncate" style={{ color: theme.text }}>{name}:</span>
                                                    <div className="flex-1 h-2 rounded-full overflow-hidden"
                                                        style={{ backgroundColor: theme.border }}>
                                                        <div 
                                                            className="h-full"
                                                            style={{
                                                                width: `${(count / simulationResults.length) * 100}%`,
                                                                backgroundColor: theme.accent
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="font-mono" style={{ color: theme.accent }}>
                                                        {((count / simulationResults.length) * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            ));
                                    })()}
                                </div>

                                <div className="text-xs opacity-50 text-center">
                                    Simulación basada en estado actual. Resultados no guardados.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
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