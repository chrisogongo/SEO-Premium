/**
 * SmartRank AI SEO — Admin Entry Point
 * Mounts the React dashboard into the WordPress admin.
 */
(function() {
    'use strict';

    // Wait for DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        var root = document.getElementById('smartrank-admin-root');
        if (!root) return;

        // If the React build is available, it will self-mount.
        // Otherwise, show a helpful fallback message.
        if (!window.__SMARTRANK_REACT_LOADED__) {
            root.innerHTML = [
                '<div style="max-width:800px;margin:40px auto;padding:32px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">',
                '  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">',
                '    <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;">',
                '      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
                '    </div>',
                '    <div>',
                '      <h1 style="margin:0;font-size:20px;color:#1e293b;">SmartRank AI SEO</h1>',
                '      <p style="margin:0;font-size:13px;color:#64748b;">Dashboard requires the React admin build</p>',
                '    </div>',
                '  </div>',
                '  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">',
                '    <p style="margin:0 0 8px;font-weight:600;color:#334155;">📦 Build the admin dashboard:</p>',
                '    <code style="display:block;background:#1e293b;color:#22d3ee;padding:12px;border-radius:6px;font-size:13px;">',
                '      npm run build:admin',
                '    </code>',
                '  </div>',
                '  <p style="color:#64748b;font-size:13px;margin:0;">',
                '    The core SEO features (meta tags, schema, sitemaps, redirects) work without the React dashboard. ',
                '    Build the admin UI to access the full interactive dashboard with AI assistant, content analysis, and more.',
                '  </p>',
                '  <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">',
                '  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">',
                '    <div style="padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;">',
                '      <strong style="color:#166534;font-size:13px;">✅ Active Features</strong>',
                '      <ul style="margin:8px 0 0;padding-left:16px;font-size:12px;color:#15803d;">',
                '        <li>Meta Tags Output</li>',
                '        <li>Schema Markup (JSON-LD)</li>',
                '        <li>XML Sitemaps</li>',
                '        <li>Redirect Manager</li>',
                '        <li>REST API Endpoints</li>',
                '      </ul>',
                '    </div>',
                '    <div style="padding:12px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;">',
                '      <strong style="color:#854d0e;font-size:13px;">⚡ After Build</strong>',
                '      <ul style="margin:8px 0 0;padding-left:16px;font-size:12px;color:#92400e;">',
                '        <li>Interactive Dashboard</li>',
                '        <li>AI SEO Assistant</li>',
                '        <li>Content Analysis</li>',
                '        <li>Technical Audits</li>',
                '        <li>Keyword Research</li>',
                '      </ul>',
                '    </div>',
                '  </div>',
                '</div>'
            ].join('\n');
        }
    });

    // Live snippet preview in meta box
    document.addEventListener('input', function(e) {
        var target = e.target;
        if (!target || !target.name) return;

        var titleEl = document.getElementById('smartrank-snippet-title');
        var urlEl   = document.getElementById('smartrank-snippet-url');
        var descEl  = document.getElementById('smartrank-snippet-desc');

        if (!titleEl) return;

        if (target.name === 'smartrank_seo_title') {
            titleEl.textContent = target.value || 'Page Title';
        }
        if (target.name === 'smartrank_meta_description') {
            descEl.textContent = target.value || 'Meta description will appear here...';
        }
    });

    // Initialize preview on load
    document.addEventListener('DOMContentLoaded', function() {
        var titleInput = document.querySelector('[name="smartrank_seo_title"]');
        var descInput  = document.querySelector('[name="smartrank_meta_description"]');
        var titleEl    = document.getElementById('smartrank-snippet-title');
        var urlEl      = document.getElementById('smartrank-snippet-url');
        var descEl     = document.getElementById('smartrank-snippet-desc');

        if (titleEl && titleInput) {
            titleEl.textContent = titleInput.value || document.title;
        }
        if (urlEl) {
            urlEl.textContent = window.location.hostname + window.location.pathname;
        }
        if (descEl && descInput) {
            descEl.textContent = descInput.value || '';
        }
    });
})();
