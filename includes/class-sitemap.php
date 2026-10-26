<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Sitemap {

    public function __construct() {
        if ( ! smartrank_get_option( 'enable_sitemap', true ) ) return;
        add_action( 'init', array( $this, 'register_rules' ) );
        add_action( 'template_redirect', array( $this, 'render' ) );
        add_action( 'save_post', array( $this, 'ping' ), 20, 2 );
    }

    public function register_rules() {
        add_rewrite_rule( 'sitemap\.xml$', 'index.php?smartrank_sitemap=index', 'top' );
        add_rewrite_rule( 'sitemap-posts\.xml$', 'index.php?smartrank_sitemap=posts', 'top' );
        add_rewrite_rule( 'sitemap-pages\.xml$', 'index.php?smartrank_sitemap=pages', 'top' );
        add_rewrite_rule( 'sitemap-categories\.xml$', 'index.php?smartrank_sitemap=categories', 'top' );
        add_rewrite_rule( 'sitemap-products\.xml$', 'index.php?smartrank_sitemap=products', 'top' );
        add_rewrite_tag( '%smartrank_sitemap%', '([^&]+)' );
    }

    public function render() {
        $type = get_query_var( 'smartrank_sitemap' );
        if ( ! $type ) return;
        header( 'Content-Type: application/xml; charset=UTF-8' );
        header( 'X-Robots-Tag: noindex, follow' );
        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        if ( $type === 'index' ) {
            echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
            foreach ( array( 'posts', 'pages', 'categories' ) as $t ) {
                echo "  <sitemap>\n    <loc>" . esc_url( home_url( "/sitemap-{$t}.xml" ) ) . "</loc>\n    <lastmod>" . gmdate( 'c' ) . "</lastmod>\n  </sitemap>\n";
            }
            if ( post_type_exists( 'product' ) ) {
                echo "  <sitemap>\n    <loc>" . esc_url( home_url( '/sitemap-products.xml' ) ) . "</loc>\n    <lastmod>" . gmdate( 'c' ) . "</lastmod>\n  </sitemap>\n";
            }
            echo '</sitemapindex>';
        } else {
            echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
            if ( in_array( $type, array( 'posts', 'pages', 'products' ) ) ) {
                $pt = $type === 'products' ? 'product' : rtrim( $type, 's' );
                $posts = get_posts( array( 'post_type' => $pt, 'post_status' => 'publish', 'posts_per_page' => 50000, 'fields' => 'ids' ) );
                foreach ( $posts as $id ) {
                    echo "  <url>\n    <loc>" . esc_url( get_permalink( $id ) ) . "</loc>\n    <lastmod>" . get_the_modified_date( 'c', $id ) . "</lastmod>\n  </url>\n";
                }
            } elseif ( $type === 'categories' ) {
                $terms = get_terms( array( 'taxonomy' => 'category', 'hide_empty' => true ) );
                if ( ! is_wp_error( $terms ) ) {
                    foreach ( $terms as $t ) {
                        echo "  <url>\n    <loc>" . esc_url( get_term_link( $t ) ) . "</loc>\n  </url>\n";
                    }
                }
            }
            echo '</urlset>';
        }
        exit;
    }

    public function ping( $post_id, $post ) {
        if ( $post->post_status !== 'publish' ) return;
        wp_remote_get( 'https://www.google.com/ping?sitemap=' . urlencode( home_url( '/sitemap.xml' ) ), array( 'timeout' => 5 ) );
    }
}
