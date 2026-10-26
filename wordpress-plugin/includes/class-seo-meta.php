<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_SEO_Meta {

    public function __construct() {
        add_action( 'wp_head', array( $this, 'output_meta_tags' ), 1 );
        add_filter( 'document_title_parts', array( $this, 'filter_title' ) );
        add_filter( 'wp_title', array( $this, 'filter_wp_title' ), 10, 3 );
    }

    public function get_post_meta( $post_id ) {
        global $wpdb;
        $defaults = array(
            'focus_keyphrase'  => '',
            'seo_title'        => '',
            'meta_description' => '',
            'canonical'        => '',
            'robots'           => 'index, follow',
            'og_title'         => '',
            'og_description'   => '',
            'og_image'         => '',
            'schema_type'      => '',
        );
        if ( ! $post_id ) return $defaults;
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

    public function output_meta_tags() {
        if ( is_admin() ) return;

        $post_id = $this->get_current_object_id();
        $meta    = $this->get_post_meta( $post_id );

        // Robots
        if ( $meta['robots'] && $meta['robots'] !== 'index, follow' ) {
            echo '<meta name="robots" content="' . esc_attr( $meta['robots'] ) . '" />' . "\n";
        }

        // Description
        if ( $meta['meta_description'] ) {
            echo '<meta name="description" content="' . esc_attr( $meta['meta_description'] ) . '" />' . "\n";
        }

        // Canonical
        $canonical = $meta['canonical'] ? $meta['canonical'] : $this->get_canonical_url( $post_id );
        if ( $canonical ) {
            echo '<link rel="canonical" href="' . esc_url( $canonical ) . '" />' . "\n";
        }

        // Open Graph
        $og_title = $meta['og_title'] ? $meta['og_title'] : $this->get_seo_title( $post_id );
        $og_desc  = $meta['og_description'] ? $meta['og_description'] : $meta['meta_description'];
        $og_image = $meta['og_image'] ? $meta['og_image'] : $this->get_featured_image_url( $post_id );

        echo '<meta property="og:type" content="' . esc_attr( $this->get_og_type() ) . '" />' . "\n";
        echo '<meta property="og:title" content="' . esc_attr( $og_title ) . '" />' . "\n";
        if ( $og_desc )  echo '<meta property="og:description" content="' . esc_attr( $og_desc ) . '" />' . "\n";
        echo '<meta property="og:url" content="' . esc_url( $canonical ) . '" />' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr( get_bloginfo( 'name' ) ) . '" />' . "\n";
        if ( $og_image ) echo '<meta property="og:image" content="' . esc_url( $og_image ) . '" />' . "\n";

        // Twitter
        echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr( $og_title ) . '" />' . "\n";
        if ( $og_desc ) echo '<meta name="twitter:description" content="' . esc_attr( $og_desc ) . '" />' . "\n";
        if ( $og_image ) echo '<meta name="twitter:image" content="' . esc_url( $og_image ) . '" />' . "\n";
    }

    public function filter_title( $parts ) {
        $post_id = $this->get_current_object_id();
        $meta    = $this->get_post_meta( $post_id );
        if ( $meta['seo_title'] ) {
            $parts['title'] = $meta['seo_title'];
        }
        return $parts;
    }

    public function filter_wp_title( $title, $sep, $seplocation ) {
        $post_id = $this->get_current_object_id();
        $meta    = $this->get_post_meta( $post_id );
        if ( $meta['seo_title'] ) {
            return $meta['seo_title'];
        }
        return $title;
    }

    private function get_seo_title( $post_id ) {
        $meta = $this->get_post_meta( $post_id );
        if ( $meta['seo_title'] ) return $meta['seo_title'];
        if ( $post_id ) return get_the_title( $post_id );
        return get_bloginfo( 'name' );
    }

    private function get_canonical_url( $post_id ) {
        if ( $post_id ) return get_permalink( $post_id );
        if ( is_home() ) return home_url( '/' );
        if ( is_archive() ) return get_archive_link_for_current();
        return home_url( $_SERVER['REQUEST_URI'] );
    }

    private function get_featured_image_url( $post_id ) {
        if ( ! $post_id || ! has_post_thumbnail( $post_id ) ) return '';
        $img = wp_get_attachment_image_url( get_post_thumbnail_id( $post_id ), 'large' );
        return $img ? $img : '';
    }

    private function get_og_type() {
        if ( is_singular() ) return 'article';
        if ( is_archive() ) return 'website';
        return 'website';
    }

    private function get_current_object_id() {
        if ( is_singular() ) return get_queried_object_id();
        return 0;
    }
}
