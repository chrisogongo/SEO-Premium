<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Redirects {

    public function __construct() {
        if ( ! smartrank_get_option( 'enable_redirects', true ) ) return;
        add_action( 'template_redirect', array( $this, 'maybe_redirect' ), 1 );
        add_action( 'template_redirect', array( $this, 'maybe_log_404' ), 99 );
    }

    public function maybe_redirect() {
        if ( is_admin() ) return;
        $request = rtrim( wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) ?: '/', '/' );
        if ( ! $request ) return;
        global $wpdb;
        $redirect = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}smartrank_redirects WHERE source = %s AND status = 'active' LIMIT 1",
            $request
        ));
        if ( ! $redirect ) return;
        if ( $this->is_loop( $redirect->target, array( $request ) ) ) return;
        $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->prefix}smartrank_redirects SET hits = hits + 1 WHERE id = %d", $redirect->id ) );
        wp_safe_redirect( $redirect->target, intval( $redirect->type ) );
        exit;
    }

    public function maybe_log_404() {
        if ( ! is_404() || ! smartrank_get_option( 'enable_404_monitor', true ) ) return;
        $url = rtrim( wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) ?: '/', '/' );
        if ( ! $url ) return;
        $referrer = isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : '';
        global $wpdb;
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}smartrank_404_log WHERE url = %s", $url ) );
        if ( $existing ) {
            $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->prefix}smartrank_404_log SET hits = hits + 1, last_hit = NOW(), referrer = %s WHERE id = %d", $referrer, $existing ) );
        } else {
            $wpdb->insert( "{$wpdb->prefix}smartrank_404_log", array( 'url' => $url, 'referrer' => $referrer, 'hits' => 1 ), array( '%s', '%s', '%d' ) );
        }
    }

    public function add_redirect( $source, $target, $type = 301 ) {
        global $wpdb;
        $source = '/' . ltrim( wp_parse_url( $source, PHP_URL_PATH ) ?: '', '/' );
        $type   = in_array( intval( $type ), array( 301, 302, 307 ) ) ? intval( $type ) : 301;
        if ( empty( $source ) || empty( $target ) ) return new WP_Error( 'invalid', 'Source and target required.' );
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}smartrank_redirects WHERE source = %s", $source ) );
        if ( $existing ) {
            $wpdb->update( "{$wpdb->prefix}smartrank_redirects", array( 'target' => $target, 'type' => $type, 'status' => 'active' ), array( 'id' => $existing ) );
            return $existing;
        }
        $wpdb->insert( "{$wpdb->prefix}smartrank_redirects", array( 'source' => $source, 'target' => $target, 'type' => $type ), array( '%s', '%s', '%d' ) );
        return $wpdb->insert_id;
    }

    public function delete_redirect( $id ) {
        global $wpdb;
        return $wpdb->delete( "{$wpdb->prefix}smartrank_redirects", array( 'id' => $id ), array( '%d' ) );
    }

    public function get_redirects( $limit = 100 ) {
        global $wpdb;
        return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}smartrank_redirects ORDER BY created_at DESC LIMIT %d", $limit ) );
    }

    private function is_loop( $target, $visited, $depth = 0 ) {
        if ( $depth > 10 ) return true;
        $path = rtrim( wp_parse_url( $target, PHP_URL_PATH ) ?: '/', '/' );
        if ( in_array( $path, $visited ) ) return true;
        global $wpdb;
        $next = $wpdb->get_row( $wpdb->prepare( "SELECT target FROM {$wpdb->prefix}smartrank_redirects WHERE source = %s AND status = 'active'", $path ) );
        if ( ! $next ) return false;
        $visited[] = $path;
        return $this->is_loop( $next->target, $visited, $depth + 1 );
    }
}
