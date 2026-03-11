import React, { useState, useRef } from 'react';
import { ThemeConfig, CategoryPreset } from '../../types';

interface Props {
    selectedCategories: string[];
    theme: ThemeConfig;
    onSave: (preset: CategoryPreset) => void;
    onClose: () => void;
}

export const SavePresetModal: React.FC<Props> = ({ selectedCategories, theme, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('');
    const nameRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            nameRef.current?.focus();
            return;
        }
        const preset: CategoryPreset = {
            id: Date.now().toString(),
            name: trimmedName,
            emoji: emoji.trim() || '⭐',
            categories: [...selectedCategories],
            createdAt: Date.now()
        };
        onSave(preset);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-sm p-6 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-300"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
                <h3 className="text-lg font-black mb-1 uppercase" style={{ color: theme.text }}>Guardar Preset</h3>
                <p className="text-[10px] mb-4 opacity-60" style={{ color: theme.sub }}>
                    {selectedCategories.length} categorías seleccionadas
                </p>

                <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Nombre del preset (ej: Fiesta Loca)"
                    className="w-full px-4 py-3 rounded-xl mb-3 outline-none text-sm font-bold border focus:border-white/50 transition-colors"
                    style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: name ? theme.accent : theme.border }}
                    autoFocus
                    maxLength={30}
                />

                <input
                    type="text"
                    value={emoji}
                    onChange={e => setEmoji(e.target.value)}
                    placeholder="Emoji (ej: 🍕)"
                    maxLength={2}
                    className="w-full px-4 py-3 rounded-xl mb-6 outline-none text-center text-2xl border focus:border-white/50 transition-colors"
                    style={{ backgroundColor: theme.cardBg, color: theme.text, borderColor: theme.border }}
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-xs uppercase"
                        style={{ backgroundColor: theme.border, color: theme.text }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        className="flex-1 py-3 rounded-xl font-bold text-xs uppercase shadow-lg disabled:opacity-40"
                        style={{ backgroundColor: theme.accent, color: 'white' }}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
