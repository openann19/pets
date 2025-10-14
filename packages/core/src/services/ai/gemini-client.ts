/**
 * 🤖 Gemini AI Client
 * Integration with Google's Gemini API for AI features
 */

import axios, { AxiosInstance } from 'axios';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private model: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-pro';
    
    this.client = axios.create({
      baseURL: config.baseURL || 'https://generativelanguage.googleapis.com/v1beta',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate content using Gemini API
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await this.client.post<GeminiResponse>(
        `/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }
      );

      const text = response.data.candidates[0]?.content?.parts[0]?.text;
      if (!text) {
        throw new Error('No content generated');
      }

      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content with Gemini');
    }
  }

  /**
   * Analyze image using Gemini Vision
   */
  async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    try {
      const response = await this.client.post<GeminiResponse>(
        `/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: await this.imageToBase64(imageUrl)
                }
              }
            ]
          }]
        }
      );

      const text = response.data.candidates[0]?.content?.parts[0]?.text;
      if (!text) {
        throw new Error('No analysis generated');
      }

      return text;
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      throw new Error('Failed to analyze image with Gemini');
    }
  }

  /**
   * Helper to convert image URL to base64
   */
  private async imageToBase64(url: string): Promise<string> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  }
}

// Export singleton instance
let geminiClient: GeminiClient | null = null;

export const initializeGemini = (config: GeminiConfig): void => {
  geminiClient = new GeminiClient(config);
};

export const _getGeminiClient = (): GeminiClient => {
  if (!geminiClient) {
    throw new Error('Gemini client not initialized. Call initializeGemini first.');
  }
  return geminiClient;
};
