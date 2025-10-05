/**
 * 📸 Photo Analyzer Service
 * AI-powered pet photo analysis using Gemini Vision
 */

import { getGeminiClient } from './gemini-client';

export interface PhotoAnalysisRequest {
  photoUrl: string;
  petType?: string;
}

export interface PhotoAnalysisResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
  suggestions: string[];
  detectedFeatures: {
    lighting: 'excellent' | 'good' | 'fair' | 'poor';
    framing: 'excellent' | 'good' | 'fair' | 'poor';
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
    background: 'clean' | 'busy' | 'distracting';
  };
  emotions: string[];
  bestFor: 'profile' | 'gallery' | 'background';
}

export class PhotoAnalyzerService {
  /**
   * Analyze pet photo using AI
   */
  async analyzePhoto(request: PhotoAnalysisRequest): Promise<PhotoAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(request.petType);
    
    try {
      const gemini = getGeminiClient();
      const response = await gemini.analyzeImage(request.photoUrl, prompt);
      
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Photo analysis error:', error);
      return this.generateFallbackAnalysis();
    }
  }

  /**
   * Analyze multiple photos and rank them
   */
  async analyzeMultiplePhotos(
    photoUrls: string[],
    petType?: string
  ): Promise<Array<PhotoAnalysisResult & { url: string }>> {
    const analyses = await Promise.all(
      photoUrls.map(async (url) => {
        const result = await this.analyzePhoto({ photoUrl: url, petType });
        return { ...result, url };
      })
    );

    // Sort by score (best first)
    return analyses.sort((a, b) => b.score - a.score);
  }

  /**
   * Get best photo for profile
   */
  async getBestProfilePhoto(photoUrls: string[], petType?: string): Promise<string> {
    const analyses = await this.analyzeMultiplePhotos(photoUrls, petType);
    return analyses[0]?.url || photoUrls[0];
  }

  /**
   * Build analysis prompt
   */
  private buildAnalysisPrompt(petType?: string): string {
    let prompt = 'Analyze this pet photo and provide:\n\n';
    prompt += '1. Overall quality rating (excellent/good/fair/poor)\n';
    prompt += '2. Technical quality scores for:\n';
    prompt += '   - Lighting quality\n';
    prompt += '   - Framing and composition\n';
    prompt += '   - Image clarity and focus\n';
    prompt += '   - Background (clean/busy/distracting)\n';
    prompt += '3. Detected emotions or expressions\n';
    prompt += '4. Suggestions for improvement\n';
    prompt += '5. Best use case (profile/gallery/background)\n\n';
    
    if (petType) {
      prompt += `The pet is a ${petType}.\n\n`;
    }
    
    prompt += 'Format response as JSON with this structure:\n';
    prompt += '{\n';
    prompt += '  "quality": "excellent|good|fair|poor",\n';
    prompt += '  "score": 0-100,\n';
    prompt += '  "lighting": "excellent|good|fair|poor",\n';
    prompt += '  "framing": "excellent|good|fair|poor",\n';
    prompt += '  "clarity": "excellent|good|fair|poor",\n';
    prompt += '  "background": "clean|busy|distracting",\n';
    prompt += '  "emotions": ["happy", "playful"],\n';
    prompt += '  "suggestions": ["tip1", "tip2"],\n';
    prompt += '  "bestFor": "profile|gallery|background"\n';
    prompt += '}';
    
    return prompt;
  }

  /**
   * Parse AI response into structured result
   */
  private parseAnalysisResponse(response: string): PhotoAnalysisResult {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          quality: parsed.quality || 'good',
          score: parsed.score || 70,
          suggestions: parsed.suggestions || [],
          detectedFeatures: {
            lighting: parsed.lighting || 'good',
            framing: parsed.framing || 'good',
            clarity: parsed.clarity || 'good',
            background: parsed.background || 'clean',
          },
          emotions: parsed.emotions || [],
          bestFor: parsed.bestFor || 'gallery',
        };
      }
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
    }

    // Fallback parsing
    return this.generateFallbackAnalysis();
  }

  /**
   * Generate fallback analysis
   */
  private generateFallbackAnalysis(): PhotoAnalysisResult {
    return {
      quality: 'good',
      score: 75,
      suggestions: ['Try better lighting', 'Center the pet in frame'],
      detectedFeatures: {
        lighting: 'good',
        framing: 'good',
        clarity: 'good',
        background: 'clean',
      },
      emotions: ['happy', 'friendly'],
      bestFor: 'gallery',
    };
  }
}

// Export singleton
export const photoAnalyzerService = new PhotoAnalyzerService();
