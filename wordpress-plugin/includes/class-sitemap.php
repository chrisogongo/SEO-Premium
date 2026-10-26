<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Sitemap {

    public function __construct() {
        if ( ! smartrank_get_option( 'enable_sitemap', true ) ) return;
        add_action( 'init', array( $this, 'register_rewrite_rules' ) );
        add_action( 'template_redirect', array( $this, 'render_sitemap' ) );
        add_action( 'save_post', array( $this, 'ping_search_engines' ), 20, 2 );
        add_action( 'transition_post_status', array( $this, 'on_status_change' ), 10, 3 );
    }

    public function register_rewrite_rules() {
        add_rewrite_rule( 'sitemap\.xml$', 'index.php?smartrank_sitemap=index', 'top' );
        add_rewrite_rule( 'sitemap-posts\.xml$', 'index.php?smartrank_sitemap=posts', 'top' );
        add_rewrite_rule( 'sitemap-pages\.xml$', 'index.php?smartrank_sitemap=pages', 'top' );
        add_rewrite_rule( 'sitemap-categories\.xml$', 'index.php?smartrank_sitemap=categories', 'top' );
        add_rewrite_rule( 'sitemap-products\.xml$', 'index.php?smartrank_sitemap=products', 'top' );
        add_rewrite_rule( 'sitemap-authors\.xml$', 'index.php?smartrank_sitemap=authors', 'top' );
        add_rewrite_rule( 'sitemap-images\.xml$', 'index.php?smartrank_sitemap=images', 'top' );

        add_rewrite_tag( '%smartrank_sitemap%', '([^&]+)' );
    }

    public function render_sitemap() {
        $type = get_query_var( 'smartrank_sitemap' );
        if ( ! $type ) return;

        header( 'Content-Type: application/xml; charset=UTF-8' );
        header( 'X-Robots-Tag: noindex, follow' );

        echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";

        if ( $type === 'index' ) {
            $this->render_index();
        } else {
            $this->render_sitemap_type( $type );
        }

        exit;
    }

    private function render_index() {
        echo '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        $types = array( 'posts', 'pages', 'categories' );
        if ( post_type_exists( 'product' ) ) {
            $types[] = 'products';
        }
        $types[] = 'authors';

        foreach ( $types as $type ) {
            echo '  <sitemap>' . "\n";
            echo '    <loc>' . esc_url( home_url( "/sitemap-{$type}.xml" ) ) . '</loc>' . "\n";
            echo '    <lastmod>' . esc_html( gmdate( 'c' ) ) . '</lastmod>' . "\n";
            echo '  </sitemap>' . "\n";
        }

        echo '</sitemapindex>';
    }

    private function render_sitemap_type( $type ) {
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' .
             ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

        switch ( $type ) {
            case 'posts':
                $this->render_post_urls( 'post' );
                break;
            case 'pages':
                $this->render_post_urls( 'page' );
                break;
            case 'categories':
                $this->render_taxonomy_urls( 'category' );
                break;
            case 'products':
                $this->render_post_urls( 'product' );
                break;
            case 'authors':
                $this->render_author_urls();
                break;
            case 'images':
                $this->render_image_urls();
                break;
        }

        echo '</urlset>';
    }

    private function render_post_urls( $post_type ) {
        global $wpdb;

        $posts = $wpdb->get_results( $wpdb->prepare(
            "SELECT p.ID, p.post_modified_gmt
             FROM {$wpdb->posts} p
             LEFT JOIN {$wpdb->prefix}smartrank_meta m
               ON p.ID = m.post_id AND m.meta_key = 'robots'
             WHERE p.post_type = %s
               AND p.post_status = 'publish'
               AND (m.meta_value IS NULL OR m.meta_value NOT LIKE '%%noindex%%')
             ORDER BY p.post_modified_gmt DESC
             LIMIT 50000",
            $post_type
        ));

        foreach ( $posts as $post ) {
            $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post->ID );
            $url  = $meta['canonical'] ? $meta['canonical'] : get_permalink( $post->ID );

            echo '  <url>' . "\n";
            echo '    <loc>' . esc_url( $url ) . '</loc>' . "\n";
            echo '    <lastmod>' . esc_html( mysql2date( 'c', $post->post_modified_gmt ) ) . '</lastmod>' . "\n";
            echo '    <changefreq>weekly</changefreq>' . "\n";
            echo '    <priority>' . ( $post_type === 'page' ? '0.8' : '0.6' ) . '</priority>' . "\n";
            echo '  </url>' . "\n";
        }
    }

    private function render_taxonomy_urls( $taxonomy ) {
        $terms = get_terms( array(
            'taxonomy'   => $taxonomy,
            'hide_empty' => true,
            'number'     => 1000,
        ));

        if ( is_wp_error( $terms ) ) return;

        foreach ( $terms as $term ) {
            echo '  <url>' . "\n";
            echo '    <loc>' . esc_url( get_term_link( $term ) ) . '</loc>' . "\n";
            echo '    <lastmod>' . esc_html( gmdate( 'c' ) ) . '</lastmod>' . "\n";
            echo '    <changefreq>weekly</changefreq>' . "\n";
            echo '    <priority>0.5</priority>' . "\n";
            echo '  </url>' . "\n";
        }
    }

    private function render_author_urls() {
        $authors = get_users( array(
            'has_published_posts' => true,
            'number'              => 100,
        ));

        foreach ( $authors as $author ) {
            echo '  <url>' . "\n";
            echo '    <loc>' . esc_url( get_author_posts_url( $author->ID ) ) . '</loc>' . "\n";
            echo '    <changefreq>monthly</changefreq>' . "\n";
            echo '    <priority>0.3</priority>' . "\n";
            echo '  </url>' . "\n";
        }
    }

    private function render_image_urls() {
        global $wpdb;
        $images = $wpdb->get_results(
            "SELECT p.ID, p.guid, p.post_title, p.post_excerpt, p.post_parent
             FROM {$wpdb->posts} p
             WHERE p.post_type = 'attachment'
               AND p.post_mime_type LIKE 'image/%'
               AND p.post_status = 'inherit'
             ORDER BY p.post_date DESC
             LIMIT 10000"
        );

        foreach ( $images as $img ) {
            $parent_url = $img->post_parent ? get_permalink( $img->post_parent ) : home_url( '/' );
            echo '  <url>' . "\n";
            echo '    <loc>' . esc_url( $parent_url ) . '</loc>' . "\n";
            echo '    <image:image>' . "\n";
            echo '      <image:loc>' . esc_url( $img->guid ) . '</image:loc>' . "\n";
            if ( $img->post_title ) {
                echo '      <image:title>' . esc_html( $img->post_title ) . '</image:title>' . "\n";
            }
            if ( $img->post_excerpt ) {
                echo '      <image:caption>' . esc_html( $img->post_excerpt ) . '</image:caption>' . "\n";
            }
            echo '    </image:image>' . "\n";
            echo '  </url>' . "\n";
        }
    }

    public function ping_search_engines( $post_id, $post ) {
        if ( wp_is_post_revision( $post_id ) ) return;
        if ( $post->post_status !== 'publish' ) return;

        $sitemap_url = home_url( '/sitemap.xml' );
        wp_remote_get( 'https://www.google.com/ping?sitemap=' . urlencode( $sitemap_url ), array( 'timeout' => 5 ) );
        wp_remote_get( 'https://www.bing.com/ping?sitemap=' . urlencode( $sitemap_url ), array( 'timeout' => 5 ) );
    }

    public function on_status_change( $new_status, $old_status, $post ) {
        if ( $new_status === 'publish' || $old_status === 'publish' ) {
            delete_transient( 'smartrank_sitemap_cache' );
        }
    }
}
