/**
 * WhatsApp Bubble Widget for Koru
 * 
 * This widget serves as both a functional WhatsApp contact button and a boilerplate
 * for building Koru-compatible widgets using the @redclover/koru-sdk.
 * 
 * @example
 * // HTML Integration:
 * <script 
 *   src="https://cdn.example.com/whatsapp-bubble.js"
 *   data-website-id="your-website-id"
 *   data-app-id="your-app-id"
 *   data-app-manager-url="https://app-manager.example.com"
 * ></script>
 * 
 * @see {@link https://www.npmjs.com/package/@redclover/koru-sdk} for SDK documentation
 */

import { KoruWidget, WidgetConfig } from '@redclover/koru-sdk';

/**
 * Widget Configuration Interface
 * 
 * IMPORTANT: This interface must match the JSON schema registered in Koru.
 * Extend WidgetConfig to inherit base configuration properties from the SDK.
 * 
 * @interface WhatsAppConfig
 * @extends {WidgetConfig}
 * 
 * @example
 * // In Koru, register this schema:
 * {
 *   "phone_number": { "type": "string", "required": true, "pattern": "^[0-9]{10,15}$" },
 *   "default_message": { "type": "string", "required": false, "maxLength": 500 },
 *   // ... other fields
 * }
 */
interface WhatsAppConfig extends WidgetConfig {
  /** WhatsApp phone number with country code (no + or spaces). Example: "5491112345678" */
  phone_number: string;
  
  /** Pre-filled message when opening WhatsApp. Max 500 characters. */
  default_message?: string;
  
  /** Corner position of the bubble. Default: "bottom-right" */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /** Enable or disable the widget. Default: true */
  enabled?: boolean;
  
  /** Bubble diameter in pixels. Range: 40-80. Default: 60 */
  bubble_size?: number;
  
  /** Horizontal offset from edge in pixels. Range: 10-100. Default: 20 */
  offset_x?: number;
  
  /** Vertical offset from edge in pixels. Range: 10-100. Default: 20 */
  offset_y?: number;
  
  /** Background color of the bubble (hex). Default: "#25D366" (WhatsApp green) */
  bubble_color?: string;
  
  /** Show tooltip on hover. Default: true */
  show_tooltip?: boolean;
  
  /** Tooltip text displayed on hover. Max 50 characters. Default: "Chat with us on WhatsApp" */
  tooltip_text?: string;
}

/**
 * WhatsApp Bubble Widget Class
 * 
 * BOILERPLATE GUIDE:
 * 1. Extend KoruWidget from @redclover/koru-sdk
 * 2. Implement required lifecycle hooks: onInit, onRender, onDestroy
 * 3. Optionally implement onConfigUpdate for dynamic updates
 * 4. Use SDK helpers: this.log(), this.track(), this.isMobile()
 * 
 * @class WhatsAppBubbleWidget
 * @extends {KoruWidget}
 */
class WhatsAppBubbleWidget extends KoruWidget {
  /**
   * Store reference to the main widget container
   * BEST PRACTICE: Always store DOM references for cleanup in onDestroy()
   */
  private bubble: HTMLElement | null = null;

  /**
   * Widget Constructor
   * 
   * REQUIRED: Call super() with widget metadata and options
   * 
   * @constructor
   * @param {string} name - Unique widget identifier (lowercase, hyphenated)
   * @param {string} version - Semantic version (e.g., "1.0.0")
   * @param {object} options - SDK configuration options
   * @param {boolean} options.cache - Enable configuration caching (default: true, TTL: 1 hour)
   * @param {boolean} options.analytics - Enable analytics tracking via this.track() (default: false)
   * @param {boolean} options.debug - Enable debug logging via this.log() (default: false)
   */
  constructor() {
    super({
      name: 'whatsapp-bubble',      // Must match Koru registration
      version: '1.0.0',              // Update on breaking changes
      options: {
        cache: true,                 // Reduces API calls, improves performance
        analytics: true,             // Enables this.track() method
        debug: false,                // Set to true during development
      }
    });
  }

  // ==================== LIFECYCLE HOOKS ====================
  // The SDK calls these methods automatically in this order:
  // 1. onInit() - After authorization, before rendering
  // 2. onRender() - After init, creates UI
  // 3. onConfigUpdate() - When config changes (optional)
  // 4. onDestroy() - On widget.stop() or page unload

  /**
   * Lifecycle Hook: Initialization
   * 
   * PURPOSE: Validate configuration, setup state, fetch external data
   * WHEN: Called once after successful authorization, before onRender()
   * BEST PRACTICE: Throw errors for invalid config to prevent rendering
   * 
   * @async
   * @param {WhatsAppConfig} config - Widget configuration from Koru
   * @throws {Error} If required fields are missing or invalid
   * 
   * @example
   * // Validation pattern:
   * if (!config.required_field) {
   *   throw new Error('required_field is required');
   * }
   */
  async onInit(config: WhatsAppConfig) {
    // STEP 1: Validate required fields
    // Throw errors to prevent widget from rendering with invalid config
    if (!config.phone_number) {
      throw new Error('phone_number is required');
    }

    // STEP 2: Validate field formats
    // Use regex or custom validation logic
    if (!/^[0-9]{10,15}$/.test(config.phone_number)) {
      throw new Error('Invalid phone_number format');
    }

    // STEP 3: Check feature flags
    // Allow widgets to be disabled without removing them
    if (config.enabled === false) {
      this.log('Widget is disabled in configuration');
      return; // Exit early, onRender() will not be called
    }

    // STEP 4: Log successful initialization (only if debug: true)
    this.log('Widget initialized', config);
    
    // OPTIONAL: Fetch external data, setup event listeners, etc.
    // Example: this.data = await fetch(config.apiUrl).then(r => r.json());
  }

  /**
   * Lifecycle Hook: Rendering
   * 
   * PURPOSE: Create and display the widget UI
   * WHEN: Called after onInit() completes successfully
   * BEST PRACTICE: Store DOM references for cleanup, use semantic HTML
   * 
   * @async
   * @param {WhatsAppConfig} config - Widget configuration from Koru
   * 
   * @example
   * // Rendering pattern:
   * this.container = document.createElement('div');
   * // ... configure element ...
   * document.body.appendChild(this.container);
   */
  async onRender(config: WhatsAppConfig) {
    // STEP 1: Create main container element
    this.bubble = document.createElement('div');
    this.bubble.className = 'whatsapp-bubble';
    
    // STEP 2: Apply dynamic styles from configuration
    // Use a helper method to keep onRender() clean
    const styles = this.getBubbleStyles(config);
    Object.keys(styles).forEach(key => {
      (this.bubble!.style as any)[key] = styles[key];
    });

    // STEP 3: Add child elements (icon, text, etc.)
    const icon = this.getIconElement();
    this.bubble.appendChild(icon);

    // STEP 4: Attach event handlers
    // Use arrow functions to maintain 'this' context
    this.bubble.addEventListener('click', () => this.handleClick(config));

    // STEP 5: Add accessibility attributes
    // WCAG 2.1 compliance: tooltips, ARIA labels, keyboard support
    if (config.show_tooltip !== false) {
      this.bubble.setAttribute('title', config.tooltip_text || 'Chat with us on WhatsApp');
      this.bubble.setAttribute('aria-label', config.tooltip_text || 'Chat with us on WhatsApp');
    }

    // Make keyboard accessible (Tab + Enter/Space)
    this.bubble.setAttribute('role', 'button');
    this.bubble.setAttribute('tabindex', '0');

    // STEP 6: Add keyboard event handlers
    this.bubble.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleClick(config);
      }
    });

    // STEP 7: Insert into DOM
    // BEST PRACTICE: Append to body for fixed positioning, or use a specific container
    document.body.appendChild(this.bubble);

    // STEP 8: Log successful render (only if debug: true)
    this.log('Widget rendered');
  }

  /**
   * Lifecycle Hook: Destruction
   * 
   * PURPOSE: Clean up resources, remove event listeners, remove DOM elements
   * WHEN: Called when widget.stop() is invoked or page unloads
   * CRITICAL: Always implement to prevent memory leaks
   * 
   * @async
   * 
   * @example
   * // Cleanup pattern:
   * this.eventListeners.forEach(({el, event, handler}) => {
   *   el.removeEventListener(event, handler);
   * });
   * this.timers.forEach(timer => clearInterval(timer));
   * this.container?.remove();
   */
  async onDestroy() {
    // Remove DOM element (automatically removes event listeners)
    if (this.bubble) {
      this.bubble.remove();
      this.bubble = null;
    }
    
    // OPTIONAL: Clear timers, remove global listeners, etc.
    // Example: clearInterval(this.updateTimer);
    // Example: window.removeEventListener('resize', this.handleResize);
    
    this.log('Widget destroyed');
  }

  /**
   * Lifecycle Hook: Configuration Update (Optional)
   * 
   * PURPOSE: Handle configuration changes without full page reload
   * WHEN: Called when widget.reload() is invoked
   * OPTIONAL: Implement for better UX, otherwise widget will fully re-initialize
   * 
   * @async
   * @param {WhatsAppConfig} newConfig - Updated configuration from Koru
   * 
   * @example
   * // Efficient update pattern:
   * if (newConfig.color !== this.config.color) {
   *   this.element.style.backgroundColor = newConfig.color;
   * }
   */
  async onConfigUpdate(newConfig: WhatsAppConfig) {
    // Simple approach: Destroy and re-render
    // For complex widgets, consider updating only changed elements
    await this.onDestroy();
    await this.onRender(newConfig);
    this.log('Widget updated with new config');
  }

  // ==================== PRIVATE METHODS ====================
  // Helper methods to keep lifecycle hooks clean and maintainable
  // BEST PRACTICE: Extract complex logic into private methods

  /**
   * Handle Bubble Click Event
   * 
   * Opens WhatsApp with pre-configured phone number and message.
   * Uses SDK's isMobile() helper to determine the correct URL scheme.
   * Tracks the click event using SDK's analytics.
   * 
   * @private
   * @param {WhatsAppConfig} config - Widget configuration
   * 
   * @example
   * // Mobile: whatsapp://send?phone=...
   * // Desktop: https://web.whatsapp.com/send?phone=...
   */
  private handleClick(config: WhatsAppConfig) {
    const phone = config.phone_number;
    const message = encodeURIComponent(config.default_message || '');
    
    // SDK HELPER: this.isMobile() detects mobile devices
    // Returns true for iOS, Android, and other mobile browsers
    const url = this.isMobile()
      ? `whatsapp://send?phone=${phone}&text=${message}`  // Opens WhatsApp app
      : `https://web.whatsapp.com/send?phone=${phone}&text=${message}`; // Opens web version
    
    // SDK HELPER: this.track() sends analytics events to Koru
    // Requires analytics: true in constructor options
    // Event data is stored in Koru for reporting
    this.track('whatsapp_clicked', {
      phone: phone,
      has_message: !!config.default_message,
      position: config.position
    });

    // Open WhatsApp in new tab/window
    window.open(url, '_blank');
  }

  /**
   * Generate Dynamic Bubble Styles
   * 
   * Creates a style object based on configuration parameters.
   * Handles positioning, sizing, and theming.
   * 
   * @private
   * @param {WhatsAppConfig} config - Widget configuration
   * @returns {Record<string, string>} CSS style object
   * 
   * @example
   * // Returns: { position: 'fixed', width: '60px', ... }
   */
  private getBubbleStyles(config: WhatsAppConfig): Record<string, string> {
    // Extract configuration with fallback defaults
    const size = config.bubble_size || 60;
    const offsetX = config.offset_x || 20;
    const offsetY = config.offset_y || 20;
    const color = config.bubble_color || '#25D366'; // WhatsApp brand green
    const position = config.position || 'bottom-right';

    // Map position names to CSS properties
    // BOILERPLATE TIP: Use this pattern for configurable positioning
    const positionStyles: Record<string, Record<string, string>> = {
      'bottom-right': { bottom: `${offsetY}px`, right: `${offsetX}px` },
      'bottom-left': { bottom: `${offsetY}px`, left: `${offsetX}px` },
      'top-right': { top: `${offsetY}px`, right: `${offsetX}px` },
      'top-left': { top: `${offsetY}px`, left: `${offsetX}px` },
    };

    // Return complete style object
    // BEST PRACTICE: Use fixed positioning for overlays
    return {
      position: 'fixed',              // Stays in viewport on scroll
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',            // Makes it circular
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Subtle elevation
      zIndex: '999999',               // Ensure it's on top
      transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth animations
      ...positionStyles[position]     // Spread position-specific styles
    };
  }

  /**
   * Create WhatsApp Icon Element
   * 
   * Generates an SVG icon with hover effects.
   * Uses official WhatsApp logo path data.
   * 
   * @private
   * @returns {HTMLElement} Icon container element
   * 
   * @example
   * // Returns a div containing an SVG with hover listeners
   */
  private getIconElement(): HTMLElement {
    const icon = document.createElement('div');
    
    // Style the icon container to ensure proper centering
    icon.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `;
    
    // Official WhatsApp logo SVG
    // BOILERPLATE TIP: Use inline SVG for icons to avoid external requests
    icon.innerHTML = `
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;

    // Add interactive hover effects
    // BEST PRACTICE: Provide visual feedback for interactive elements
    icon.addEventListener('mouseenter', () => {
      if (this.bubble) {
        this.bubble.style.transform = 'scale(1.1)';           // Grow slightly
        this.bubble.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'; // Deeper shadow
      }
    });

    icon.addEventListener('mouseleave', () => {
      if (this.bubble) {
        this.bubble.style.transform = 'scale(1)';             // Return to normal
        this.bubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; // Original shadow
      }
    });

    return icon;
  }
}

// ==================== WIDGET INITIALIZATION ====================
// Auto-start the widget when script loads
// The SDK handles:
// 1. Reading data attributes from script tag
// 2. Authorizing with Koru
// 3. Fetching configuration
// 4. Calling lifecycle hooks in order
// 5. Error handling and retries

new WhatsAppBubbleWidget().start();
