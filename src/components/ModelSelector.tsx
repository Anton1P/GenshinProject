import React from 'react';
import { Cpu, Loader2, ChevronDown } from 'lucide-react';
import { ModelInfo } from '../services/gemini';

interface ModelSelectorProps {
    selectedModel: string;
    setSelectedModel: (model: string) => void;
    availableModels: ModelInfo[];
    isLoadingModels: boolean;
    compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
    selectedModel,
    setSelectedModel,
    availableModels,
    isLoadingModels,
    compact = false,
}) => {
    return (
        <div className={`flex items-center gap-2 ${compact ? '' : 'w-full'}`}>
            <Cpu className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-fuchsia-400/70 flex-shrink-0`} />
            <div className="relative flex-1 min-w-0">
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isLoadingModels}
                    className={`w-full appearance-none bg-slate-800 border border-slate-700 text-slate-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent
                      transition-all cursor-pointer truncate
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${compact ? 'py-1.5 pl-2.5 pr-7 text-xs' : 'py-2.5 pl-3 pr-8 text-sm'}`}
                >
                    {isLoadingModels ? (
                        <option className="bg-slate-900 text-slate-300">Chargement...</option>
                    ) : availableModels.length > 0 ? (
                        availableModels.map((m) => (
                            <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                                {m.name}
                            </option>
                        ))
                    ) : (
                        <option value={selectedModel} className="bg-slate-900 text-slate-200">
                            {selectedModel}
                        </option>
                    )}
                </select>

                {/* Custom chevron icon */}
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${compact ? 'right-1.5' : 'right-2.5'}`}>
                    {isLoadingModels ? (
                        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelSelector;
