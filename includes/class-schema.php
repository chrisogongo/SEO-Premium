<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Schema {

    public function __construct() {
        if ( smartrank_get_option( 'enable_schema', true ) ) {
            add_action( 'wp_head', array( $this, 'output_schema' ), 5 );
        }
    }

    public function output_schema() {
        if ( is_admin() ) return;
        $schemas = array();
        $schemas[] = $this->get_organization_schema();
        $schemas[] = $this->get_website_schema();
        $schemas[] = $this->get_breadcrumb_schema();

        if ( is_singular() ) {
            $post_id = get_queried_object_id();
            $post    = get_post( $post_id );
            $meta    = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
            $type    = $meta['schema_type'] ?: $this->detect_type( $post );
            switch ( $type ) {
                case 'Article':
                case 'BlogPosting':
                    $schemas[] = $this->get_article_schema( $post, $type );
                    break;
                case 'Product':
                    $schemas[] = $this->get_product_schema( $post );
                    break;
                case 'FAQPage':
                    $schemas[] = $this->get_faq_schema( $post );
                    break;
                default:
                    $schemas[] = $this->get_webpage_schema( $post );
            }
        }

        $schemas = array_filter( $schemas );
        if ( empty( $schemas ) ) return;

        echo "\n<!-- SmartRank AI SEO Schema -->\n";
        foreach ( $schemas as $schema ) {
            $json = wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT );
            if ( $json ) echo '<script type="application/ld+json">' . $json . "</script>\n";
        }
        echo "<!-- /SmartRank AI SEO Schema -->\n\n";
    }

    private function get_organization_schema() {
        return array(
            '@context' => 'https://schema.org',
            '@type'    => 'Organization',
            'name'     => get_bloginfo( 'name' ),
            'url'      => home_url( '/' ),
            'logo'     => array( '@type' => 'ImageObject', 'url' => get_site_icon_url( 512 ) ),
        );
    }

    private function get_website_schema() {
        return array(
            '@context'        => 'https://schema.org',
            '@type'           => 'WebSite',
            'name'            => get_bloginfo( 'name' ),
            'url'             => home_url( '/' ),
            'potentialAction' => array(
                '@type'       => 'SearchAction',
                'target'      => home_url( '/?s={search_term_string}' ),
                'query-input' => 'required name=search_term_string',
            ),
        );
    }

    private function get_breadcrumb_schema() {
        $crumbs = array( array( 'label' => 'Home', 'url' => home_url( '/' ) ) );
        if ( is_singular() ) {
            $crumbs[] = array( 'label' => get_the_title(), 'url' => get_permalink() );
        } elseif ( is_category() || is_tag() ) {
            $term = get_queried_object();
            $crumbs[] = array( 'label' => $term->name, 'url' => get_term_link( $term ) );
        }
        $items = array();
        foreach ( $crumbs as $i => $c ) {
            $items[] = array( '@type' => 'ListItem', 'position' => $i + 1, 'name' => $c['label'], 'item' => $c['url'] );
        }
        return array( '@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $items );
    }

    private function get_article_schema( $post, $type = 'Article' ) {
        $schema = array(
            '@context'         => 'https://schema.org',
            '@type'            => $type,
            'headline'         => get_the_title( $post ),
            'datePublished'    => get_the_date( 'c', $post ),
            'dateModified'     => get_the_modified_date( 'c', $post ),
            'author'           => array( '@type' => 'Person', 'name' => get_the_author_meta( 'display_name', $post->post_author ) ),
            'publisher'        => array( '@type' => 'Organization', 'name' => get_bloginfo( 'name' ), 'logo' => array( '@type' => 'ImageObject', 'url' => get_site_icon_url( 512 ) ) ),
            'mainEntityOfPage' => array( '@type' => 'WebPage', '@id' => get_permalink( $post ) ),
        );
        if ( has_post_thumbnail( $post ) ) $schema['image'] = wp_get_attachment_image_url( get_post_thumbnail_id( $post ), 'full' );
        return $schema;
    }

    private function get_product_schema( $post ) {
        $schema = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'Product',
            'name'        => get_the_title( $post ),
            'description' => wp_trim_words( wp_strip_all_tags( $post->post_content ), 50 ),
            'url'         => get_permalink( $post ),
        );
        if ( has_post_thumbnail( $post ) ) $schema['image'] = wp_get_attachment_image_url( get_post_thumbnail_id( $post ), 'full' );
        if ( function_exists( 'wc_get_product' ) ) {
            $wc = wc_get_product( $post->ID );
            if ( $wc ) {
                $schema['offers'] = array(
                    '@type'         => 'Offer',
                    'price'         => $wc->get_price(),
                    'priceCurrency' => get_woocommerce_currency(),
                    'availability'  => $wc->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                );
            }
        }
        return $schema;
    }

    private function get_faq_schema( $post ) {
        preg_match_all( '/<h[23][^>]*>(.*?)<\/h[23]>\s*<p[^>]*>(.*?)<\/p>/s', $post->post_content, $matches );
        if ( empty( $matches[1] ) ) return null;
        $entities = array();
        foreach ( $matches[1] as $i => $q ) {
            $entities[] = array( '@type' => 'Question', 'name' => wp_strip_all_tags( $q ), 'acceptedAnswer' => array( '@type' => 'Answer', 'text' => wp_strip_all_tags( $matches[2][$i] ) ) );
        }
        return array( '@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => $entities );
    }

    private function get_webpage_schema( $post ) {
        if ( ! $post ) return null;
        return array( '@context' => 'https://schema.org', '@type' => 'WebPage', 'name' => get_the_title( $post ), 'url' => get_permalink( $post ) );
    }

    private function detect_type( $post ) {
        if ( ! $post ) return 'WebPage';
        if ( $post->post_type === 'product' ) return 'Product';
        if ( $post->post_type === 'post' ) return 'BlogPosting';
        return 'WebPage';
    }
}
