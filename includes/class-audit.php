<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Audit {

    private $issues = array();
    private $run_id;

    public function __construct() {
        add_action( 'smartrank_daily_audit', array( $this, 'run_scheduled' ) );
    }

    public function run_scheduled() {
        $this->run_full();
    }

    public function run_full() {
        global $wpdb;
        $this->run_id = uniqid( 'audit_' );
        $this->issues = array();
        $this->audit_posts();
        $this->audit_sitemap();
        $this->audit_robots();
        $this->audit_https();

        foreach ( $this->issues as $issue ) {
            $wpdb->insert( "{$wpdb->prefix}smartrank_audit", array(
                'run_id'      => $this->run_id,
                'url'         => $issue['url'],
                'issue_type'  => $issue['type'],
                'severity'    => $issue['severity'],
                'title'       => $issue['title'],
                'description' => $issue['description'],
                'fixable'     => $issue['fixable'] ? 1 : 0,
            ), array( '%s', '%s', '%s', '%s', '%s', '%s', '%d' ) );
        }

        return array(
            'run_id' => $this->run_id,
            'total'  => count( $this->issues ),
            'by_severity' => $this->count_severity(),
        );
    }

    private function audit_posts() {
        $posts = get_posts( array(
            'post_type'      => get_post_types( array( 'public' => true ) ),
            'post_status'    => 'publish',
            'posts_per_page' => 500,
            'fields'         => 'ids',
        ));
        foreach ( $posts as $post_id ) {
            $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
            $post = get_post( $post_id );
            $url  = get_permalink( $post_id );
            if ( empty( $meta['seo_title'] ) ) {
                $this->add( 'metadata', 'high', $url, 'Missing SEO title', 'No custom SEO title set.' );
            }
            if ( empty( $meta['meta_description'] ) ) {
                $this->add( 'metadata', 'high', $url, 'Missing meta description', 'No meta description set.' );
            }
            if ( empty( $meta['focus_keyphrase'] ) ) {
                $this->add( 'content', 'medium', $url, 'No focus keyphrase', 'No target keyword set.' );
            }
            $wc = str_word_count( wp_strip_all_tags( $post->post_content ) );
            if ( $wc < 300 && $post->post_type === 'post' ) {
                $this->add( 'content', 'medium', $url, 'Thin content', "Only {$wc} words." );
            }
            preg_match_all( '/<img[^>]+>/i', $post->post_content, $imgs );
            if ( ! empty( $imgs[0] ) ) {
                $missing = 0;
                foreach ( $imgs[0] as $img ) {
                    if ( ! preg_match( '/alt\s*=\s*["\']([^"\']+)["\']/i', $img ) ) $missing++;
                }
                if ( $missing > 0 ) {
                    $this->add( 'content', 'medium', $url, 'Images missing alt text', "{$missing} image(s) have no alt." );
                }
            }
        }
    }

    private function audit_sitemap() {
        $r = wp_remote_get( home_url( '/sitemap.xml' ), array( 'timeout' => 10 ) );
        if ( is_wp_error( $r ) || wp_remote_retrieve_response_code( $r ) !== 200 ) {
            $this->add( 'technical', 'critical', home_url( '/sitemap.xml' ), 'Sitemap not accessible', 'XML sitemap could not be reached.' );
        }
    }

    private function audit_robots() {
        $r = wp_remote_get( home_url( '/robots.txt' ), array( 'timeout' => 10 ) );
        if ( is_wp_error( $r ) ) {
            $this->add( 'technical', 'high', home_url( '/robots.txt' ), 'robots.txt not accessible', 'Search engines cannot read robots.txt.' );
        }
    }

    private function audit_https() {
        if ( ! is_ssl() ) {
            $this->add( 'technical', 'critical', home_url( '/' ), 'Site not using HTTPS', 'HTTPS is required for security and rankings.' );
        }
    }

    private function add( $type, $severity, $url, $title, $description ) {
        $this->issues[] = array( 'type' => $type, 'severity' => $severity, 'url' => $url, 'title' => $title, 'description' => $description, 'fixable' => $type === 'metadata' );
    }

    private function count_severity() {
        $c = array( 'critical' => 0, 'high' => 0, 'medium' => 0, 'low' => 0 );
        foreach ( $this->issues as $i ) if ( isset( $c[ $i['severity'] ] ) ) $c[ $i['severity'] ]++;
        return $c;
    }

    public function get_latest() {
        global $wpdb;
        $run_id = $wpdb->get_var( "SELECT run_id FROM {$wpdb->prefix}smartrank_audit ORDER BY created_at DESC LIMIT 1" );
        if ( ! $run_id ) return array();
        return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}smartrank_audit WHERE run_id = %s ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low')", $run_id ) );
    }
}
