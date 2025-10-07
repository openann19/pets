/**
 * PROJECT HYPERION: PERFORMANCE MONITORING SYSTEM
 * 
 * Real-time performance monitoring for the new architecture.
 * Tracks FPS, memory usage, and animation performance.
 */

import { NativeModules, Platform } from 'react-native';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  animationFrameTime: number;
  gestureResponseTime: number;
  componentRenderTime: number;
}

type PerformanceCallback = (metrics: PerformanceMetrics) => void;

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private readonly callbacks: PerformanceCallback[] = [];
  private isMonitoring = false;
  private frameCount = 0;
  private lastFrameTime = 0;
  private readonly fpsHistory: number[] = [];
  private readonly maxHistoryLength = 60; // 1 second at 60fps

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance metrics
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    this.measureFrame();
  }

  /**
   * Stop monitoring performance metrics
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  /**
   * Add callback for performance updates
   */
  addCallback(callback: PerformanceCallback): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback: PerformanceCallback): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Measure frame performance
   */
  private readonly measureFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastFrameTime;
    
    if (frameTime > 0) {
      const fps = 1000 / frameTime;
      this.fpsHistory.push(fps);
      
      // Keep history within bounds
      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }
    }

    this.lastFrameTime = currentTime;
    this.frameCount++;

    // Calculate metrics every 60 frames (1 second at 60fps)
    if (this.frameCount % 60 === 0) {
      this.calculateMetrics();
    }

    // Schedule next frame
    requestAnimationFrame(this.measureFrame);
  };

  /**
   * Calculate performance metrics
   */
  private calculateMetrics(): void {
    const metrics: PerformanceMetrics = {
      fps: this.getAverageFPS(),
      memoryUsage: this.getMemoryUsage(),
      animationFrameTime: this.getAverageFrameTime(),
      gestureResponseTime: this.getGestureResponseTime(),
      componentRenderTime: this.getComponentRenderTime(),
    };

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.warn('Performance callback error:', error);
      }
    });
  }

  /**
   * Get average FPS over the last second
   */
  private getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    
    const sum = this.fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Get average frame time
   */
  private getAverageFrameTime(): number {
    if (this.fpsHistory.length === 0) return 0;
    
    const frameTimes = this.fpsHistory.map(fps => 1000 / fps);
    const sum = frameTimes.reduce((acc, time) => acc + time, 0);
    return Math.round(sum / frameTimes.length);
  }

  /**
   * Get memory usage (platform-specific)
   */
  private getMemoryUsage(): number {
    try {
      if (Platform.OS === 'android' && NativeModules.DeviceInfo) {
        return NativeModules.DeviceInfo.getUsedMemory?.() || 0;
      }
      
      if (Platform.OS === 'ios' && NativeModules.Performance) {
        return NativeModules.Performance.getMemoryUsage?.() || 0;
      }
      
      // Fallback: estimate based on performance
      return (performance as any).memory?.usedJSHeapSize ?? 0;
    } catch (error) {
      console.warn('Memory usage measurement failed:', error);
      return 0;
    }
  }

  /**
   * Get gesture response time (simulated)
   */
  private getGestureResponseTime(): number {
    // In a real implementation, this would measure actual gesture response times
    // For now, we'll simulate based on FPS performance
    const avgFPS = this.getAverageFPS();
    if (avgFPS >= 55) return 16; // Excellent
    if (avgFPS >= 45) return 20; // Good
    if (avgFPS >= 30) return 30; // Fair
    return 50; // Poor
  }

  /**
   * Get component render time (simulated)
   */
  private getComponentRenderTime(): number {
    // In a real implementation, this would measure actual render times
    // For now, we'll simulate based on FPS performance
    const avgFPS = this.getAverageFPS();
    if (avgFPS >= 55) return 8; // Excellent
    if (avgFPS >= 45) return 12; // Good
    if (avgFPS >= 30) return 20; // Fair
    return 35; // Poor
  }

  /**
   * Get performance grade based on metrics
   */
  getPerformanceGrade(metrics: PerformanceMetrics): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    const { fps, animationFrameTime, gestureResponseTime } = metrics;

    if (fps >= 58 && animationFrameTime <= 18 && gestureResponseTime <= 18) {
      return 'A+';
    }
    if (fps >= 55 && animationFrameTime <= 20 && gestureResponseTime <= 20) {
      return 'A';
    }
    if (fps >= 45 && animationFrameTime <= 25 && gestureResponseTime <= 25) {
      return 'B';
    }
    if (fps >= 30 && animationFrameTime <= 35 && gestureResponseTime <= 35) {
      return 'C';
    }
    if (fps >= 20 && animationFrameTime <= 50 && gestureResponseTime <= 50) {
      return 'D';
    }
    return 'F';
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    const { fps, memoryUsage, animationFrameTime } = metrics;

    if (fps < 50) {
      recommendations.push('Consider reducing animation complexity');
      recommendations.push('Check for unnecessary re-renders');
    }

    if (animationFrameTime > 20) {
      recommendations.push('Optimize animation calculations');
      recommendations.push('Use UI thread animations (Reanimated)');
    }

    if (memoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('Check for memory leaks');
      recommendations.push('Implement proper cleanup in useEffect');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent! 🎉');
    }

    return recommendations;
  }

  /**
   * Log performance metrics to console
   */
  logMetrics(metrics: PerformanceMetrics): void {
    const grade = this.getPerformanceGrade(metrics);
    const recommendations = this.getPerformanceRecommendations(metrics);

    console.log('🚀 Performance Metrics:');
    console.log(`   FPS: ${metrics.fps}`);
    console.log(`   Frame Time: ${metrics.animationFrameTime}ms`);
    console.log(`   Gesture Response: ${metrics.gestureResponseTime}ms`);
    console.log(`   Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
    console.log(`   Grade: ${grade}`);
    console.log('📋 Recommendations:');
    recommendations.forEach(rec => console.log(`   • ${rec}`));
  }
}

export default PerformanceMonitor;
export type { PerformanceMetrics, PerformanceCallback };
