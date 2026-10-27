# SmartRank AI SEO — WordPress Plugin

> A complete, pure PHP WordPress SEO plugin with AI-powered content optimization, schema markup, XML sitemaps, redirect management, and technical audits.

![Version](https://img.shields.io/badge/version-1.5.0-blue)
![WordPress](https://img.shields.io/badge/WordPress-5.8%2B-blue)
![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple)
![License](https://img.shields.io/badge/license-GPL--2.0%2B-green)

## 🚀 Overview

SmartRank AI SEO is an all-in-one WordPress SEO plugin that works entirely in PHP — no Node.js, no build step, no React required. Install it like any other WordPress plugin and start optimizing immediately.

## ✨ Features

### Core SEO
- 📊 **Dashboard** — SEO health score, page stats, quick actions
- 📝 **On-Page SEO Editor** — Meta boxes on all post types with live Google preview
- 🏗️ **Schema Markup** — JSON-LD for 15+ Schema.org types (auto-generated)
- 🌐 **XML Sitemaps** — Auto-generated at `/sitemap.xml` with sub-sitemaps
- 🔀 **Redirect Manager** — 301/302/307 with loop detection & hit tracking
- 🛡️ **Technical SEO Audit** — Automated scanning with severity-based prioritization
- 📍 **404 Monitor** — Track broken URLs and create redirects
- 📍 **Local SEO** — Business info management with LocalBusiness schema
- 🔑 **Keyword Research** — Organize keywords by group and intent

### AI-Powered (Optional)
- 🤖 Generate SEO titles and meta descriptions
- 🔍 Analyze content for SEO issues
- 📋 Create content briefs
- Supports OpenAI, Anthropic (Claude), and Google (Gemini)

## 📁 Plugin Structure

```
smartrank-ai-seo/
├── smartrank-ai-seo.php          ← Main plugin file
├── uninstall.php                  ← Clean uninstall handler
├── readme.txt                     ← WordPress.org readme
├── includes/
│   ├── class-activator.php        ← DB tables, activation, cron
│   ├── class-admin.php            ← Admin menus, pages, meta boxes
│   ├── class-seo-meta.php         ← Frontend meta tag output
│   ├── class-schema.php           ← JSON-LD schema generation
│   ├── class-sitemap.php          ← XML sitemap generation
│   ├── class-redirects.php        ← Redirect handling
│   ├── class-audit.php            ← Technical SEO audit engine
│   ├── class-ai-assistant.php     ← AI provider integration
│   └── class-rest-api.php         ← REST API endpoints
└── assets/
    ├── css/admin.css              ← Admin styles
    └── js/admin.js                ← Admin JavaScript (AJAX)
```

## 🔧 Installation

### Method 1: WordPress Dashboard
1. Download this repository as a ZIP file
2. Go to **Plugins → Add New → Upload Plugin**
3. Upload the ZIP file
4. Click **Activate**
5. Go to **SmartRank SEO → Settings** to configure

### Method 2: Manual Upload
1. Upload the entire folder to `/wp-content/plugins/smartrank-ai-seo/`
2. Activate through the WordPress admin

### Method 3: Git Clone (Development)
```bash
cd wp-content/plugins/
git clone https://github.com/chrisogongo/SEO-Premium.git smartrank-ai-seo
```

## 📋 Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher (PHP 8.0+ recommended)
- MySQL 5.7 or higher

## 🔌 REST API Endpoints

All endpoints are under `/wp-json/smartrank/v1/` and require `manage_options` capability:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/dashboard` | GET | Dashboard metrics |
| `/meta/{id}` | GET/POST | Read/save SEO metadata |
| `/analyze/{id}` | POST | AI content analysis |
| `/ai/meta-description/{id}` | POST | Generate meta description |
| `/ai/seo-title/{id}` | POST | Generate SEO title |
| `/audit/run` | POST | Run technical audit |
| `/audit/results` | GET | Get latest audit results |
| `/redirects` | GET/POST | List/create redirects |
| `/redirects/{id}` | DELETE | Remove redirect |
| `/keywords` | GET/POST | Manage keywords |
| `/settings` | GET/POST | Plugin settings |

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `wp_smartrank_meta` | SEO metadata per post |
| `wp_smartrank_redirects` | Redirect rules with hit tracking |
| `wp_smartrank_404_log` | 404 error monitoring |
| `wp_smartrank_audit` | Technical audit results |
| `wp_smartrank_keywords` | Keyword research data |
| `wp_smartrank_audit_log` | Change audit trail |

## 🔐 Security

- ✅ All inputs sanitized before processing
- ✅ All outputs properly escaped (XSS prevention)
- ✅ Prepared database queries (SQL injection prevention)
- ✅ Nonce verification on all forms
- ✅ Capability checks on all admin pages
- ✅ Secure REST API endpoints
- ✅ Rate limiting on AI API calls
- ✅ Audit logging for sensitive operations
- ✅ No WordPress core file modifications

## 🤝 Compatibility

- ✅ Gutenberg & Classic Editor
- ✅ WooCommerce
- ✅ All major WordPress themes
- ✅ Custom post types
- ✅ Caching plugins
- ✅ Page builders (Elementor, etc.)

## 📄 License

GPL-2.0-or-later — Same as WordPress.

## 🙏 Credits

Built by [Chris Ogongo](https://github.com/chrisogongo)

---

**SmartRank AI SEO — Intelligent SEO management for WordPress**
