/**
 * SmartRank AI SEO — Admin JavaScript
 */
(function($) {
    'use strict';
    if (typeof smartrankData === 'undefined') return;
    var API = smartrankData.apiUrl;
    var nonce = smartrankData.nonce;

    function apiRequest(endpoint, method, data) {
        var options = { url: API + endpoint, method: method || 'GET', beforeSend: function(xhr) { xhr.setRequestHeader('X-WP-Nonce', nonce); }, contentType: 'application/json' };
        if (data) options.data = JSON.stringify(data);
        return $.ajax(options);
    }

    function showMessage(container, message, type) {
        type = type || 'success';
        var cls = type === 'error' ? 'notice-error' : 'notice-success';
        $(container).prepend('<div class="notice ' + cls + ' inline"><p>' + message + '</p></div>');
        setTimeout(function() { $(container).find('.notice').first().fadeOut(); }, 4000);
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    $(document).ready(function() {
        // Score ring
        $('.smartrank-score-ring').each(function() {
            var score = parseInt($(this).data('score')) || 0;
            var color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
            var deg = (score / 100) * 360;
            $(this).css({ 'background': 'conic-gradient(' + color + ' 0deg ' + deg + 'deg, #e2e8f0 ' + deg + 'deg 360deg)' });
        });

        // Audit
        $('#smartrank-run-audit').on('click', function() {
            var btn = $(this);
            var results = $('#smartrank-audit-results');
            btn.prop('disabled', true).html('<span class="dashicons dashicons-update spin"></span> Running audit...');
            results.html('<div class="smartrank-loading-inline"><span class="dashicons dashicons-update spin"></span> Scanning...</div>');
            apiRequest('audit/run', 'POST').done(function(response) {
                var data = response.data || response;
                var html = '<div class="smartrank-audit-summary"><h3>Audit Complete</h3><div class="smartrank-audit-stats">';
                html += '<div class="smartrank-stat"><span class="smartrank-stat-value">' + data.total + '</span><span>Total Issues</span></div>';
                if (data.by_severity) {
                    html += '<div class="smartrank-stat smartrank-stat-critical"><span class="smartrank-stat-value">' + data.by_severity.critical + '</span><span>Critical</span></div>';
                    html += '<div class="smartrank-stat smartrank-stat-high"><span class="smartrank-stat-value">' + data.by_severity.high + '</span><span>High</span></div>';
                    html += '<div class="smartrank-stat smartrank-stat-medium"><span class="smartrank-stat-value">' + data.by_severity.medium + '</span><span>Medium</span></div>';
                    html += '<div class="smartrank-stat smartrank-stat-low"><span class="smartrank-stat-value">' + data.by_severity.low + '</span><span>Low</span></div>';
                }
                html += '</div></div>';
                apiRequest('audit/results', 'GET').done(function(details) {
                    var items = details.data || details;
                    if (items && items.length > 0) {
                        html += '<table class="widefat striped"><thead><tr><th>Severity</th><th>Issue</th><th>URL</th><th>Fixable</th></tr></thead><tbody>';
                        items.forEach(function(item) {
                            html += '<tr><td><span class="smartrank-badge smartrank-badge-' + item.severity + '">' + item.severity + '</span></td>';
                            html += '<td><strong>' + escapeHtml(item.title) + '</strong><br><small>' + escapeHtml(item.description) + '</small></td>';
                            html += '<td><code>' + escapeHtml(item.url) + '</code></td>';
                            html += '<td>' + (item.fixable == 1 ? '✅ Yes' : '—') + '</td></tr>';
                        });
                        html += '</tbody></table>';
                    }
                    results.html(html);
                });
            }).fail(function(xhr) {
                results.html('<div class="notice notice-error inline"><p>Audit failed: ' + (xhr.responseJSON?.message || 'Unknown error') + '</p></div>');
            }).always(function() {
                btn.prop('disabled', false).html('<span class="dashicons dashicons-shield"></span> Run Full Audit');
            });
        });

        // Redirects
        $('#smartrank-add-redirect').on('submit', function(e) {
            e.preventDefault();
            var form = $(this);
            var data = { source: form.find('[name="source"]').val(), target: form.find('[name="target"]').val(), type: parseInt(form.find('[name="type"]').val()) };
            if (!data.source || !data.target) { alert('Please fill in both source and target URLs.'); return; }
            apiRequest('redirects', 'POST', data).done(function() {
                showMessage(form, 'Redirect added!', 'success');
                setTimeout(function() { location.reload(); }, 1000);
            }).fail(function(xhr) {
                showMessage(form, xhr.responseJSON?.message || 'Failed', 'error');
            });
        });

        $(document).on('click', '.smartrank-delete-redirect', function() {
            if (!confirm('Delete this redirect?')) return;
            var id = $(this).data('id');
            var row = $(this).closest('tr');
            apiRequest('redirects/' + id, 'DELETE').done(function() {
                row.fadeOut(300, function() { $(this).remove(); });
            });
        });

        // AI Assistant
        var output = $('#smartrank-ai-output');
        function runAI(endpoint) {
            var postId = $('#smartrank-ai-post').val();
            if (!postId) { output.html('<div class="notice notice-warning inline"><p>Please select a post.</p></div>'); return; }
            output.html('<div class="smartrank-loading-inline"><span class="dashicons dashicons-update spin"></span> AI is generating...</div>');
            apiRequest(endpoint.replace('{id}', postId), 'POST').done(function(response) {
                var content = (response.data || response).content || JSON.stringify(response.data || response, null, 2);
                output.html('<div class="smartrank-ai-result"><h4>🤖 AI Output</h4><pre>' + escapeHtml(content) + '</pre></div>');
            }).fail(function(xhr) {
                output.html('<div class="notice notice-error inline"><p>' + escapeHtml(xhr.responseJSON?.message || 'AI request failed') + '</p></div>');
            });
        }
        $('#smartrank-ai-meta').on('click', function() { runAI('ai/meta-description/{id}'); });
        $('#smartrank-ai-title').on('click', function() { runAI('ai/seo-title/{id}'); });
        $('#smartrank-ai-analyze').on('click', function() { runAI('analyze/{id}'); });

        // Keywords
        $('#smartrank-add-keyword').on('submit', function(e) {
            e.preventDefault();
            var form = $(this);
            var data = { keyword: form.find('[name="keyword"]').val(), intent: form.find('[name="intent"]').val(), group_name: form.find('[name="group_name"]').val() };
            if (!data.keyword) { alert('Please enter a keyword.'); return; }
            apiRequest('keywords', 'POST', data).done(function() {
                showMessage(form, 'Keyword added!', 'success');
                setTimeout(function() { location.reload(); }, 1000);
            }).fail(function(xhr) {
                showMessage(form, 'Failed: ' + (xhr.responseJSON?.message || 'Unknown error'), 'error');
            });
        });

        // Meta box live preview
        $('[name="smartrank_seo_title"]').on('input', function() {
            $('#smartrank-snippet-title').text($(this).val() || document.title);
        });
        $('[name="smartrank_meta_description"]').on('input', function() {
            $('#smartrank-snippet-desc').text($(this).val() || 'Meta description will appear here...');
        });

        // AI generate in meta box
        $('.smartrank-ai-generate').on('click', function() {
            var action = $(this).data('action');
            var postId = $('#smartrank-meta-box').data('post-id') || $('#post_ID').val();
            var btn = $(this);
            var originalText = btn.text();
            if (!smartrankData.aiEnabled) { alert('AI features disabled. Enable in SmartRank SEO → Settings.'); return; }
            btn.prop('disabled', true).text('🤖 Generating...');
            var endpoint = action === 'meta-description' ? 'ai/meta-description/' + postId : 'ai/seo-title/' + postId;
            apiRequest(endpoint, 'POST').done(function(response) {
                var content = (response.data || response).content || '';
                if (action === 'meta-description') $('[name="smartrank_meta_description"]').val(content).trigger('input');
                else $('[name="smartrank_seo_title"]').val(content).trigger('input');
                btn.text('✅ Applied!');
                setTimeout(function() { btn.prop('disabled', false).text(originalText); }, 2000);
            }).fail(function(xhr) {
                alert('AI Error: ' + (xhr.responseJSON?.message || 'Generation failed'));
                btn.prop('disabled', false).text(originalText);
            });
        });
    });
})(jQuery);
