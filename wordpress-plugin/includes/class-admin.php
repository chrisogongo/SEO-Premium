<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Admin {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'register_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'wp_ajax_smartrank_save_meta', array( $this, 'ajax_save_meta' ) );
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
            'smartrank-search-appearance'=> __( 'Search Appearance', 'smartrank-ai-seo' ),
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
            'smartrank-integrations'     => __( 'Integrations', 'smartrank-ai-seo' ),
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

        $asset_path = SMARTRANK_PLUGIN_DIR . 'admin/dist/';
        $asset_url  = SMARTRANK_PLUGIN_URL . 'admin/dist/';

        if ( file_exists( $asset_path . 'index.html' ) ) {
            wp_enqueue_style(
                'smartrank-admin-css',
                $asset_url . 'assets/index.css',
                array(),
                SMARTRANK_VERSION
            );
        }

        wp_enqueue_style(
            'smartrank-admin-base',
            SMARTRANK_PLUGIN_URL . 'admin/css/admin.css',
            array(),
            SMARTRANK_VERSION
        );

        wp_localize_script( 'jquery', 'smartrankData', array(
            'apiUrl'   => rest_url( 'smartrank/v1/' ),
            'nonce'    => wp_create_nonce( 'wp_rest' ),
            'adminUrl' => admin_url(),
            'siteUrl'  => get_site_url(),
            'page'     => isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'smartrank-seo',
            'version'  => SMARTRANK_VERSION,
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
                    <label><?php esc_html_e( 'OG Title', 'smartrank-ai-seo' ); ?></label>
                    <input type="text" name="smartrank_og_title" value="<?php echo esc_attr( $meta['og_title'] ); ?>" class="widefat" />
                </div>
                <div class="smartrank-field">
                    <label><?php esc_html_e( 'OG Description', 'smartrank-ai-seo' ); ?></label>
                    <textarea name="smartrank_og_description" class="widefat" rows="2"><?php echo esc_textarea( $meta['og_description'] ); ?></textarea>
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
                    <p class="smartrank-snippet-title" id="smartrank-snippet-title"></p>
                    <p class="smartrank-snippet-url" id="smartrank-snippet-url"></p>
                    <p class="smartrank-snippet-desc" id="smartrank-snippet-desc"></p>
                </div>
            </div>

            <div class="smartrank-ai-actions">
                <button type="button" class="button button-secondary smartrank-ai-generate" data-action="meta-description">
                    <?php esc_html_e( '🤖 Generate Meta Description', 'smartrank-ai-seo' ); ?>
                </button>
                <button type="button" class="button button-secondary smartrank-ai-generate" data-action="seo-title">
                    <?php esc_html_e( '🤖 Generate SEO Title', 'smartrank-ai-seo' ); ?>
                </button>
                <button type="button" class="button button-secondary smartrank-ai-analyze">
                    <?php esc_html_e( '🔍 Analyze Content', 'smartrank-ai-seo' ); ?>
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
            'robots', 'og_title', 'og_description', 'schema_type',
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
            'og_title'         => '',
            'og_description'   => '',
            'schema_type'      => '',
        );
        $rows = $wpdb->get_results( $wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$wpdb->prefix}smartrank_meta WHERE post_id = %d",
            $post_id
        ));
        foreach ( $rows as $row ) {
            $defaults[ $row->meta_key ] = $row->meta_value;
        }
        return $defaults;
    }

    public function ajax_save_meta() {
        check_ajax_referer( 'wp_rest', 'nonce' );
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Unauthorized', 403 );
        }
        wp_send_json_success();
    }

    public function render_dashboard() {
        $page = isset( $_GET['page'] ) ? sanitize_text_field( $_GET['page'] ) : 'smartrank-seo';
        ?>
        <div class="wrap smartrank-wrap">
            <div id="smartrank-admin-root" data-page="<?php echo esc_attr( $page ); ?>">
                <div class="smartrank-loading">
                    <div class="smartrank-spinner"></div>
                    <p><?php esc_html_e( 'Loading SmartRank AI SEO…', 'smartrank-ai-seo' ); ?></p>
                </div>
            </div>
        </div>
        <?php
        $dist = SMARTRANK_PLUGIN_DIR . 'admin/dist/index.html';
        if ( file_exists( $dist ) ) {
            echo '<script type="module" src="' . esc_url( SMARTRANK_PLUGIN_URL . 'admin/dist/assets/index.js' ) . '"></script>';
        }
    }
}
