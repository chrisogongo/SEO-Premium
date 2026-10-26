=== SmartRank AI SEO ===
Contributors: chrisogongo
Tags: seo, ai, schema, sitemap, meta, optimization, woocommerce, local-seo, redirect, audit
Requires at least: 5.8
Tested up to: 6.5
Requires PHP: 7.4
Stable tag: 1.5.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Advanced AI-powered WordPress SEO plugin with content analysis, schema markup, XML sitemaps, redirect management, technical audits, and AI-assisted optimization.

== Description ==

SmartRank AI SEO is a comprehensive SEO management system that helps website owners optimize their entire SEO strategy from the WordPress dashboard.

= Core Features =

* **Professional Dashboard** — SEO health score, traffic metrics, issue tracking, and prioritized recommendations
* **On-Page SEO Editor** — Real-time content analysis with Google snippet preview for every post, page, and product
* **AI SEO Assistant** — Generate meta descriptions, SEO titles, content briefs, and analyze content with AI
* **Schema Markup Generator** — 15+ Schema.org types with JSON-LD output and validation
* **XML Sitemap Management** — Automatic generation for posts, pages, products, categories, and images
* **Redirect Manager** — 301/302/307 redirects with loop detection, chain detection, and CSV import
* **Technical SEO Audit** — Automated scanning with prioritized issue resolution
* **Internal Link Assistant** — AI-powered link suggestions and orphan page detection
* **Local SEO** — Business information management with LocalBusiness schema
* **Google Search Console** — Performance monitoring and insights (requires OAuth)
* **Keyword Research** — Keyword management, topic clusters, and cannibalization detection
* **WooCommerce SEO** — Product page optimization with Product schema
* **Image SEO** — Alt text optimization with AI suggestions
* **404 Monitor** — Track and fix broken URLs

= AI-Powered Features =

* Generate SEO titles and meta descriptions
* Create blog articles, content briefs, and outlines
* Product descriptions and FAQ sections
* Image alt text suggestions
* Content optimization recommendations
* Prioritized action plans with impact estimates
* Support for OpenAI, Anthropic, and Google AI providers

= Safety & Automation =

* Safe, reversible automation rules
* Approval required for publishing and significant changes
* Complete audit log with rollback capability
* Clear distinction between measured data, estimates, and AI suggestions
* No guaranteed ranking claims — only data-supported recommendations

= Security =

* All inputs sanitized, all outputs escaped
* Prepared database queries (SQL injection prevention)
* Nonce verification on all forms
* Capability checks on all admin pages
* Secure REST API endpoints
* Encrypted API key storage
* Rate limiting on AI API calls
* Audit logging for sensitive operations
* No WordPress core file modifications

= Compatibility =

* Gutenberg & Classic Editor
* Elementor & other page builders
* WooCommerce
* All major WordPress themes
* Custom post types
* Multilingual plugins
* Caching plugins

== Installation ==

1. Upload the `smartrank-ai-seo` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to SmartRank SEO → Setup Wizard to configure
4. (Optional) Add your AI API key in Settings → AI Configuration

== Frequently Asked Questions ==

= Do I need an AI API key? =

No. All core SEO features work without AI. The AI assistant is an optional enhancement that requires a configured API key from OpenAI, Anthropic, or Google.

= Is this compatible with other SEO plugins? =

SmartRank detects other SEO plugins (Yoast, Rank Math, AIOSEO) and provides a compatibility mode. We recommend disabling competing plugins to avoid duplicate metadata output.

= Does this guarantee Google rankings? =

No. No tool can guarantee rankings. SmartRank provides data-supported recommendations and helps you implement SEO best practices. Results depend on many factors including content quality, competition, and algorithm changes.

= What schema types are supported? =

Organization, LocalBusiness, ProfessionalService, WebSite, WebPage, Article, BlogPosting, Product, Service, BreadcrumbList, Person, Event, VideoObject, FAQPage, and more.

= How do XML sitemaps work? =

Sitemaps are automatically generated at `/sitemap.xml` with sub-sitemaps for posts, pages, categories, products, and images. They update automatically when content changes.

== Screenshots ==

1. Professional SEO Dashboard with health score and metrics
2. On-Page SEO Editor with live Google preview
3. AI SEO Assistant with content generation
4. Technical SEO Audit with prioritized issues
5. Schema Markup Generator with JSON-LD validation
6. Redirect Manager with loop detection
7. Keyword Research with topic clusters
8. Internal Link Assistant

== Changelog ==

= 1.5.0 =
* Added AI content brief generator
* Improved schema validation
* New internal link algorithm
* Performance optimizations
* WooCommerce SEO module improvements

= 1.4.0 =
* WooCommerce SEO module
* Local SEO improvements
* Bug fixes and security patches

= 1.3.0 =
* Google Search Console integration
* Rank tracker module
* Image SEO tools

= 1.2.0 =
* AI assistant with multiple providers
* Keyword research module
* Technical audit engine

= 1.0.0 =
* Initial release
* On-page SEO editor
* Schema generator
* XML sitemaps
* Redirect manager

== Upgrade Notice ==

= 1.5.0 =
Major update with AI content briefs, improved schema validation, and performance optimizations.
