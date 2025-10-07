/**
 * 🤖 Gemini AI Client
 * Integration with Google's Gemini API for AI features
 */
import axios from 'axios';
export class GeminiClient {
    client;
    apiKey;
    model;
    constructor(config) {
        this.apiKey = config.apiKey;
        this.model = config.model ?? 'gemini-pro';
        this.client = axios.create({
            baseURL: config.baseURL ?? 'https://generativelanguage.googleapis.com/v1beta',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Generate content using Gemini API
     */
    async generateContent(prompt) {
        try {
            const response = await this.client.post(`/models/${this.model}:generateContent?key=${this.apiKey}`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            });
            const text = response.data.candidates[0]?.content?.parts[0]?.text;
            if (text == null || text === '') {
                throw new Error('No content generated');
            }
            return text;
        }
        catch (error) {
            console.error('Gemini API error:', error);
            throw new Error('Failed to generate content with Gemini');
        }
    }
    /**
     * Analyze image using Gemini Vision
     */
    async analyzeImage(imageUrl, prompt) {
        try {
            const response = await this.client.post(`/models/gemini-pro-vision:generateContent?key=${this.apiKey}`, {
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
            });
            const text = response.data.candidates[0]?.content?.parts[0]?.text;
            if (text == null || text === '') {
                throw new Error('No analysis generated');
            }
            return text;
        }
        catch (error) {
            console.error('Gemini Vision API error:', error);
            throw new Error('Failed to analyze image with Gemini');
        }
    }
    /**
     * Helper to convert image URL to base64
     */
    async imageToBase64(url) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data).toString('base64');
    }
}
// Export singleton instance
let geminiClient = null;
export const initializeGemini = (config) => {
    geminiClient = new GeminiClient(config);
};
export const getGeminiClient = () => {
    if (!geminiClient) {
        throw new Error('Gemini client not initialized. Call initializeGemini first.');
    }
    return geminiClient;
};
