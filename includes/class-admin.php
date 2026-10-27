<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Admin {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'register_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'add_meta_boxes', array( $this, 'add_meta_boxes' ) );
        add_action( 'save_post', array( $this, 'save_post_meta' ), 10, 2 );
    }

    public function register_menus() {
        add_menu_page( 'SmartRank AI SEO', 'SmartRank SEO', 'manage_options', 'smartrank-seo', array( $this, 'render_page' ), 'dashicons-chart-line', 76 );
        foreach ( array(
            'smartrank-settings' => 'Settings', 'smartrank-ai-assistant' => 'AI Assistant',
            'smartrank-keywords' => 'Keywords', 'smartrank-audit' => 'SEO Audit',
            'smartrank-schema' => 'Schema', 'smartrank-sitemap' => 'Sitemaps',
            'smartrank-redirects' => 'Redirects', 'smartrank-404' => '404 Monitor',
            'smartrank-local-seo' => 'Local SEO', 'smartrank-documentation' => 'Documentation',
        ) as $slug => $title ) {
            add_submenu_page( 'smartrank-seo', $title, $title, 'manage_options', $slug, array( $this, 'render_page' ) );
        }
    }

    public function enqueue_assets( $hook ) {
        if ( strpos( $hook, 'smartrank' ) === false ) return;
        wp_enqueue_style( 'smartrank-admin', SMARTRANK_PLUGIN_URL . 'assets/css/admin.css', array(), SMARTRANK_VERSION );
        wp_enqueue_script( 'smartrank-admin', SMARTRANK_PLUGIN_URL . 'assets/js/admin.js', array( 'jquery' ), SMARTRANK_VERSION, true );
        wp_localize_script( 'smartrank-admin', 'smartrankData', array(
            'apiUrl' => rest_url( 'smartrank/v1/' ), 'nonce' => wp_create_nonce( 'wp_rest' ),
            'page' => isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'smartrank-seo',
            'aiEnabled' => smartrank_get_option( 'ai_enabled', false ),
        ));
    }

    public function register_settings() {
        register_setting( 'smartrank_settings_group', 'smartrank_settings', array( 'type' => 'array', 'sanitize_callback' => array( $this, 'sanitize_settings' ) ) );
    }

    public function sanitize_settings( $input ) {
        $sanitized = array();
        foreach ( array( 'site_type' => 'sanitize_text_field', 'title_separator' => 'sanitize_text_field', 'enable_sitemap' => 'rest_sanitize_boolean', 'enable_schema' => 'rest_sanitize_boolean', 'enable_redirects' => 'rest_sanitize_boolean', 'enable_404_monitor' => 'rest_sanitize_boolean', 'ai_enabled' => 'rest_sanitize_boolean', 'ai_provider' => 'sanitize_text_field', 'ai_model' => 'sanitize_text_field', 'ai_api_key' => 'sanitize_text_field', 'ai_monthly_limit' => 'absint' ) as $key => $cb ) {
            if ( isset( $input[ $key ] ) ) $sanitized[ $key ] = call_user_func( $cb, $input[ $key ] );
        }
        return $sanitized;
    }

    public function add_meta_boxes() {
        foreach ( get_post_types( array( 'public' => true ) ) as $pt ) {
            add_meta_box( 'smartrank-seo-meta', 'SmartRank SEO', array( $this, 'render_meta_box' ), $pt, 'normal', 'high' );
        }
    }

    public function render_meta_box( $post ) {
        wp_nonce_field( 'smartrank_meta_box', 'smartrank_meta_nonce' );
        $meta = $this->get_post_meta( $post->ID );
        ?>
        <div class="smartrank-meta-grid">
            <div class="smartrank-field"><label>Focus Keyphrase</label><input type="text" name="smartrank_focus_keyphrase" value="<?php echo esc_attr( $meta['focus_keyphrase'] ); ?>" class="widefat" /></div>
            <div class="smartrank-field"><label>SEO Title</label><input type="text" name="smartrank_seo_title" value="<?php echo esc_attr( $meta['seo_title'] ); ?>" class="widefat" maxlength="60" /></div>
            <div class="smartrank-field"><label>Meta Description</label><textarea name="smartrank_meta_description" class="widefat" rows="3" maxlength="160"><?php echo esc_textarea( $meta['meta_description'] ); ?></textarea></div>
            <div class="smartrank-field"><label>Canonical URL</label><input type="url" name="smartrank_canonical" value="<?php echo esc_url( $meta['canonical'] ); ?>" class="widefat" /></div>
            <div class="smartrank-field"><label>Robots Meta</label><select name="smartrank_robots" class="widefat"><?php foreach ( array( 'index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow' ) as $v ) : ?><option value="<?php echo esc_attr( $v ); ?>" <?php selected( $meta['robots'], $v ); ?>><?php echo esc_html( $v ); ?></option><?php endforeach; ?></select></div>
            <div class="smartrank-field"><label>Schema Type</label><select name="smartrank_schema_type" class="widefat"><option value="">Auto-detect</option><?php foreach ( array( 'Article', 'BlogPosting', 'WebPage', 'Product', 'FAQPage', 'LocalBusiness', 'Organization' ) as $t ) : ?><option value="<?php echo esc_attr( $t ); ?>" <?php selected( $meta['schema_type'], $t ); ?>><?php echo esc_html( $t ); ?></option><?php endforeach; ?></select></div>
        </div>
        <div class="smartrank-snippet-preview"><h4>Google Preview</h4><div class="smartrank-snippet"><p class="smartrank-snippet-title" id="smartrank-snippet-title"><?php echo esc_html( $meta['seo_title'] ?: $post->post_title ); ?></p><p class="smartrank-snippet-url"><?php echo esc_html( get_permalink( $post ) ); ?></p><p class="smartrank-snippet-desc" id="smartrank-snippet-desc"><?php echo esc_html( $meta['meta_description'] ); ?></p></div></div>
        <div class="smartrank-ai-actions"><button type="button" class="button smartrank-ai-generate" data-action="meta-description">🤖 Generate Meta</button><button type="button" class="button smartrank-ai-generate" data-action="seo-title">🤖 Generate Title</button></div>
        <?php
    }

    public function save_post_meta( $post_id, $post ) {
        if ( ! isset( $_POST['smartrank_meta_nonce'] ) || ! wp_verify_nonce( $_POST['smartrank_meta_nonce'], 'smartrank_meta_box' ) ) return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;
        global $wpdb;
        foreach ( array( 'focus_keyphrase', 'seo_title', 'meta_description', 'canonical', 'robots', 'schema_type' ) as $f ) {
            $v = isset( $_POST[ 'smartrank_' . $f ] ) ? sanitize_text_field( wp_unslash( $_POST[ 'smartrank_' . $f ] ) ) : '';
            $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}smartrank_meta WHERE post_id = %d AND meta_key = %s", $post_id, $f ) );
            if ( $existing ) $wpdb->update( "{$wpdb->prefix}smartrank_meta", array( 'meta_value' => $v ), array( 'post_id' => $post_id, 'meta_key' => $f ) );
            else $wpdb->insert( "{$wpdb->prefix}smartrank_meta", array( 'post_id' => $post_id, 'meta_key' => $f, 'meta_value' => $v ) );
        }
    }

    private function get_post_meta( $post_id ) {
        global $wpdb;
        $defaults = array( 'focus_keyphrase' => '', 'seo_title' => '', 'meta_description' => '', 'canonical' => '', 'robots' => 'index, follow', 'schema_type' => '' );
        $rows = $wpdb->get_results( $wpdb->prepare( "SELECT meta_key, meta_value FROM {$wpdb->prefix}smartrank_meta WHERE post_id = %d", $post_id ) );
        foreach ( $rows as $r ) if ( array_key_exists( $r->meta_key, $defaults ) ) $defaults[ $r->meta_key ] = $r->meta_value;
        return $defaults;
    }

    public function render_page() {
        $page = isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'smartrank-seo';
        ?>
        <div class="wrap smartrank-wrap">
            <div class="smartrank-header"><div class="smartrank-logo"><span class="dashicons dashicons-chart-line"></span><div><h1>SmartRank AI SEO</h1><span class="smartrank-version">v<?php echo esc_html( SMARTRANK_VERSION ); ?></span></div></div></div>
            <div class="smartrank-layout">
                <nav class="smartrank-nav"><?php $this->render_nav( $page ); ?></nav>
                <main class="smartrank-content"><?php $this->render_content( $page ); ?></main>
            </div>
        </div>
        <?php
    }

    private function render_nav( $current ) {
        foreach ( array( 'smartrank-seo' => array( 'dashboard', 'Dashboard' ), 'smartrank-settings' => array( 'admin-generic', 'Settings' ), 'smartrank-ai-assistant' => array( 'format-chat', 'AI Assistant' ), 'smartrank-keywords' => array( 'search', 'Keywords' ), 'smartrank-audit' => array( 'shield', 'SEO Audit' ), 'smartrank-schema' => array( 'editor-code', 'Schema' ), 'smartrank-sitemap' => array( 'admin-site', 'Sitemaps' ), 'smartrank-redirects' => array( 'randomize', 'Redirects' ), 'smartrank-404' => array( 'warning', '404 Monitor' ), 'smartrank-local-seo' => array( 'location', 'Local SEO' ), 'smartrank-documentation' => array( 'book', 'Docs' ) ) as $slug => $info ) {
            printf( '<a href="%s"%s><span class="dashicons dashicons-%s"></span> %s</a>', admin_url( 'admin.php?page=' . $slug ), $slug === $current ? ' class="active"' : '', $info[0], $info[1] );
        }
    }

    private function render_content( $page ) {
        switch ( $page ) {
            case 'smartrank-seo': $this->page_dashboard(); break;
            case 'smartrank-settings': $this->page_settings(); break;
            case 'smartrank-audit': $this->page_audit(); break;
            case 'smartrank-redirects': $this->page_redirects(); break;
            case 'smartrank-schema': $this->page_schema(); break;
            case 'smartrank-sitemap': $this->page_sitemap(); break;
            case 'smartrank-ai-assistant': $this->page_ai(); break;
            case 'smartrank-keywords': $this->page_keywords(); break;
            case 'smartrank-404': $this->page_404(); break;
            case 'smartrank-local-seo': $this->page_local(); break;
            case 'smartrank-documentation': $this->page_docs(); break;
            default: echo '<h2>Module Coming Soon</h2><p>This module is available in the Pro version.</p>';
        }
    }

    private function page_dashboard() {
        global $wpdb;
        $published = wp_count_posts( 'post' )->publish + wp_count_posts( 'page' )->publish;
        $missing   = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} p LEFT JOIN {$wpdb->prefix}smartrank_meta m ON p.ID = m.post_id AND m.meta_key = 'meta_description' WHERE p.post_status = 'publish' AND p.post_type IN ('post','page') AND (m.meta_value IS NULL OR m.meta_value = '')" );
        $redirects = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_redirects WHERE status = 'active'" );
        $errors404 = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_404_log" );
        $health    = max( 0, round( 100 - ( $published > 0 ? ( $missing / $published ) * 50 : 0 ) ) );
        ?>
        <h2>SEO Dashboard</h2>
        <div class="smartrank-cards">
            <div class="smartrank-card smartrank-card-score"><div class="smartrank-score-ring" data-score="<?php echo esc_attr( $health ); ?>"><span><?php echo esc_html( $health ); ?></span></div><h3>SEO Health</h3></div>
            <div class="smartrank-card"><div class="smartrank-card-value"><?php echo esc_html( $published ); ?></div><div class="smartrank-card-label">Pages Published</div></div>
            <div class="smartrank-card"><div class="smartrank-card-value smartrank-warning"><?php echo esc_html( $missing ); ?></div><div class="smartrank-card-label">Missing Meta Descriptions</div></div>
            <div class="smartrank-card"><div class="smartrank-card-value"><?php echo esc_html( $redirects ); ?></div><div class="smartrank-card-label">Active Redirects</div></div>
            <div class="smartrank-card"><div class="smartrank-card-value <?php echo $errors404 > 0 ? 'smartrank-warning' : ''; ?>"><?php echo esc_html( $errors404 ); ?></div><div class="smartrank-card-label">404 Errors</div></div>
        </div>
        <div class="smartrank-section"><h3>Quick Actions</h3><div class="smartrank-actions">
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-audit' ) ); ?>" class="button button-primary"><span class="dashicons dashicons-shield"></span> Run Audit</a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-sitemap' ) ); ?>" class="button"><span class="dashicons dashicons-admin-site"></span> View Sitemaps</a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-redirects' ) ); ?>" class="button"><span class="dashicons dashicons-randomize"></span> Manage Redirects</a>
            <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-settings' ) ); ?>" class="button"><span class="dashicons dashicons-admin-generic"></span> Settings</a>
        </div></div>
        <div class="smartrank-section"><h3>Module Status</h3><table class="widefat striped"><tbody>
            <tr><td><strong>XML Sitemaps</strong></td><td><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap.xml' ) ); ?></a></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>Schema Markup</strong></td><td>JSON-LD output on all pages</td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>Redirect Manager</strong></td><td><?php echo intval( $redirects ); ?> active redirects</td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>404 Monitor</strong></td><td><?php echo intval( $errors404 ); ?> errors logged</td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>AI Assistant</strong></td><td><?php echo smartrank_get_option( 'ai_enabled' ) ? 'Enabled' : 'Disabled — configure in Settings'; ?></td><td><span class="smartrank-status <?php echo smartrank_get_option( 'ai_enabled' ) ? 'smartrank-status-active' : 'smartrank-status-inactive'; ?>"><?php echo smartrank_get_option( 'ai_enabled' ) ? 'Active' : 'Inactive'; ?></span></td></tr>
        </tbody></table></div>
        <?php
    }

    private function page_settings() {
        $s = get_option( 'smartrank_settings', array() );
        ?>
        <h2>General Settings</h2>
        <form method="post" action="options.php"><?php settings_fields( 'smartrank_settings_group' ); ?>
        <table class="form-table">
            <tr><th>Website Type</th><td><select name="smartrank_settings[site_type]"><?php foreach ( array( 'blog' => 'Blog', 'ecommerce' => 'E-commerce', 'business' => 'Business', 'portfolio' => 'Portfolio' ) as $v => $l ) : ?><option value="<?php echo esc_attr( $v ); ?>" <?php selected( $s['site_type'] ?? 'blog', $v ); ?>><?php echo esc_html( $l ); ?></option><?php endforeach; ?></select></td></tr>
            <tr><th>Title Separator</th><td><select name="smartrank_settings[title_separator]"><?php foreach ( array( '-' => 'Dash (-)', '|' => 'Pipe (|)', '»' => 'Guillemet (»)' ) as $v => $l ) : ?><option value="<?php echo esc_attr( $v ); ?>" <?php selected( $s['title_separator'] ?? '-', $v ); ?>><?php echo esc_html( $l ); ?></option><?php endforeach; ?></select></td></tr>
            <tr><th>Features</th><td><label><input type="checkbox" name="smartrank_settings[enable_sitemap]" value="1" <?php checked( $s['enable_sitemap'] ?? true ); ?>> Enable XML Sitemaps</label><br><label><input type="checkbox" name="smartrank_settings[enable_schema]" value="1" <?php checked( $s['enable_schema'] ?? true ); ?>> Enable Schema Markup</label><br><label><input type="checkbox" name="smartrank_settings[enable_redirects]" value="1" <?php checked( $s['enable_redirects'] ?? true ); ?>> Enable Redirect Manager</label><br><label><input type="checkbox" name="smartrank_settings[enable_404_monitor]" value="1" <?php checked( $s['enable_404_monitor'] ?? true ); ?>> Enable 404 Monitor</label></td></tr>
            <tr><th colspan="2"><h3>AI Configuration</h3></th></tr>
            <tr><th>Enable AI</th><td><label><input type="checkbox" name="smartrank_settings[ai_enabled]" value="1" <?php checked( $s['ai_enabled'] ?? false ); ?>> Enable AI SEO Assistant</label></td></tr>
            <tr><th>AI Provider</th><td><select name="smartrank_settings[ai_provider]"><?php foreach ( array( 'openai' => 'OpenAI (GPT-4)', 'anthropic' => 'Anthropic (Claude)', 'google' => 'Google (Gemini)' ) as $v => $l ) : ?><option value="<?php echo esc_attr( $v ); ?>" <?php selected( $s['ai_provider'] ?? 'openai', $v ); ?>><?php echo esc_html( $l ); ?></option><?php endforeach; ?></select></td></tr>
            <tr><th>API Key</th><td><input type="password" name="smartrank_settings[ai_api_key]" value="<?php echo esc_attr( $s['ai_api_key'] ?? '' ); ?>" class="regular-text"></td></tr>
            <tr><th>Monthly Limit</th><td><input type="number" name="smartrank_settings[ai_monthly_limit]" value="<?php echo esc_attr( $s['ai_monthly_limit'] ?? 50 ); ?>" class="small-text"> requests/month</td></tr>
        </table><?php submit_button(); ?></form>
        <?php
    }

    private function page_audit() { ?>
        <h2>Technical SEO Audit</h2><p>Scan your website for technical SEO issues.</p>
        <div class="smartrank-section"><button type="button" class="button button-primary button-hero" id="smartrank-run-audit"><span class="dashicons dashicons-shield"></span> Run Full Audit</button><div id="smartrank-audit-results"></div></div>
    <?php }

    private function page_redirects() {
        global $wpdb;
        $redirects = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_redirects ORDER BY created_at DESC LIMIT 100" );
        ?>
        <h2>Redirect Manager</h2>
        <div class="smartrank-section"><h3>Add New Redirect</h3><form id="smartrank-add-redirect" class="smartrank-form"><div class="smartrank-form-row"><input type="text" name="source" placeholder="/old-url" class="regular-text" required><span>→</span><input type="text" name="target" placeholder="/new-url" class="regular-text" required><select name="type"><option value="301">301 (Permanent)</option><option value="302">302 (Temporary)</option><option value="307">307 (Temporary)</option></select><button type="submit" class="button button-primary">Add Redirect</button></div></form></div>
        <div class="smartrank-section"><h3>Active Redirects (<?php echo count( $redirects ); ?>)</h3><table class="widefat striped"><thead><tr><th>Source</th><th>Target</th><th>Type</th><th>Hits</th><th>Actions</th></tr></thead><tbody><?php if ( empty( $redirects ) ) : ?><tr><td colspan="5">No redirects configured.</td></tr><?php else : foreach ( $redirects as $r ) : ?><tr data-id="<?php echo esc_attr( $r->id ); ?>"><td><code><?php echo esc_html( $r->source ); ?></code></td><td><code><?php echo esc_html( $r->target ); ?></code></td><td><span class="smartrank-badge"><?php echo esc_html( $r->type ); ?></span></td><td><?php echo esc_html( $r->hits ); ?></td><td><button class="button button-small smartrank-delete-redirect" data-id="<?php echo esc_attr( $r->id ); ?>">Delete</button></td></tr><?php endforeach; endif; ?></tbody></table></div>
    <?php }

    private function page_schema() { ?>
        <h2>Schema Markup Generator</h2><p>Schema markup is automatically generated. Configure per-page schema in the post editor.</p>
        <div class="smartrank-section"><h3>Active Schema Types</h3><table class="widefat striped"><tbody><?php foreach ( array( 'Organization' => 'Sitewide', 'WebSite' => 'Sitelinks search', 'BreadcrumbList' => 'Auto-generated', 'BlogPosting' => 'Blog posts', 'Article' => 'Articles', 'Product' => 'WooCommerce', 'FAQPage' => 'Q&A content', 'WebPage' => 'Pages' ) as $t => $d ) : ?><tr><td><strong><?php echo esc_html( $t ); ?></strong></td><td><?php echo esc_html( $d ); ?></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr><?php endforeach; ?></tbody></table></div>
    <?php }

    private function page_sitemap() { ?>
        <h2>XML Sitemaps</h2><p>Sitemaps are automatically generated and submitted to search engines.</p>
        <div class="smartrank-section"><table class="widefat striped"><tbody>
            <tr><td><strong>Sitemap Index</strong></td><td><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap.xml' ) ); ?></a></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>Posts</strong></td><td><a href="<?php echo esc_url( home_url( '/sitemap-posts.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-posts.xml' ) ); ?></a></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>Pages</strong></td><td><a href="<?php echo esc_url( home_url( '/sitemap-pages.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-pages.xml' ) ); ?></a></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <tr><td><strong>Categories</strong></td><td><a href="<?php echo esc_url( home_url( '/sitemap-categories.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-categories.xml' ) ); ?></a></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr>
            <?php if ( post_type_exists( 'product' ) ) : ?><tr><td><strong>Products</strong></td><td><a href="<?php echo esc_url( home_url( '/sitemap-products.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-products.xml' ) ); ?></a></td><td><span class="smartrank-status smartrank-status-active">Active</span></td></tr><?php endif; ?>
        </tbody></table></div>
    <?php }

    private function page_ai() {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) { echo '<h2>AI SEO Assistant</h2><div class="notice notice-warning inline"><p>AI features disabled. <a href="' . esc_url( admin_url( 'admin.php?page=smartrank-settings' ) ) . '">Enable in Settings →</a></p></div>'; return; }
        ?>
        <h2>AI SEO Assistant</h2>
        <div class="smartrank-section"><h3>AI Content Generator</h3><form id="smartrank-ai-form"><p><label>Select Post:</label><select id="smartrank-ai-post" class="regular-text"><option value="">— Select —</option><?php foreach ( get_posts( array( 'post_type' => array( 'post', 'page' ), 'posts_per_page' => 50, 'post_status' => 'publish' ) ) as $p ) : ?><option value="<?php echo esc_attr( $p->ID ); ?>"><?php echo esc_html( $p->post_title ); ?></option><?php endforeach; ?></select></p><p><button type="button" class="button" id="smartrank-ai-meta">🤖 Generate Meta</button> <button type="button" class="button" id="smartrank-ai-title">🤖 Generate Title</button> <button type="button" class="button" id="smartrank-ai-analyze">🔍 Analyze</button></p><div id="smartrank-ai-output"></div></form></div>
    <?php }

    private function page_keywords() {
        global $wpdb;
        $keywords = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_keywords ORDER BY created_at DESC LIMIT 100" );
        ?>
        <h2>Keyword Research</h2>
        <div class="smartrank-section"><h3>Add Keyword</h3><form id="smartrank-add-keyword" class="smartrank-form"><div class="smartrank-form-row"><input type="text" name="keyword" placeholder="Target keyword" class="regular-text" required><select name="intent"><option value="informational">Informational</option><option value="commercial">Commercial</option><option value="transactional">Transactional</option></select><input type="text" name="group_name" placeholder="Group" class="regular-text"><button type="submit" class="button button-primary">Add</button></div></form></div>
        <div class="smartrank-section"><h3>Your Keywords (<?php echo count( $keywords ); ?>)</h3><table class="widefat striped"><thead><tr><th>Keyword</th><th>Intent</th><th>Group</th></tr></thead><tbody><?php if ( empty( $keywords ) ) : ?><tr><td colspan="3">No keywords added.</td></tr><?php else : foreach ( $keywords as $kw ) : ?><tr><td><strong><?php echo esc_html( $kw->keyword ); ?></strong></td><td><span class="smartrank-badge"><?php echo esc_html( $kw->intent ); ?></span></td><td><?php echo esc_html( $kw->group_name ); ?></td></tr><?php endforeach; endif; ?></tbody></table></div>
    <?php }

    private function page_404() {
        global $wpdb;
        $errors = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_404_log ORDER BY hits DESC LIMIT 100" );
        ?>
        <h2>404 Monitor</h2><p>Track URLs returning 404 errors.</p>
        <div class="smartrank-section"><table class="widefat striped"><thead><tr><th>URL</th><th>Hits</th><th>Last Hit</th><th>Actions</th></tr></thead><tbody><?php if ( empty( $errors ) ) : ?><tr><td colspan="4">No 404 errors logged.</td></tr><?php else : foreach ( $errors as $e ) : ?><tr><td><code><?php echo esc_html( $e->url ); ?></code></td><td><strong><?php echo esc_html( $e->hits ); ?></strong></td><td><?php echo esc_html( $e->last_hit ); ?></td><td><a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-redirects&source=' . urlencode( $e->url ) ) ); ?>" class="button button-small">Create Redirect</a></td></tr><?php endforeach; endif; ?></tbody></table></div>
    <?php }

    private function page_local() {
        $local = smartrank_get_option( 'local_settings', array() );
        ?>
        <h2>Local SEO</h2>
        <form method="post" action="options.php"><?php settings_fields( 'smartrank_settings_group' ); ?>
        <table class="form-table">
            <tr><th>Business Name</th><td><input type="text" name="smartrank_settings[local_name]" value="<?php echo esc_attr( $local['name'] ?? get_bloginfo( 'name' ) ); ?>" class="regular-text"></td></tr>
            <tr><th>Address</th><td><input type="text" name="smartrank_settings[local_address]" value="<?php echo esc_attr( $local['address'] ?? '' ); ?>" class="regular-text"></td></tr>
            <tr><th>Phone</th><td><input type="text" name="smartrank_settings[local_phone]" value="<?php echo esc_attr( $local['phone'] ?? '' ); ?>" class="regular-text"></td></tr>
            <tr><th>Email</th><td><input type="email" name="smartrank_settings[local_email]" value="<?php echo esc_attr( $local['email'] ?? '' ); ?>" class="regular-text"></td></tr>
        </table><?php submit_button(); ?></form>
    <?php }

    private function page_docs() { ?>
        <h2>Documentation</h2>
        <div class="smartrank-section"><h3>Getting Started</h3><ol><li>Run the Setup Wizard to configure basic settings</li><li>Add SEO metadata to your pages via the meta box</li><li>Run a Technical SEO Audit to find issues</li><li>Configure AI features (optional) for content generation</li></ol>
        <h3>Features</h3><ul><li><strong>Meta Tags:</strong> Automatically outputs title, description, OG, and Twitter tags</li><li><strong>Schema:</strong> JSON-LD structured data for 15+ schema types</li><li><strong>Sitemaps:</strong> Auto-generated XML sitemaps at /sitemap.xml</li><li><strong>Redirects:</strong> 301/302/307 redirects with loop detection</li><li><strong>AI Assistant:</strong> Generate meta descriptions, titles, and content briefs</li></ul>
        <h3>REST API</h3><p>All endpoints: <code><?php echo esc_html( rest_url( 'smartrank/v1/' ) ); ?></code></p></div>
    <?php }
}
