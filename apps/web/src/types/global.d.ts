// Global type definitions for browser APIs
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    gtag?: any;
  }
  
  interface Navigator {
    getBattery?: () => Promise<any>;
    connection?: any;
    mozConnection?: any;
    webkitConnection?: any;
  }
  
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
  
  interface PerformanceEntry {
    hadRecentInput?: boolean;
    value?: number;
    startTime?: number;
    processingStart?: number;
  }
}

export {};