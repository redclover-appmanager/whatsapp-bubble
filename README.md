# WhatsApp Bubble Widget

A floating WhatsApp contact button widget that displays in a corner of the website. When clicked, opens WhatsApp with a pre-configured phone number and optional message.

Built using the `@roku/widget-sdk`.

## Features

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

## Configuration Schema

The widget accepts these configuration parameters (managed by App Manager):

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
- App Manager backend running (for testing)

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

3. Make sure your App Manager backend is running and configured with the test website and app IDs

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

### 3. Register in App Manager

Go to **Admin Panel → Apps → Add App** and fill in:

- **Name**: WhatsApp Bubble
- **Description**: Floating WhatsApp contact button for your website
- **Status**: Active
- **Widget URL**: `https://your-cdn.com/whatsapp-bubble.min.js`
- **Config Schema**: (paste the JSON schema above)

## Customer Usage

### Embed Code

Customers will receive this embed code from App Manager:

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

1. **Initialization** (`onInit`)
   - Validates configuration
   - Checks if widget is enabled
   - Logs initialization

2. **Rendering** (`onRender`)
   - Creates bubble element
   - Applies styles and position
   - Adds event listeners
   - Appends to DOM

3. **Destruction** (`onDestroy`)
   - Removes bubble from DOM
   - Cleans up references

4. **Config Updates** (`onConfigUpdate`)
   - Re-renders widget with new config
   - Maintains state

### SDK Features Used

- ✅ Authorization with App Manager
- ✅ Configuration fetching and caching
- ✅ Error handling and retry logic
- ✅ Analytics tracking
- ✅ Mobile detection
- ✅ DOM helpers (`createElement`)
- ✅ Debug logging

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

## License

ISC
