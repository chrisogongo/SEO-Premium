<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Rest_API {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $ns = 'smartrank/v1';

        // Dashboard
        register_rest_route( $ns, '/dashboard', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_dashboard' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // SEO Meta
        register_rest_route( $ns, '/meta/(?P<id>\d+)', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_meta' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'save_meta' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
        ));

        // Content Analysis
        register_rest_route( $ns, '/analyze/(?P<id>\d+)', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'analyze_content' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // AI Generation
        register_rest_route( $ns, '/ai/generate', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'ai_generate' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        register_rest_route( $ns, '/ai/meta-description/(?P<id>\d+)', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'ai_meta_description' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        register_rest_route( $ns, '/ai/seo-title/(?P<id>\d+)', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'ai_seo_title' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        register_rest_route( $ns, '/ai/content-brief', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'ai_content_brief' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // Audit
        register_rest_route( $ns, '/audit/run', array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'run_audit' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        register_rest_route( $ns, '/audit/results', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_audit_results' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // Redirects
        register_rest_route( $ns, '/redirects', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_redirects' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'create_redirect' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
        ));

        register_rest_route( $ns, '/redirects/(?P<id>\d+)', array(
            'methods'             => 'DELETE',
            'callback'            => array( $this, 'delete_redirect' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // Keywords
        register_rest_route( $ns, '/keywords', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_keywords' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'save_keyword' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
        ));

        // Settings
        register_rest_route( $ns, '/settings', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_settings' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'save_settings' ),
                'permission_callback' => array( $this, 'check_admin' ),
            ),
        ));

        // Audit Log
        register_rest_route( $ns, '/audit-log', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_audit_log' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // 404 Log
        register_rest_route( $ns, '/404-log', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_404_log' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));

        // Content pages for analysis
        register_rest_route( $ns, '/content', array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_content_list' ),
            'permission_callback' => array( $this, 'check_admin' ),
        ));
    }

    public function check_admin() {
        return current_user_can( 'manage_options' );
    }

    public function get_dashboard() {
        global $wpdb;

        $total_posts = wp_count_posts( 'post' );
        $total_pages = wp_count_posts( 'page' );
        $published   = ( $total_posts->publish ?? 0 ) + ( $total_pages->publish ?? 0 );

        // Count issues
        $run_id = $wpdb->get_var( "SELECT run_id FROM {$wpdb->prefix}smartrank_audit ORDER BY created_at DESC LIMIT 1" );
        $issues = 0;
        $by_severity = array( 'critical' => 0, 'high' => 0, 'medium' => 0, 'low' => 0 );
        if ( $run_id ) {
            $issues = $wpdb->get_var( $wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_audit WHERE run_id = %s", $run_id
            ));
            $rows = $wpdb->get_results( $wpdb->prepare(
                "SELECT severity, COUNT(*) as cnt FROM {$wpdb->prefix}smartrank_audit WHERE run_id = %s GROUP BY severity",
                $run_id
            ));
            foreach ( $rows as $r ) $by_severity[ $r->severity ] = intval( $r->cnt );
        }

        // Missing meta descriptions
        $missing_desc = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->prefix}smartrank_meta m ON p.ID = m.post_id AND m.meta_key = 'meta_description'
             WHERE p.post_status = 'publish' AND p.post_type IN ('post','page')
             AND (m.meta_value IS NULL OR m.meta_value = '')"
        );

        // Redirects count
        $redirects = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_redirects WHERE status = 'active'" );

        // 404 count
        $errors_404 = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_404_log" );

        // AI usage
        $ai_usage = intval( get_transient( 'smartrank_ai_usage_' . date( 'Y_m' ) ) );
        $ai_limit = intval( smartrank_get_option( 'ai_monthly_limit', 50 ) );

        // SEO health score
        $health = 100;
        if ( $published > 0 ) {
            $health -= min( 30, ( intval( $missing_desc ) / $published ) * 50 );
            $health -= min( 20, $by_severity['critical'] * 5 );
            $health -= min( 15, $by_severity['high'] * 3 );
            $health -= min( 10, $by_severity['medium'] * 1 );
        }
        $health = max( 0, round( $health ) );

        return rest_ensure_response( array(
            'health_score'    => $health,
            'pages_analyzed'  => $published,
            'total_issues'    => intval( $issues ),
            'missing_desc'    => intval( $missing_desc ),
            'issues_by_severity' => $by_severity,
            'active_redirects' => intval( $redirects ),
            'errors_404'       => intval( $errors_404 ),
            'ai_usage'         => $ai_usage,
            'ai_limit'         => $ai_limit,
            'ai_enabled'       => (bool) smartrank_get_option( 'ai_enabled', false ),
            'sitemap_active'   => (bool) smartrank_get_option( 'enable_sitemap', true ),
            'schema_active'    => (bool) smartrank_get_option( 'enable_schema', true ),
        ));
    }

    public function get_meta( $request ) {
        $post_id = intval( $request['id'] );
        $meta    = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $post    = get_post( $post_id );
        return rest_ensure_response( array(
            'post' => array(
                'id'       => $post->ID,
                'title'    => $post->post_title,
                'url'      => get_permalink( $post ),
                'type'     => $post->post_type,
                'status'   => $post->post_status,
                'content'  => wp_trim_words( wp_strip_all_tags( $post->post_content ), 100 ),
            ),
            'meta' => $meta,
        ));
    }

    public function save_meta( $request ) {
        $post_id = intval( $request['id'] );
        $params  = $request->get_json_params();
        $admin   = new SmartRank_Admin();
        $_POST   = array();
        foreach ( $params as $key => $value ) {
            $_POST[ $key ] = $value;
        }
        $_POST['smartrank_meta_nonce'] = wp_create_nonce( 'smartrank_meta_box' );
        $post = get_post( $post_id );
        $admin->save_post_meta( $post_id, $post );
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function analyze_content( $request ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) {
            return new WP_Error( 'ai_disabled', 'AI features are not enabled.', array( 'status' => 403 ) );
        }
        $ai     = new SmartRank_AI_Assistant();
        $result = $ai->analyze_content( intval( $request['id'] ) );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( $result );
    }

    public function ai_generate( $request ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) {
            return new WP_Error( 'ai_disabled', 'AI features are not enabled.', array( 'status' => 403 ) );
        }
        $params = $request->get_json_params();
        $ai     = new SmartRank_AI_Assistant();
        $result = $ai->generate( $params['prompt'] ?? '', $params );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'content' => $result ) );
    }

    public function ai_meta_description( $request ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) {
            return new WP_Error( 'ai_disabled', 'AI features are not enabled.', array( 'status' => 403 ) );
        }
        $ai     = new SmartRank_AI_Assistant();
        $result = $ai->generate_meta_description( intval( $request['id'] ) );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'content' => $result ) );
    }

    public function ai_seo_title( $request ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) {
            return new WP_Error( 'ai_disabled', 'AI features are not enabled.', array( 'status' => 403 ) );
        }
        $ai     = new SmartRank_AI_Assistant();
        $result = $ai->generate_seo_title( intval( $request['id'] ) );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'content' => $result ) );
    }

    public function ai_content_brief( $request ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) {
            return new WP_Error( 'ai_disabled', 'AI features are not enabled.', array( 'status' => 403 ) );
        }
        $params = $request->get_json_params();
        $ai     = new SmartRank_AI_Assistant();
        $result = $ai->generate_content_brief(
            $params['topic'] ?? '',
            $params['keyword'] ?? '',
            $params['intent'] ?? 'informational'
        );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( $result );
    }

    public function run_audit() {
        $audit  = new SmartRank_Audit();
        $result = $audit->run_full_audit();
        return rest_ensure_response( $result );
    }

    public function get_audit_results() {
        $audit = new SmartRank_Audit();
        return rest_ensure_response( $audit->get_latest_results() );
    }

    public function get_redirects() {
        $redirects = new SmartRank_Redirects();
        return rest_ensure_response( $redirects->get_redirects() );
    }

    public function create_redirect( $request ) {
        $params    = $request->get_json_params();
        $redirects = new SmartRank_Redirects();
        $result    = $redirects->add_redirect(
            $params['source'] ?? '',
            $params['target'] ?? '',
            $params['type'] ?? 301
        );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'id' => $result ) );
    }

    public function delete_redirect( $request ) {
        $redirects = new SmartRank_Redirects();
        $result    = $redirects->delete_redirect( intval( $request['id'] ) );
        return rest_ensure_response( array( 'success' => (bool) $result ) );
    }

    public function get_keywords() {
        global $wpdb;
        $results = $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}smartrank_keywords ORDER BY created_at DESC LIMIT 200"
        );
        return rest_ensure_response( $results );
    }

    public function save_keyword( $request ) {
        global $wpdb;
        $params = $request->get_json_params();
        $wpdb->insert(
            "{$wpdb->prefix}smartrank_keywords",
            array(
                'keyword'    => sanitize_text_field( $params['keyword'] ?? '' ),
                'post_id'    => intval( $params['post_id'] ?? 0 ) ?: null,
                'intent'     => sanitize_text_field( $params['intent'] ?? '' ),
                'volume'     => sanitize_text_field( $params['volume'] ?? '' ),
                'position'   => intval( $params['position'] ?? 0 ) ?: null,
                'group_name' => sanitize_text_field( $params['group_name'] ?? '' ),
            ),
            array( '%s', '%d', '%s', '%s', '%d', '%s' )
        );
        return rest_ensure_response( array( 'id' => $wpdb->insert_id ) );
    }

    public function get_settings() {
        return rest_ensure_response( get_option( 'smartrank_settings', array() ) );
    }

    public function save_settings( $request ) {
        $params = $request->get_json_params();
        $admin  = new SmartRank_Admin();
        $clean  = $admin->sanitize_settings( $params );
        update_option( 'smartrank_settings', $clean );
        return rest_ensure_response( $clean );
    }

    public function get_audit_log() {
        global $wpdb;
        return rest_ensure_response(
            $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_audit_log ORDER BY created_at DESC LIMIT 100" )
        );
    }

    public function get_404_log() {
        global $wpdb;
        return rest_ensure_response(
            $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_404_log ORDER BY last_hit DESC LIMIT 100" )
        );
    }

    public function get_content_list() {
        $posts = get_posts( array(
            'post_type'      => get_post_types( array( 'public' => true ) ),
            'post_status'    => 'publish',
            'posts_per_page' => 100,
        ));

        $results = array();
        foreach ( $posts as $post ) {
            $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post->ID );
            $results[] = array(
                'id'              => $post->ID,
                'title'           => $post->post_title,
                'url'             => get_permalink( $post ),
                'type'            => $post->post_type,
                'focus_keyphrase' => $meta['focus_keyphrase'],
                'seo_title'       => $meta['seo_title'],
                'meta_description'=> $meta['meta_description'],
                'word_count'      => str_word_count( wp_strip_all_tags( $post->post_content ) ),
            );
        }

        return rest_ensure_response( $results );
    }
}
