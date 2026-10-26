<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Audit {

    private $issues = array();
    private $run_id;

    public function __construct() {
        add_action( 'smartrank_daily_audit', array( $this, 'run_scheduled_audit' ) );
    }

    public function run_scheduled_audit() {
        $this->run_full_audit();
    }

    public function run_full_audit() {
        global $wpdb;
        $this->run_id = uniqid( 'audit_' );
        $this->issues = array();

        $this->audit_posts();
        $this->audit_sitemap();
        $this->audit_robots();
        $this->audit_https();
        $this->audit_images();

        // Store results
        foreach ( $this->issues as $issue ) {
            $wpdb->insert(
                "{$wpdb->prefix}smartrank_audit",
                array(
                    'run_id'      => $this->run_id,
                    'url'         => $issue['url'],
                    'issue_type'  => $issue['type'],
                    'severity'    => $issue['severity'],
                    'title'       => $issue['title'],
                    'description' => $issue['description'],
                    'fixable'     => $issue['fixable'] ? 1 : 0,
                ),
                array( '%s', '%s', '%s', '%s', '%s', '%s', '%d' )
            );
        }

        return array(
            'run_id' => $this->run_id,
            'total'  => count( $this->issues ),
            'by_severity' => $this->count_by_severity(),
        );
    }

    private function audit_posts() {
        $posts = get_posts( array(
            'post_type'      => get_post_types( array( 'public' => true ) ),
            'post_status'    => 'publish',
            'posts_per_page' => 500,
            'fields'         => 'ids',
        ));

        $titles = array();
        $descs  = array();

        foreach ( $posts as $post_id ) {
            $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
            $post = get_post( $post_id );
            $url  = get_permalink( $post_id );

            // Missing SEO title
            if ( empty( $meta['seo_title'] ) ) {
                $this->add_issue( 'metadata', 'high', $url,
                    'Missing SEO title',
                    'Page has no custom SEO title. Default title will be used which may not be optimized.'
                );
            } else {
                $len = strlen( $meta['seo_title'] );
                if ( $len > 60 ) {
                    $this->add_issue( 'metadata', 'medium', $url,
                        'SEO title too long',
                        "Title is {$len} characters. Recommended max is 60."
                    );
                }
                if ( isset( $titles[ $meta['seo_title'] ] ) ) {
                    $this->add_issue( 'metadata', 'high', $url,
                        'Duplicate SEO title',
                        'This title is identical to another page: ' . $titles[ $meta['seo_title'] ]
                    );
                }
                $titles[ $meta['seo_title'] ] = $url;
            }

            // Missing meta description
            if ( empty( $meta['meta_description'] ) ) {
                $this->add_issue( 'metadata', 'high', $url,
                    'Missing meta description',
                    'Page has no meta description. Search engines will generate a snippet automatically.'
                );
            } else {
                $len = strlen( $meta['meta_description'] );
                if ( $len > 160 ) {
                    $this->add_issue( 'metadata', 'medium', $url,
                        'Meta description too long',
                        "Description is {$len} characters. Recommended max is 160."
                    );
                }
                if ( isset( $descs[ $meta['meta_description'] ] ) ) {
                    $this->add_issue( 'metadata', 'high', $url,
                        'Duplicate meta description',
                        'This description is identical to another page.'
                    );
                }
                $descs[ $meta['meta_description'] ] = $url;
            }

            // Missing focus keyphrase
            if ( empty( $meta['focus_keyphrase'] ) ) {
                $this->add_issue( 'content', 'medium', $url,
                    'No focus keyphrase set',
                    'Page has no target keyword for optimization.'
                );
            }

            // Thin content
            $word_count = str_word_count( wp_strip_all_tags( $post->post_content ) );
            if ( $word_count < 300 && $post->post_type === 'post' ) {
                $this->add_issue( 'content', 'medium', $url,
                    'Thin content',
                    "Page has only {$word_count} words. Consider expanding content."
                );
            }

            // Image alt text check
            preg_match_all( '/<img[^>]+>/i', $post->post_content, $images );
            if ( ! empty( $images[0] ) ) {
                $missing_alt = 0;
                foreach ( $images[0] as $img ) {
                    if ( ! preg_match( '/alt\s*=\s*["\']([^"\']+)["\']/i', $img ) ) {
                        $missing_alt++;
                    }
                }
                if ( $missing_alt > 0 ) {
                    $this->add_issue( 'content', 'medium', $url,
                        'Images missing alt text',
                        "{$missing_alt} image(s) have no alt attribute."
                    );
                }
            }
        }
    }

    private function audit_sitemap() {
        $response = wp_remote_get( home_url( '/sitemap.xml' ), array( 'timeout' => 10 ) );
        if ( is_wp_error( $response ) ) {
            $this->add_issue( 'technical', 'critical', home_url( '/sitemap.xml' ),
                'XML Sitemap not accessible',
                'The sitemap could not be reached. Search engines need it to discover your pages.'
            );
            return;
        }
        $code = wp_remote_retrieve_response_code( $response );
        if ( $code !== 200 ) {
            $this->add_issue( 'technical', 'high', home_url( '/sitemap.xml' ),
                'XML Sitemap returns error',
                "Sitemap returned HTTP {$code}."
            );
        }
    }

    private function audit_robots() {
        $response = wp_remote_get( home_url( '/robots.txt' ), array( 'timeout' => 10 ) );
        if ( is_wp_error( $response ) ) {
            $this->add_issue( 'technical', 'high', home_url( '/robots.txt' ),
                'robots.txt not accessible',
                'Search engines cannot read your robots.txt file.'
            );
        }
    }

    private function audit_https() {
        if ( ! is_ssl() ) {
            $this->add_issue( 'technical', 'critical', home_url( '/' ),
                'Site not using HTTPS',
                'HTTPS is required for security and is a ranking factor.'
            );
        }
    }

    private function audit_images() {
        $attachments = get_posts( array(
            'post_type'      => 'attachment',
            'post_mime_type' => 'image',
            'posts_per_page' => 200,
            'fields'         => 'ids',
        ));

        $missing_alt = 0;
        foreach ( $attachments as $id ) {
            $alt = get_post_meta( $id, '_wp_attachment_image_alt', true );
            if ( empty( $alt ) ) $missing_alt++;
        }

        if ( $missing_alt > 0 ) {
            $this->add_issue( 'content', 'low', home_url( '/' ),
                'Images missing alt text',
                "{$missing_alt} image(s) in the media library have no alt text."
            );
        }
    }

    private function add_issue( $type, $severity, $url, $title, $description ) {
        $this->issues[] = array(
            'type'        => $type,
            'severity'    => $severity,
            'url'         => $url,
            'title'       => $title,
            'description' => $description,
            'fixable'     => in_array( $type, array( 'metadata' ), true ),
        );
    }

    private function count_by_severity() {
        $counts = array( 'critical' => 0, 'high' => 0, 'medium' => 0, 'low' => 0 );
        foreach ( $this->issues as $issue ) {
            if ( isset( $counts[ $issue['severity'] ] ) ) {
                $counts[ $issue['severity'] ]++;
            }
        }
        return $counts;
    }

    public function get_latest_results() {
        global $wpdb;
        $run_id = $wpdb->get_var(
            "SELECT run_id FROM {$wpdb->prefix}smartrank_audit ORDER BY created_at DESC LIMIT 1"
        );
        if ( ! $run_id ) return array();

        return $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}smartrank_audit WHERE run_id = %s ORDER BY
             FIELD(severity, 'critical', 'high', 'medium', 'low')",
            $run_id
        ));
    }
}
