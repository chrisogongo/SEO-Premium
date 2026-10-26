<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SmartRank_AI_Assistant {

    private $provider;
    private $api_key;
    private $model;

    public function __construct() {
        $this->provider = smartrank_get_option( 'ai_provider', 'openai' );
        $this->api_key  = smartrank_get_option( 'ai_api_key', '' );
        $this->model    = smartrank_get_option( 'ai_model', 'gpt-4' );
    }

    public function generate( $prompt, $options = array() ) {
        if ( empty( $this->api_key ) ) return new WP_Error( 'no_api_key', 'AI API key not configured.' );
        if ( ! $this->check_quota() ) return new WP_Error( 'quota', 'Monthly AI limit reached.' );

        $response = null;
        switch ( $this->provider ) {
            case 'openai':    $response = $this->call_openai( $prompt, $options ); break;
            case 'anthropic': $response = $this->call_anthropic( $prompt, $options ); break;
            case 'google':    $response = $this->call_google( $prompt, $options ); break;
            default: return new WP_Error( 'invalid_provider', 'Unknown AI provider.' );
        }

        if ( ! is_wp_error( $response ) ) $this->record_usage();
        return $response;
    }

    public function generate_meta_description( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );
        $meta    = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $content = wp_trim_words( wp_strip_all_tags( $post->post_content ), 200 );
        $prompt  = "Write an SEO meta description (max 155 chars) for this page. Include focus keyword: {$meta['focus_keyphrase']}. Title: {$post->post_title}. Content: {$content}. Return ONLY the description.";
        return $this->generate( $prompt, array( 'max_tokens' => 200 ) );
    }

    public function generate_seo_title( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );
        $meta      = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $site_name = get_bloginfo( 'name' );
        $sep       = smartrank_get_option( 'title_separator', '-' );
        $prompt    = "Write an SEO title (max 60 chars) for: {$post->post_title}. Focus keyword: {$meta['focus_keyphrase']}. Site: {$site_name}. Format: Title {$sep} {$site_name}. Return ONLY the title.";
        return $this->generate( $prompt, array( 'max_tokens' => 100 ) );
    }

    public function analyze_content( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );
        $meta    = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $content = wp_trim_words( wp_strip_all_tags( $post->post_content ), 500 );
        $prompt  = "Analyze this page for SEO. Return JSON: {seo_score, issues:[{severity,title,description,fixable}], suggestions:[], keyword_density, readability_score}. Title: {$post->post_title}. Meta: {$meta['meta_description']}. Keyword: {$meta['focus_keyphrase']}. Content: {$content}. Return ONLY valid JSON.";
        $result  = $this->generate( $prompt, array( 'max_tokens' => 1500 ) );
        if ( is_wp_error( $result ) ) return $result;
        $decoded = json_decode( $result, true );
        return $decoded ?: array( 'raw' => $result );
    }

    private function call_openai( $prompt, $options ) {
        $body = array(
            'model'    => $this->model,
            'messages' => array(
                array( 'role' => 'system', 'content' => 'You are an SEO expert. Provide accurate, helpful responses. Never fabricate data.' ),
                array( 'role' => 'user', 'content' => $prompt ),
            ),
            'max_tokens'  => isset( $options['max_tokens'] ) ? $options['max_tokens'] : 1000,
            'temperature' => 0.7,
        );
        $response = wp_remote_post( 'https://api.openai.com/v1/chat/completions', array(
            'timeout' => 60,
            'headers' => array( 'Authorization' => 'Bearer ' . $this->api_key, 'Content-Type' => 'application/json' ),
            'body'    => wp_json_encode( $body ),
        ));
        if ( is_wp_error( $response ) ) return $response;
        $code = wp_remote_retrieve_response_code( $response );
        $data = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( $code !== 200 ) return new WP_Error( 'api_error', $data['error']['message'] ?? 'API error' );
        return isset( $data['choices'][0]['message']['content'] ) ? trim( $data['choices'][0]['message']['content'] ) : new WP_Error( 'empty', 'Empty response.' );
    }

    private function call_anthropic( $prompt, $options ) {
        $body = array(
            'model'      => $this->model ?: 'claude-3-sonnet-20240229',
            'max_tokens' => isset( $options['max_tokens'] ) ? $options['max_tokens'] : 1000,
            'messages'   => array( array( 'role' => 'user', 'content' => $prompt ) ),
        );
        $response = wp_remote_post( 'https://api.anthropic.com/v1/messages', array(
            'timeout' => 60,
            'headers' => array( 'x-api-key' => $this->api_key, 'anthropic-version' => '2023-06-01', 'Content-Type' => 'application/json' ),
            'body'    => wp_json_encode( $body ),
        ));
        if ( is_wp_error( $response ) ) return $response;
        $data = json_decode( wp_remote_retrieve_body( $response ), true );
        return isset( $data['content'][0]['text'] ) ? trim( $data['content'][0]['text'] ) : '';
    }

    private function call_google( $prompt, $options ) {
        $body = array(
            'contents' => array( array( 'parts' => array( array( 'text' => $prompt ) ) ) ),
            'generationConfig' => array( 'maxOutputTokens' => isset( $options['max_tokens'] ) ? $options['max_tokens'] : 1000, 'temperature' => 0.7 ),
        );
        $url      = 'https://generativelanguage.googleapis.com/v1/models/' . $this->model . ':generateContent?key=' . $this->api_key;
        $response = wp_remote_post( $url, array( 'timeout' => 60, 'headers' => array( 'Content-Type' => 'application/json' ), 'body' => wp_json_encode( $body ) ) );
        if ( is_wp_error( $response ) ) return $response;
        $data = json_decode( wp_remote_retrieve_body( $response ), true );
        return isset( $data['candidates'][0]['content']['parts'][0]['text'] ) ? trim( $data['candidates'][0]['content']['parts'][0]['text'] ) : '';
    }

    private function check_quota() {
        $limit = intval( smartrank_get_option( 'ai_monthly_limit', 50 ) );
        if ( $limit <= 0 ) return true;
        return $this->get_usage() < $limit;
    }

    private function get_usage() {
        return intval( get_transient( 'smartrank_ai_usage_' . date( 'Y_m' ) ) );
    }

    private function record_usage() {
        $key = 'smartrank_ai_usage_' . date( 'Y_m' );
        set_transient( $key, intval( get_transient( $key ) ) + 1, MONTH_IN_SECONDS );
    }
}
