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

        // Organization (sitewide)
        $schemas[] = $this->get_organization_schema();

        // WebSite (sitewide)
        $schemas[] = $this->get_website_schema();

        // Breadcrumbs
        $schemas[] = $this->get_breadcrumb_schema();

        // Post-specific
        if ( is_singular() ) {
            $post_id   = get_queried_object_id();
            $post      = get_post( $post_id );
            $post_meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
            $type      = $post_meta['schema_type'] ? $post_meta['schema_type'] : $this->detect_schema_type( $post );

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
                case 'LocalBusiness':
                    $schemas[] = $this->get_local_business_schema();
                    break;
                case 'WebPage':
                default:
                    $schemas[] = $this->get_webpage_schema( $post );
                    break;
            }
        } elseif ( is_front_page() ) {
            $schemas[] = $this->get_webpage_schema( get_post( get_option( 'page_on_front' ) ) );
        }

        $schemas = array_filter( $schemas );
        if ( empty( $schemas ) ) return;

        echo "\n<!-- SmartRank AI SEO Schema -->\n";
        foreach ( $schemas as $schema ) {
            $json = wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT );
            if ( $json ) {
                echo '<script type="application/ld+json">' . $json . "</script>\n";
            }
        }
        echo "<!-- /SmartRank AI SEO Schema -->\n\n";
    }

    private function get_organization_schema() {
        $local = smartrank_get_option( 'local_settings', array() );
        return array(
            '@context'  => 'https://schema.org',
            '@type'     => 'Organization',
            'name'      => get_bloginfo( 'name' ),
            'url'       => home_url( '/' ),
            'logo'      => array(
                '@type' => 'ImageObject',
                'url'   => smartrank_get_option( 'logo_url', '' ) ?: get_site_icon_url( 512 ),
            ),
            'contactPoint' => array(
                '@type'         => 'ContactPoint',
                'telephone'     => isset( $local['phone'] ) ? $local['phone'] : '',
                'contactType'   => 'customer service',
                'availableLanguage' => array( get_locale() ),
            ),
        );
    }

    private function get_website_schema() {
        return array(
            '@context'          => 'https://schema.org',
            '@type'             => 'WebSite',
            'name'              => get_bloginfo( 'name' ),
            'url'               => home_url( '/' ),
            'potentialAction'   => array(
                '@type'       => 'SearchAction',
                'target'      => home_url( '/?s={search_term_string}' ),
                'query-input' => 'required name=search_term_string',
            ),
        );
    }

    private function get_breadcrumb_schema() {
        $crumbs = $this->get_breadcrumbs();
        if ( empty( $crumbs ) ) return null;

        $items = array();
        foreach ( $crumbs as $i => $crumb ) {
            $items[] = array(
                '@type'    => 'ListItem',
                'position' => $i + 1,
                'name'     => $crumb['label'],
                'item'     => $crumb['url'],
            );
        }

        return array(
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => $items,
        );
    }

    private function get_article_schema( $post, $type = 'Article' ) {
        $author_name = get_the_author_meta( 'display_name', $post->post_author );
        $schema = array(
            '@context'         => 'https://schema.org',
            '@type'            => $type,
            'headline'         => get_the_title( $post ),
            'datePublished'    => get_the_date( 'c', $post ),
            'dateModified'     => get_the_modified_date( 'c', $post ),
            'author'           => array(
                '@type' => 'Person',
                'name'  => $author_name,
            ),
            'publisher'        => array(
                '@type' => 'Organization',
                'name'  => get_bloginfo( 'name' ),
                'logo'  => array(
                    '@type' => 'ImageObject',
                    'url'   => get_site_icon_url( 512 ),
                ),
            ),
            'mainEntityOfPage' => array(
                '@type' => 'WebPage',
                '@id'   => get_permalink( $post ),
            ),
        );

        if ( has_post_thumbnail( $post ) ) {
            $schema['image'] = wp_get_attachment_image_url( get_post_thumbnail_id( $post ), 'full' );
        }

        $desc = ( new SmartRank_SEO_Meta() )->get_post_meta( $post->ID );
        if ( $desc['meta_description'] ) {
            $schema['description'] = $desc['meta_description'];
        }

        return $schema;
    }

    private function get_product_schema( $post ) {
        $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post->ID );
        $schema = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'Product',
            'name'        => get_the_title( $post ),
            'description' => wp_strip_all_tags( $post->post_content ),
            'url'         => get_permalink( $post ),
        );

        if ( has_post_thumbnail( $post ) ) {
            $schema['image'] = wp_get_attachment_image_url( get_post_thumbnail_id( $post ), 'full' );
        }

        // WooCommerce integration
        if ( function_exists( 'wc_get_product' ) ) {
            $wc = wc_get_product( $post->ID );
            if ( $wc ) {
                $schema['offers'] = array(
                    '@type'         => 'Offer',
                    'price'         => $wc->get_price(),
                    'priceCurrency' => get_woocommerce_currency(),
                    'availability'  => $wc->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    'url'           => get_permalink( $post ),
                );
                if ( $wc->get_sku() ) {
                    $schema['sku'] = $wc->get_sku();
                }
            }
        }

        return $schema;
    }

    private function get_faq_schema( $post ) {
        $content = $post->post_content;
        preg_match_all( '/<h[23][^>]*>(.*?)<\/h[23]>\s*<p[^>]*>(.*?)<\/p>/s', $content, $matches );

        if ( empty( $matches[1] ) ) return null;

        $entities = array();
        foreach ( $matches[1] as $i => $question ) {
            $entities[] = array(
                '@type'          => 'Question',
                'name'           => wp_strip_all_tags( $question ),
                'acceptedAnswer' => array(
                    '@type' => 'Answer',
                    'text'  => wp_strip_all_tags( $matches[2][ $i ] ),
                ),
            );
        }

        return array(
            '@context'    => 'https://schema.org',
            '@type'       => 'FAQPage',
            'mainEntity'  => $entities,
        );
    }

    private function get_webpage_schema( $post ) {
        if ( ! $post ) return null;
        return array(
            '@context' => 'https://schema.org',
            '@type'    => 'WebPage',
            'name'     => get_the_title( $post ),
            'url'      => get_permalink( $post ),
        );
    }

    private function get_local_business_schema() {
        $local = smartrank_get_option( 'local_settings', array() );
        if ( empty( $local ) ) return null;

        $schema = array(
            '@context'    => 'https://schema.org',
            '@type'       => 'LocalBusiness',
            'name'        => isset( $local['name'] ) ? $local['name'] : get_bloginfo( 'name' ),
            'address'     => array(
                '@type'           => 'PostalAddress',
                'streetAddress'   => isset( $local['address'] ) ? $local['address'] : '',
                'addressLocality' => isset( $local['city'] ) ? $local['city'] : '',
                'addressRegion'   => isset( $local['state'] ) ? $local['state'] : '',
                'postalCode'      => isset( $local['zip'] ) ? $local['zip'] : '',
                'addressCountry'  => isset( $local['country'] ) ? $local['country'] : '',
            ),
        );

        if ( ! empty( $local['phone'] ) ) $schema['telephone'] = $local['phone'];
        if ( ! empty( $local['email'] ) ) $schema['email'] = $local['email'];
        if ( ! empty( $local['lat'] ) && ! empty( $local['lng'] ) ) {
            $schema['geo'] = array(
                '@type'     => 'GeoCoordinates',
                'latitude'  => $local['lat'],
                'longitude' => $local['lng'],
            );
        }

        return $schema;
    }

    private function detect_schema_type( $post ) {
        if ( ! $post ) return 'WebPage';
        if ( $post->post_type === 'product' || ( function_exists( 'wc_get_product' ) && wc_get_product( $post->ID ) ) ) {
            return 'Product';
        }
        if ( $post->post_type === 'post' ) return 'BlogPosting';
        if ( in_array( $post->post_type, array( 'page', 'service' ), true ) ) return 'WebPage';
        return 'Article';
    }

    private function get_breadcrumbs() {
        $crumbs = array(
            array( 'label' => __( 'Home', 'smartrank-ai-seo' ), 'url' => home_url( '/' ) ),
        );

        if ( is_singular() ) {
            $post = get_queried_object();
            $tax  = get_object_taxonomies( $post->post_type );
            if ( ! empty( $tax ) ) {
                $terms = get_the_terms( $post, $tax[0] );
                if ( $terms && ! is_wp_error( $terms ) ) {
                    $term  = $terms[0];
                    $crumbs[] = array( 'label' => $term->name, 'url' => get_term_link( $term ) );
                }
            }
            $crumbs[] = array( 'label' => get_the_title( $post ), 'url' => get_permalink( $post ) );
        } elseif ( is_category() || is_tag() || is_tax() ) {
            $term = get_queried_object();
            $crumbs[] = array( 'label' => $term->name, 'url' => get_term_link( $term ) );
        }

        return $crumbs;
    }
}
