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
        if ( empty( $this->api_key ) ) {
            return new WP_Error( 'no_api_key', __( 'AI API key not configured.', 'smartrank-ai-seo' ) );
        }

        if ( ! $this->check_quota() ) {
            return new WP_Error( 'quota_exceeded', __( 'Monthly AI usage limit reached.', 'smartrank-ai-seo' ) );
        }

        $response = null;
        switch ( $this->provider ) {
            case 'openai':
                $response = $this->call_openai( $prompt, $options );
                break;
            case 'anthropic':
                $response = $this->call_anthropic( $prompt, $options );
                break;
            case 'google':
                $response = $this->call_google( $prompt, $options );
                break;
            default:
                return new WP_Error( 'invalid_provider', __( 'Unknown AI provider.', 'smartrank-ai-seo' ) );
        }

        if ( ! is_wp_error( $response ) ) {
            $this->record_usage();
        }

        return $response;
    }

    public function generate_meta_description( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );

        $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $content = wp_trim_words( wp_strip_all_tags( $post->post_content ), 200 );

        $prompt = sprintf(
            "Write an SEO meta description for the following WordPress page. Requirements:
- Maximum 155 characters
- Include the focus keyword: %s
- Be compelling and encourage clicks
- Accurately represent the content
- Do NOT use clickbait or false claims

Title: %s
Content excerpt: %s
Focus keyword: %s

Return ONLY the meta description, nothing else.",
            $meta['focus_keyphrase'] ?: 'auto-detect',
            $post->post_title,
            $content,
            $meta['focus_keyphrase']
        );

        return $this->generate( $prompt, array( 'max_tokens' => 200 ) );
    }

    public function generate_seo_title( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );

        $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $site_name = get_bloginfo( 'name' );
        $separator = smartrank_get_option( 'title_separator', '-' );

        $prompt = sprintf(
            "Write an SEO-optimized title tag for this WordPress page. Requirements:
- Maximum 60 characters including site name
- Include the focus keyword near the beginning
- Format: [Title] %s %s
- Be descriptive and compelling

Current title: %s
Focus keyword: %s
Site name: %s

Return ONLY the title tag, nothing else.",
            $separator, $site_name,
            $post->post_title,
            $meta['focus_keyphrase'] ?: 'auto-detect',
            $site_name
        );

        return $this->generate( $prompt, array( 'max_tokens' => 100 ) );
    }

    public function analyze_content( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );

        $meta = ( new SmartRank_SEO_Meta() )->get_post_meta( $post_id );
        $content = wp_trim_words( wp_strip_all_tags( $post->post_content ), 500 );

        $prompt = sprintf(
            "Analyze this WordPress page for SEO optimization. Provide a JSON response with:
1. seo_score (0-100)
2. issues (array of {severity, title, description, fixable})
3. suggestions (array of strings)
4. keyword_density (percentage)
5. readability_score (0-100)

Title: %s
Meta Description: %s
Focus Keyword: %s
Content: %s

Return ONLY valid JSON, no markdown.",
            $post->post_title,
            $meta['meta_description'] ?: '(not set)',
            $meta['focus_keyphrase'] ?: '(not set)',
            $content
        );

        $result = $this->generate( $prompt, array( 'max_tokens' => 1500 ) );
        if ( is_wp_error( $result ) ) return $result;

        $decoded = json_decode( $result, true );
        return $decoded ? $decoded : array( 'raw' => $result );
    }

    public function suggest_keywords( $post_id ) {
        $post = get_post( $post_id );
        if ( ! $post ) return new WP_Error( 'not_found', 'Post not found.' );

        $content = wp_trim_words( wp_strip_all_tags( $post->post_content ), 300 );

        $prompt = sprintf(
            "Based on this content, suggest 5 relevant keywords for SEO optimization.
For each keyword, provide:
- keyword: the keyword phrase
- intent: informational/commercial/transactional/navigational
- relevance: high/medium/low

Content title: %s
Content: %s

Return ONLY a JSON array, no markdown.",
            $post->post_title,
            $content
        );

        $result = $this->generate( $prompt, array( 'max_tokens' => 800 ) );
        if ( is_wp_error( $result ) ) return $result;

        $decoded = json_decode( $result, true );
        return $decoded ? $decoded : array();
    }

    public function generate_content_brief( $topic, $keyword, $intent = 'informational' ) {
        $prompt = sprintf(
            "Create a detailed content brief for a WordPress article. Include:
1. target_keyword
2. secondary_keywords (array of 5)
3. search_intent
4. recommended_word_count
5. outline (array of H2 headings with brief descriptions)
6. key_points_to_cover (array)
7. internal_link_opportunities (array)

Topic: %s
Primary keyword: %s
Search intent: %s

Return ONLY valid JSON.",
            $topic, $keyword, $intent
        );

        $result = $this->generate( $prompt, array( 'max_tokens' => 2000 ) );
        if ( is_wp_error( $result ) ) return $result;

        $decoded = json_decode( $result, true );
        return $decoded ? $decoded : array( 'raw' => $result );
    }

    public function suggest_image_alt( $attachment_id ) {
        $attachment = get_post( $attachment_id );
        if ( ! $attachment || $attachment->post_type !== 'attachment' ) {
            return new WP_Error( 'not_found', 'Attachment not found.' );
        }

        $prompt = sprintf(
            "Write a descriptive alt text for this image. Requirements:
- Maximum 125 characters
- Describe what the image shows
- Include relevant context if apparent
- Be accurate, do not invent details

Image filename: %s
Image title: %s
Image caption: %s

Return ONLY the alt text.",
            basename( get_attached_file( $attachment_id ) ),
            $attachment->post_title,
            $attachment->post_excerpt
        );

        return $this->generate( $prompt, array( 'max_tokens' => 100 ) );
    }

    private function call_openai( $prompt, $options ) {
        $body = array(
            'model'    => $this->model,
            'messages' => array(
                array( 'role' => 'system', 'content' => 'You are an SEO expert assistant. Provide accurate, helpful responses. Never fabricate statistics or make false claims.' ),
                array( 'role' => 'user', 'content' => $prompt ),
            ),
            'max_tokens' => isset( $options['max_tokens'] ) ? $options['max_tokens'] : 1000,
            'temperature' => 0.7,
        );

        $response = wp_remote_post( 'https://api.openai.com/v1/chat/completions', array(
            'timeout' => 60,
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type'  => 'application/json',
            ),
            'body' => wp_json_encode( $body ),
        ));

        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code !== 200 ) {
            $msg = isset( $data['error']['message'] ) ? $data['error']['message'] : 'API error';
            return new WP_Error( 'api_error', $msg );
        }

        return isset( $data['choices'][0]['message']['content'] )
            ? trim( $data['choices'][0]['message']['content'] )
            : new WP_Error( 'empty_response', 'Empty response from AI.' );
    }

    private function call_anthropic( $prompt, $options ) {
        $body = array(
            'model'      => $this->model ?: 'claude-3-sonnet-20240229',
            'max_tokens' => isset( $options['max_tokens'] ) ? $options['max_tokens'] : 1000,
            'messages'   => array(
                array( 'role' => 'user', 'content' => $prompt ),
            ),
        );

        $response = wp_remote_post( 'https://api.anthropic.com/v1/messages', array(
            'timeout' => 60,
            'headers' => array(
                'x-api-key'         => $this->api_key,
                'anthropic-version' => '2023-06-01',
                'Content-Type'      => 'application/json',
            ),
            'body' => wp_json_encode( $body ),
        ));

        if ( is_wp_error( $response ) ) return $response;

        $code = wp_remote_retrieve_response_code( $response );
        $data = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code !== 200 ) {
            return new WP_Error( 'api_error', isset( $data['error']['message'] ) ? $data['error']['message'] : 'API error' );
        }

        return isset( $data['content'][0]['text'] ) ? trim( $data['content'][0]['text'] ) : '';
    }

    private function call_google( $prompt, $options ) {
        $body = array(
            'contents' => array(
                array( 'parts' => array( array( 'text' => $prompt ) ) ),
            ),
            'generationConfig' => array(
                'maxOutputTokens' => isset( $options['max_tokens'] ) ? $options['max_tokens'] : 1000,
                'temperature'     => 0.7,
            ),
        );

        $url = 'https://generativelanguage.googleapis.com/v1/models/' . $this->model . ':generateContent?key=' . $this->api_key;

        $response = wp_remote_post( $url, array(
            'timeout' => 60,
            'headers' => array( 'Content-Type' => 'application/json' ),
            'body'    => wp_json_encode( $body ),
        ));

        if ( is_wp_error( $response ) ) return $response;

        $data = json_decode( wp_remote_retrieve_body( $response ), true );
        return isset( $data['candidates'][0]['content']['parts'][0]['text'] )
            ? trim( $data['candidates'][0]['content']['parts'][0]['text'] )
            : '';
    }

    private function check_quota() {
        $limit = intval( smartrank_get_option( 'ai_monthly_limit', 50 ) );
        if ( $limit <= 0 ) return true;

        $usage = $this->get_monthly_usage();
        return $usage < $limit;
    }

    private function get_monthly_usage() {
        $usage = get_transient( 'smartrank_ai_usage_' . date( 'Y_m' ) );
        return $usage ? intval( $usage ) : 0;
    }

    private function record_usage() {
        $key   = 'smartrank_ai_usage_' . date( 'Y_m' );
        $usage = intval( get_transient( $key ) );
        set_transient( $key, $usage + 1, MONTH_IN_SECONDS );
    }
}
