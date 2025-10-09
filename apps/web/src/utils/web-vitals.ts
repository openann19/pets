import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

const vitalsThresholds = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 }
};

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = vitalsThresholds[name as keyof typeof vitalsThresholds];
  if (!threshold) return 'needs-improvement';
  
  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
}

function sendToAnalytics(metric: VitalMetric) {
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_rating: metric.rating,
        non_interaction: true,
      });
    }

    // Custom analytics endpoint
    fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Silently fail analytics
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'poor' ? '❌' : '⚠️';
    console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }
}

export function reportWebVitals() {
  onCLS((metric) => {
    const rating = getRating('CLS', metric.value);
    sendToAnalytics({ name: 'CLS', value: metric.value, rating });
  });

  // FID is deprecated, using INP instead
  // onFID((metric) => {
  //   const rating = getRating('FID', metric.value);
  //   sendToAnalytics({ name: 'FID', value: metric.value, rating });
  // });

  onFCP((metric) => {
    const rating = getRating('FCP', metric.value);
    sendToAnalytics({ name: 'FCP', value: metric.value, rating });
  });

  onLCP((metric) => {
    const rating = getRating('LCP', metric.value);
    sendToAnalytics({ name: 'LCP', value: metric.value, rating });
  });

  onTTFB((metric) => {
    const rating = getRating('TTFB', metric.value);
    sendToAnalytics({ name: 'TTFB', value: metric.value, rating });
  });

  onINP((metric) => {
    const rating = getRating('INP', metric.value);
    sendToAnalytics({ name: 'INP', value: metric.value, rating });
  });
}

// Export for testing
export { vitalsThresholds };