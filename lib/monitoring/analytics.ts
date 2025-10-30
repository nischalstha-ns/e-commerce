interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private static instance: Analytics;
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  init() {
    if (typeof window === 'undefined') return;
    this.isInitialized = true;
    this.flushQueue();
  }

  track(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    try {
      // Only use internal analytics API to avoid tracking blockers
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch(() => {});
    } catch (error) {
      // Silently fail to avoid console errors
    }
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) this.track(event);
    }
  }
}

export const analytics = Analytics.getInstance();

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track({ name, properties });
};

export const trackPageView = (path: string) => {
  analytics.track({ name: 'page_view', properties: { path } });
};

export const trackUserAction = (action: string, userId?: string) => {
  analytics.track({ name: 'user_action', properties: { action }, userId });
};