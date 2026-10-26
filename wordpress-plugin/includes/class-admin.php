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
        add_menu_page(
            __( 'SmartRank AI SEO', 'smartrank-ai-seo' ),
            __( 'SmartRank SEO', 'smartrank-ai-seo' ),
            'manage_options',
            'smartrank-seo',
            array( $this, 'render_dashboard' ),
            'dashicons-chart-line',
            76
        );

        $submenus = array(
            'smartrank-seo'              => __( 'Dashboard', 'smartrank-ai-seo' ),
            'smartrank-setup'            => __( 'Setup Wizard', 'smartrank-ai-seo' ),
            'smartrank-settings'         => __( 'General Settings', 'smartrank-ai-seo' ),
            'smartrank-ai-assistant'     => __( 'AI SEO Assistant', 'smartrank-ai-seo' ),
            'smartrank-keywords'         => __( 'Keyword Research', 'smartrank-ai-seo' ),
            'smartrank-audit'            => __( 'Technical SEO Audit', 'smartrank-ai-seo' ),
            'smartrank-schema'           => __( 'Schema Generator', 'smartrank-ai-seo' ),
            'smartrank-sitemap'          => __( 'XML Sitemaps', 'smartrank-ai-seo' ),
            'smartrank-redirects'        => __( 'Redirect Manager', 'smartrank-ai-seo' ),
            'smartrank-404'              => __( '404 Monitor', 'smartrank-ai-seo' ),
            'smartrank-internal-links'   => __( 'Internal Link Assistant', 'smartrank-ai-seo' ),
            'smartrank-local-seo'        => __( 'Local SEO', 'smartrank-ai-seo' ),
            'smartrank-search-console'   => __( 'Search Console', 'smartrank-ai-seo' ),
            'smartrank-rank-tracker'     => __( 'Rank Tracker', 'smartrank-ai-seo' ),
            'smartrank-woocommerce'      => __( 'WooCommerce SEO', 'smartrank-ai-seo' ),
            'smartrank-image-seo'        => __( 'Image SEO', 'smartrank-ai-seo' ),
            'smartrank-import-export'    => __( 'Import / Export', 'smartrank-ai-seo' ),
            'smartrank-documentation'    => __( 'Help & Docs', 'smartrank-ai-seo' ),
        );

        foreach ( $submenus as $slug => $title ) {
            if ( $slug === 'smartrank-seo' ) continue;
            add_submenu_page(
                'smartrank-seo',
                $title,
                $title,
                'manage_options',
                $slug,
                array( $this, 'render_dashboard' )
            );
        }
    }

    public function enqueue_assets( $hook ) {
        if ( strpos( $hook, 'smartrank' ) === false ) return;

        wp_enqueue_style(
            'smartrank-admin',
            SMARTRANK_PLUGIN_URL . 'admin/css/admin.css',
            array(),
            SMARTRANK_VERSION
        );

        wp_enqueue_script(
            'smartrank-admin',
            SMARTRANK_PLUGIN_URL . 'admin/js/admin.js',
            array( 'jquery' ),
            SMARTRANK_VERSION,
            true
        );

        wp_localize_script( 'smartrank-admin', 'smartrankData', array(
            'apiUrl'    => rest_url( 'smartrank/v1/' ),
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'adminUrl'  => admin_url(),
            'siteUrl'   => get_site_url(),
            'page'      => isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'smartrank-seo',
            'version'   => SMARTRANK_VERSION,
            'aiEnabled' => smartrank_get_option( 'ai_enabled', false ),
            'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
        ));
    }

    public function register_settings() {
        register_setting( 'smartrank_settings_group', 'smartrank_settings', array(
            'type'              => 'array',
            'sanitize_callback' => array( $this, 'sanitize_settings' ),
        ));
    }

    public function sanitize_settings( $input ) {
        $sanitized = array();
        $allowed = array(
            'site_type'          => 'sanitize_text_field',
            'title_separator'    => 'sanitize_text_field',
            'enable_sitemap'     => 'rest_sanitize_boolean',
            'enable_schema'      => 'rest_sanitize_boolean',
            'enable_redirects'   => 'rest_sanitize_boolean',
            'enable_404_monitor' => 'rest_sanitize_boolean',
            'ai_enabled'         => 'rest_sanitize_boolean',
            'ai_provider'        => 'sanitize_text_field',
            'ai_model'           => 'sanitize_text_field',
            'ai_api_key'         => 'sanitize_text_field',
            'ai_monthly_limit'   => 'absint',
        );
        foreach ( $allowed as $key => $callback ) {
            if ( isset( $input[ $key ] ) ) {
                $sanitized[ $key ] = call_user_func( $callback, $input[ $key ] );
            }
        }
        return $sanitized;
    }

    public function add_meta_boxes() {
        $post_types = get_post_types( array( 'public' => true ) );
        foreach ( $post_types as $pt ) {
            add_meta_box(
                'smartrank-seo-meta',
                __( 'SmartRank SEO', 'smartrank-ai-seo' ),
                array( $this, 'render_meta_box' ),
                $pt,
                'normal',
                'high'
            );
        }
    }

    public function render_meta_box( $post ) {
        wp_nonce_field( 'smartrank_meta_box', 'smartrank_meta_nonce' );
        $meta = $this->get_post_meta( $post->ID );
        ?>
        <div id="smartrank-meta-box" data-post-id="<?php echo esc_attr( $post->ID ); ?>">
            <div class="smartrank-meta-grid">
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'Focus Keyphrase', 'smartrank-ai-seo' ); ?></label>
                    <input type="text" name="smartrank_focus_keyphrase" value="<?php echo esc_attr( $meta['focus_keyphrase'] ); ?>" class="widefat" />
                </div>
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'SEO Title', 'smartrank-ai-seo' ); ?></label>
                    <input type="text" name="smartrank_seo_title" value="<?php echo esc_attr( $meta['seo_title'] ); ?>" class="widefat" maxlength="60" />
                </div>
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'Meta Description', 'smartrank-ai-seo' ); ?></label>
                    <textarea name="smartrank_meta_description" class="widefat" rows="3" maxlength="160"><?php echo esc_textarea( $meta['meta_description'] ); ?></textarea>
                </div>
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'Canonical URL', 'smartrank-ai-seo' ); ?></label>
                    <input type="url" name="smartrank_canonical" value="<?php echo esc_url( $meta['canonical'] ); ?>" class="widefat" />
                </div>
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'Robots Meta', 'smartrank-ai-seo' ); ?></label>
                    <select name="smartrank_robots" class="widefat">
                        <?php foreach ( array( 'index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow' ) as $val ) : ?>
                            <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $meta['robots'], $val ); ?>><?php echo esc_html( $val ); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'Schema Type', 'smartrank-ai-seo' ); ?></label>
                    <select name="smartrank_schema_type" class="widefat">
                        <option value=""><?php esc_html_e( 'Auto-detect', 'smartrank-ai-seo' ); ?></option>
                        <?php foreach ( array( 'Article', 'BlogPosting', 'WebPage', 'Product', 'FAQPage', 'LocalBusiness', 'Organization', 'Person', 'Service', 'Event', 'VideoObject' ) as $type ) : ?>
                            <option value="<?php echo esc_attr( $type ); ?>" <?php selected( $meta['schema_type'], $type ); ?>><?php echo esc_html( $type ); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="smartrank-snippet-preview">
                <h4><?php esc_html_e( 'Google Preview', 'smartrank-ai-seo' ); ?></h4>
                <div class="smartrank-snippet">
                    <p class="smartrank-snippet-title" id="smartrank-snippet-title"><?php echo esc_html( $meta['seo_title'] ?: $post->post_title ); ?></p>
                    <p class="smartrank-snippet-url" id="smartrank-snippet-url"><?php echo esc_html( get_permalink( $post ) ); ?></p>
                    <p class="smartrank-snippet-desc" id="smartrank-snippet-desc"><?php echo esc_html( $meta['meta_description'] ); ?></p>
                </div>
            </div>

            <div class="smartrank-ai-actions">
                <button type="button" class="button button-secondary smartrank-ai-generate" data-action="meta-description">
                    <?php esc_html_e( '🤖 Generate Meta Description', 'smartrank-ai-seo' ); ?>
                </button>
                <button type="button" class="button button-secondary smartrank-ai-generate" data-action="seo-title">
                    <?php esc_html_e( '🤖 Generate SEO Title', 'smartrank-ai-seo' ); ?>
                </button>
            </div>
        </div>
        <?php
    }

    public function save_post_meta( $post_id, $post ) {
        if ( ! isset( $_POST['smartrank_meta_nonce'] ) ) return;
        if ( ! wp_verify_nonce( $_POST['smartrank_meta_nonce'], 'smartrank_meta_box' ) ) return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;

        $fields = array(
            'focus_keyphrase', 'seo_title', 'meta_description', 'canonical',
            'robots', 'schema_type',
        );

        global $wpdb;
        foreach ( $fields as $field ) {
            $key   = 'smartrank_' . $field;
            $value = isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';

            $existing = $wpdb->get_var( $wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}smartrank_meta WHERE post_id = %d AND meta_key = %s",
                $post_id, $field
            ));

            if ( $existing ) {
                $wpdb->update(
                    "{$wpdb->prefix}smartrank_meta",
                    array( 'meta_value' => $value ),
                    array( 'post_id' => $post_id, 'meta_key' => $field ),
                    array( '%s' ),
                    array( '%d', '%s' )
                );
            } else {
                $wpdb->insert(
                    "{$wpdb->prefix}smartrank_meta",
                    array( 'post_id' => $post_id, 'meta_key' => $field, 'meta_value' => $value ),
                    array( '%d', '%s', '%s' )
                );
            }
        }
    }

    private function get_post_meta( $post_id ) {
        global $wpdb;
        $defaults = array(
            'focus_keyphrase'  => '',
            'seo_title'        => '',
            'meta_description' => '',
            'canonical'        => '',
            'robots'           => 'index, follow',
            'schema_type'      => '',
        );
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->prefix}smartrank_meta WHERE post_id = %d",
            $post_id
        ));
        foreach ( $rows as $row ) {
            if ( array_key_exists( $row->meta_key, $defaults ) ) {
                $defaults[ $row->meta_key ] = $row->meta_value;
            }
        }
        return $defaults;
    }

    public function render_dashboard() {
        $page = isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'smartrank-seo';
        $this->render_admin_page( $page );
    }

    private function render_admin_page( $page ) {
        ?>
        <div class="wrap smartrank-wrap">
            <div class="smartrank-header">
                <div class="smartrank-logo">
                    <span class="dashicons dashicons-chart-line"></span>
                    <div>
                        <h1><?php esc_html_e( 'SmartRank AI SEO', 'smartrank-ai-seo' ); ?></h1>
                        <span class="smartrank-version">v<?php echo esc_html( SMARTRANK_VERSION ); ?></span>
                    </div>
                </div>
            </div>

            <div class="smartrank-layout">
                <nav class="smartrank-nav">
                    <?php $this->render_nav_menu( $page ); ?>
                </nav>

                <main class="smartrank-content" id="smartrank-content">
                    <?php $this->render_page_content( $page ); ?>
                </main>
            </div>
        </div>
        <?php
    }

    private function render_nav_menu( $current ) {
        $items = array(
            'smartrank-seo'            => array( 'dashicons-dashboard', __( 'Dashboard', 'smartrank-ai-seo' ) ),
            'smartrank-setup'          => array( 'dashicons-admin-links', __( 'Setup Wizard', 'smartrank-ai-seo' ) ),
            'smartrank-settings'       => array( 'dashicons-admin-generic', __( 'Settings', 'smartrank-ai-seo' ) ),
            'smartrank-ai-assistant'   => array( 'dashicons-format-chat', __( 'AI Assistant', 'smartrank-ai-seo' ) ),
            'smartrank-keywords'       => array( 'dashicons-search', __( 'Keywords', 'smartrank-ai-seo' ) ),
            'smartrank-audit'          => array( 'dashicons-shield', __( 'SEO Audit', 'smartrank-ai-seo' ) ),
            'smartrank-schema'         => array( 'dashicons-editor-code', __( 'Schema', 'smartrank-ai-seo' ) ),
            'smartrank-sitemap'        => array( 'dashicons-admin-site', __( 'Sitemaps', 'smartrank-ai-seo' ) ),
            'smartrank-redirects'      => array( 'dashicons-randomize', __( 'Redirects', 'smartrank-ai-seo' ) ),
            'smartrank-404'            => array( 'dashicons-warning', __( '404 Monitor', 'smartrank-ai-seo' ) ),
            'smartrank-internal-links' => array( 'dashicons-admin-links', __( 'Internal Links', 'smartrank-ai-seo' ) ),
            'smartrank-local-seo'      => array( 'dashicons-location', __( 'Local SEO', 'smartrank-ai-seo' ) ),
            'smartrank-search-console' => array( 'dashicons-chart-bar', __( 'Search Console', 'smartrank-ai-seo' ) ),
            'smartrank-rank-tracker'   => array( 'dashicons-marker', __( 'Rank Tracker', 'smartrank-ai-seo' ) ),
            'smartrank-woocommerce'    => array( 'dashicons-cart', __( 'WooCommerce', 'smartrank-ai-seo' ) ),
            'smartrank-image-seo'      => array( 'dashicons-format-image', __( 'Image SEO', 'smartrank-ai-seo' ) ),
            'smartrank-documentation'  => array( 'dashicons-book', __( 'Documentation', 'smartrank-ai-seo' ) ),
        );

        foreach ( $items as $slug => $info ) {
            $url   = admin_url( 'admin.php?page=' . $slug );
            $class = $slug === $current ? ' class="active"' : '';
            printf(
                '<a href="%s"%s><span class="dashicons %s"></span> %s</a>',
                esc_url( $url ),
                $class,
                esc_attr( $info[0] ),
                esc_html( $info[1] )
            );
        }
    }

    private function render_page_content( $page ) {
        switch ( $page ) {
            case 'smartrank-seo':
                $this->page_dashboard();
                break;
            case 'smartrank-settings':
                $this->page_settings();
                break;
            case 'smartrank-audit':
                $this->page_audit();
                break;
            case 'smartrank-redirects':
                $this->page_redirects();
                break;
            case 'smartrank-schema':
                $this->page_schema();
                break;
            case 'smartrank-sitemap':
                $this->page_sitemap();
                break;
            case 'smartrank-ai-assistant':
                $this->page_ai_assistant();
                break;
            case 'smartrank-keywords':
                $this->page_keywords();
                break;
            case 'smartrank-404':
                $this->page_404();
                break;
            case 'smartrank-local-seo':
                $this->page_local_seo();
                break;
            case 'smartrank-documentation':
                $this->page_documentation();
                break;
            default:
                $this->page_placeholder( $page );
                break;
        }
    }

    private function page_dashboard() {
        global $wpdb;
        $published = wp_count_posts( 'post' )->publish + wp_count_posts( 'page' )->publish;
        $missing_desc = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->prefix}smartrank_meta m ON p.ID = m.post_id AND m.meta_key = 'meta_description'
             WHERE p.post_status = 'publish' AND p.post_type IN ('post','page')
             AND (m.meta_value IS NULL OR m.meta_value = '')"
        );
        $redirects = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_redirects WHERE status = 'active'" );
        $errors_404 = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_404_log" );

        $health = 100;
        if ( $published > 0 ) {
            $health -= min( 30, ( intval( $missing_desc ) / max( 1, $published ) ) * 50 );
        }
        $health = max( 0, round( $health ) );
        ?>
        <h2><?php esc_html_e( 'SEO Dashboard', 'smartrank-ai-seo' ); ?></h2>

        <div class="smartrank-cards">
            <div class="smartrank-card smartrank-card-score">
                <div class="smartrank-score-ring" data-score="<?php echo esc_attr( $health ); ?>">
                    <span><?php echo esc_html( $health ); ?></span>
                </div>
                <h3><?php esc_html_e( 'SEO Health Score', 'smartrank-ai-seo' ); ?></h3>
            </div>
            <div class="smartrank-card">
                <div class="smartrank-card-value"><?php echo esc_html( $published ); ?></div>
                <div class="smartrank-card-label"><?php esc_html_e( 'Pages Published', 'smartrank-ai-seo' ); ?></div>
            </div>
            <div class="smartrank-card">
                <div class="smartrank-card-value smartrank-warning"><?php echo esc_html( $missing_desc ); ?></div>
                <div class="smartrank-card-label"><?php esc_html_e( 'Missing Meta Descriptions', 'smartrank-ai-seo' ); ?></div>
            </div>
            <div class="smartrank-card">
                <div class="smartrank-card-value"><?php echo esc_html( $redirects ); ?></div>
                <div class="smartrank-card-label"><?php esc_html_e( 'Active Redirects', 'smartrank-ai-seo' ); ?></div>
            </div>
            <div class="smartrank-card">
                <div class="smartrank-card-value <?php echo $errors_404 > 0 ? 'smartrank-warning' : ''; ?>"><?php echo esc_html( $errors_404 ); ?></div>
                <div class="smartrank-card-label"><?php esc_html_e( '404 Errors Logged', 'smartrank-ai-seo' ); ?></div>
            </div>
        </div>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Quick Actions', 'smartrank-ai-seo' ); ?></h3>
            <div class="smartrank-actions">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-audit' ) ); ?>" class="button button-primary">
                    <span class="dashicons dashicons-shield"></span> <?php esc_html_e( 'Run SEO Audit', 'smartrank-ai-seo' ); ?>
                </a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-sitemap' ) ); ?>" class="button">
                    <span class="dashicons dashicons-admin-site"></span> <?php esc_html_e( 'View Sitemaps', 'smartrank-ai-seo' ); ?>
                </a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-redirects' ) ); ?>" class="button">
                    <span class="dashicons dashicons-randomize"></span> <?php esc_html_e( 'Manage Redirects', 'smartrank-ai-seo' ); ?>
                </a>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-settings' ) ); ?>" class="button">
                    <span class="dashicons dashicons-admin-generic"></span> <?php esc_html_e( 'Settings', 'smartrank-ai-seo' ); ?>
                </a>
            </div>
        </div>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Module Status', 'smartrank-ai-seo' ); ?></h3>
            <table class="widefat striped">
                <tbody>
                    <tr>
                        <td><strong><?php esc_html_e( 'XML Sitemaps', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap.xml' ) ); ?></a></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Schema Markup', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><?php esc_html_e( 'JSON-LD output on all pages', 'smartrank-ai-seo' ); ?></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Redirect Manager', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><?php printf( esc_html__( '%d active redirects', 'smartrank-ai-seo' ), intval( $redirects ) ); ?></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( '404 Monitor', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><?php printf( esc_html__( '%d errors logged', 'smartrank-ai-seo' ), intval( $errors_404 ) ); ?></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'AI Assistant', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><?php echo smartrank_get_option( 'ai_enabled' ) ? esc_html__( 'Enabled', 'smartrank-ai-seo' ) : esc_html__( 'Disabled — configure in Settings', 'smartrank-ai-seo' ); ?></td>
                        <td><span class="smartrank-status <?php echo smartrank_get_option( 'ai_enabled' ) ? 'smartrank-status-active' : 'smartrank-status-inactive'; ?>">
                            <?php echo smartrank_get_option( 'ai_enabled' ) ? esc_html__( 'Active', 'smartrank-ai-seo' ) : esc_html__( 'Inactive', 'smartrank-ai-seo' ); ?>
                        </span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <?php
    }

    private function page_settings() {
        $settings = get_option( 'smartrank_settings', array() );
        ?>
        <h2><?php esc_html_e( 'General Settings', 'smartrank-ai-seo' ); ?></h2>
        <form method="post" action="options.php">
            <?php settings_fields( 'smartrank_settings_group' ); ?>
            <table class="form-table">
                <tr>
                    <th><label for="site_type"><?php esc_html_e( 'Website Type', 'smartrank-ai-seo' ); ?></label></th>
                    <td>
                        <select name="smartrank_settings[site_type]" id="site_type">
                            <?php foreach ( array( 'blog' => 'Blog', 'ecommerce' => 'E-commerce', 'business' => 'Business', 'portfolio' => 'Portfolio', 'news' => 'News/Media' ) as $val => $label ) : ?>
                                <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $settings['site_type'] ?? 'blog', $val ); ?>><?php echo esc_html( $label ); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="title_separator"><?php esc_html_e( 'Title Separator', 'smartrank-ai-seo' ); ?></label></th>
                    <td>
                        <select name="smartrank_settings[title_separator]" id="title_separator">
                            <?php foreach ( array( '-' => 'Dash (-)', '|' => 'Pipe (|)', '»' => 'Guillemet (»)', '~' => 'Tilde (~)' ) as $val => $label ) : ?>
                                <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $settings['title_separator'] ?? '-', $val ); ?>><?php echo esc_html( $label ); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><?php esc_html_e( 'Features', 'smartrank-ai-seo' ); ?></th>
                    <td>
                        <label><input type="checkbox" name="smartrank_settings[enable_sitemap]" value="1" <?php checked( $settings['enable_sitemap'] ?? true ); ?>> <?php esc_html_e( 'Enable XML Sitemaps', 'smartrank-ai-seo' ); ?></label><br>
                        <label><input type="checkbox" name="smartrank_settings[enable_schema]" value="1" <?php checked( $settings['enable_schema'] ?? true ); ?>> <?php esc_html_e( 'Enable Schema Markup', 'smartrank-ai-seo' ); ?></label><br>
                        <label><input type="checkbox" name="smartrank_settings[enable_redirects]" value="1" <?php checked( $settings['enable_redirects'] ?? true ); ?>> <?php esc_html_e( 'Enable Redirect Manager', 'smartrank-ai-seo' ); ?></label><br>
                        <label><input type="checkbox" name="smartrank_settings[enable_404_monitor]" value="1" <?php checked( $settings['enable_404_monitor'] ?? true ); ?>> <?php esc_html_e( 'Enable 404 Monitor', 'smartrank-ai-seo' ); ?></label>
                    </td>
                </tr>
                <tr>
                    <th colspan="2"><h3><?php esc_html_e( 'AI Configuration', 'smartrank-ai-seo' ); ?></h3></th>
                </tr>
                <tr>
                    <th><label for="ai_enabled"><?php esc_html_e( 'Enable AI Features', 'smartrank-ai-seo' ); ?></label></th>
                    <td><label><input type="checkbox" name="smartrank_settings[ai_enabled]" id="ai_enabled" value="1" <?php checked( $settings['ai_enabled'] ?? false ); ?>> <?php esc_html_e( 'Enable AI SEO Assistant', 'smartrank-ai-seo' ); ?></label></td>
                </tr>
                <tr>
                    <th><label for="ai_provider"><?php esc_html_e( 'AI Provider', 'smartrank-ai-seo' ); ?></label></th>
                    <td>
                        <select name="smartrank_settings[ai_provider]" id="ai_provider">
                            <option value="openai" <?php selected( $settings['ai_provider'] ?? 'openai', 'openai' ); ?>>OpenAI (GPT-4)</option>
                            <option value="anthropic" <?php selected( $settings['ai_provider'] ?? '', 'anthropic' ); ?>>Anthropic (Claude)</option>
                            <option value="google" <?php selected( $settings['ai_provider'] ?? '', 'google' ); ?>>Google (Gemini)</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="ai_api_key"><?php esc_html_e( 'API Key', 'smartrank-ai-seo' ); ?></label></th>
                    <td><input type="password" name="smartrank_settings[ai_api_key]" id="ai_api_key" value="<?php echo esc_attr( $settings['ai_api_key'] ?? '' ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="ai_monthly_limit"><?php esc_html_e( 'Monthly AI Limit', 'smartrank-ai-seo' ); ?></label></th>
                    <td><input type="number" name="smartrank_settings[ai_monthly_limit]" id="ai_monthly_limit" value="<?php echo esc_attr( $settings['ai_monthly_limit'] ?? 50 ); ?>" class="small-text"> <?php esc_html_e( 'requests per month', 'smartrank-ai-seo' ); ?></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <?php
    }

    private function page_audit() {
        ?>
        <h2><?php esc_html_e( 'Technical SEO Audit', 'smartrank-ai-seo' ); ?></h2>
        <p><?php esc_html_e( 'Scan your website for technical SEO issues and get prioritized recommendations.', 'smartrank-ai-seo' ); ?></p>

        <div class="smartrank-section">
            <button type="button" class="button button-primary button-hero" id="smartrank-run-audit">
                <span class="dashicons dashicons-shield"></span> <?php esc_html_e( 'Run Full Audit', 'smartrank-ai-seo' ); ?>
            </button>
            <div id="smartrank-audit-results" class="smartrank-audit-results"></div>
        </div>
        <?php
    }

    private function page_redirects() {
        global $wpdb;
        $redirects = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_redirects ORDER BY created_at DESC LIMIT 100" );
        ?>
        <h2><?php esc_html_e( 'Redirect Manager', 'smartrank-ai-seo' ); ?></h2>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Add New Redirect', 'smartrank-ai-seo' ); ?></h3>
            <form id="smartrank-add-redirect" class="smartrank-form">
                <div class="smartrank-form-row">
                    <input type="text" name="source" placeholder="/old-url" class="regular-text" required>
                    <span>→</span>
                    <input type="text" name="target" placeholder="/new-url" class="regular-text" required>
                    <select name="type">
                        <option value="301">301 (Permanent)</option>
                        <option value="302">302 (Temporary)</option>
                        <option value="307">307 (Temporary)</option>
                    </select>
                    <button type="submit" class="button button-primary"><?php esc_html_e( 'Add Redirect', 'smartrank-ai-seo' ); ?></button>
                </div>
            </form>
        </div>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Active Redirects', 'smartrank-ai-seo' ); ?> (<?php echo count( $redirects ); ?>)</h3>
            <table class="widefat striped" id="smartrank-redirects-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'Source', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Target', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Type', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Hits', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Actions', 'smartrank-ai-seo' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ( empty( $redirects ) ) : ?>
                        <tr><td colspan="5"><?php esc_html_e( 'No redirects configured yet.', 'smartrank-ai-seo' ); ?></td></tr>
                    <?php else : foreach ( $redirects as $r ) : ?>
                        <tr data-id="<?php echo esc_attr( $r->id ); ?>">
                            <td><code><?php echo esc_html( $r->source ); ?></code></td>
                            <td><code><?php echo esc_html( $r->target ); ?></code></td>
                            <td><span class="smartrank-badge"><?php echo esc_html( $r->type ); ?></span></td>
                            <td><?php echo esc_html( $r->hits ); ?></td>
                            <td>
                                <button class="button button-small smartrank-delete-redirect" data-id="<?php echo esc_attr( $r->id ); ?>"><?php esc_html_e( 'Delete', 'smartrank-ai-seo' ); ?></button>
                            </td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    private function page_schema() {
        ?>
        <h2><?php esc_html_e( 'Schema Markup Generator', 'smartrank-ai-seo' ); ?></h2>
        <p><?php esc_html_e( 'Schema markup is automatically generated on your pages. Configure defaults below.', 'smartrank-ai-seo' ); ?></p>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Active Schema Types', 'smartrank-ai-seo' ); ?></h3>
            <table class="widefat striped">
                <thead>
                    <tr><th><?php esc_html_e( 'Type', 'smartrank-ai-seo' ); ?></th><th><?php esc_html_e( 'Status', 'smartrank-ai-seo' ); ?></th><th><?php esc_html_e( 'Description', 'smartrank-ai-seo' ); ?></th></tr>
                </thead>
                <tbody>
                    <?php
                    $types = array(
                        'Organization'   => 'Sitewide — appears on every page',
                        'WebSite'        => 'Sitewide — enables sitelinks search box',
                        'BreadcrumbList' => 'Auto-generated from page hierarchy',
                        'BlogPosting'    => 'Auto-applied to blog posts',
                        'Article'        => 'For standard articles and pages',
                        'Product'        => 'Auto-applied to WooCommerce products',
                        'FAQPage'        => 'Auto-detected from Q&A content',
                        'LocalBusiness'  => 'For contact/about pages with address',
                        'WebPage'        => 'Default for standard pages',
                        'Person'         => 'For author archives',
                        'Event'          => 'Manual — set per page',
                        'VideoObject'    => 'Manual — set per page',
                    );
                    foreach ( $types as $type => $desc ) :
                    ?>
                    <tr>
                        <td><strong><?php echo esc_html( $type ); ?></strong></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                        <td><?php echo esc_html( $desc ); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    private function page_sitemap() {
        ?>
        <h2><?php esc_html_e( 'XML Sitemaps', 'smartrank-ai-seo' ); ?></h2>
        <p><?php esc_html_e( 'Sitemaps are automatically generated and submitted to search engines.', 'smartrank-ai-seo' ); ?></p>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Your Sitemaps', 'smartrank-ai-seo' ); ?></h3>
            <table class="widefat striped">
                <tbody>
                    <tr>
                        <td><strong><?php esc_html_e( 'Sitemap Index', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><a href="<?php echo esc_url( home_url( '/sitemap.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap.xml' ) ); ?></a></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Posts', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><a href="<?php echo esc_url( home_url( '/sitemap-posts.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-posts.xml' ) ); ?></a></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Pages', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><a href="<?php echo esc_url( home_url( '/sitemap-pages.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-pages.xml' ) ); ?></a></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <tr>
                        <td><strong><?php esc_html_e( 'Categories', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><a href="<?php echo esc_url( home_url( '/sitemap-categories.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-categories.xml' ) ); ?></a></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <?php if ( post_type_exists( 'product' ) ) : ?>
                    <tr>
                        <td><strong><?php esc_html_e( 'Products', 'smartrank-ai-seo' ); ?></strong></td>
                        <td><a href="<?php echo esc_url( home_url( '/sitemap-products.xml' ) ); ?>" target="_blank"><?php echo esc_html( home_url( '/sitemap-products.xml' ) ); ?></a></td>
                        <td><span class="smartrank-status smartrank-status-active"><?php esc_html_e( 'Active', 'smartrank-ai-seo' ); ?></span></td>
                    </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    private function page_ai_assistant() {
        $enabled = smartrank_get_option( 'ai_enabled', false );
        ?>
        <h2><?php esc_html_e( 'AI SEO Assistant', 'smartrank-ai-seo' ); ?></h2>

        <?php if ( ! $enabled ) : ?>
            <div class="notice notice-warning inline">
                <p><?php esc_html_e( 'AI features are disabled. Enable them in Settings and add your API key.', 'smartrank-ai-seo' ); ?>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-settings' ) ); ?>"><?php esc_html_e( 'Go to Settings →', 'smartrank-ai-seo' ); ?></a></p>
            </div>
        <?php else : ?>
            <div class="smartrank-section">
                <h3><?php esc_html_e( 'AI Content Generator', 'smartrank-ai-seo' ); ?></h3>
                <form id="smartrank-ai-form">
                    <p>
                        <label><?php esc_html_e( 'Select Post:', 'smartrank-ai-seo' ); ?></label>
                        <select id="smartrank-ai-post" class="regular-text">
                            <option value=""><?php esc_html_e( '— Select —', 'smartrank-ai-seo' ); ?></option>
                            <?php
                            $posts = get_posts( array( 'post_type' => array( 'post', 'page' ), 'posts_per_page' => 50, 'post_status' => 'publish' ) );
                            foreach ( $posts as $p ) :
                            ?>
                                <option value="<?php echo esc_attr( $p->ID ); ?>"><?php echo esc_html( $p->post_title ); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </p>
                    <p>
                        <button type="button" class="button" id="smartrank-ai-meta"><?php esc_html_e( '🤖 Generate Meta Description', 'smartrank-ai-seo' ); ?></button>
                        <button type="button" class="button" id="smartrank-ai-title"><?php esc_html_e( '🤖 Generate SEO Title', 'smartrank-ai-seo' ); ?></button>
                        <button type="button" class="button" id="smartrank-ai-analyze"><?php esc_html_e( '🔍 Analyze Content', 'smartrank-ai-seo' ); ?></button>
                    </p>
                    <div id="smartrank-ai-output" class="smartrank-ai-output"></div>
                </form>
            </div>
        <?php endif; ?>
        <?php
    }

    private function page_keywords() {
        global $wpdb;
        $keywords = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_keywords ORDER BY created_at DESC LIMIT 100" );
        ?>
        <h2><?php esc_html_e( 'Keyword Research', 'smartrank-ai-seo' ); ?></h2>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Add Keyword', 'smartrank-ai-seo' ); ?></h3>
            <form id="smartrank-add-keyword" class="smartrank-form">
                <div class="smartrank-form-row">
                    <input type="text" name="keyword" placeholder="Target keyword" class="regular-text" required>
                    <select name="intent">
                        <option value="informational"><?php esc_html_e( 'Informational', 'smartrank-ai-seo' ); ?></option>
                        <option value="commercial"><?php esc_html_e( 'Commercial', 'smartrank-ai-seo' ); ?></option>
                        <option value="transactional"><?php esc_html_e( 'Transactional', 'smartrank-ai-seo' ); ?></option>
                        <option value="navigational"><?php esc_html_e( 'Navigational', 'smartrank-ai-seo' ); ?></option>
                    </select>
                    <input type="text" name="group_name" placeholder="Group" class="regular-text">
                    <button type="submit" class="button button-primary"><?php esc_html_e( 'Add', 'smartrank-ai-seo' ); ?></button>
                </div>
            </form>
        </div>

        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Your Keywords', 'smartrank-ai-seo' ); ?> (<?php echo count( $keywords ); ?>)</h3>
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'Keyword', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Intent', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Group', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Position', 'smartrank-ai-seo' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ( empty( $keywords ) ) : ?>
                        <tr><td colspan="4"><?php esc_html_e( 'No keywords added yet.', 'smartrank-ai-seo' ); ?></td></tr>
                    <?php else : foreach ( $keywords as $kw ) : ?>
                        <tr>
                            <td><strong><?php echo esc_html( $kw->keyword ); ?></strong></td>
                            <td><span class="smartrank-badge"><?php echo esc_html( $kw->intent ); ?></span></td>
                            <td><?php echo esc_html( $kw->group_name ); ?></td>
                            <td><?php echo $kw->position ? '#' . esc_html( $kw->position ) : '—'; ?></td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    private function page_404() {
        global $wpdb;
        $errors = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_404_log ORDER BY hits DESC LIMIT 100" );
        ?>
        <h2><?php esc_html_e( '404 Monitor', 'smartrank-ai-seo' ); ?></h2>
        <p><?php esc_html_e( 'Track URLs that return 404 errors. Create redirects for high-traffic 404s.', 'smartrank-ai-seo' ); ?></p>

        <div class="smartrank-section">
            <table class="widefat striped">
                <thead>
                    <tr>
                        <th><?php esc_html_e( 'URL', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Hits', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Last Hit', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Referrer', 'smartrank-ai-seo' ); ?></th>
                        <th><?php esc_html_e( 'Actions', 'smartrank-ai-seo' ); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if ( empty( $errors ) ) : ?>
                        <tr><td colspan="5"><?php esc_html_e( 'No 404 errors logged yet.', 'smartrank-ai-seo' ); ?></td></tr>
                    <?php else : foreach ( $errors as $err ) : ?>
                        <tr>
                            <td><code><?php echo esc_html( $err->url ); ?></code></td>
                            <td><strong><?php echo esc_html( $err->hits ); ?></strong></td>
                            <td><?php echo esc_html( $err->last_hit ); ?></td>
                            <td><?php echo esc_html( $err->referrer ); ?></td>
                            <td>
                                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smartrank-redirects&source=' . urlencode( $err->url ) ) ); ?>" class="button button-small">
                                    <?php esc_html_e( 'Create Redirect', 'smartrank-ai-seo' ); ?>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    private function page_local_seo() {
        $local = smartrank_get_option( 'local_settings', array() );
        ?>
        <h2><?php esc_html_e( 'Local SEO', 'smartrank-ai-seo' ); ?></h2>
        <form method="post" action="options.php">
            <?php settings_fields( 'smartrank_settings_group' ); ?>
            <table class="form-table">
                <tr>
                    <th><label><?php esc_html_e( 'Business Name', 'smartrank-ai-seo' ); ?></label></th>
                    <td><input type="text" name="smartrank_settings[local_name]" value="<?php echo esc_attr( $local['name'] ?? get_bloginfo( 'name' ) ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e( 'Address', 'smartrank-ai-seo' ); ?></label></th>
                    <td><input type="text" name="smartrank_settings[local_address]" value="<?php echo esc_attr( $local['address'] ?? '' ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e( 'Phone', 'smartrank-ai-seo' ); ?></label></th>
                    <td><input type="text" name="smartrank_settings[local_phone]" value="<?php echo esc_attr( $local['phone'] ?? '' ); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label><?php esc_html_e( 'Email', 'smartrank-ai-seo' ); ?></label></th>
                    <td><input type="email" name="smartrank_settings[local_email]" value="<?php echo esc_attr( $local['email'] ?? '' ); ?>" class="regular-text"></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <?php
    }

    private function page_documentation() {
        ?>
        <h2><?php esc_html_e( 'Documentation', 'smartrank-ai-seo' ); ?></h2>
        <div class="smartrank-section">
            <h3><?php esc_html_e( 'Getting Started', 'smartrank-ai-seo' ); ?></h3>
            <ol>
                <li><?php esc_html_e( 'Run the Setup Wizard to configure basic settings', 'smartrank-ai-seo' ); ?></li>
                <li><?php esc_html_e( 'Add SEO metadata to your existing pages via the meta box', 'smartrank-ai-seo' ); ?></li>
                <li><?php esc_html_e( 'Run a Technical SEO Audit to find issues', 'smartrank-ai-seo' ); ?></li>
                <li><?php esc_html_e( 'Configure AI features (optional) for content generation', 'smartrank-ai-seo' ); ?></li>
            </ol>

            <h3><?php esc_html_e( 'Features', 'smartrank-ai-seo' ); ?></h3>
            <ul>
                <li><strong><?php esc_html_e( 'Meta Tags:', 'smartrank-ai-seo' ); ?></strong> <?php esc_html_e( 'Automatically outputs title, description, OG, and Twitter tags', 'smartrank-ai-seo' ); ?></li>
                <li><strong><?php esc_html_e( 'Schema:', 'smartrank-ai-seo' ); ?></strong> <?php esc_html_e( 'JSON-LD structured data for 15+ schema types', 'smartrank-ai-seo' ); ?></li>
                <li><strong><?php esc_html_e( 'Sitemaps:', 'smartrank-ai-seo' ); ?></strong> <?php esc_html_e( 'Auto-generated XML sitemaps at /sitemap.xml', 'smartrank-ai-seo' ); ?></li>
                <li><strong><?php esc_html_e( 'Redirects:', 'smartrank-ai-seo' ); ?></strong> <?php esc_html_e( '301/302/307 redirects with loop detection', 'smartrank-ai-seo' ); ?></li>
                <li><strong><?php esc_html_e( 'AI Assistant:', 'smartrank-ai-seo' ); ?></strong> <?php esc_html_e( 'Generate meta descriptions, titles, and content briefs', 'smartrank-ai-seo' ); ?></li>
            </ul>

            <h3><?php esc_html_e( 'REST API', 'smartrank-ai-seo' ); ?></h3>
            <p><?php esc_html_e( 'All endpoints are available at:', 'smartrank-ai-seo' ); ?> <code><?php echo esc_html( rest_url( 'smartrank/v1/' ) ); ?></code></p>
        </div>
        <?php
    }

    private function page_placeholder( $page ) {
        $titles = array(
            'smartrank-setup'          => __( 'Setup Wizard', 'smartrank-ai-seo' ),
            'smartrank-internal-links' => __( 'Internal Link Assistant', 'smartrank-ai-seo' ),
            'smartrank-search-console' => __( 'Google Search Console', 'smartrank-ai-seo' ),
            'smartrank-rank-tracker'   => __( 'Rank Tracker', 'smartrank-ai-seo' ),
            'smartrank-woocommerce'    => __( 'WooCommerce SEO', 'smartrank-ai-seo' ),
            'smartrank-image-seo'      => __( 'Image SEO', 'smartrank-ai-seo' ),
            'smartrank-import-export'  => __( 'Import / Export', 'smartrank-ai-seo' ),
        );
        $title = isset( $titles[ $page ] ) ? $titles[ $page ] : ucfirst( str_replace( 'smartrank-', '', $page ) );
        ?>
        <h2><?php echo esc_html( $title ); ?></h2>
        <div class="smartrank-section">
            <p><?php printf( esc_html__( 'The %s module is available in the Pro version.', 'smartrank-ai-seo' ), esc_html( $title ) ); ?></p>
            <p><?php esc_html_e( 'Core SEO features (meta tags, schema, sitemaps, redirects, audits) are fully functional.', 'smartrank-ai-seo' ); ?></p>
        </div>
        <?php
    }
}
