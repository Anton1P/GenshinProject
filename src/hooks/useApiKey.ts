import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });

  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) {
      setKeyStatus('idle');
      setIsValidating(false);
      return;
    }

    const validateGeminiKey = async (key: string) => {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (res.ok) {
          setKeyStatus('valid');
        } else {
          setKeyStatus('invalid');
        }
      } catch (error) {
        setKeyStatus('invalid');
      } finally {
        setIsValidating(false);
      }
    };

    setIsValidating(true);
    setKeyStatus('idle');
    
    const timeoutId = setTimeout(() => {
      validateGeminiKey(apiKey);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [apiKey]);

  return { apiKey, setApiKey, isValidating, keyStatus };
};
