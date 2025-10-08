export class DeepSeekClient {
  constructor(config: any) {}
  
  async complete(prompt: string) {
    return {
      choices: [{
        text: 'Mocked AI response for: ' + prompt,
        index: 0,
        logprobs: null,
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    };
  }
  
  async chat(messages: any[]) {
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: 'Mocked chat response',
        },
        index: 0,
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    };
  }
  
  async generateBio(petInfo: any) {
    return {
      bio: `${petInfo.name} is a wonderful ${petInfo.breed} who loves to play and cuddle!`,
      tags: ['friendly', 'playful', 'cuddly'],
    };
  }
  
  async analyzePhoto(imageUrl: string) {
    return {
      breed: 'Golden Retriever',
      confidence: 0.95,
      age: 'Adult',
      characteristics: ['friendly', 'golden coat', 'medium size'],
    };
  }
  
  async calculateCompatibility(pet1: any, pet2: any) {
    return {
      score: 85,
      factors: {
        personality: 90,
        lifestyle: 80,
        activity: 85,
        social: 88,
        environment: 82,
      },
      recommendation: 'Highly compatible match!',
    };
  }
}

export default DeepSeekClient;