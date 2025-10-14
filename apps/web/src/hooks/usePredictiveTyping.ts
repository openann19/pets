import { useCallback, useState } from 'react';

interface PredictiveTypingConfig {
  maxSuggestions: number;
  minConfidence: number;
  contextWindow: number;
  learningRate: number;
}

interface LanguageModel {
  vocabulary: Map<string, number>;
  bigrams: Map<string, number>;
  trigrams: Map<string, number>;
  contextModel: Map<string, Map<string, number>>;
  totalTokens: number;
}

interface Prediction {
  text: string;
  confidence: number;
  probability: number;
  context: string[];
}

export const usePredictiveTyping = (config: PredictiveTypingConfig = { maxSuggestions: 5, minConfidence: 0.5, contextWindow: 10, learningRate: 0.1 }) => {
  const [languageModel, setLanguageModel] = useState<LanguageModel>({
    vocabulary: new Map(),
    bigrams: new Map(),
    trigrams: new Map(),
    contextModel: new Map(),
    totalTokens: 0,
  });
  const [isLearning, setIsLearning] = useState(false);
  const [predictionCache, setPredictionCache] = useState<Map<string, Prediction[]>>(new Map());

  // Tokenize text into words and meaningful units
  const tokenize = useCallback((text: string): string[] =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .filter((token) => token.length > 0) // Remove empty tokens
    , []);

  // Build language model from training data
  const buildLanguageModel = useCallback((trainingTexts: string[]) => {
    setIsLearning(true);

    const vocabulary = new Map<string, number>();
    const bigrams = new Map<string, number>();
    const trigrams = new Map<string, number>();
    const contextModel = new Map<string, Map<string, number>>();
    let totalTokens = 0;

    // Process each training text
    trainingTexts.forEach((text) => {
      const tokens = tokenize(text);

      tokens.forEach((token, index) => {
        totalTokens++;

        // Update vocabulary
        vocabulary.set(token, (vocabulary.get(token) || 0) + 1);

        // Update bigrams
        if (index > 0) {
          const bigram = `${tokens[index - 1]} ${token}`;
          bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
        }

        // Update trigrams
        if (index > 1) {
          const trigram = `${tokens[index - 2]} ${tokens[index - 1]} ${token}`;
          trigrams.set(trigram, (trigrams.get(trigram) || 0) + 1);
        }

        // Update context model
        if (index > 0) {
          const context = tokens[index - 1];
          if (context && !contextModel.has(context)) {
            contextModel.set(context, new Map());
          }
          if (context) {
            const contextMap = contextModel.get(context)!;
            contextMap.set(token, (contextMap.get(token) || 0) + 1);
          }
        }
      });
    });

    setLanguageModel({
      vocabulary,
      bigrams,
      trigrams,
      contextModel,
      totalTokens,
    });

    setIsLearning(false);
  }, [tokenize]);

  // Calculate n-gram probability
  const calculateProbability = useCallback(
    (context: string[], token: string): number => {
      if (context.length === 0) {
        // Unigram probability
        const tokenCount = languageModel.vocabulary.get(token) || 0;
        return tokenCount / languageModel.totalTokens;
      }

      if (context.length === 1) {
        // Bigram probability
        const bigram = `${context[0]} ${token}`;
        const bigramCount = languageModel.bigrams.get(bigram) || 0;
        const contextCount = context[0] ? languageModel.vocabulary.get(context[0]) || 0 : 0;
        return contextCount > 0 ? bigramCount / contextCount : 0;
      }

      if (context.length === 2) {
        // Trigram probability
        const trigram = `${context[0]} ${context[1]} ${token}`;
        const trigramCount = languageModel.trigrams.get(trigram) || 0;
        const bigram = `${context[0]} ${context[1]}`;
        const bigramCount = languageModel.bigrams.get(bigram) || 0;
        return bigramCount > 0 ? trigramCount / bigramCount : 0;
      }

      // Fallback to context model
      const contextKey = context.join(' ');
      const contextMap = languageModel.contextModel.get(contextKey);
      if (!contextMap) return 0;

      const tokenCount = contextMap.get(token) || 0;
      const totalContextCount = Array.from(contextMap.values()).reduce(
        (sum, count) => sum + count,
        0,
      );
      return totalContextCount > 0 ? tokenCount / totalContextCount : 0;
    },
    [languageModel],
  );

  // Generate predictions based on context
  const generatePredictions = useCallback(
    (context: string[]): Prediction[] => {
      const cacheKey = context.join('|');

      // Check cache first
      if (predictionCache.has(cacheKey)) {
        return predictionCache.get(cacheKey)!;
      }

      const predictions: Prediction[] = [];
      const processedTokens = new Set<string>();

      // Get all possible next tokens from vocabulary
      languageModel.vocabulary.forEach((_, token) => {
        if (processedTokens.has(token)) return;

        const probability = calculateProbability(context, token);
        const confidence = Math.min(probability * 100, 1);

        if (confidence >= config.minConfidence) {
          predictions.push({
            text: token,
            confidence,
            probability,
            context: [...context],
          });
          processedTokens.add(token);
        }
      });

      // Sort by confidence and limit results
      predictions.sort((a, b) => b.confidence - a.confidence);
      const limitedPredictions = predictions.slice(0, config.maxSuggestions);

      // Cache the results
      setPredictionCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(cacheKey, limitedPredictions);
        return newCache;
      });

      return limitedPredictions;
    },
    [languageModel, calculateProbability, config, predictionCache],
  );

  // Predict next word based on current text
  const predictNext = useCallback(
    (currentText: string): Prediction[] => {
      const tokens = tokenize(currentText);
      const context = tokens.slice(-config.contextWindow);
      return generatePredictions(context);
    },
    [tokenize, generatePredictions, config.contextWindow],
  );

  // Learn from user input
  const learnFromInput = useCallback(
    (text: string) => {
      const tokens = tokenize(text);

      // Update vocabulary
      tokens.forEach((token) => {
        languageModel.vocabulary.set(token, (languageModel.vocabulary.get(token) || 0) + 1);
      });

      // Update bigrams
      for (let i = 1; i < tokens.length; i++) {
        const bigram = `${tokens[i - 1]} ${tokens[i]}`;
        languageModel.bigrams.set(bigram, (languageModel.bigrams.get(bigram) || 0) + 1);
      }

      // Update trigrams
      for (let i = 2; i < tokens.length; i++) {
        const trigram = `${tokens[i - 2]} ${tokens[i - 1]} ${tokens[i]}`;
        languageModel.trigrams.set(trigram, (languageModel.trigrams.get(trigram) || 0) + 1);
      }

      // Update context model
      for (let i = 1; i < tokens.length; i++) {
        const context = tokens[i - 1];
        const token = tokens[i];
        if (context && token && !languageModel.contextModel.has(context)) {
          languageModel.contextModel.set(context, new Map());
        }
        if (context && token) {
          const contextMap = languageModel.contextModel.get(context)!;
          contextMap.set(token, (contextMap.get(token) || 0) + 1);
        }
      }

      // Update total tokens
      setLanguageModel((prev) => ({
        ...prev,
        totalTokens: prev.totalTokens + tokens.length,
      }));

      // Clear cache to force recalculation
      setPredictionCache(new Map());
    },
    [tokenize, languageModel],
  );

  // Get typing suggestions for autocomplete
  const getSuggestions = useCallback(
    (partialWord: string, context: string[] = []): Prediction[] => {
      const suggestions: Prediction[] = [];
      const lowerPartial = partialWord.toLowerCase();

      languageModel.vocabulary.forEach((_, token) => {
        if (token.toLowerCase().startsWith(lowerPartial)) {
          const probability = calculateProbability(context, token);
          const confidence = Math.min(probability * 100, 1);

          if (confidence >= config.minConfidence) {
            suggestions.push({
              text: token,
              confidence,
              probability,
              context: [...context],
            });
          }
        }
      });

      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, config.maxSuggestions);
    },
    [languageModel, calculateProbability, config],
  );

  // Clear all learned data
  const clearModel = useCallback(() => {
    setLanguageModel({
      vocabulary: new Map(),
      bigrams: new Map(),
      trigrams: new Map(),
      contextModel: new Map(),
      totalTokens: 0,
    });
    setPredictionCache(new Map());
  }, []);

  // Export model for persistence
  const exportModel = useCallback(() => ({
    vocabulary: Array.from(languageModel.vocabulary.entries()),
    bigrams: Array.from(languageModel.bigrams.entries()),
    trigrams: Array.from(languageModel.trigrams.entries()),
    contextModel: Array.from(languageModel.contextModel.entries()).map(([key, value]) => [
      key,
      Array.from(value.entries()),
    ]),
    totalTokens: languageModel.totalTokens,
  }), [languageModel]);

  // Import model from persisted data
  const importModel = useCallback(
    (data: {
      vocabulary: [string, number][];
      bigrams: [string, number][];
      trigrams: [string, number][];
      contextModel: [string, [string, number][]][];
      totalTokens: number;
    }) => {
      setLanguageModel({
        vocabulary: new Map(data.vocabulary),
        bigrams: new Map(data.bigrams),
        trigrams: new Map(data.trigrams),
        contextModel: new Map(
          data.contextModel.map(([key, value]: [string, [string, number][]]) => [
            key,
            new Map(value),
          ]),
        ),
        totalTokens: data.totalTokens,
      });
      setPredictionCache(new Map());
    },
    [],
  );

  return {
    predictNext,
    getSuggestions,
    learnFromInput,
    buildLanguageModel,
    clearModel,
    exportModel,
    importModel,
    languageModel,
    isLearning,
    predictionCache: Array.from(predictionCache.entries()),
  };
};
