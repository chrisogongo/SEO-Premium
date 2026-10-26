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

        $request = $this->get_request_path();
        if ( ! $request ) return;

        global $wpdb;
        $redirect = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}smartrank_redirects
             WHERE source = %s AND status = 'active'
             LIMIT 1",
            $request
        ));

        if ( ! $redirect ) return;

        // Loop detection
        if ( $this->is_redirect_loop( $redirect->target, 0, array() ) ) {
            return;
        }

        // Chain detection
        $chain = array( $request );
        $final = $this->resolve_redirect_chain( $redirect->target, $chain );

        wp_safe_redirect( $final, intval( $redirect->type ) );
        exit;
    }

    public function maybe_log_404() {
        if ( ! is_404() ) return;
        if ( ! smartrank_get_option( 'enable_404_monitor', true ) ) return;

        $url = $this->get_request_path();
        if ( ! $url ) return;

        $referrer = isset( $_SERVER['HTTP_REFERER'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : '';

        global $wpdb;
        $existing = $wpdb->get_var( $wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}smartrank_404_log WHERE url = %s",
            $url
        ));

        if ( $existing ) {
            $wpdb->query( $wpdb->prepare(
                "UPDATE {$wpdb->prefix}smartrank_404_log
                 SET hits = hits + 1, last_hit = NOW(), referrer = %s
                 WHERE id = %d",
                $referrer, $existing
            ));
        } else {
            $wpdb->insert(
                "{$wpdb->prefix}smartrank_404_log",
                array( 'url' => $url, 'referrer' => $referrer, 'hits' => 1 ),
                array( '%s', '%s', '%d' )
            );
        }
    }

    public function add_redirect( $source, $target, $type = 301 ) {
        global $wpdb;

        $source = $this->sanitize_path( $source );
        $target = esc_url_raw( $target );
        $type   = in_array( intval( $type ), array( 301, 302, 307 ), true ) ? intval( $type ) : 301;

        // Validate
        if ( empty( $source ) || empty( $target ) ) {
            return new WP_Error( 'invalid', __( 'Source and target are required.', 'smartrank-ai-seo' ) );
        }

        // Loop check
        if ( $source === $this->get_path_from_url( $target ) ) {
            return new WP_Error( 'loop', __( 'Source and target cannot be the same.', 'smartrank-ai-seo' ) );
        }

        // Check for existing
        $existing = $wpdb->get_var( $wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}smartrank_redirects WHERE source = %s",
            $source
        ));

        if ( $existing ) {
            $wpdb->update(
                "{$wpdb->prefix}smartrank_redirects",
                array( 'target' => $target, 'type' => $type, 'status' => 'active' ),
                array( 'id' => $existing ),
                array( '%s', '%d', '%s' ),
                array( '%d' )
            );
            $id = $existing;
        } else {
            $wpdb->insert(
                "{$wpdb->prefix}smartrank_redirects",
                array( 'source' => $source, 'target' => $target, 'type' => $type ),
                array( '%s', '%s', '%d' )
            );
            $id = $wpdb->insert_id;
        }

        self::log_action( 'created', 'redirect', $id, "Redirect: {$source} → {$target} ({$type})" );

        return $id;
    }

    public function delete_redirect( $id ) {
        global $wpdb;
        $redirect = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}smartrank_redirects WHERE id = %d",
            $id
        ));
        if ( ! $redirect ) return false;

        self::log_action( 'deleted', 'redirect', $id, "Redirect removed: {$redirect->source} → {$redirect->target}" );

        return $wpdb->delete( "{$wpdb->prefix}smartrank_redirects", array( 'id' => $id ), array( '%d' ) );
    }

    public function get_redirects( $args = array() ) {
        global $wpdb;
        $defaults = array( 'status' => 'all', 'limit' => 100, 'offset' => 0 );
        $args     = wp_parse_args( $args, $defaults );

        $where = '1=1';
        $params = array();
        if ( $args['status'] !== 'all' ) {
            $where   .= ' AND status = %s';
            $params[] = $args['status'];
        }

        $params[] = $args['limit'];
        $params[] = $args['offset'];

        return $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}smartrank_redirects WHERE {$where} ORDER BY created_at DESC LIMIT %d OFFSET %d",
            ...$params
        ));
    }

    public function import_csv( $file_path ) {
        if ( ! file_exists( $file_path ) ) {
            return new WP_Error( 'not_found', __( 'File not found.', 'smartrank-ai-seo' ) );
        }

        $handle  = fopen( $file_path, 'r' );
        $created = 0;
        $errors  = array();
        $row     = 0;

        while ( ( $data = fgetcsv( $handle ) ) !== false ) {
            $row++;
            if ( $row === 1 ) continue; // Skip header

            if ( count( $data ) < 2 ) {
                $errors[] = "Row {$row}: insufficient columns";
                continue;
            }

            $source = trim( $data[0] );
            $target = trim( $data[1] );
            $type   = isset( $data[2] ) ? intval( $data[2] ) : 301;

            $result = $this->add_redirect( $source, $target, $type );
            if ( is_wp_error( $result ) ) {
                $errors[] = "Row {$row}: " . $result->get_error_message();
            } else {
                $created++;
            }
        }

        fclose( $handle );
        return array( 'created' => $created, 'errors' => $errors );
    }

    private function get_request_path() {
        $uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
        $path = wp_parse_url( $uri, PHP_URL_PATH );
        return $path ? rtrim( $path, '/' ) : '';
    }

    private function sanitize_path( $path ) {
        $path = wp_parse_url( $path, PHP_URL_PATH );
        return $path ? '/' . ltrim( $path, '/' ) : '';
    }

    private function get_path_from_url( $url ) {
        $path = wp_parse_url( $url, PHP_URL_PATH );
        return $path ? rtrim( $path, '/' ) : '';
    }

    private function is_redirect_loop( $target, $depth = 0, $visited = array() ) {
        if ( $depth > 10 ) return true;
        $path = $this->get_path_from_url( $target );
        if ( in_array( $path, $visited, true ) ) return true;

        global $wpdb;
        $next = $wpdb->get_row( $wpdb->prepare(
            "SELECT target FROM {$wpdb->prefix}smartrank_redirects WHERE source = %s AND status = 'active'",
            $path
        ));

        if ( ! $next ) return false;

        $visited[] = $path;
        return $this->is_redirect_loop( $next->target, $depth + 1, $visited );
    }

    private function resolve_redirect_chain( $target, $chain, $depth = 0 ) {
        if ( $depth > 10 ) return $target;
        $path = $this->get_path_from_url( $target );
        if ( in_array( $path, $chain, true ) ) return $target;

        global $wpdb;
        $next = $wpdb->get_row( $wpdb->prepare(
            "SELECT target FROM {$wpdb->prefix}smartrank_redirects WHERE source = %s AND status = 'active'",
            $path
        ));

        if ( ! $next ) return $target;

        $chain[] = $path;
        return $this->resolve_redirect_chain( $next->target, $chain, $depth + 1 );
    }

    public static function log_action( $action, $target_type, $target_id, $description ) {
        global $wpdb;
        $wpdb->insert(
            "{$wpdb->prefix}smartrank_audit_log",
            array(
                'user_id'     => get_current_user_id(),
                'action'      => $action,
                'target_type' => $target_type,
                'target_id'   => $target_id,
                'description' => $description,
            ),
            array( '%d', '%s', '%s', '%d', '%s' )
        );
    }
}
