import { useState, useEffect, useCallback } from 'react';
import { fetchAvailableModels, ModelInfo } from '../services/gemini';

const STORAGE_KEY = 'genshin_selected_model';
const DEFAULT_MODEL = 'gemini-3-flash-preview';
const DEPRECATED_MODELS = ['gemini-3.0-flash'];

export const useModelSelector = (apiKey: string) => {
    const [selectedModel, setSelectedModel] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL;
            // Migrate stale cached values from previous versions
            if (DEPRECATED_MODELS.includes(saved)) {
                localStorage.setItem(STORAGE_KEY, DEFAULT_MODEL);
                return DEFAULT_MODEL;
            }
            return saved;
        }
        return DEFAULT_MODEL;
    });

    const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    // Persist to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, selectedModel);
        }
    }, [selectedModel]);

    // Fetch models when API key changes and is valid
    const loadModels = useCallback(async () => {
        if (!apiKey || apiKey.length < 10) {
            setAvailableModels([]);
            return;
        }

        setIsLoadingModels(true);
        try {
            const models = await fetchAvailableModels(apiKey);
            setAvailableModels(models);

            // If the currently selected model isn't in the list, keep it anyway
            // (it might still work or be a preview model)
        } catch (error) {
            console.error('Failed to load models:', error);
        } finally {
            setIsLoadingModels(false);
        }
    }, [apiKey]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadModels();
        }, 1000); // Debounce to avoid spamming during key input

        return () => clearTimeout(timer);
    }, [loadModels]);

    return {
        selectedModel,
        setSelectedModel,
        availableModels,
        isLoadingModels,
    };
};
