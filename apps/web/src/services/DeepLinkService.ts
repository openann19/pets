/**
 * Deep Link Service
 * Comprehensive deep linking support for web app matching mobile capabilities
 */

export interface DeepLinkRoute {
  path: string;
  component: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  fragment?: string;
}

export interface DeepLinkHandler {
  pattern: RegExp;
  handler: (match: RegExpMatchArray, url: URL) => Promise<void>;
  priority: number;
}

export interface DeepLinkConfig {
  baseUrl: string;
  enableAnalytics: boolean;
  enableSharing: boolean;
  enableSocialMeta: boolean;
  fallbackRoute: string;
}

export interface ShareOptions {
  title: string;
  description: string;
  image?: string;
  url: string;
  hashtags?: string[];
  via?: string;
}

class DeepLinkService {
  private config: DeepLinkConfig;
  private handlers: DeepLinkHandler[] = [];
  private currentRoute: DeepLinkRoute | null = null;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Initialize the deep link service
   */
  async initialize(): Promise<void> {
    try {
      // Setup default handlers
      this.setupDefaultHandlers();

      // Handle initial URL
      await this.handleCurrentUrl();

      // Setup event listeners
      this.setupEventListeners();

      // Update social meta tags
      this.updateSocialMetaTags();

      console.log('Deep Link Service initialized');
    } catch (error) {
      console.error('Failed to initialize deep link service:', error);
    }
  }

  /**
   * Register a deep link handler
   */
  registerHandler(
    pattern: RegExp,
    handler: (match: RegExpMatchArray, url: URL) => Promise<void>,
    priority = 0,
  ): void {
    this.handlers.push({ pattern, handler, priority });

    // Sort by priority (higher priority first)
    this.handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Handle a deep link URL
   */
  async handleUrl(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url, window.location.origin);

      // Find matching handler
      for (const handler of this.handlers) {
        const match = urlObj.pathname.match(handler.pattern);
        if (match) {
          await handler.handler(match, urlObj);
          return true;
        }
      }

      // No handler found, use fallback
      await this.handleFallback(urlObj);
      return false;
    } catch (error) {
      console.error('Failed to handle URL:', error);
      return false;
    }
  }

  /**
   * Generate a deep link URL
   */
  generateUrl(
    route: string,
    params?: Record<string, string>,
    query?: Record<string, string>,
    fragment?: string,
  ): string {
    let url = `${this.config.baseUrl}${route}`;

    // Replace route parameters
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      }
    }

    // Add query parameters
    if (query && Object.keys(query).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        searchParams.append(key, value);
      }
      url += `?${searchParams.toString()}`;
    }

    // Add fragment
    if (fragment) {
      url += `#${fragment}`;
    }

    return url;
  }

  /**
   * Share a deep link
   */
  async shareLink(options: ShareOptions): Promise<void> {
    try {
      if (navigator.share) {
        // Use native Web Share API
        await navigator.share({
          title: options.title,
          text: options.description,
          url: options.url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(options.url);

        // Show success message
        this.showNotification('Link copied to clipboard!');
      }

      // Track analytics
      if (this.config.enableAnalytics) {
        this.trackEvent('deep_link_shared', {
          url: options.url,
          title: options.title,
        });
      }
    } catch (error) {
      console.error('Failed to share link:', error);
    }
  }

  /**
   * Open a deep link in a new tab
   */
  openInNewTab(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Copy a deep link to clipboard
   */
  async copyToClipboard(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      this.showNotification('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }

  /**
   * Get current route information
   */
  getCurrentRoute(): DeepLinkRoute | null {
    return this.currentRoute;
  }

  /**
   * Update social meta tags
   */
  updateSocialMetaTags(meta?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }): void {
    if (!this.config.enableSocialMeta) return;

    const title = meta?.title || document.title;
    const description = meta?.description || this.getMetaContent('description');
    const image = meta?.image || this.getMetaContent('og:image');
    const url = meta?.url || window.location.href;

    // Update Open Graph tags
    this.setMetaTag('og:title', title);
    this.setMetaTag('og:description', description);
    this.setMetaTag('og:image', image);
    this.setMetaTag('og:url', url);

    // Update Twitter Card tags
    this.setMetaTag('twitter:card', 'summary_large_image');
    this.setMetaTag('twitter:title', title);
    this.setMetaTag('twitter:description', description);
    this.setMetaTag('twitter:image', image);

    // Update standard meta tags
    this.setMetaTag('description', description);
  }

  /**
   * Setup default handlers
   */
  private setupDefaultHandlers(): void {
    // Pet profile handler
    this.registerHandler(
      /^\/pet\/([^/]+)$/,
      async (match, url) => {
        const petId = match[1];
        await this.navigateToRoute(`/pet/${petId}`);
        this.updateSocialMetaTags({
          title: `Pet Profile - ${petId}`,
          description: `View this amazing pet's profile`,
          url: url.href,
        });
      },
      100,
    );

    // Match handler
    this.registerHandler(
      /^\/match\/([^/]+)$/,
      async (match, url) => {
        const matchId = match[1];
        await this.navigateToRoute(`/match/${matchId}`);
        this.updateSocialMetaTags({
          title: `New Match!`,
          description: `You have a new match waiting for you`,
          url: url.href,
        });
      },
      100,
    );

    // Chat handler
    this.registerHandler(
      /^\/chat\/([^/]+)$/,
      async (match, url) => {
        const chatId = match[1];
        await this.navigateToRoute(`/chat/${chatId}`);
        this.updateSocialMetaTags({
          title: `Chat`,
          description: `Continue your conversation`,
          url: url.href,
        });
      },
      100,
    );

    // User profile handler
    this.registerHandler(
      /^\/profile\/([^/]+)$/,
      async (match, url) => {
        const userId = match[1];
        await this.navigateToRoute(`/profile/${userId}`);
        this.updateSocialMetaTags({
          title: `User Profile`,
          description: `View this user's profile`,
          url: url.href,
        });
      },
      100,
    );

    // Leaderboard handler
    this.registerHandler(
      /^\/leaderboard(?:\/([^/]+))?$/,
      async (match, url) => {
        const category = match[1] || 'all';
        await this.navigateToRoute(`/leaderboard/${category}`);
        this.updateSocialMetaTags({
          title: `Leaderboard - ${category}`,
          description: `See the top pets in ${category}`,
          url: url.href,
        });
      },
      100,
    );

    // Discover handler
    this.registerHandler(
      /^\/discover(?:\?(.*))?$/,
      async (match, url) => {
        const query = match[1] || '';
        await this.navigateToRoute(`/discover?${query}`);
        this.updateSocialMetaTags({
          title: `Discover Pets`,
          description: `Find your perfect pet match`,
          url: url.href,
        });
      },
      100,
    );

    // Settings handler
    this.registerHandler(
      /^\/settings(?:\/([^/]+))?$/,
      async (match, url) => {
        const section = match[1] || 'general';
        await this.navigateToRoute(`/settings/${section}`);
        this.updateSocialMetaTags({
          title: `Settings - ${section}`,
          description: `Manage your account settings`,
          url: url.href,
        });
      },
      100,
    );
  }

  /**
   * Handle current URL
   */
  private async handleCurrentUrl(): Promise<void> {
    await this.handleUrl(window.location.href);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle popstate events (back/forward navigation)
    window.addEventListener('popstate', (_event) => {
      this.handleCurrentUrl();
    });

    // Handle hash changes
    window.addEventListener('hashchange', (_event) => {
      this.handleCurrentUrl();
    });
  }

  /**
   * Handle fallback route
   */
  private async handleFallback(_url: URL): Promise<void> {
    await this.navigateToRoute(this.config.fallbackRoute);
  }

  /**
   * Navigate to a route
   */
  private async navigateToRoute(route: string): Promise<void> {
    try {
      // Parse the route
      const [pathname, search, hash] = route.split(/(\?.*)?(#.*)?/);

      // Ensure pathname is not undefined for strict type checking
      const path = pathname ?? '';
      const component = pathname ?? '';

      // Create a deep link route with the required properties 
      // and optional properties only when they exist
      const routeInfo: DeepLinkRoute = {
        path,
        component,
      };

      // Only add optional properties when they have values
      if (search) {
        routeInfo.query = this.parseQueryString(search);
      }

      if (hash) {
        routeInfo.fragment = hash.substring(1);
      }

      this.currentRoute = routeInfo;

      // Emit route change event
      this.emit('routeChanged', routeInfo);

      // Update browser history
      if (window.location.pathname !== pathname) {
        window.history.pushState({}, '', route);
      }
    } catch (error) {
      console.error('Failed to navigate to route:', error);
    }
  }

  /**
   * Parse query string
   */
  private parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  /**
   * Get meta content
   */
  private getMetaContent(name: string): string {
    const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta ? meta.getAttribute('content') || '' : '';
  }

  /**
   * Set meta tag
   */
  private setMetaTag(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', name);
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
  }

  /**
   * Show notification
   */
  private showNotification(message: string): void {
    // Implementation would show a toast notification
    console.log('Notification:', message);
  }

  /**
   * Track analytics event
   */
  private trackEvent(event: string, data: unknown): void {
    // Implementation would track with analytics service
    console.log('Analytics:', event, data);
  }

  /**
   * Emit event
   */
  private emit(event: string, data: unknown): void {
    const customEvent = new CustomEvent(event, { detail: data });
    window.dispatchEvent(customEvent);
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): DeepLinkConfig {
    return {
      baseUrl: window.location.origin,
      enableAnalytics: true,
      enableSharing: true,
      enableSocialMeta: true,
      fallbackRoute: '/',
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DeepLinkConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): DeepLinkConfig {
    return { ...this.config };
  }
}

const deepLinkService = new DeepLinkService();
export default deepLinkService;
