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

- **🔍 Basic Information**: Domain, protocol, page title, character encoding
- **🌐 DNS Resolution**: IP addresses with geolocation mapping
- **📡 Server Location**: Visual map display of server locations with ISP information
- **🔒 Security Headers**: Check HTTP security headers (HSTS, CSP, X-Frame, etc.)
- **🏷️ Social Meta Tags**: Open Graph, Twitter Cards, canonical URLs
- **📋 Response Headers**: Full list of HTTP response headers
- **⚡ Real-time Analysis**: Automatically fetches data when popup opens

### UI Design

- Cyberpunk tech aesthetic with high contrast colors
- Monospace typography for data display
- Right-angle geometric design
- Animated scanlines and status indicators
- Responsive layout optimized for popup interface

## 🚀 Installation

### Development

```bash
# Clone the repository
git clone https://github.com/nmsn/glim.git
cd glim

# Install dependencies
pnpm install

# Start development server
pnpm dev
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

## 🛠️ Tech Stack

- **[WXT](https://wxt.dev/)** - Next-gen web extension framework
- **React 19** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Browser APIs**:
  - `webRequest` - Capture response headers
  - `dns` - DNS resolution
  - `tabs` - Access current tab information
  - Content Scripts - Extract page metadata

## 📁 Project Structure

```
entrypoints/
├── popup/              # Popup UI
│   ├── App.tsx        # Main component
│   ├── style.css      # Global styles
│   └── components/    # UI components
├── background.ts      # Service worker
├── content.ts         # Content script
└── utils/             # Utility functions
    ├── page-info.ts   # Page metadata extraction
    ├── headers.ts     # Response headers
    ├── dns.ts         # DNS resolution
    ├── server-location.ts  # IP geolocation
    ├── http-security.ts    # Security headers check
    └── social-tag.ts       # Social meta tags
```

## 🎨 Design System

See [UI-DESIGN-SPEC.md](./UI-DESIGN-SPEC.md) for detailed design specifications.

### Color Palette

- **Primary**: `#f5c518` (Yellow) - Accent color
- **Secondary**: `#00d084` (Green) - Success states
- **Background**: `#0a0a0b` (Dark) - Primary background
- **Text**: `#e8e8e8` (Light) - Primary text

### Typography

- **Display**: Orbitron - Headers and titles
- **Mono**: Share Tech Mono - Data and values

## 🔒 Permissions

- `dns` - DNS resolution
- `webRequest` - Capture HTTP headers
- `activeTab` - Access current tab
- `host_permissions: <all_urls>` - Analyze any website

## 📄 License

[MIT](./LICENSE)

## 🙏 Acknowledgements

This project is inspired by [web-check](https://github.com/Lissy93/web-check) by Lissy93, an excellent all-in-one website OSINT tool.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/nmsn">nmsn</a>
</p>
