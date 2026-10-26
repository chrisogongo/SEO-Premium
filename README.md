# SmartRank AI SEO - Advanced WordPress SEO Plugin

> A comprehensive, AI-powered WordPress SEO plugin that helps website owners manage their entire SEO strategy from the WordPress dashboard.

![Version](https://img.shields.io/badge/version-1.5.0-blue)
![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-blue)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple)
![License](https://img.shields.io/badge/license-GPL--2.0%2B-green)

## 🚀 Overview

SmartRank AI SEO is an all-in-one SEO management system inspired by the capabilities of premium SEO plugins like AIOSEO Pro. It combines traditional SEO tools with AI-powered content generation to help you improve your website's organic search visibility.

**⚠️ Important:** This project includes both a **WordPress plugin** (PHP) and an **interactive web dashboard** (React) that demonstrates all plugin features.

## ✨ Features

### Core SEO Features
- 📊 **Professional Dashboard** — SEO health score, traffic metrics, issue tracking
- 📝 **On-Page SEO Editor** — Real-time content analysis with Google snippet preview
- 🤖 **AI SEO Assistant** — Content generation, optimization, and intelligent recommendations
- 🔑 **Keyword Research** — Keyword management, topic clusters, cannibalization detection
- 🛡️ **Technical SEO Audit** — Automated scanning with prioritized issue resolution
- 🏗️ **Schema Markup Generator** — 15+ Schema.org types with JSON-LD validation
- 🌐 **XML Sitemap Management** — Automatic generation and updates
- 🔀 **Redirect Manager** — 301/302/307 redirects with loop detection
- 🔗 **Internal Link Assistant** — AI-powered link suggestions
- 📍 **Local SEO** — Business information and LocalBusiness schema
- 📈 **Google Search Console** — Performance monitoring and insights
- 🎯 **Rank Tracker** — Keyword position tracking
- 🛒 **WooCommerce SEO** — Product page optimization
- 🖼️ **Image SEO** — Alt text optimization and analysis

### AI-Powered Features
- Generate SEO titles and meta descriptions
- Create blog articles, content briefs, and outlines
- Product descriptions and FAQ sections
- Image alt text suggestions
- Content optimization recommendations
- Prioritized action plans with impact estimates

### Safety & Automation
- ✅ Safe, reversible automation rules
- 🔒 Approval required for publishing and significant changes
- 📋 Complete audit log with rollback capability
- 🛡️ Clear distinction between measured data, estimates, and AI suggestions
- ⚠️ No guaranteed ranking claims — only data-supported recommendations

## 📁 Project Structure

```
seo-premium/
├── src/                          # React dashboard source
│   ├── App.tsx                   # Main application
│   ├── main.tsx                  # Entry point
│   ├── index.css                 # Global styles
│   └── components/
│       └── AIAssistant/          # AI SEO Assistant module
│           ├── index.tsx         # Main component
│           └── data.ts           # Types & mock data
├── public/                       # Static assets
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 🛠️ Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **Recharts** — Data visualization
- **Lucide React** — Icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/chrisogongo/SEO-Premium.git
cd SEO-Premium

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

## 📖 Dashboard Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | SEO health overview with charts and metrics |
| **Setup Wizard** | Step-by-step plugin configuration |
| **On-Page SEO** | Content editor with real-time analysis |
| **AI Assistant** | 7-tab AI module with analysis, recommendations, automation |
| **Keyword Research** | Keyword management with topic clusters |
| **Technical Audit** | Website scanning with prioritized issues |
| **Schema Generator** | JSON-LD structured data creation |
| **XML Sitemaps** | Sitemap generation and management |
| **Redirect Manager** | URL redirect rules with monitoring |
| **Internal Links** | AI-powered link suggestions |
| **Local SEO** | Business information management |
| **Search Console** | Google Search Console integration |
| **Rank Tracker** | Keyword position tracking |
| **WooCommerce** | Product SEO optimization |
| **Image SEO** | Alt text and image optimization |
| **Settings** | Plugin configuration and integrations |
| **Documentation** | Complete user guide |

## 🔐 Security

This plugin follows WordPress security best practices:

- All inputs sanitized before processing
- All outputs properly escaped (XSS prevention)
- Prepared database queries (SQL injection prevention)
- Nonce verification on all forms
- Capability checks on admin pages
- Secure REST API endpoints
- Encrypted API key storage
- Rate limiting on AI API calls
- Audit logging for sensitive operations
- No WordPress core file modifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GPL-2.0+ License — the same as WordPress.

## 🙏 Acknowledgments

- Inspired by the capabilities of premium SEO plugins
- Built with modern web technologies
- Designed for WordPress compatibility

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ by [chrisogongo](https://github.com/chrisogongo)**

*SmartRank AI SEO — Intelligent SEO management for WordPress*
