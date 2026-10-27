<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_Activator {

    public static function activate() {
        self::create_tables();
        self::create_default_options();
        self::schedule_events();
        flush_rewrite_rules();
    }

    public static function deactivate() {
        wp_clear_scheduled_hook( 'smartrank_daily_audit' );
        wp_clear_scheduled_hook( 'smartrank_weekly_report' );
        flush_rewrite_rules();
    }

    public static function maybe_upgrade() {
        $installed = get_option( 'smartrank_db_version', '0' );
        if ( version_compare( $installed, SMARTRANK_DB_VERSION, '<' ) ) {
            self::create_tables();
            update_option( 'smartrank_db_version', SMARTRANK_DB_VERSION );
        }
    }

    private static function create_tables() {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}smartrank_meta (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            post_id bigint(20) unsigned NOT NULL,
            meta_key varchar(191) NOT NULL,
            meta_value longtext,
            PRIMARY KEY (id),
            UNIQUE KEY post_meta (post_id, meta_key),
            KEY post_id (post_id)
        ) $charset;";
        dbDelta( $sql );

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}smartrank_redirects (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            source varchar(255) NOT NULL,
            target varchar(255) NOT NULL,
            type int(3) NOT NULL DEFAULT 301,
            status varchar(20) NOT NULL DEFAULT 'active',
            hits bigint(20) unsigned NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY source (source(191)),
            KEY status (status)
        ) $charset;";
        dbDelta( $sql );

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}smartrank_404_log (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            url varchar(255) NOT NULL,
            referrer varchar(255),
            hits bigint(20) unsigned NOT NULL DEFAULT 1,
            last_hit datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY url (url(191))
        ) $charset;";
        dbDelta( $sql );

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}smartrank_audit (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            run_id varchar(64) NOT NULL,
            url varchar(255) NOT NULL,
            issue_type varchar(50) NOT NULL,
            severity varchar(20) NOT NULL,
            title varchar(255) NOT NULL,
            description text,
            fixable tinyint(1) NOT NULL DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY run_id (run_id),
            KEY severity (severity)
        ) $charset;";
        dbDelta( $sql );

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}smartrank_keywords (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            keyword varchar(191) NOT NULL,
            post_id bigint(20) unsigned DEFAULT NULL,
            intent varchar(20),
            volume varchar(20),
            position int(11),
            group_name varchar(100),
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY keyword (keyword),
            KEY post_id (post_id)
        ) $charset;";
        dbDelta( $sql );

        $sql = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}smartrank_audit_log (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            action varchar(50) NOT NULL,
            target_type varchar(50) NOT NULL,
            target_id bigint(20) unsigned,
            description text,
            previous_state longtext,
            new_state longtext,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY action (action),
            KEY created_at (created_at)
        ) $charset;";
        dbDelta( $sql );
    }

    private static function create_default_options() {
        $defaults = array(
            'site_type'          => 'blog',
            'title_separator'    => '-',
            'enable_sitemap'     => true,
            'enable_schema'      => true,
            'enable_redirects'   => true,
            'enable_404_monitor' => true,
            'ai_enabled'         => false,
            'ai_provider'        => 'openai',
            'ai_model'           => 'gpt-4',
            'ai_api_key'         => '',
            'ai_monthly_limit'   => 50,
        );
        if ( false === get_option( 'smartrank_settings' ) ) {
            update_option( 'smartrank_settings', $defaults );
        }
    }

    private static function schedule_events() {
        if ( ! wp_next_scheduled( 'smartrank_daily_audit' ) ) {
            wp_schedule_event( time(), 'daily', 'smartrank_daily_audit' );
        }
        if ( ! wp_next_scheduled( 'smartrank_weekly_report' ) ) {
            wp_schedule_event( time(), 'weekly', 'smartrank_weekly_report' );
        }
    }
}
