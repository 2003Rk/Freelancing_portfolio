// Simple performance monitoring utility for smoke effect
export class PerformanceMonitor {
  static startTiming(label) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${label}-start`);
    }
  }

  static endTiming(label) {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        console.log(`${label} took ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (e) {
        console.warn(`Could not measure ${label}:`, e);
      }
    }
    return 0;
  }

  static clearTimings(label) {
    if (typeof performance !== 'undefined') {
      try {
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
      } catch (e) {
        // Ignore errors
      }
    }
  }
}

export default PerformanceMonitor;