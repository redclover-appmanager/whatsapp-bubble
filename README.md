# WhatsApp Bubble Widget

> **🎯 Dual Purpose:** This project serves as both a production-ready WhatsApp contact widget AND a comprehensive boilerplate/guide for building Koru-compatible widgets.

A floating WhatsApp contact button widget that displays in a corner of the website. When clicked, opens WhatsApp with a pre-configured phone number and optional message.

Built using the `@redclover/koru-sdk`.

> **📦 SDK Note:** Install via `npm install @redclover/koru-sdk`. The base class is `KoruWidget`.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [For Widget Developers](#for-widget-developers)
- [Configuration Schema](#configuration-schema)
- [Development](#development)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Customer Usage](#customer-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 📚 Documentation

This project includes comprehensive documentation for different audiences:

- **[QUICK_START.md](./QUICK_START.md)** - 30-minute guide to build your first widget
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - In-depth tutorial with step-by-step examples
- **[README.md](./README.md)** (this file) - Complete reference and best practices
- **[src/index.ts](./src/index.ts)** - Heavily commented source code

## Features

### End-User Features
- ✅ Floating bubble with WhatsApp icon
- ✅ Configurable position (4 corners)
- ✅ Customizable size, color, and offset
- ✅ Pre-filled message support
- ✅ Mobile and desktop support
- ✅ Keyboard accessible (Tab + Enter)
- ✅ Hover animations and tooltips
- ✅ Analytics tracking
- ✅ Configuration caching
- ✅ Lightweight (~12KB gzipped)

### Developer Features
- 📚 **Comprehensive Documentation** - Inline comments, JSDoc, and guides
- 🎓 **Learning Resource** - Understand SDK patterns and best practices
- 🔧 **Boilerplate Code** - Copy and modify for your own widgets
- 🏗️ **Production-Ready** - Error handling, accessibility, performance optimized
- 📊 **Analytics Integration** - Built-in event tracking examples
- 🧪 **Test Setup** - Local development environment included

## Quick Start

### For End Users

```html
<!-- Add this script tag to your website -->
<script
  src="https://cdn.example.com/whatsapp-bubble.js"
  data-website-id="your-website-id"
  data-app-id="your-app-id"
  data-app-manager-url="https://app-manager.example.com"
  async
></script>
```

### For Widget Developers

```bash
# Clone this repository as a starting point
git clone <repo-url> my-widget
cd my-widget

# Install dependencies
npm install

# Start development server
npm run dev

# Open test.html in your browser
open test.html
```

## For Widget Developers

### 🎓 Using This as a Boilerplate

This project is designed to be copied and modified for your own widgets. Here's how:

#### 1. **Study the Code Structure**

```
src/index.ts          # Main widget implementation (heavily commented)
├── Configuration Interface
├── Widget Class
│   ├── Constructor (SDK setup)
│   ├── Lifecycle Hooks
│   │   ├── onInit()        - Validation & setup
│   │   ├── onRender()      - UI creation
│   │   ├── onDestroy()     - Cleanup
│   │   └── onConfigUpdate() - Dynamic updates
│   └── Private Methods
└── Initialization
```

#### 2. **Key Learning Points**

| Concept | Location in Code | What to Learn |
|---------|------------------|---------------|
| **SDK Integration** | Lines 19, 82-112 | How to extend `KoruWidget` |
| **Configuration** | Lines 38-68 | Type-safe config interface |
| **Validation** | Lines 138-163 | Config validation patterns |
| **Rendering** | Lines 181-226 | DOM creation and styling |
| **Cleanup** | Lines 245-257 | Memory leak prevention |
| **Analytics** | Lines 314-318 | Event tracking with SDK |
| **Mobile Detection** | Lines 307-309 | Using SDK helpers |
| **Accessibility** | Lines 201-218 | WCAG compliance |

#### 3. **Customization Checklist**

When adapting this for your widget:

- [ ] **Update widget name** in constructor (line 104)
- [ ] **Define your config interface** (lines 38-68)
- [ ] **Update config schema** in `config-schema.json`
- [ ] **Implement your validation** in `onInit()` (lines 138-163)
- [ ] **Build your UI** in `onRender()` (lines 181-226)
- [ ] **Add your business logic** in private methods
- [ ] **Update analytics events** to match your use case
- [ ] **Test thoroughly** with `test.html`
- [ ] **Update README** with your widget's documentation

#### 4. **Common Patterns Demonstrated**

```typescript
// ✅ Configuration with defaults
const size = config.bubble_size || 60;

// ✅ Conditional rendering
if (config.show_tooltip !== false) {
  // Add tooltip
}

// ✅ Dynamic styling
const styles = this.getBubbleStyles(config);
Object.keys(styles).forEach(key => {
  element.style[key] = styles[key];
});

// ✅ Event tracking
this.track('event_name', { data });

// ✅ Mobile detection
const url = this.isMobile() ? mobileUrl : desktopUrl;

// ✅ Proper cleanup
async onDestroy() {
  this.element?.remove();
  this.element = null;
}
```

#### 5. **SDK Methods Available**

| Method | Purpose | Example |
|--------|---------|---------|
| `this.log(msg, data)` | Debug logging | `this.log('Rendered', config)` |
| `this.track(event, data)` | Analytics | `this.track('button_clicked', {id: 1})` |
| `this.isMobile()` | Device detection | `if (this.isMobile()) { ... }` |
| `this.config` | Current config | `const color = this.config.color` |
| `this.authData` | Auth response | `const appId = this.authData.app_id` |

#### 6. **Testing Your Widget**

1. **Update `test.html`** with your test configuration
2. **Run dev server**: `npm run dev`
3. **Open in browser**: `http://localhost:5173/test.html`
4. **Check console** for SDK debug logs (set `debug: true`)
5. **Test all config options** by modifying Koru settings

#### 7. **Common Pitfalls to Avoid**

❌ **Don't:**
- Forget to call `super()` in constructor
- Skip validation in `onInit()`
- Leave out `onDestroy()` cleanup
- Hardcode configuration values
- Ignore accessibility requirements
- Skip error handling

✅ **Do:**
- Validate all required config fields
- Store DOM references for cleanup
- Use SDK helpers (`isMobile()`, `track()`)
- Follow TypeScript types strictly
- Test on mobile and desktop
- Document your configuration schema

## Configuration Schema

The widget accepts these configuration parameters (managed by Koru):

```json
{
  "phone_number": {
    "type": "string",
    "required": true,
    "pattern": "^[0-9]{10,15}$",
    "description": "WhatsApp phone number with country code (no + or spaces)",
    "example": "5491112345678"
  },
  "default_message": {
    "type": "string",
    "required": false,
    "maxLength": 500,
    "description": "Pre-filled message when opening WhatsApp",
    "example": "Hello! I'm interested in your services"
  },
  "position": {
    "type": "string",
    "required": false,
    "enum": ["bottom-right", "bottom-left", "top-right", "top-left"],
    "default": "bottom-right",
    "description": "Corner position of the bubble"
  },
  "enabled": {
    "type": "boolean",
    "required": false,
    "default": true,
    "description": "Enable or disable the widget"
  },
  "bubble_size": {
    "type": "number",
    "required": false,
    "min": 40,
    "max": 80,
    "default": 60,
    "description": "Bubble diameter in pixels"
  },
  "offset_x": {
    "type": "number",
    "required": false,
    "min": 10,
    "max": 100,
    "default": 20,
    "description": "Horizontal offset from edge in pixels"
  },
  "offset_y": {
    "type": "number",
    "required": false,
    "min": 10,
    "max": 100,
    "default": 20,
    "description": "Vertical offset from edge in pixels"
  },
  "bubble_color": {
    "type": "string",
    "required": false,
    "pattern": "^#[0-9A-Fa-f]{6}$",
    "default": "#25D366",
    "description": "Background color of the bubble (hex)"
  },
  "show_tooltip": {
    "type": "boolean",
    "required": false,
    "default": true,
    "description": "Show tooltip on hover"
  },
  "tooltip_text": {
    "type": "string",
    "required": false,
    "maxLength": 50,
    "default": "Chat with us on WhatsApp",
    "description": "Tooltip text displayed on hover"
  }
}
```

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- Koru backend running (for testing)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `test.html` in your browser

3. Make sure your Koru backend is running and configured with the test website and app IDs

### Building

```bash
# Build for production
npm run build
```

Output: `dist/whatsapp-bubble.min.js` (~12KB gzipped)

## Deployment

### 1. Build the Widget

```bash
npm run build
```

### 2. Upload to CDN

Upload `dist/whatsapp-bubble.min.js` to your CDN or hosting service.

### 3. Register in Koru

Go to **Admin Panel → Apps → Add App** and fill in:

- **Name**: WhatsApp Bubble
- **Description**: Floating WhatsApp contact button for your website
- **Status**: Active
- **Widget URL**: `https://your-cdn.com/whatsapp-bubble.min.js`
- **Config Schema**: (paste the JSON schema above)

## Customer Usage

### Embed Code

Customers will receive this embed code from Koru:

```html
<script
  src="https://your-cdn.com/whatsapp-bubble.min.js"
  data-website-id="CUSTOMER_WEBSITE_ID"
  data-app-id="WHATSAPP_BUBBLE_APP_ID"
  data-app-manager-url="https://your-app-manager.com"
  async
></script>
```

### Customer Instructions

1. Go to **My Websites** in dashboard
2. Click on your website
3. Click **Configure** on WhatsApp Bubble
4. Fill in phone number and settings
5. Click **Save Configuration**
6. Go to **Embed Code** tab
7. Copy the code
8. Paste in your website before `</body>`
9. Publish your website

## Architecture

### Widget Lifecycle

The widget extends `KoruWidget` from `@redclover/koru-sdk` and implements these lifecycle hooks:

1. **Initialization** (`onInit`)
   - Validates required `phone_number` configuration
   - Validates phone number format (10-15 digits)
   - Checks if widget is enabled
   - Logs initialization

2. **Rendering** (`onRender`)
   - Creates bubble element with WhatsApp icon
   - Applies configurable styles (size, color, position)
   - Adds click handler to open WhatsApp
   - Adds keyboard accessibility (Enter/Space)
   - Adds hover animations
   - Appends to DOM

3. **Destruction** (`onDestroy`)
   - Removes bubble from DOM
   - Cleans up references

4. **Config Updates** (`onConfigUpdate`)
   - Destroys old widget
   - Re-renders with new configuration
   - Maintains clean state

### SDK Features (Automatic)

The `@redclover/koru-sdk` provides these features automatically:

- ✅ **Authorization**: Validates widget access with Koru
- ✅ **Configuration fetching**: Retrieves config from Koru API
- ✅ **Caching**: Caches configuration for 1 hour
- ✅ **Error handling**: Automatic retry logic (3 attempts)
- ✅ **Analytics tracking**: `this.track()` method for events
- ✅ **Mobile detection**: `this.isMobile()` helper
- ✅ **Debug logging**: `this.log()` method with debug mode
- ✅ **Lifecycle management**: Automatic hook execution

### Widget Implementation (~150 lines)

The widget itself only needs to implement:

- WhatsApp bubble UI with SVG icon
- Click handler (opens WhatsApp web/app)
- Position configuration (4 corners)
- Size, color, and offset customization
- Tooltip support
- Keyboard accessibility
- Hover animations

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Bundle size: ~12KB gzipped
- Load time: < 100ms
- No impact on customer website performance
- Configuration cached for 1 hour

## Accessibility

- ✅ Keyboard navigation (Tab + Enter/Space)
- ✅ ARIA labels and roles
- ✅ Focus indicators
- ✅ Tooltip support

## Best Practices

### 🎯 Widget Development Guidelines

#### Configuration Design

```typescript
// ✅ Good: Provide sensible defaults
const size = config.bubble_size || 60;

// ✅ Good: Validate early in onInit()
if (!config.required_field) {
  throw new Error('required_field is required');
}

// ❌ Bad: Fail silently
if (!config.required_field) {
  console.log('Missing field'); // Widget still renders broken
}
```

#### Memory Management

```typescript
// ✅ Good: Store references and clean up
class MyWidget extends KoruWidget {
  private element: HTMLElement | null = null;
  private timers: number[] = [];
  
  async onDestroy() {
    this.element?.remove();
    this.timers.forEach(t => clearInterval(t));
  }
}

// ❌ Bad: No cleanup
class MyWidget extends KoruWidget {
  async onRender(config) {
    setInterval(() => this.update(), 1000); // Memory leak!
  }
}
```

#### Error Handling

```typescript
// ✅ Good: Graceful degradation
async onRender(config) {
  try {
    await this.renderContent(config);
  } catch (error) {
    this.log('Render error:', error);
    this.renderErrorState();
  }
}

// ❌ Bad: Unhandled errors
async onRender(config) {
  await this.renderContent(config); // Crashes if fails
}
```

#### Performance

```typescript
// ✅ Good: Minimize DOM operations
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const el = this.createItem(item);
  fragment.appendChild(el);
});
container.appendChild(fragment); // Single reflow

// ❌ Bad: Multiple reflows
items.forEach(item => {
  const el = this.createItem(item);
  container.appendChild(el); // Reflow on each iteration
}
```

#### Analytics

```typescript
// ✅ Good: Track meaningful events
this.track('purchase_completed', {
  product_id: product.id,
  amount: product.price,
  currency: 'USD'
});

// ❌ Bad: Track everything
this.track('mouse_moved', { x, y }); // Too noisy
```

### 📚 Additional Resources

- [Koru SDK Documentation](https://www.npmjs.com/package/@redclover/koru-sdk)
- [Koru API Reference](https://docs.appmanager.example.com)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Troubleshooting

### Widget Not Loading

**Symptom:** Widget doesn't appear on the page

**Solutions:**
1. Check browser console for errors
2. Verify all data attributes are present on script tag
3. Ensure Koru URL is correct and accessible
4. Enable debug mode: `options: { debug: true }`
5. Check that widget is authorized in Koru

### Authorization Failing

**Symptom:** Console shows "Not authorized" error

**Solutions:**
1. Verify `data-website-id` matches Koru database
2. Verify `data-app-id` matches Koru database
3. Check that website has the app installed
4. Ensure app status is "Active" in Koru
5. Check network tab for 401/403 responses

### Configuration Not Updating

**Symptom:** Changes in Koru don't reflect on website

**Solutions:**
1. Clear browser cache and localStorage
2. Call `widget.reload()` to bypass cache
3. Check cache duration in constructor options
4. Verify configuration was saved in Koru
5. Check browser console for config fetch errors

### TypeScript Errors

**Symptom:** Build fails with type errors

**Solutions:**
1. Ensure `@redclover/koru-sdk` is installed
2. Run `npm install` to update dependencies
3. Check that config interface extends `WidgetConfig`
4. Verify all lifecycle hooks have correct signatures
5. Use `any` type as last resort (not recommended)

### Performance Issues

**Symptom:** Widget causes page slowdown

**Solutions:**
1. Check for memory leaks in `onDestroy()`
2. Minimize DOM operations in `onRender()`
3. Debounce frequent events (scroll, resize)
4. Use CSS animations instead of JavaScript
5. Profile with browser DevTools

## License

ISC
