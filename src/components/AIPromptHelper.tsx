import React, { useMemo } from 'react';
import { Zap } from 'lucide-react';
import { Character } from '../types';

interface AIPromptHelperProps {
    onSelectPrompt: (promptText: string) => void;
    showcaseCharacters: Character[];
}

// ─── Static Quick Prompts ──────────────────────────────────────────
const STATIC_PROMPTS = [
    "🛡️ Équipe Survie / Soin",
    "🌍 Meilleure team Exploration",
    "❄️ Créer une team Freeze",
    "🔥 Team Vaporize optimale",
    "⚡ Team Aggravate / Quicken",
    "💎 Meilleure team Mono-élément",
    "🌱 Team Burgeon / Bloom",
    "⚔️ Meilleure team Hypercarry",
];

const AIPromptHelper: React.FC<AIPromptHelperProps> = ({ onSelectPrompt, showcaseCharacters }) => {
    // ── Contextual suggestions based on showcase ──
    const combinedPrompts = useMemo(() => {
        const dynamic: string[] = [];

        // Filter characters that have weapon or artifacts (i.e. actually built)
        const builtShowcase = showcaseCharacters.filter(
            (c: any) => c.weapon || (c.artifacts && c.artifacts.length > 0)
        );

        // Sort by level descending, take top 2
        const topChars = [...builtShowcase]
            .sort((a: any, b: any) => (b.level ?? 0) - (a.level ?? 0))
            .slice(0, 2);

        topChars.forEach((char) => {
            dynamic.push(`✨ Meilleure équipe pour ${char.name}`);
        });

        // Merge: dynamic first, then static
        return [...dynamic, ...STATIC_PROMPTS];
    }, [showcaseCharacters]);

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Suggestions
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {combinedPrompts.map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => onSelectPrompt(prompt)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full
                       bg-slate-800/70 border border-slate-700/50 text-slate-300
                       hover:bg-purple-500/20 hover:border-purple-500/40 hover:text-purple-200
                       transition-all duration-200 cursor-pointer"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIPromptHelper;
