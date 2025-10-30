// Analytics utilities
class Analytics {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
  }

  track(event, properties = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        url: typeof window !== 'undefined' ? window.location.href : ''
      }
    };

    this.events.push(eventData);
    
    // Send to analytics service (Google Analytics, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }
  }

  getSessionId() {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  }

  // E-commerce specific events
  trackPurchase(orderId, items, total) {
    this.track('purchase', {
      transaction_id: orderId,
      value: total,
      currency: 'USD',
      items
    });
  }

  trackAddToCart(item) {
    this.track('add_to_cart', {
      currency: 'USD',
      value: item.price,
      items: [item]
    });
  }

  trackViewItem(item) {
    this.track('view_item', {
      currency: 'USD',
      value: item.price,
      items: [item]
    });
  }

  trackSearch(searchTerm, results) {
    this.track('search', {
      search_term: searchTerm,
      results_count: results.length
    });
  }
}

export const analytics = new Analytics();