# Development Guide

> **For Widget Developers:** This guide explains how to build Koru-compatible widgets using this project as a reference.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Understanding the SDK](#understanding-the-sdk)
- [Widget Lifecycle](#widget-lifecycle)
- [Step-by-Step Tutorial](#step-by-step-tutorial)
- [Advanced Topics](#advanced-topics)
- [Testing Strategies](#testing-strategies)
- [Deployment Checklist](#deployment-checklist)

## Prerequisites

### Required Knowledge

- **JavaScript/TypeScript** - ES6+ features, async/await, classes
- **DOM API** - Element creation, event handling, styling
- **HTML/CSS** - Semantic markup, responsive design
- **HTTP/REST** - Basic understanding of APIs

### Required Tools

- **Node.js** 16+ and npm
- **Code editor** with TypeScript support (VS Code recommended)
- **Browser** with DevTools (Chrome/Firefox recommended)
- **Koru** backend running locally or accessible remotely

## Project Setup

### 1. Clone and Install

```bash
# Clone this repository
git clone <repo-url> my-custom-widget
cd my-custom-widget

# Install dependencies
npm install

# Verify installation
npm run build
```

### 2. Configure Your Environment

Create a `.env` file (optional):

```env
APP_MANAGER_URL=http://localhost:3000
WEBSITE_ID=your-test-website-id
APP_ID=your-test-app-id
```

### 3. Start Development Server

```bash
npm run dev
# Server starts at http://localhost:5173
```

### 4. Open Test Page

Open `test.html` in your browser or navigate to `http://localhost:5173/test.html`

## Understanding the SDK

> **📦 SDK Note:** Install via `npm install @redclover/koru-sdk`. The base class is `KoruWidget`.

### SDK Architecture

```
@redclover/koru-sdk
├── KoruWidget (Base Class)
│   ├── Authorization Logic
│   ├── Configuration Fetching
│   ├── Caching Layer
│   ├── Lifecycle Management
│   └── Helper Methods
└── Type Definitions
    ├── WidgetConfig
    ├── AuthResponse
    └── WidgetOptions
```

### What the SDK Handles Automatically

1. **Script Tag Parsing** - Reads `data-*` attributes
2. **Authorization** - Validates with Koru API
3. **Configuration** - Fetches and caches widget config
4. **Retry Logic** - Retries failed requests (3 attempts)
5. **Error Handling** - Catches and logs errors
6. **Lifecycle** - Calls hooks in correct order
7. **Analytics** - Sends events to Koru (if enabled)

### What You Need to Implement

1. **Configuration Interface** - Define your config schema
2. **Validation Logic** - Validate config in `onInit()`
3. **UI Rendering** - Create DOM elements in `onRender()`
4. **Business Logic** - Handle user interactions
5. **Cleanup** - Remove elements in `onDestroy()`

## Widget Lifecycle

### Lifecycle Flow

```
Script Loads
    ↓
new MyWidget().start()
    ↓
SDK reads data attributes
    ↓
SDK authorizes with Koru
    ↓
SDK fetches configuration
    ↓
onInit(config) ← YOU IMPLEMENT
    ↓
onRender(config) ← YOU IMPLEMENT
    ↓
Widget is live
    ↓
(optional) widget.reload()
    ↓
onConfigUpdate(config) ← YOU IMPLEMENT
    ↓
widget.stop() or page unload
    ↓
onDestroy() ← YOU IMPLEMENT
```

### Lifecycle Hooks Explained

#### `onInit(config)`

**Purpose:** Validate configuration and setup initial state

**When Called:** Once, after successful authorization

**Should:**
- Validate required fields
- Validate field formats
- Check feature flags
- Fetch external data (if needed)
- Setup global listeners (if needed)

**Should NOT:**
- Create DOM elements (use `onRender()`)
- Modify the page (use `onRender()`)

**Example:**

```typescript
async onInit(config: MyConfig) {
  // Validate required fields
  if (!config.api_key) {
    throw new Error('api_key is required');
  }
  
  // Validate formats
  if (!/^[A-Z0-9]{32}$/.test(config.api_key)) {
    throw new Error('Invalid api_key format');
  }
  
  // Fetch external data
  this.data = await fetch(config.api_url)
    .then(r => r.json());
  
  this.log('Initialized with', config);
}
```

#### `onRender(config)`

**Purpose:** Create and display the widget UI

**When Called:** Once, after `onInit()` completes

**Should:**
- Create DOM elements
- Apply styles
- Attach event listeners
- Insert into page
- Store references for cleanup

**Should NOT:**
- Fetch data (use `onInit()`)
- Validate config (use `onInit()`)

**Example:**

```typescript
async onRender(config: MyConfig) {
  // Create container
  this.container = document.createElement('div');
  this.container.className = 'my-widget';
  
  // Add content
  const title = document.createElement('h1');
  title.textContent = config.title;
  this.container.appendChild(title);
  
  // Add event listeners
  this.container.addEventListener('click', () => {
    this.handleClick(config);
  });
  
  // Insert into page
  document.body.appendChild(this.container);
  
  this.log('Rendered');
}
```

#### `onDestroy()`

**Purpose:** Clean up resources and remove widget

**When Called:** When `widget.stop()` is called or page unloads

**Should:**
- Remove DOM elements
- Remove event listeners
- Clear timers/intervals
- Cancel pending requests
- Null out references

**Should NOT:**
- Leave anything behind
- Assume elements still exist

**Example:**

```typescript
async onDestroy() {
  // Remove DOM
  this.container?.remove();
  this.container = null;
  
  // Clear timers
  if (this.updateTimer) {
    clearInterval(this.updateTimer);
    this.updateTimer = null;
  }
  
  // Remove global listeners
  window.removeEventListener('resize', this.handleResize);
  
  this.log('Destroyed');
}
```

#### `onConfigUpdate(config)` (Optional)

**Purpose:** Handle configuration changes without full reload

**When Called:** When `widget.reload()` is called

**Should:**
- Update only what changed
- Be more efficient than destroy + render
- Maintain widget state if possible

**Should NOT:**
- Re-initialize everything (unless necessary)

**Example:**

```typescript
async onConfigUpdate(newConfig: MyConfig) {
  // Efficient update: only change what's different
  if (newConfig.title !== this.config.title) {
    this.titleElement.textContent = newConfig.title;
  }
  
  if (newConfig.color !== this.config.color) {
    this.container.style.backgroundColor = newConfig.color;
  }
  
  // Or simple approach: full re-render
  await this.onDestroy();
  await this.onRender(newConfig);
  
  this.log('Updated');
}
```

## Step-by-Step Tutorial

### Building a Simple Counter Widget

Let's build a counter widget from scratch to understand the process.

#### Step 1: Define Configuration

```typescript
// src/index.ts
import { KoruWidget, WidgetConfig } from '@redclover/koru-sdk';

interface CounterConfig extends WidgetConfig {
  initial_value?: number;
  max_value?: number;
  button_color?: string;
  enabled?: boolean;
}
```

#### Step 2: Create Widget Class

```typescript
class CounterWidget extends KoruWidget {
  private container: HTMLElement | null = null;
  private countElement: HTMLElement | null = null;
  private count: number = 0;

  constructor() {
    super({
      name: 'counter-widget',
      version: '1.0.0',
      options: {
        cache: true,
        analytics: true,
        debug: true, // Enable for development
      }
    });
  }
}
```

#### Step 3: Implement onInit()

```typescript
async onInit(config: CounterConfig) {
  // Check if enabled
  if (config.enabled === false) {
    this.log('Widget is disabled');
    return;
  }
  
  // Validate max_value
  if (config.max_value && config.max_value < 0) {
    throw new Error('max_value must be positive');
  }
  
  // Set initial count
  this.count = config.initial_value || 0;
  
  this.log('Initialized', config);
}
```

#### Step 4: Implement onRender()

```typescript
async onRender(config: CounterConfig) {
  // Create container
  this.container = document.createElement('div');
  this.container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    font-family: sans-serif;
  `;
  
  // Create count display
  this.countElement = document.createElement('div');
  this.countElement.textContent = `Count: ${this.count}`;
  this.countElement.style.cssText = `
    font-size: 24px;
    margin-bottom: 10px;
    text-align: center;
  `;
  this.container.appendChild(this.countElement);
  
  // Create increment button
  const button = document.createElement('button');
  button.textContent = 'Increment';
  button.style.cssText = `
    padding: 10px 20px;
    background: ${config.button_color || '#007bff'};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  `;
  button.addEventListener('click', () => this.increment(config));
  this.container.appendChild(button);
  
  // Insert into page
  document.body.appendChild(this.container);
  
  this.log('Rendered');
}
```

#### Step 5: Add Business Logic

```typescript
private increment(config: CounterConfig) {
  // Check max value
  if (config.max_value && this.count >= config.max_value) {
    alert('Maximum value reached!');
    return;
  }
  
  // Increment
  this.count++;
  
  // Update display
  if (this.countElement) {
    this.countElement.textContent = `Count: ${this.count}`;
  }
  
  // Track event
  this.track('counter_incremented', {
    new_value: this.count,
    max_value: config.max_value
  });
  
  this.log('Incremented to', this.count);
}
```

#### Step 6: Implement onDestroy()

```typescript
async onDestroy() {
  this.container?.remove();
  this.container = null;
  this.countElement = null;
  this.log('Destroyed');
}
```

#### Step 7: Initialize Widget

```typescript
// Auto-start
new CounterWidget().start();
```

#### Step 8: Create Configuration Schema

Create `config-schema.json`:

```json
{
  "initial_value": {
    "type": "number",
    "required": false,
    "default": 0,
    "description": "Starting count value"
  },
  "max_value": {
    "type": "number",
    "required": false,
    "min": 1,
    "description": "Maximum count value"
  },
  "button_color": {
    "type": "string",
    "required": false,
    "pattern": "^#[0-9A-Fa-f]{6}$",
    "default": "#007bff",
    "description": "Button background color"
  },
  "enabled": {
    "type": "boolean",
    "required": false,
    "default": true,
    "description": "Enable or disable widget"
  }
}
```

#### Step 9: Test Locally

Update `test.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Counter Widget Test</title>
</head>
<body>
  <h1>Counter Widget Test</h1>
  
  <script
    src="http://localhost:5173/src/index.ts"
    data-website-id="test-website-id"
    data-app-id="test-app-id"
    data-app-manager-url="http://localhost:3000"
    type="module"
  ></script>
</body>
</html>
```

#### Step 10: Build for Production

```bash
npm run build
# Output: dist/counter-widget.min.js
```

## Advanced Topics

### State Management

For complex widgets with multiple components:

```typescript
class StatefulWidget extends KoruWidget {
  private state = {
    items: [] as Item[],
    selectedId: null as string | null,
    loading: false,
  };
  
  private setState(updates: Partial<typeof this.state>) {
    this.state = { ...this.state, ...updates };
    this.render();
  }
  
  private render() {
    // Re-render based on state
    if (this.state.loading) {
      this.showLoader();
    } else {
      this.showContent();
    }
  }
}
```

### External API Integration

```typescript
async onInit(config: MyConfig) {
  try {
    const response = await fetch(config.api_url, {
      headers: {
        'Authorization': `Bearer ${config.api_key}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    this.data = await response.json();
  } catch (error) {
    this.log('API fetch failed:', error);
    throw new Error('Failed to fetch data from API');
  }
}
```

### Complex Event Handling

```typescript
class InteractiveWidget extends KoruWidget {
  private handlers = new Map<HTMLElement, Map<string, EventListener>>();
  
  private addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener
  ) {
    element.addEventListener(event, handler);
    
    // Track for cleanup
    if (!this.handlers.has(element)) {
      this.handlers.set(element, new Map());
    }
    this.handlers.get(element)!.set(event, handler);
  }
  
  async onDestroy() {
    // Clean up all listeners
    this.handlers.forEach((events, element) => {
      events.forEach((handler, event) => {
        element.removeEventListener(event, handler);
      });
    });
    this.handlers.clear();
  }
}
```

### Responsive Design

```typescript
async onRender(config: MyConfig) {
  const isMobile = this.isMobile();
  
  this.container = document.createElement('div');
  this.container.className = isMobile ? 'widget-mobile' : 'widget-desktop';
  
  // Add resize listener
  this.handleResize = () => {
    const nowMobile = this.isMobile();
    if (nowMobile !== isMobile) {
      this.reload(); // Re-render for new layout
    }
  };
  window.addEventListener('resize', this.handleResize);
  
  // ... rest of rendering
}
```

## Testing Strategies

### Unit Testing (Conceptual)

```typescript
// While the SDK doesn't provide test utilities, you can:
// 1. Extract business logic to pure functions
// 2. Test those functions independently

// Pure function (testable)
function validatePhoneNumber(phone: string): boolean {
  return /^[0-9]{10,15}$/.test(phone);
}

// Use in widget
async onInit(config: MyConfig) {
  if (!validatePhoneNumber(config.phone)) {
    throw new Error('Invalid phone number');
  }
}
```

### Manual Testing Checklist

- [ ] Widget loads without errors
- [ ] All configuration options work
- [ ] Mobile and desktop layouts work
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] No console errors or warnings
- [ ] Analytics events fire correctly
- [ ] Widget cleans up on destroy
- [ ] No memory leaks (check DevTools)
- [ ] Works in all target browsers

### Browser Testing

```bash
# Test in multiple browsers
open -a "Google Chrome" test.html
open -a "Firefox" test.html
open -a "Safari" test.html
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] No console errors
- [ ] Code is documented
- [ ] README is updated
- [ ] Version number is bumped
- [ ] Build succeeds: `npm run build`
- [ ] Bundle size is acceptable
- [ ] Configuration schema is finalized

### Build

```bash
# Production build
npm run build

# Verify output
ls -lh dist/
# Should see: your-widget.min.js
```

### CDN Upload

```bash
# Upload to your CDN
# Example with AWS S3:
aws s3 cp dist/your-widget.min.js \
  s3://your-cdn-bucket/widgets/your-widget/v1.0.0/

# Set cache headers
aws s3api put-object-acl \
  --bucket your-cdn-bucket \
  --key widgets/your-widget/v1.0.0/your-widget.min.js \
  --acl public-read
```

### Koru Registration

1. Go to **Admin Panel → Apps → Add App**
2. Fill in:
   - **Name:** Your Widget Name
   - **Description:** What it does
   - **Status:** Active
   - **Widget URL:** `https://cdn.example.com/widgets/your-widget/v1.0.0/your-widget.min.js`
   - **Config Schema:** Paste your JSON schema
3. Click **Save**
4. Note the generated App ID

### Verification

```html
<!-- Test the deployed widget -->
<script
  src="https://cdn.example.com/widgets/your-widget/v1.0.0/your-widget.min.js"
  data-website-id="test-website-id"
  data-app-id="your-app-id"
  data-app-manager-url="https://your-app-manager.com"
  async
></script>
```

### Post-Deployment

- [ ] Widget loads from CDN
- [ ] Authorization works
- [ ] Configuration fetches correctly
- [ ] Analytics events are received
- [ ] No CORS errors
- [ ] Performance is acceptable
- [ ] Documentation is published

## Next Steps

1. **Read the SDK documentation** - Understand all available methods
2. **Study the code** - Read through `src/index.ts` with comments
3. **Build something simple** - Start with the counter example
4. **Iterate** - Add features incrementally
5. **Share** - Publish your widget to Koru

## Getting Help

- **SDK Issues:** [npm package](https://www.npmjs.com/package/@redclover/koru-sdk)
- **Koru Docs:** [Documentation](https://docs.appmanager.example.com)
- **Community:** [Discord/Slack](#)

---

**Happy Widget Building! 🚀**
