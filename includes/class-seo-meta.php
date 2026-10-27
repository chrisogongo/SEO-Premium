<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_SEO_Meta {

    public function __construct() {
        add_action( 'wp_head', array( $this, 'output_meta_tags' ), 1 );
        add_filter( 'document_title_parts', array( $this, 'filter_title' ) );
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
        $post_id = is_singular() ? get_queried_object_id() : 0;
        $meta    = $this->get_post_meta( $post_id );

        if ( $meta['robots'] && $meta['robots'] !== 'index, follow' ) {
            echo '<meta name="robots" content="' . esc_attr( $meta['robots'] ) . '" />' . "\n";
        }
        if ( $meta['meta_description'] ) {
            echo '<meta name="description" content="' . esc_attr( $meta['meta_description'] ) . '" />' . "\n";
        }

        $canonical = $meta['canonical'] ? $meta['canonical'] : ( $post_id ? get_permalink( $post_id ) : home_url( $_SERVER['REQUEST_URI'] ?? '/' ) );
        echo '<link rel="canonical" href="' . esc_url( $canonical ) . '" />' . "\n";

        $og_title = $meta['og_title'] ?: ( $meta['seo_title'] ?: ( $post_id ? get_the_title( $post_id ) : get_bloginfo( 'name' ) ) );
        $og_desc  = $meta['og_description'] ?: $meta['meta_description'];
        $og_image = $meta['og_image'] ?: ( $post_id && has_post_thumbnail( $post_id ) ? wp_get_attachment_image_url( get_post_thumbnail_id( $post_id ), 'large' ) : '' );

        echo '<meta property="og:type" content="' . ( is_singular() ? 'article' : 'website' ) . '" />' . "\n";
        echo '<meta property="og:title" content="' . esc_attr( $og_title ) . '" />' . "\n";
        if ( $og_desc )  echo '<meta property="og:description" content="' . esc_attr( $og_desc ) . '" />' . "\n";
        echo '<meta property="og:url" content="' . esc_url( $canonical ) . '" />' . "\n";
        echo '<meta property="og:site_name" content="' . esc_attr( get_bloginfo( 'name' ) ) . '" />' . "\n";
        if ( $og_image ) echo '<meta property="og:image" content="' . esc_url( $og_image ) . '" />' . "\n";

        echo '<meta name="twitter:card" content="summary_large_image" />' . "\n";
        echo '<meta name="twitter:title" content="' . esc_attr( $og_title ) . '" />' . "\n";
        if ( $og_desc ) echo '<meta name="twitter:description" content="' . esc_attr( $og_desc ) . '" />' . "\n";
        if ( $og_image ) echo '<meta name="twitter:image" content="' . esc_url( $og_image ) . '" />' . "\n";
    }

    public function filter_title( $parts ) {
        $post_id = is_singular() ? get_queried_object_id() : 0;
        $meta    = $this->get_post_meta( $post_id );
        if ( $meta['seo_title'] ) {
            $parts['title'] = $meta['seo_title'];
        }
        return $parts;
    }
}
