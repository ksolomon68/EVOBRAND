# 🚀 Accessibility Widget Pro - Integration Guide

Complete guide for adding the enhanced accessibility widget to any app or website.

## 📦 What's Included

You have 3 accessibility solutions now:

1. **Browser Extensions** (A11y Compliance + AccessAssist) - User installs
2. **Basic Widget** (accessibility-widget.js) - Simple embeddable
3. **Pro Widget** ⭐ **NEW & RECOMMENDED** - Enterprise-grade with 30+ features

## ✨ Pro Widget Features

### 30+ Accessibility Features:
- ✅ High Contrast, Dark Mode, Invert Colors
- ✅ Font Size, Letter/Word Spacing, Line Height
- ✅ Dyslexia-friendly fonts
- ✅ Link & Focus highlighting
- ✅ Large cursor
- ✅ Reading Mask, Guide, Ruler
- ✅ Keyboard navigation
- ✅ Page simplification
- ✅ Stop animations
- ✅ Text-to-Speech
- ✅ 6 Color blindness filters
- ✅ Saturation, Brightness, Hue controls
- ✅ And more!

### Modern UI:
- 📱 Tab-based interface (Vision, Content, Navigation, Color)
- 🎨 Profile presets (Default, Vision, Motor, Focus)
- 🌓 Auto dark/light theme detection
- ⚡ Smooth animations
- 📱 Mobile optimized

---

## 🎯 Method 1: Plain HTML/JavaScript (Easiest)

**Perfect for:** Static sites, WordPress, PHP apps, any HTML page

### Step 1: Include Script

Add before closing `</body>` tag:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your content -->
  
  <!-- Add this ONE line -->
  <script src="/path/to/accessibility-widget-pro.min.js" data-a11y-widget></script>
</body>
</html>
\`\`\`

### Step 2: Customize (Optional)

\`\`\`html
<script src="/accessibility-widget-pro.min.js" 
  data-a11y-widget
  data-a11y-theme="auto"
  data-a11y-position="bottom-right"
  data-a11y-profiles="true">
</script>
\`\`\`

### Step 3: Advanced Configuration

\`\`\`html
<script src="/accessibility-widget-pro.min.js"></script>
<script>
  new AccessibilityWidgetPro({
    theme: 'auto',
    position: 'bottom-right',
    profiles: true,
    autoOpen: false,
    onChange: (settings) => {
      console.log('Accessibility settings changed:', settings);
      // Send to analytics
      gtag('event', 'accessibility_change', settings);
    }
  });
</script>
\`\`\`

**✅ Done!** The widget appears on your site.

---

## ⚛️ Method 2: React

**Perfect for:** React, Next.js, Gatsby apps

### Installation

\`\`\`bash
# Copy the React component
cp react/AccessibilityWidget.jsx src/components/
\`\`\`

### Basic Usage

\`\`\`jsx
import AccessibilityWidget from './components/AccessibilityWidget';

function App() {
  return (
    <div className="App">
      <YourContent />
      
      {/* Add accessibility widget */}
      <AccessibilityWidget 
        theme="auto"
        position="bottom-right"
        profiles={true}
      />
    </div>
  );
}

export default App;
\`\`\`

### With Event Handlers

\`\`\`jsx
function App() {
  const handleChange = (settings) => {
    console.log('Settings changed:', settings);
    
    // Send to analytics
    analytics.track('accessibility_change', {
      feature: Object.keys(settings).find(k => settings[k] !== false),
      ...settings
    });
  };

  return (
    <div className="App">
      <YourContent />
      
      <AccessibilityWidget 
        theme="auto"
        position="bottom-right"
        profiles={true}
        onChange={handleChange}
        onOpen={() => console.log('Widget opened')}
        onClose={() => console.log('Widget closed')}
      />
    </div>
  );
}
\`\`\`

### Next.js Integration

\`\`\`jsx
// pages/_app.js
import AccessibilityWidget from '../components/AccessibilityWidget';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <AccessibilityWidget theme="auto" />
    </>
  );
}

export default MyApp;
\`\`\`

### Using the Hook

\`\`\`jsx
import { useAccessibilityWidget } from './components/AccessibilityWidget';

function MyComponent() {
  const { widget, open, applyProfile } = useAccessibilityWidget();

  return (
    <div>
      <button onClick={open}>
        Open Accessibility Menu
      </button>
      
      <button onClick={() => applyProfile('vision')}>
        Apply Vision Profile
      </button>
    </div>
  );
}
\`\`\`

**✅ Done!** Widget integrated in React app.

---

## 💚 Method 3: Vue.js

**Perfect for:** Vue 2/3, Nuxt apps

### Basic Usage

\`\`\`vue
<template>
  <div id="app">
    <YourContent />
    
    <!-- Add accessibility widget -->
    <AccessibilityWidget 
      theme="auto"
      position="bottom-right"
      :profiles="true"
      @change="handleChange"
    />
  </div>
</template>

<script>
export default {
  name: 'App',
  
  mounted() {
    // Load widget script
    const script = document.createElement('script');
    script.src = '/accessibility-widget-pro.min.js';
    script.async = true;
    document.body.appendChild(script);
  },
  
  methods: {
    handleChange(settings) {
      console.log('Settings changed:', settings);
    }
  }
}
</script>
\`\`\`

### Nuxt.js Integration

\`\`\`javascript
// nuxt.config.js
export default {
  head: {
    script: [
      {
        src: '/accessibility-widget-pro.min.js',
        body: true,
        defer: true
      }
    ]
  }
}
\`\`\`

\`\`\`vue
// layouts/default.vue
<template>
  <div>
    <Nuxt />
    <client-only>
      <div id="accessibility-widget"></div>
    </client-only>
  </div>
</template>

<script>
export default {
  mounted() {
    if (window.AccessibilityWidgetPro) {
      new window.AccessibilityWidgetPro({
        theme: 'auto',
        position: 'bottom-right'
      });
    }
  }
}
</script>
\`\`\`

**✅ Done!** Widget integrated in Vue app.

---

## 🅰️ Method 4: Angular

**Perfect for:** Angular apps

### app.component.ts

\`\`\`typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <router-outlet></router-outlet>
    <div id="accessibility-widget"></div>
  \`
})
export class AppComponent implements OnInit {
  
  ngOnInit() {
    this.loadAccessibilityWidget();
  }

  loadAccessibilityWidget() {
    const script = document.createElement('script');
    script.src = '/assets/accessibility-widget-pro.min.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).AccessibilityWidgetPro) {
        new (window as any).AccessibilityWidgetPro({
          theme: 'auto',
          position: 'bottom-right',
          profiles: true,
          onChange: (settings: any) => {
            console.log('Accessibility settings changed:', settings);
          }
        });
      }
    };
    document.body.appendChild(script);
  }
}
\`\`\`

### angular.json

\`\`\`json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "accessibility-widget-pro.min.js",
                "input": "node_modules/accessibility-widget-pro/dist",
                "output": "/assets"
              }
            ]
          }
        }
      }
    }
  }
}
\`\`\`

**✅ Done!** Widget integrated in Angular app.

---

## 🔥 Method 5: WordPress

**Perfect for:** WordPress sites

### Option A: Theme Integration

Add to your theme's `footer.php` before `</body>`:

\`\`\`php
<script src="<?php echo get_template_directory_uri(); ?>/js/accessibility-widget-pro.min.js" data-a11y-widget></script>
\`\`\`

### Option B: Plugin

Create `wp-content/plugins/accessibility-widget/accessibility-widget.php`:

\`\`\`php
<?php
/**
 * Plugin Name: Accessibility Widget Pro
 * Description: Add accessibility features to your site
 * Version: 1.0
 */

function accessibility_widget_enqueue_scripts() {
    wp_enqueue_script(
        'accessibility-widget',
        plugins_url('accessibility-widget-pro.min.js', __FILE__),
        array(),
        '1.0',
        true
    );
    
    // Add initialization
    wp_add_inline_script('accessibility-widget', '
        new AccessibilityWidgetPro({
            theme: "auto",
            position: "bottom-right",
            profiles: true
        });
    ');
}
add_action('wp_enqueue_scripts', 'accessibility_widget_enqueue_scripts');
?>
\`\`\`

**✅ Done!** Widget available on WordPress site.

---

## 🛠️ Configuration Options

\`\`\`javascript
new AccessibilityWidgetPro({
  // Appearance
  theme: 'auto',              // auto, light, dark
  position: 'bottom-right',   // bottom-right, bottom-left, top-right, top-left
  
  // Features
  profiles: true,             // Enable profile presets
  showIntro: true,            // Show intro on first visit
  autoOpen: false,            // Auto-open widget
  
  // Data
  saveSettings: true,         // Save user preferences
  storageKey: 'a11y-widget',  // localStorage key
  
  // Events
  onChange: (settings) => {
    console.log(settings);
  },
  onOpen: () => {
    console.log('opened');
  },
  onClose: () => {
    console.log('closed');
  },
  onProfileChange: (profile) => {
    console.log('profile:', profile);
  }
});
\`\`\`

---

## 📊 Analytics Integration

### Google Analytics

\`\`\`javascript
new AccessibilityWidgetPro({
  onChange: (settings) => {
    gtag('event', 'accessibility_change', {
      event_category: 'Accessibility',
      event_label: JSON.stringify(settings)
    });
  }
});
\`\`\`

### Segment

\`\`\`javascript
new AccessibilityWidgetPro({
  onChange: (settings) => {
    analytics.track('Accessibility Setting Changed', settings);
  },
  onProfileChange: (profile) => {
    analytics.track('Accessibility Profile Applied', {
      profile: profile
    });
  }
});
\`\`\`

---

## 🎨 Custom Styling

Override default styles:

\`\`\`css
/* Custom colors */
#a11y-widget-pro {
  --primary-color: #your-brand-color;
  --background: #ffffff;
  --text: #000000;
}

/* Custom positioning */
#a11y-widget-pro {
  bottom: 10px !important;
  right: 10px !important;
}
\`\`\`

---

## 🚀 Production Checklist

- [ ] Download `accessibility-widget-pro.min.js`
- [ ] Upload to your server/CDN
- [ ] Add script tag to your site
- [ ] Test on multiple pages
- [ ] Test on mobile devices
- [ ] Configure analytics (optional)
- [ ] Customize theme/position (optional)
- [ ] Add to accessibility statement
- [ ] Deploy to production

---

## 🆘 Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Verify script path is correct
- Ensure script loads before initialization

### Settings don't save
- Check if localStorage is available
- User may be in private browsing mode
- Verify `saveSettings: true` is set

### Conflicts with existing code
- Widget uses prefixed classes (`a11y-*`)
- Check z-index conflicts
- Try different position

---

## 📚 Next Steps

1. **Test locally** - Try on development site first
2. **Customize** - Match your brand colors
3. **Deploy** - Push to production
4. **Announce** - Tell users about the feature
5. **Monitor** - Track usage in analytics

---

## ✅ You're Ready!

Choose your integration method above and get started in minutes!

**Questions?** Check the examples folder for working demos.

**Need help?** See the full API documentation.

---

**Making the web accessible for everyone! ♿✨**
