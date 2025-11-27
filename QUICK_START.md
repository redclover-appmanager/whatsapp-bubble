# Quick Start Guide for Widget Developers

> **TL;DR:** Copy this project, change 5 things, deploy. This guide gets you from zero to deployed widget in 30 minutes.

**SDK Version:** This guide uses `@redclover/koru-sdk` v1.1.0+ which includes built-in preview mode support.

## 🚀 30-Minute Widget

### Step 1: Copy This Project (2 min)

```bash
git clone <this-repo> my-awesome-widget
cd my-awesome-widget
npm install
```

### Step 2: Rename Your Widget (3 min)

**File: `src/index.ts`**

```typescript
// Line 104: Change widget name
constructor() {
  super({
    name: 'my-awesome-widget',  // ← CHANGE THIS
    version: '1.0.0',
    // ...
  });
}
```

**File: `package.json`**

```json
{
  "name": "my-awesome-widget",  // ← CHANGE THIS
  "description": "My awesome widget description"  // ← CHANGE THIS
}
```

### Step 3: Define Your Configuration (5 min)

**File: `src/index.ts` (lines 38-68)**

```typescript
interface MyWidgetConfig extends WidgetConfig {
  // Replace WhatsApp config with your own
  api_key: string;           // Required field
  theme?: 'light' | 'dark';  // Optional with union type
  max_items?: number;        // Optional number
  enabled?: boolean;         // Feature flag
}
```

**File: `config-schema.json`**

```json
{
  "api_key": {
    "type": "string",
    "required": true,
    "description": "Your API key"
  },
  "theme": {
    "type": "string",
    "required": false,
    "enum": ["light", "dark"],
    "default": "light"
  },
  "max_items": {
    "type": "number",
    "required": false,
    "min": 1,
    "max": 100,
    "default": 10
  },
  "enabled": {
    "type": "boolean",
    "required": false,
    "default": true
  }
}
```

### Step 4: Implement Your Logic (15 min)

**Validation (in `onInit`)**

```typescript
async onInit(config: MyWidgetConfig) {
  // Validate required fields
  if (!config.api_key) {
    throw new Error('api_key is required');
  }
  
  // Check enabled flag
  if (config.enabled === false) {
    this.log('Widget disabled');
    return;
  }
  
  this.log('Initialized');
}
```

**UI (in `onRender`)**

```typescript
async onRender(config: MyWidgetConfig) {
  // Create your widget UI
  this.container = document.createElement('div');
  this.container.className = 'my-widget';
  this.container.textContent = 'Hello from my widget!';
  
  // Style it
  this.container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 20px;
    background: ${config.theme === 'dark' ? '#333' : '#fff'};
    color: ${config.theme === 'dark' ? '#fff' : '#333'};
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `;
  
  // Add to page
  document.body.appendChild(this.container);
  
  this.log('Rendered');
}
```

**Cleanup (in `onDestroy`)**

```typescript
async onDestroy() {
  this.container?.remove();
  this.container = null;
  this.log('Destroyed');
}
```

### Step 5: Test Locally (5 min)

Update `test-preview.html`:

```html
<script>
  window.__KORU_PREVIEW_CONFIG__ = {
    enabled: true,
    api_key: 'test-key-123',
    theme: 'light',
    max_items: 10
  };
</script>
<script src="./dist/my-awesome-widget.iife.js"></script>
```

**Run:**

```bash
npm run build
open test-preview.html
```

**Check console for:**
- ✅ "Widget initialized"
- ✅ "Widget rendered"
- ✅ No errors

### Step 6: Build & Deploy (5 min)

```bash
# Build for production
npm run build
# Output: dist/my-awesome-widget.iife.js

# Option A: Deploy to GitHub (easiest for testing)
git add dist/my-awesome-widget.iife.js -f
git commit -m "Build widget"
git push origin main
# URL: https://raw.githubusercontent.com/username/repo/main/dist/my-awesome-widget.iife.js

# Option B: Deploy to Vercel
vercel --prod

# Option C: Deploy to AWS S3
aws s3 cp dist/my-awesome-widget.iife.js \
  s3://my-cdn/widgets/my-awesome-widget/v1.0.0/ \
  --acl public-read
```

### Step 7: Register in Koru (5 min)

1. Go to **Admin → Apps → Add App**
2. Fill in:
   - Name: "My Awesome Widget"
   - Widget URL: Use URL from Step 6 (e.g., `https://your-project.vercel.app/dist/my-awesome-widget.iife.js`)
   - Config Schema: (paste your `config-schema.json`)
3. Save and note the App ID

### Step 8: Test in Production (2 min)

```html
<script
  src="https://your-cdn.com/dist/my-awesome-widget.iife.js"
  data-website-id="real-website-id"
  data-app-id="real-app-id"
  data-app-manager-url="https://your-koru-backend.com"
  async
></script>
```

The SDK automatically handles both preview mode (Koru editor) and production mode.

## 📝 Cheat Sheet

### SDK Methods

```typescript
// Logging (requires debug: true)
this.log('Message', data);

// Analytics (requires analytics: true)
this.track('event_name', { key: 'value' });

// Mobile detection
if (this.isMobile()) { /* mobile code */ }

// Access config
const value = this.config.my_field;

// Access auth data
const appId = this.authData.app_id;
```

### Lifecycle Order

```
1. new MyWidget().start()
2. SDK authorizes
3. SDK fetches config
4. onInit(config)      ← Validate here
5. onRender(config)    ← Build UI here
6. [widget is live]
7. onDestroy()         ← Clean up here
```

### Common Patterns

```typescript
// Default values
const size = config.size || 60;

// Validation
if (!config.required_field) {
  throw new Error('required_field is required');
}

// Feature flags
if (config.enabled === false) return;

// Event tracking
this.track('button_clicked', { button_id: 'submit' });

// Cleanup
async onDestroy() {
  this.element?.remove();
  this.element = null;
}
```

### File Structure

```
my-widget/
├── src/
│   └── index.ts           ← Your widget code
├── dist/                  ← Build output (gitignored)
├── config-schema.json     ← Configuration schema
├── test.html              ← Local testing
├── package.json           ← Dependencies
├── tsconfig.json          ← TypeScript config
├── vite.config.ts         ← Build config
└── README.md              ← Documentation
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Widget not loading | Check console, verify data attributes |
| "Not authorized" | Check website_id and app_id match Koru |
| Config not updating | Clear cache: `widget.reload()` |
| TypeScript errors | Run `npm install`, check types |
| Build fails | Check `vite.config.ts`, run `npm run build` |

## 📚 Learn More

- **Full Tutorial:** See `DEVELOPMENT.md`
- **Best Practices:** See `README.md` → Best Practices section
- **Code Examples:** Read `src/index.ts` (heavily commented)
- **SDK Docs:** [Koru SDK on npm](https://www.npmjs.com/package/@redclover/koru-sdk)

## 🎯 Next Steps

1. ✅ You have a working widget
2. 📖 Read through `src/index.ts` comments
3. 🎨 Customize the UI
4. 🧪 Add more features
5. 📊 Add analytics tracking
6. 🚀 Deploy to production
7. 📝 Document for users

---

**Need help?** Check `DEVELOPMENT.md` for detailed explanations of every concept.
