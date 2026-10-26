<?php
/**
 * Plugin Name:       SmartRank AI SEO
 * Plugin URI:        https://github.com/chrisogongo/SEO-Premium
 * Description:       Advanced AI-powered WordPress SEO plugin with content analysis, schema markup, XML sitemaps, redirect management, technical audits, and AI-assisted optimization.
 * Version:           1.5.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Chris Ogongo
 * Author URI:        https://github.com/chrisogongo
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       smartrank-ai-seo
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'SMARTRANK_VERSION', '1.5.0' );
define( 'SMARTRANK_PLUGIN_FILE', __FILE__ );
define( 'SMARTRANK_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SMARTRANK_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'SMARTRANK_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'SMARTRANK_DB_VERSION', '1.5.0' );

/* ── Autoloader ─────────────────────────────────────────── */
spl_autoload_register( function ( $class ) {
    $prefix    = 'SmartRank_';
    $base_dir  = SMARTRANK_PLUGIN_DIR . 'includes/';
    $len       = strlen( $prefix );
    if ( strncmp( $prefix, $class, $len ) !== 0 ) return;
    $relative  = substr( $class, $len );
    $file      = $base_dir . 'class-' . strtolower( str_replace( '_', '-', $relative ) ) . '.php';
    if ( file_exists( $file ) ) require $file;
});

/* ── Activation / Deactivation ──────────────────────────── */
register_activation_hook( __FILE__, array( 'SmartRank_Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'SmartRank_Activator', 'deactivate' ) );

/* ── Boot ───────────────────────────────────────────────── */
function smartrank_init() {
    load_plugin_textdomain( 'smartrank-ai-seo', false, dirname( SMARTRANK_PLUGIN_BASENAME ) . '/languages' );

    SmartRank_Activator::maybe_upgrade();

    if ( is_admin() ) {
        new SmartRank_Admin();
    }

    new SmartRank_SEO_Meta();
    new SmartRank_Schema();
    new SmartRank_Sitemap();
    new SmartRank_Redirects();
    new SmartRank_Rest_API();

    if ( smartrank_get_option( 'ai_enabled', false ) ) {
        new SmartRank_AI_Assistant();
    }
}
add_action( 'plugins_loaded', 'smartrank_init' );

/* ── Helper ─────────────────────────────────────────────── */
function smartrank_get_option( $key, $default = '' ) {
    $opts = get_option( 'smartrank_settings', array() );
    return isset( $opts[ $key ] ) ? $opts[ $key ] : $default;
}

function smartrank_update_option( $key, $value ) {
    $opts = get_option( 'smartrank_settings', array() );
    $opts[ $key ] = $value;
    update_option( 'smartrank_settings', $opts );
}
