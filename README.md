# Glim

> A powerful browser extension for analyzing website information at a glance.

<p align="center">
  <img src="public/icon/128.png" alt="Glim Logo" width="128" height="128">
</p>

<p align="center">
  <a href="README.zh-CN.md">中文</a> | English
</p>

## ✨ Features

Glim is a browser extension that provides comprehensive website analysis directly from your browser toolbar. With a single click, you can access detailed information about any website you're visiting.

### Core Features

- **🔍 Basic Information**: Title, description, keywords, charset, favicon
- **🌐 IP & Geolocation**: IP addresses with visual map display
- **📡 Server Location**: Server location mapping with ISP information
- **🔒 Security Headers**: Check HTTP security headers (HSTS, CSP, X-Frame, etc.)
- **🏷️ Social Meta Tags**: Open Graph, Twitter Cards, canonical URLs
- **📋 Response Headers**: Complete list of HTTP response headers
- **⚡ Tech Stack Detection**: Identify frontend frameworks, UI libraries, CDN, build tools, and more
- **⚡ Real-time Analysis**: Automatically fetches data when popup opens

### UI Design

- **Cyberpunk Aesthetic**: High contrast dark theme with sharp geometric design
- **Monospace Typography**: Clean data display with JetBrains Mono
- **Right-angle Design**: No rounded corners, brutalist-inspired interface
- **Interactive Animations**:
  - Scanline effects and glowing text
  - Character-by-character text scramble animations
  - Hover-triggered highlight effects
- **Responsive Layout**: Optimized for popup interface

### Tech Stack Detection

Identifies technologies used by websites through:

- **Frontend Frameworks**: React, Vue, Angular, Svelte, Next.js, Nuxt, etc.
- **UI/CSS Frameworks**: Tailwind CSS, Bootstrap, Bulma, etc.
- **JavaScript Libraries**: jQuery, Preact, Lit, Alpine.js, etc.
- **Build Tools & Runtimes**: Webpack, Vite, Babel, Node.js
- **CDN Providers**: Cloudflare, jsDelivr, unpkg, etc.
- **Backend Hints**: Server software detection via HTTP headers
- **Confidence Levels**: High/Medium/Low with visual indicators

## 🚀 Installation

### Development

```bash
# Clone the repository
git clone https://github.com/nmsn/glim.git
cd glim

# Install dependencies
pnpm install

# Start development server (Chrome)
pnpm dev

# Start development server (Firefox)
pnpm dev:firefox
```

### Build

```bash
# Build for Chrome
pnpm build

# Build for Firefox
pnpm build:firefox

# Create distribution zip
pnpm zip
```

### Type Checking

```bash
pnpm compile
```

## 🛠️ Tech Stack

- **[WXT](https://wxt.dev/)** - Next-gen web extension framework
- **React 19** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling (via `@tailwindcss/vite`)
- **react-simple-maps** - Interactive map visualization
- **react-i18next** - Internationalization support (en, zh-CN)
- **Browser APIs**:
  - `webRequest` - Capture response headers
  - `dns` - DNS resolution
  - `tabs` - Access current tab information
  - Content Scripts - Extract page metadata

## 📁 Project Structure

```
entrypoints/
├── popup/              # Popup UI (React)
│   ├── App.tsx         # Main component
│   ├── style.css       # Global styles & CSS variables
│   ├── components/     # UI components
│   │   ├── GlowCard.tsx        # Card with glow border animation
│   │   ├── KeyValueCard.tsx    # Key-value display card
│   │   ├── ServerLocationCard.tsx  # IP + map visualization
│   │   ├── PageInfoCard.tsx    # Basic page info
│   │   ├── SecurityCard.tsx    # Security headers display
│   │   ├── SocialTagsCard.tsx  # Social meta tags
│   │   ├── HeadersCard.tsx     # Response headers
│   │   ├── TechStackCard.tsx   # Tech stack detection
│   │   └── MapChart.tsx       # Map component (lazy-loaded)
│   └── locales/        # i18n translations (en, zh-CN)
├── background.ts       # Service worker
│                      # - HTTP header caching
│                      # - IP geolocation lookup
│                      # - Message passing
├── content.ts         # Content script
│                      # - Page data collection
│                      # - Social meta tag extraction
│                      # - Favicon detection
└── utils/             # Utility functions
    ├── tech-stack/     # Tech stack detection
    │   ├── rule-loader.ts      # Rule file loading
    │   ├── page-detector.ts    # Page-based detection
    │   ├── header-detector.ts  # Header-based detection
    │   ├── merge.ts            # Result merging
    │   └── types.ts            # TypeScript types
    ├── page-info.ts    # Page metadata extraction
    ├── headers.ts      # Response headers retrieval
    ├── http-security.ts    # Security headers check
    ├── social-tag.ts   # Social meta tags
    ├── server-location.ts  # IP geolocation
    └── get-ip.ts       # DNS resolution

public/
└── rules/              # Tech stack detection rules
    ├── index.json      # Rule index
    ├── page/           # Page-based detection rules
    └── headers/        # Header-based detection rules
```

## 🎨 Design System

See [UI-DESIGN-SPEC.md](./UI-DESIGN-SPEC.md) for detailed design specifications.

### Color Palette

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-bg` | `#0d0d0d` | Background |
| `--color-fg` | `#e0e0e0` | Text |
| `--color-accent` | `#ffffff` | Highlight, glow effects |
| `--color-border` | `#333333` | Borders |
| `--color-muted` | `#777777` | Secondary text |
| `--color-hover` | `#1a1a1a` | Hover background |

### Typography

- **Display**: Orbitron - Headers and titles
- **Mono**: JetBrains Mono / Share Tech Mono - Data and values

### Themes

- **Dark** (default): High contrast dark theme
- **Light**: Light theme variant (`.light-theme` class)
- **System**: Follows `prefers-color-scheme`

## 🔒 Permissions

- `dns` - DNS resolution for IP detection
- `webRequest` - Capture HTTP headers for security analysis
- `activeTab` - Access current tab information
- `host_permissions: <all_urls>` - Analyze any website

## 📄 License

[MIT](./LICENSE)

## 🙏 Acknowledgements

Inspired by [web-check](https://github.com/Lissy93/web-check) by Lissy93, an excellent all-in-one website OSINT tool.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nmsn">nmsn</a>
</p>