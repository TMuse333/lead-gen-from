# Chatbot Iframe Integration Guide

## Overview

This document explains how the agent-lead-gen chatbot is embedded into client websites via iframe. The primary example is the Chris Crowell Real Estate website.

---

## Live Implementation

### Client Website
- **Project:** Chris Crowell Real Estate
- **Repo:** `chris-crowell/frontend`
- **Branch:** `dev2` (preview), `main` (production)

### Chatbot URL
```
https://chatbot.focusflowsoftware.com/bot/chris-crowell-real-estate
```

---

## Integration Architecture

### Components Created

Two React components were built to embed the chatbot:

#### 1. `InlineChatbot` - Primary Embedded Component
**Location:** `src/components/chatbotWidget/inlineChatbot.tsx`

An always-visible chatbot embedded directly in the page content.

```tsx
<InlineChatbot
  botUrl="https://chatbot.focusflowsoftware.com/bot/chris-crowell-real-estate"
  title="Chat with Chris"
  subtitle="Get personalized guidance for your real estate journey"
/>
```

**Features:**
- Embedded in page flow (not floating)
- 500px default height
- Expand/fullscreen button
- Backdrop overlay when expanded
- Framer Motion animations

#### 2. `ChatbotWidget` - Floating Scroll Button
**Location:** `src/components/chatbotWidget/chatbotWidget.tsx`

A floating button that scrolls to the inline chatbot.

```tsx
<ChatbotWidget />
```

**Features:**
- Fixed position (bottom-right)
- Subtle bounce animation to draw attention
- Auto-hides when inline chatbot is visible (IntersectionObserver)
- Smooth scrolls to `#chatbot-section` on click

---

## Important: Single Iframe Limitation

### Discovery
When testing with two iframes loading the same bot URL on one page, both showed "Bot Not Found" error.

### Cause
The chatbot service only allows **one iframe instance per bot per page**. Multiple iframes cause a conflict.

### Solution
Use a single iframe (InlineChatbot) and convert the floating widget to a scroll-to button instead of a second iframe.

### Implementation
```tsx
// ChatbotWidget scrolls to the inline chatbot instead of opening its own iframe
const scrollToChatbot = () => {
  const chatbotSection = document.getElementById("chatbot-section");
  if (chatbotSection) {
    chatbotSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};
```

---

## Iframe Configuration

### Basic Iframe Setup
```tsx
<iframe
  src={botUrl}
  className="w-full h-full border-0"
  title="Chat with Chris Crowell"
  allow="microphone"
/>
```

### Required Attributes
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `src` | Bot URL | The chatbot endpoint |
| `allow` | `"microphone"` | Enable voice input if supported |
| `title` | Descriptive text | Accessibility |
| `className` | `"border-0"` | Remove default iframe border |

### Sizing
- **Inline mode:** `h-[500px]` (fixed height)
- **Expanded mode:** `h-[calc(100%-60px)]` (full container minus header)

---

## Page Integration

### Where It's Used
**File:** `src/components/landingPage/IntakeSection.tsx`

```tsx
{/* Inline Chatbot */}
<div id="chatbot-section" className="mb-10">
  <InlineChatbot
    title="Chat with Chris"
    subtitle="Get personalized guidance for your real estate journey"
  />
</div>
```

### Global Widget
**File:** `src/app/layout.tsx`

```tsx
<ContextProvider>
  {children}
  <Analytics />
  <CookieConsent />
  <ChatbotWidget />  {/* Floating scroll button */}
</ContextProvider>
```

---

## User Experience Flow

```
User lands on page
        ↓
Sees floating chat button (bouncing)
        ↓
Scrolls down OR clicks button
        ↓
Reaches IntakeSection with inline chatbot
        ↓
Floating button auto-hides (chatbot visible)
        ↓
User interacts with chatbot
        ↓
Can expand to fullscreen if needed
        ↓
Scrolls away → floating button reappears
```

---

## Styling Notes

### Header Styling
```tsx
<div className="bg-[#CC0000] text-white px-4 py-3 flex items-center justify-between">
  {/* Icon + Title + Expand button */}
</div>
```

- Uses client's brand color (`#CC0000`)
- White text for contrast
- Rounded corners on container (`rounded-2xl`)
- Shadow for depth (`shadow-2xl`)

### Animations
- Entry animation: `opacity: 0, y: 20` → `opacity: 1, y: 0`
- Floating button: `animate-subtle-bounce` (CSS keyframes)
- Expand transition: CSS `transition-all duration-300`

---

## Future Considerations

### For agent-lead-gen Development

1. **Cross-Origin Communication**
   - Consider `postMessage` API for parent ↔ iframe communication
   - Could enable: theme syncing, event tracking, minimize commands

2. **Embed Script Option**
   - Alternative to iframe: JavaScript embed script
   - More control over styling and behavior
   - Could bypass single-iframe limitation

3. **Cookie/Session Handling**
   - See `COOKIE_IMPLEMENTATION.md` for visitor tracking ideas
   - Consider passing visitor ID from parent to iframe via URL params

4. **Analytics Integration**
   - Track iframe interactions in parent page analytics
   - Could fire events when chat starts, form submitted, etc.

5. **Responsive Improvements**
   - Mobile-optimized heights
   - Full-screen mode on mobile by default

---

## File References

### Chris Crowell Project
```
chris-crowell/frontend/
├── src/
│   ├── app/
│   │   └── layout.tsx              # ChatbotWidget included here
│   └── components/
│       ├── chatbotWidget/
│       │   ├── chatbotWidget.tsx   # Floating scroll button
│       │   └── inlineChatbot.tsx   # Main iframe component
│       └── landingPage/
│           └── IntakeSection.tsx   # Uses InlineChatbot
```

### Chatbot Service
```
https://chatbot.focusflowsoftware.com/bot/{bot-slug}
```

---

## Embed Mode Optimizations (2026-01-31 Update)

### New Features

#### 1. **Compact Embed Mode**
The chatbot now automatically adapts when `?embed=true` is added to the URL:

```tsx
// Compact mode activated
https://chatbot.focusflowsoftware.com/bot/{client-id}?embed=true
```

**Optimizations in Embed Mode:**
- Smaller header (8px avatar vs 10px)
- Reduced padding (px-3 py-2 vs px-6 py-3)
- Truncated business name for space saving
- Progress bar always visible (not hidden on mobile)
- Close button visible (posts message to parent window)
- Side tracker panel hidden (full-width chat)
- Minimum height: 400px (down from 500px)
- Isolation CSS to prevent bleed into parent

#### 2. **Iframe Test Dashboard**
A new admin panel feature for testing and getting embed code.

**Location:** Admin Dashboard → Iframe Test Tab

**Features:**
- **Live Preview:** See your bot in different screen sizes
- **Size Presets:** Mobile (375×667), Tablet (768×1024), Desktop (1200×800)
- **Custom Dimensions:** Test any width/height
- **Copy Embed Code:** Get ready-to-use HTML with one click
- **Integration Tips:** Built-in best practices guide
- **Open in New Tab:** Quick link to test standalone

**Usage:**
1. Navigate to Admin Dashboard
2. Click "Iframe Test" tab
3. Select a client configuration
4. Choose screen size or enter custom dimensions
5. Preview live or copy embed code

### Recommended Embed Code

```html
<!-- AI Chatbot Embed Code -->
<iframe
  src="https://chatbot.focusflowsoftware.com/bot/{client-id}?embed=true"
  width="100%"
  height="600px"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  allow="microphone"
  title="AI Chat Assistant"
></iframe>
```

### Close Button Messaging

In embed mode, the close button sends a postMessage to the parent window:

```javascript
// In parent page - listen for close events
window.addEventListener('message', (event) => {
  if (event.data.type === 'close-iframe') {
    // Handle close (e.g., hide iframe container, minimize, etc.)
    document.getElementById('chatbot-container').style.display = 'none';
  }
});
```

---

## Best Practices for Embedding

### 1. **Responsive Sizing**
```css
/* Mobile-first approach */
iframe {
  width: 100%;
  min-height: 500px; /* Minimum for good UX */
  height: 600px;
}

@media (min-width: 768px) {
  iframe {
    height: 700px;
  }
}
```

### 2. **Custom Styling**
```html
<div class="chatbot-wrapper">
  <iframe
    src="..."
    style="
      border: none;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      max-width: 1200px;
      margin: 0 auto;
    "
  ></iframe>
</div>
```

### 3. **Color Theming**
The chatbot automatically uses the client's color configuration stored in the database. No additional parameters needed - colors are injected via CSS variables on page load.

### 4. **Performance Optimization**
```html
<!-- Lazy load iframe below the fold -->
<iframe
  src="..."
  loading="lazy"
></iframe>
```

---

## Troubleshooting

### "Bot Not Found" Error
- **Cause:** Multiple iframes loading same bot, OR invalid bot slug
- **Fix:** Ensure only one iframe per bot per page

### Iframe Not Loading
- Check browser console for CORS or X-Frame-Options errors
- Verify bot URL is correct and service is running
- Ensure `?embed=true` parameter is included for embedded mode

### Expand Button Not Working
- Check z-index stacking (backdrop: z-40, chatbot: z-50)
- Ensure backdrop renders before chatbot in JSX

### Floating Button Not Hiding
- Verify `id="chatbot-section"` exists on inline chatbot container
- Check IntersectionObserver threshold (currently 0.3)

### Close Button Not Working
- Ensure parent page has message event listener
- Check browser console for postMessage errors
- Verify origin validation if implemented
