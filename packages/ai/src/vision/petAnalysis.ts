/**
 * Computer Vision Pet Analysis for PawfectMatch
 * Real DeepSeek AI-powered photo analysis for breed identification and health assessment
 */


export interface PetPhotoAnalysisData {
  species: string;
  breed: string;
  confidence: number;
  age: number;
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    conditions: string[];
    recommendations: string[];
  };
  characteristics: {
    size: 'small' | 'medium' | 'large' | 'extra-large';
    color: string[];
    markings: string[];
    features: string[];
  };
  temperament: string[];
  quality: {
    photoScore: number;
    lighting: 'excellent' | 'good' | 'fair' | 'poor';
    clarity: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface AnalysisResult {
  success: boolean;
  analysis?: PetPhotoAnalysisData;
  error?: string;
  processingTime: number;
}

/**
 * Real DeepSeek AI-Powered Pet Photo Analysis
 */
export class PetPhotoAnalysis {
  private readonly deepSeekService: DeepSeekService;
  private isInitialized = false;

  constructor(deepSeekConfig: { apiKey: string; baseUrl?: string }) {
    this.deepSeekService = new DeepSeekService(deepSeekConfig);
    this.initializeService();
  }

  /**
   * Initialize the DeepSeek service
   */
  private async initializeService(): Promise<void> {
    try {
      const isConnected = await this.deepSeekService.testConnection();
      this.isInitialized = isConnected;
      console.log('DeepSeek pet analysis service initialized:', isConnected);
    } catch (error) {
      console.error('Failed to initialize DeepSeek service:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Analyze a pet photo using DeepSeek AI
   */
  public async analyzePhoto(imageData: ImageData | string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'DeepSeek service not initialized',
        processingTime: Date.now() - startTime,
      };
    }

    try {
      // Convert image data to base64 if needed
      const base64Image = typeof imageData === 'string' 
        ? imageData 
        : await this.imageDataToBase64(imageData);
      
      // Use DeepSeek AI for analysis
      const response = await this.deepSeekService.analyzePetPhoto(base64Image);
      const analysis = this.parseDeepSeekResponse(response);
      
      return {
        success: true,
        analysis,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Convert ImageData to base64 string
   */
  private async imageDataToBase64(imageData: ImageData): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }

  /**
   * Parse DeepSeek AI response
   */
  private parseDeepSeekResponse(response: unknown): PetPhotoAnalysisData {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in DeepSeek response');
      }

      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      return this.parseTextResponse(content);
    } catch (error) {
      console.error('Failed to parse DeepSeek response:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Parse text-based response
   */
  private parseTextResponse(content: string): PetPhotoAnalysisData {
    // Extract information from text response
    const speciesMatch = content.match(/species["\s]*:["\s]*([a-z]+)/i);
    const breedMatch = content.match(/breed["\s]*:["\s]*([^,}]+)/i);
    const confidenceMatch = content.match(/confidence["\s]*:["\s]*([0-9.]+)/i);
    
    return {
      species: speciesMatch?.[1] || 'unknown',
      breed: breedMatch?.[1]?.trim() || 'unknown',
      confidence: parseFloat(confidenceMatch?.[1] || '0.5'),
      age: 0,
      health: {
        overall: 'good',
        conditions: [],
        recommendations: [],
      },
      characteristics: {
        size: 'medium',
        color: [],
        markings: [],
        features: [],
      },
      temperament: [],
      quality: {
        photoScore: 0.7,
        lighting: 'good',
        clarity: 'good',
      },
    };
  }

  /**
   * Default analysis fallback
   */
  private getDefaultAnalysis(): PetPhotoAnalysisData {
    return {
      species: 'unknown',
      breed: 'unknown',
      confidence: 0.5,
      age: 0,
      health: {
        overall: 'good',
        conditions: [],
        recommendations: [],
      },
      characteristics: {
        size: 'medium',
        color: [],
        markings: [],
        features: [],
      },
      temperament: [],
      quality: {
        photoScore: 0.5,
        lighting: 'good',
        clarity: 'good',
      },
    };
  }

  /**
   * Test DeepSeek connection
   */
  public async testConnection(): Promise<boolean> {
    return await this.deepSeekService.testConnection();
  }

  /**
   * Get service status
   */
  public getStatus(): unknown {
    return {
      initialized: this.isInitialized,
      deepSeekConnected: this.isInitialized,
    };
  }

  /**
   * Batch analyze multiple photos
   */
  public async analyzePhotos(photos: (ImageData | string)[]): Promise<AnalysisResult[]> {
    const results = await Promise.all(
      photos.map(photo => this.analyzePhoto(photo))
    );

    return results;
  }

  /**
   * Get analysis confidence threshold
   */
  public getConfidenceThreshold(): number {
    return 0.7; // 70% minimum confidence
  }

  /**
   * Check if analysis is reliable
   */
  public isAnalysisReliable(analysis: PetPhotoAnalysisData): boolean {
    return analysis.confidence >= this.getConfidenceThreshold() &&
           analysis.quality.photoScore >= 0.6;
  }
}

/**
 * Create pet photo analysis instance
 */
export function createPetPhotoAnalysis(deepSeekConfig: { apiKey: string; baseUrl?: string }): PetPhotoAnalysis {
  return new PetPhotoAnalysis(deepSeekConfig);
}
