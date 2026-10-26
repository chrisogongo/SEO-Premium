<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Rest_API {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $ns = 'smartrank/v1';
        register_rest_route( $ns, '/dashboard', array( 'methods' => 'GET', 'callback' => array( $this, 'get_dashboard' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/meta/(?P<id>\d+)', array(
            array( 'methods' => 'GET', 'callback' => array( $this, 'get_meta' ), 'permission_callback' => array( $this, 'check_admin' ) ),
            array( 'methods' => 'POST', 'callback' => array( $this, 'save_meta' ), 'permission_callback' => array( $this, 'check_admin' ) ),
        ));
        register_rest_route( $ns, '/analyze/(?P<id>\d+)', array( 'methods' => 'POST', 'callback' => array( $this, 'analyze' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/ai/meta-description/(?P<id>\d+)', array( 'methods' => 'POST', 'callback' => array( $this, 'ai_meta' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/ai/seo-title/(?P<id>\d+)', array( 'methods' => 'POST', 'callback' => array( $this, 'ai_title' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/audit/run', array( 'methods' => 'POST', 'callback' => array( $this, 'run_audit' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/audit/results', array( 'methods' => 'GET', 'callback' => array( $this, 'get_audit' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/redirects', array(
            array( 'methods' => 'GET', 'callback' => array( $this, 'get_redirects' ), 'permission_callback' => array( $this, 'check_admin' ) ),
            array( 'methods' => 'POST', 'callback' => array( $this, 'add_redirect' ), 'permission_callback' => array( $this, 'check_admin' ) ),
        ));
        register_rest_route( $ns, '/redirects/(?P<id>\d+)', array( 'methods' => 'DELETE', 'callback' => array( $this, 'delete_redirect' ), 'permission_callback' => array( $this, 'check_admin' ) ) );
        register_rest_route( $ns, '/keywords', array(
            array( 'methods' => 'GET', 'callback' => array( $this, 'get_keywords' ), 'permission_callback' => array( $this, 'check_admin' ) ),
            array( 'methods' => 'POST', 'callback' => array( $this, 'save_keyword' ), 'permission_callback' => array( $this, 'check_admin' ) ),
        ));
        register_rest_route( $ns, '/settings', array(
            array( 'methods' => 'GET', 'callback' => array( $this, 'get_settings' ), 'permission_callback' => array( $this, 'check_admin' ) ),
            array( 'methods' => 'POST', 'callback' => array( $this, 'save_settings' ), 'permission_callback' => array( $this, 'check_admin' ) ),
        ));
    }

    public function check_admin() { return current_user_can( 'manage_options' ); }

    public function get_dashboard() {
        global $wpdb;
        $published = wp_count_posts( 'post' )->publish + wp_count_posts( 'page' )->publish;
        $missing   = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->posts} p LEFT JOIN {$wpdb->prefix}smartrank_meta m ON p.ID = m.post_id AND m.meta_key = 'meta_description' WHERE p.post_status = 'publish' AND p.post_type IN ('post','page') AND (m.meta_value IS NULL OR m.meta_value = '')" );
        $redirects = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_redirects WHERE status = 'active'" );
        $errors404 = $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}smartrank_404_log" );
        $health    = max( 0, round( 100 - ( $published > 0 ? ( $missing / $published ) * 50 : 0 ) ) );
        return rest_ensure_response( array(
            'health_score' => $health, 'pages' => $published, 'missing_desc' => intval( $missing ),
            'redirects' => intval( $redirects ), 'errors_404' => intval( $errors404 ),
            'ai_enabled' => (bool) smartrank_get_option( 'ai_enabled' ),
        ));
    }

    public function get_meta( $r ) {
        $id   = intval( $r['id'] );
        $post = get_post( $id );
        return rest_ensure_response( array( 'post' => array( 'id' => $post->ID, 'title' => $post->post_title, 'url' => get_permalink( $post ) ), 'meta' => ( new SmartRank_SEO_Meta() )->get_post_meta( $id ) ) );
    }

    public function save_meta( $r ) {
        $id     = intval( $r['id'] );
        $params = $r->get_json_params();
        global $wpdb;
        foreach ( array( 'focus_keyphrase', 'seo_title', 'meta_description', 'canonical', 'robots', 'schema_type' ) as $f ) {
            if ( ! isset( $params[ 'smartrank_' . $f ] ) ) continue;
            $v = sanitize_text_field( $params[ 'smartrank_' . $f ] );
            $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}smartrank_meta WHERE post_id = %d AND meta_key = %s", $id, $f ) );
            if ( $existing ) $wpdb->update( "{$wpdb->prefix}smartrank_meta", array( 'meta_value' => $v ), array( 'post_id' => $id, 'meta_key' => $f ) );
            else $wpdb->insert( "{$wpdb->prefix}smartrank_meta", array( 'post_id' => $id, 'meta_key' => $f, 'meta_value' => $v ) );
        }
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function analyze( $r ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) return new WP_Error( 'disabled', 'AI disabled.', array( 'status' => 403 ) );
        $result = ( new SmartRank_AI_Assistant() )->analyze_content( intval( $r['id'] ) );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( $result );
    }

    public function ai_meta( $r ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) return new WP_Error( 'disabled', 'AI disabled.', array( 'status' => 403 ) );
        $result = ( new SmartRank_AI_Assistant() )->generate_meta_description( intval( $r['id'] ) );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'content' => $result ) );
    }

    public function ai_title( $r ) {
        if ( ! smartrank_get_option( 'ai_enabled' ) ) return new WP_Error( 'disabled', 'AI disabled.', array( 'status' => 403 ) );
        $result = ( new SmartRank_AI_Assistant() )->generate_seo_title( intval( $r['id'] ) );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'content' => $result ) );
    }

    public function run_audit() { return rest_ensure_response( ( new SmartRank_Audit() )->run_full() ); }
    public function get_audit() { return rest_ensure_response( ( new SmartRank_Audit() )->get_latest() ); }
    public function get_redirects() { return rest_ensure_response( ( new SmartRank_Redirects() )->get_redirects() ); }

    public function add_redirect( $r ) {
        $p = $r->get_json_params();
        $result = ( new SmartRank_Redirects() )->add_redirect( $p['source'] ?? '', $p['target'] ?? '', $p['type'] ?? 301 );
        if ( is_wp_error( $result ) ) return $result;
        return rest_ensure_response( array( 'id' => $result ) );
    }

    public function delete_redirect( $r ) {
        return rest_ensure_response( array( 'success' => (bool) ( new SmartRank_Redirects() )->delete_redirect( intval( $r['id'] ) ) ) );
    }

    public function get_keywords() {
        global $wpdb;
        return rest_ensure_response( $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}smartrank_keywords ORDER BY created_at DESC LIMIT 200" ) );
    }

    public function save_keyword( $r ) {
        global $wpdb;
        $p = $r->get_json_params();
        $wpdb->insert( "{$wpdb->prefix}smartrank_keywords", array(
            'keyword' => sanitize_text_field( $p['keyword'] ?? '' ),
            'intent'  => sanitize_text_field( $p['intent'] ?? '' ),
            'group_name' => sanitize_text_field( $p['group_name'] ?? '' ),
        ));
        return rest_ensure_response( array( 'id' => $wpdb->insert_id ) );
    }

    public function get_settings() { return rest_ensure_response( get_option( 'smartrank_settings', array() ) ); }

    public function save_settings( $r ) {
        $p = $r->get_json_params();
        $admin = new SmartRank_Admin();
        update_option( 'smartrank_settings', $admin->sanitize_settings( $p ) );
        return rest_ensure_response( get_option( 'smartrank_settings' ) );
    }
}
