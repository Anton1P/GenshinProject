import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { Character } from '../types';

interface AIPromptHelperProps {
    onSelectPrompt: (promptText: string) => void;
    showcaseCharacters: Character[];
}

const AIPromptHelper: React.FC<AIPromptHelperProps> = ({ onSelectPrompt, showcaseCharacters }) => {
    // ── Generate one suggestion per valid showcase character ──
    const suggestions = useMemo(() => {
        if (!showcaseCharacters || showcaseCharacters.length === 0) return [];

        return showcaseCharacters
            .filter((c: any) => c.name)
            .map((char) => ({
                label: `✨ Team ${char.name}`,
                payload: `Make the best team for ${char.name}`,
            }));
    }, [showcaseCharacters]);

    // Nothing to show if no characters
    if (suggestions.length === 0) return null;

    return (
        <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Suggestions
                </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {suggestions.map(({ label, payload }) => (
                    <button
                        key={label}
                        onClick={() => onSelectPrompt(payload)}
                        className="px-2.5 py-1 text-xs rounded-full
                       border border-slate-700 bg-slate-800/50 text-slate-300
                       hover:bg-slate-700 hover:text-slate-100
                       transition-colors cursor-pointer whitespace-nowrap"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIPromptHelper;
