import { logger } from '@pawfectmatch/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface NeuralNetworkConfig {
  layers: number[];
  activation: 'relu' | 'sigmoid' | 'tanh' | 'gelu' | 'silu';
  dropout: number;
  attentionHeads: number;
}

interface NeuralNetwork {
  layers: number[];
  weights: number[][][];
  biases: number[][];
  attentionHeads: number;
  activation: string;
  dropout: number;
}

export const useNeuralNetwork = (config: NeuralNetworkConfig = { layers: [64, 32, 16], activation: 'relu', dropout: 0.2, attentionHeads: 4 }) => {
  const [network, setNetwork] = useState<NeuralNetwork | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Initialize neural network
  useEffect(() => {
    const initializeNetwork = (): void => {
      const weights: number[][][] = [];
      const biases: number[][] = [];

      // Ensure config.layers exists and has at least 2 elements
      if (!config?.layers || config.layers.length < 2) {
        logger.error('Neural network configuration is invalid: layers must have at least 2 elements');
        return;
      }

      for (let i = 0; i < config.layers.length - 1; i++) {
        const layerWeights: number[][] = [];
        const layerBiases: number[] = [];

        // Ensure layer sizes are defined
        const inputLayerSize = config.layers[i];
        const outputLayerSize = config.layers[i + 1];

        if (inputLayerSize === undefined || outputLayerSize === undefined) {
          logger.error(`Layer size undefined at index ${i} or ${i + 1}`);
          continue;
        }

        for (let j = 0; j < outputLayerSize; j++) {
          const neuronWeights: number[] = [];
          for (let k = 0; k < inputLayerSize; k++) {
            neuronWeights.push((Math.random() - 0.5) * 0.1);
          }
          layerWeights.push(neuronWeights);
          layerBiases.push((Math.random() - 0.5) * 0.1);
        }

        weights.push(layerWeights);
        biases.push(layerBiases);
      }

      setNetwork({
        layers: config.layers,
        weights,
        biases,
        attentionHeads: config.attentionHeads,
        activation: config.activation,
        dropout: config.dropout,
      });
    };

    initializeNetwork();
  }, [config]);

  // Activation functions
  const activationFunctions = useMemo(() => ({
    relu: (x: number) => Math.max(0, x),
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    tanh: (x: number) => Math.tanh(x),
    gelu: (x: number) => {
      // Approximation of erf function since Math.erf doesn't exist
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const t = 1.0 / (1.0 + p * Math.abs(x / Math.sqrt(2)));
      const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp((-x * x) / 2);
      return x >= 0 ? x * 0.5 * (1 + y) : x * 0.5 * (1 - y);
    },
    silu: (x: number) => x / (1 + Math.exp(-x)),
  }), []);

  // Forward pass through network
  const forward = useCallback(
    (input: number[]): number[] => {
      if (!network) return [];

      let current = [...input];

      // Safety check for network structure
      if (!network.weights || !network.biases) {
        logger.error('Network weights or biases are undefined');
        return [];
      }

      for (let i = 0; i < network.weights.length; i++) {
        const next: number[] = [];

        // Ensure weights and biases exist at this layer
        const layerWeights = network.weights[i];
        const layerBiases = network.biases[i];

        if (!layerWeights || !layerBiases) {
          logger.error(`Layer ${i} weights or biases are undefined`);
          continue;
        }

        for (let j = 0; j < layerWeights.length; j++) {
          // Check if bias exists for this neuron
          const bias = layerBiases[j];
          if (bias === undefined) {
            logger.error(`Bias for neuron ${j} in layer ${i} is undefined`);
            next.push(0); // Default to 0 if bias is missing
            continue;
          }

          let sum: number = bias;
          const neuronWeights = layerWeights[j];

          // Check if weights exist for this connection
          if (!neuronWeights) {
            next.push(sum);
            continue;
          }

          for (let k = 0; k < current.length; k++) {
            const weight = neuronWeights[k];
            // Ensure weight exists for this connection
            if (weight !== undefined && k < current.length) {
              const inputValue = current[k];
              if (inputValue !== undefined) {
                sum += inputValue * weight;
              }
            }
          }

          // Apply activation
          const activation =
            activationFunctions[network.activation as keyof typeof activationFunctions] ||
            activationFunctions.gelu;
          next.push(activation(sum));

          // Apply dropout during training
          if (isTraining && Math.random() < network.dropout) {
            next[j] = 0;
          }
        }

        current = next;
      }

      return current;
    },
    [network, isTraining, activationFunctions],
  );

  // Extract features from text
  const extractTextFeatures = useCallback(
    (text: string): number[] => {
      const features: number[] = [];

      // Length features
      features.push(text.length / 1000); // Normalized length
      features.push(text.split(' ').length / 100); // Word count

      // Character diversity
      const uniqueChars = new Set(text.toLowerCase()).size;
      features.push(uniqueChars / 100);

      // Punctuation density
      const punctuation = text.match(/[.,!?;:]/g)?.length || 0;
      features.push(punctuation / text.length);

      // Capitalization ratio
      const uppercase = text.match(/[A-Z]/g)?.length || 0;
      features.push(uppercase / text.length);

      // Lexical complexity (syllable estimation)
      const words = text.split(' ');
      const complexWords = words.filter((word) => word.length > 6).length;
      features.push(complexWords / words.length);

      // Sentiment indicators
      const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'happy', 'excellent'];
      const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'sad', 'angry', 'worst'];

      const lowerText = text.toLowerCase();
      const positiveCount = positiveWords.reduce(
        (count, word) => count + (lowerText.split(word).length - 1),
        0,
      );
      const negativeCount = negativeWords.reduce(
        (count, word) => count + (lowerText.split(word).length - 1),
        0,
      );

      features.push(positiveCount / words.length);
      features.push(negativeCount / words.length);

      // Emotional intensity (exclamation marks, caps)
      const exclamations = text.match(/!/g)?.length || 0;
      features.push(exclamations / text.length);

      // Question density
      const questions = text.match(/\?/g)?.length || 0;
      features.push(questions / text.length);

      return features.slice(0, network?.layers[0] || 10);
    },
    [network],
  );

  // Analyze text complexity
  const analyzeComplexity = useCallback(
    (text: string): number => {
      if (!network) return 0;

      // Convert text to numerical features
      const features = extractTextFeatures(text);
      const output = forward(features);

      // Return complexity score (0-1)
      return Math.max(0, Math.min(1, output[0] || 0));
    },
    [network, forward, extractTextFeatures],
  );

  // Train network on text data
  const train = useCallback(
    async (trainingData: { input: string; target: number }[]) => {
      if (!network) return;

      setIsTraining(true);
      setTrainingProgress(0);

      const epochs = 100;

      for (let epoch = 0; epoch < epochs; epoch++) {
        let totalLoss = 0;

        for (const data of trainingData) {
          const input = extractTextFeatures(data.input);
          const prediction = forward(input);
          const target = [data.target];

          // Ensure prediction and target are properly defined
          if (prediction.length === 0 || target.length === 0) {
            continue;
          }

          const targetValue = target[0] ?? 0;
          const predictionValue = prediction[0] ?? 0;
          const error = targetValue - predictionValue;

          totalLoss += Math.abs(error);

          // For now, we'll simulate training
          // Log total loss for debugging (can be removed in production)
          logger.info(`Epoch ${epoch + 1}/${epochs}, Total Loss: ${totalLoss}`, {
            epoch: epoch + 1,
            epochs,
            totalLoss
          });
        }

        setTrainingProgress((epoch + 1) / epochs);
      }

      setIsTraining(false);
      setTrainingProgress(1);
    },
    [network, forward, extractTextFeatures],
  );

  return {
    network,
    isTraining,
    trainingProgress,
    forward,
    analyzeComplexity,
    train,
    extractTextFeatures,
  };
};
