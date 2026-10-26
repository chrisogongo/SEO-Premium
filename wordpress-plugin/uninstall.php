<?php
/**
 * SmartRank AI SEO Uninstall
 * Fires when the plugin is deleted via WordPress admin.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

// Check if user wants to keep data
$settings = get_option( 'smartrank_settings', array() );
$keep_data = isset( $settings['uninstall_keep_data'] ) ? $settings['uninstall_keep_data'] : false;

if ( ! $keep_data ) {
    // Drop custom tables
    $tables = array(
        "{$wpdb->prefix}smartrank_meta",
        "{$wpdb->prefix}smartrank_redirects",
        "{$wpdb->prefix}smartrank_404_log",
        "{$wpdb->prefix}smartrank_audit",
        "{$wpdb->prefix}smartrank_keywords",
        "{$wpdb->prefix}smartrank_audit_log",
    );

    foreach ( $tables as $table ) {
        $wpdb->query( "DROP TABLE IF EXISTS {$table}" ); // phpcs:ignore
    }

    // Delete options
    delete_option( 'smartrank_settings' );
    delete_option( 'smartrank_db_version' );

    // Delete transients
    $wpdb->query(
        "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_smartrank_%'
         OR option_name LIKE '_transient_timeout_smartrank_%'"
    );
}

// Clear scheduled hooks
wp_clear_scheduled_hook( 'smartrank_daily_audit' );
wp_clear_scheduled_hook( 'smartrank_weekly_report' );

// Flush rewrite rules
flush_rewrite_rules();
