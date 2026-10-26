// ============================================================
// SmartRank AI SEO Assistant — Types & Mock Data
// ============================================================

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Impact = 'high' | 'medium' | 'low';
export type Effort = 'low' | 'medium' | 'high';
export type Confidence = 'high' | 'medium' | 'low';
export type Urgency = 'immediate' | 'soon' | 'planned' | 'optional';
export type SearchIntent = 'informational' | 'commercial' | 'transactional' | 'navigational';
export type ContentType = 'page' | 'post' | 'product' | 'category';
export type AutomationStatus = 'enabled' | 'disabled' | 'requires-approval';
export type AuditAction = 'created' | 'updated' | 'deleted' | 'rolled-back' | 'approved' | 'rejected';

export interface ContentAnalysis {
  id: number;
  title: string;
  url: string;
  type: ContentType;
  seoScore: number;
  previousScore: number;
  primaryKeyword: string | null;
  secondaryKeywords: string[];
  searchIntent: SearchIntent | null;
  issues: ContentIssue[];
  suggestions: string[];
  lastAnalyzed: string;
  status: 'optimized' | 'needs-work' | 'critical';
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  imagesMissingAlt: number;
}

export interface ContentIssue {
  id: string;
  category: 'metadata' | 'content' | 'technical' | 'links' | 'schema' | 'performance';
  severity: Priority;
  title: string;
  description: string;
  reason: string;
  fixable: boolean;
  autoFixable: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  affectedUrl: string | null;
  affectedPages: number;
  impact: Impact;
  effort: Effort;
  confidence: Confidence;
  urgency: Urgency;
  category: 'content' | 'technical' | 'metadata' | 'links' | 'schema' | 'keywords' | 'structure';
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed';
  autoApplicable: boolean;
  estimatedTrafficChange: string | null;
  dataSupport: 'measured' | 'estimated' | 'best-practice' | 'ai-analysis' | 'unavailable';
  steps: string[];
  completedDate?: string;
  measuredResult?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: 'metadata' | 'content' | 'schema' | 'links' | 'reports';
  status: AutomationStatus;
  riskLevel: 'safe' | 'moderate' | 'high';
  reversible: boolean;
  requiresApproval: boolean;
  lastRun: string | null;
  timesRun: number;
  actionsTaken: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  user: string;
  target: string;
  targetType: 'metadata' | 'content' | 'redirect' | 'schema' | 'settings' | 'automation' | 'links';
  description: string;
  previousState: string | null;
  newState: string | null;
  canRollback: boolean;
  rolledBack: boolean;
}

export interface KeywordSuggestion {
  keyword: string;
  intent: SearchIntent;
  relevance: 'high' | 'medium' | 'low';
  suggestedFor: string;
  reason: string;
  currentRanking: number | null;
  volume: string | null;
  dataSource: 'measured' | 'estimated' | 'ai-suggestion' | 'unavailable';
}

export interface ContentGap {
  id: string;
  topic: string;
  primaryKeyword: string;
  supportingKeywords: string[];
  searchIntent: SearchIntent;
  estimatedVolume: string | null;
  competition: 'high' | 'medium' | 'low';
  recommendedType: ContentType;
  reason: string;
  relatedExistingContent: string[];
  priority: Priority;
  dataSource: 'measured' | 'estimated' | 'ai-analysis' | 'unavailable';
}

export interface CannibalizationAlert {
  id: string;
  keyword: string;
  competingPages: { url: string; title: string; score: number }[];
  recommendation: string;
  severity: Priority;
}

export interface SEOReport {
  id: string;
  type: 'weekly' | 'monthly';
  period: string;
  generatedAt: string;
  overallScore: number;
  previousScore: number;
  summary: string;
  highlights: { label: string; value: string; change: string; positive: boolean }[];
  completedTasks: number;
  pendingTasks: number;
  trafficChange: string | null;
  topImprovements: string[];
  areasForImprovement: string[];
  dataLimitations: string[];
}

// ============================================================
// MOCK DATA
// ============================================================

export const mockContentAnalysis: ContentAnalysis[] = [
  {
    id: 1, title: 'WordPress SEO Guide', url: '/wordpress-seo-guide', type: 'post',
    seoScore: 92, previousScore: 74, primaryKeyword: 'wordpress seo guide',
    secondaryKeywords: ['wordpress optimization', 'seo tips', 'wordpress plugin'],
    searchIntent: 'informational', wordCount: 3200, internalLinks: 12, externalLinks: 5,
    images: 8, imagesMissingAlt: 1, lastAnalyzed: '2 hours ago', status: 'optimized',
    issues: [
      { id: 'i1', category: 'metadata', severity: 'low', title: 'OG image could be larger', description: 'Current OG image is 800x400. Recommended minimum is 1200x630.', reason: 'Larger OG images display better in social media shares, increasing click-through rates.', fixable: true, autoFixable: false },
    ],
    suggestions: ['Add a FAQ section to target featured snippets', 'Consider adding a table of contents for better UX'],
  },
  {
    id: 2, title: 'Best SEO Tools 2024', url: '/best-seo-tools', type: 'post',
    seoScore: 67, previousScore: 67, primaryKeyword: 'best seo tools',
    secondaryKeywords: ['seo software', 'keyword research tools'],
    searchIntent: 'commercial', wordCount: 1800, internalLinks: 3, externalLinks: 8,
    images: 4, imagesMissingAlt: 2, lastAnalyzed: '5 hours ago', status: 'needs-work',
    issues: [
      { id: 'i2', category: 'content', severity: 'high', title: 'Content too short for target keyword', description: '1,800 words is below the recommended 2,500+ for competitive commercial keywords.', reason: 'Competing pages average 3,100 words. More comprehensive content tends to rank higher for competitive terms.', fixable: false, autoFixable: false },
      { id: 'i3', category: 'links', severity: 'medium', title: 'Few internal links', description: 'Only 3 internal links found. Related content exists that could be linked.', reason: 'Internal links help distribute page authority and help search engines discover related content.', fixable: true, autoFixable: true },
      { id: 'i4', category: 'metadata', severity: 'medium', title: 'Missing FAQ schema opportunity', description: 'Content structure suggests FAQ schema could be added.', reason: 'FAQ schema can generate rich results in search, increasing visibility and click-through rates.', fixable: true, autoFixable: true },
      { id: 'i5', category: 'content', severity: 'low', title: '2 images missing alt text', description: 'Two images do not have descriptive alt attributes.', reason: 'Alt text helps search engines understand image content and improves accessibility.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Expand comparison section with detailed pros/cons', 'Add pricing information table', 'Include user testimonials or case studies'],
  },
  {
    id: 3, title: 'Schema Markup Tutorial', url: '/schema-markup-tutorial', type: 'post',
    seoScore: 85, previousScore: 71, primaryKeyword: 'schema markup tutorial',
    secondaryKeywords: ['structured data', 'json-ld', 'schema.org'],
    searchIntent: 'informational', wordCount: 2800, internalLinks: 7, externalLinks: 4,
    images: 6, imagesMissingAlt: 0, lastAnalyzed: '1 day ago', status: 'optimized',
    issues: [
      { id: 'i6', category: 'schema', severity: 'low', title: 'Could add VideoObject schema', description: 'Page embeds a tutorial video but lacks VideoObject schema.', reason: 'VideoObject schema can make video content eligible for rich results and video carousels.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Add step-by-step numbered list for HowTo schema eligibility', 'Create a downloadable cheat sheet as a lead magnet'],
  },
  {
    id: 4, title: 'Premium SEO Plugin', url: '/products/premium-seo-plugin', type: 'product',
    seoScore: 54, previousScore: 54, primaryKeyword: null,
    secondaryKeywords: [], searchIntent: null, wordCount: 420, internalLinks: 1, externalLinks: 0,
    images: 3, imagesMissingAlt: 3, lastAnalyzed: '3 hours ago', status: 'critical',
    issues: [
      { id: 'i7', category: 'metadata', severity: 'critical', title: 'No focus keyword assigned', description: 'Product page has no primary keyword targeting strategy.', reason: 'Without a target keyword, content cannot be optimized for specific search queries.', fixable: true, autoFixable: false },
      { id: 'i8', category: 'metadata', severity: 'critical', title: 'Missing meta description', description: 'No meta description has been set for this product page.', reason: 'Meta descriptions appear in search results and influence click-through rates.', fixable: true, autoFixable: true },
      { id: 'i9', category: 'content', severity: 'critical', title: 'Content too thin', description: 'Only 420 words. Product pages need comprehensive descriptions.', reason: 'Thin content provides insufficient information for search engines to understand and rank the page.', fixable: false, autoFixable: false },
      { id: 'i10', category: 'content', severity: 'high', title: 'All images missing alt text', description: '3 product images have no alt attributes.', reason: 'Image alt text is essential for accessibility and image search visibility.', fixable: true, autoFixable: true },
      { id: 'i11', category: 'schema', severity: 'high', title: 'Product schema incomplete', description: 'Product schema is missing price, availability, and review data.', reason: 'Complete Product schema enables rich results showing price, availability, and ratings in search.', fixable: true, autoFixable: false },
      { id: 'i12', category: 'links', severity: 'medium', title: 'No internal links', description: 'Page has no internal links to related content.', reason: 'Internal links help users discover related products and content, reducing bounce rates.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Add comprehensive product description with features and benefits', 'Include comparison with competing products', 'Add customer reviews section', 'Create FAQ section for common product questions'],
  },
  {
    id: 5, title: 'SEO Services', url: '/services/seo', type: 'page',
    seoScore: 73, previousScore: 68, primaryKeyword: 'seo services',
    secondaryKeywords: ['professional seo', 'seo agency'],
    searchIntent: 'transactional', wordCount: 1500, internalLinks: 4, externalLinks: 1,
    images: 2, imagesMissingAlt: 0, lastAnalyzed: '6 hours ago', status: 'needs-work',
    issues: [
      { id: 'i13', category: 'content', severity: 'medium', title: 'Missing clear CTA', description: 'Page lacks a prominent call-to-action for conversion.', reason: 'Service pages need clear CTAs to convert visitors who found the page through search.', fixable: true, autoFixable: false },
      { id: 'i14', category: 'schema', severity: 'medium', title: 'Missing Service schema', description: 'Service page could benefit from Service schema markup.', reason: 'Service schema helps search engines understand the offered services and can generate rich results.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Add pricing tiers or packages section', 'Include case studies or success metrics', 'Add trust signals (testimonials, certifications)'],
  },
  {
    id: 6, title: 'About Us', url: '/about', type: 'page',
    seoScore: 61, previousScore: 61, primaryKeyword: null,
    secondaryKeywords: [], searchIntent: 'navigational', wordCount: 800, internalLinks: 2, externalLinks: 0,
    images: 1, imagesMissingAlt: 1, lastAnalyzed: '1 day ago', status: 'needs-work',
    issues: [
      { id: 'i15', category: 'metadata', severity: 'high', title: 'Generic SEO title', description: 'Title is just "About Us" without brand or differentiator.', reason: 'Generic titles miss branding opportunities and are less compelling in search results.', fixable: true, autoFixable: true },
      { id: 'i16', category: 'schema', severity: 'medium', title: 'Missing Organization schema', description: 'About page should include Organization or Person schema.', reason: 'Organization schema helps search engines associate content with your brand entity.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Add team member bios with Person schema', 'Include company history and mission statement'],
  },
  {
    id: 7, title: 'Contact', url: '/contact', type: 'page',
    seoScore: 48, previousScore: 48, primaryKeyword: null,
    secondaryKeywords: [], searchIntent: 'navigational', wordCount: 150, internalLinks: 0, externalLinks: 0,
    images: 0, imagesMissingAlt: 0, lastAnalyzed: '2 days ago', status: 'critical',
    issues: [
      { id: 'i17', category: 'metadata', severity: 'critical', title: 'Missing meta description', description: 'Contact page has no meta description.', reason: 'Meta descriptions influence click-through rates from search results.', fixable: true, autoFixable: true },
      { id: 'i18', category: 'content', severity: 'critical', title: 'Extremely thin content', description: 'Only 150 words on the contact page.', reason: 'Very thin content provides minimal value and ranking signals.', fixable: false, autoFixable: false },
      { id: 'i19', category: 'schema', severity: 'high', title: 'Missing LocalBusiness schema', description: 'Contact page should include LocalBusiness or Organization schema with contact info.', reason: 'Contact schema enables rich results with phone numbers, address, and opening hours.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Add business hours, map, and directions', 'Include multiple contact methods (phone, email, form)', 'Add FAQ for common contact questions'],
  },
  {
    id: 8, title: 'SEO Blog', url: '/blog', type: 'category',
    seoScore: 70, previousScore: 65, primaryKeyword: 'seo blog',
    secondaryKeywords: ['seo articles', 'seo tips blog'],
    searchIntent: 'informational', wordCount: 0, internalLinks: 0, externalLinks: 0,
    images: 0, imagesMissingAlt: 0, lastAnalyzed: '12 hours ago', status: 'needs-work',
    issues: [
      { id: 'i20', category: 'metadata', severity: 'medium', title: 'Category description missing', description: 'Blog category has no archive description.', reason: 'Category descriptions help search engines understand the topic scope of the archive.', fixable: true, autoFixable: true },
    ],
    suggestions: ['Add a compelling category description', 'Consider adding featured posts section'],
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'r1', title: 'Add meta descriptions to 8 pages', description: '8 published pages are missing meta descriptions entirely.',
    reason: 'Meta descriptions directly influence click-through rates from search results. Pages without them get auto-generated snippets that may not accurately represent the content.',
    affectedUrl: null, affectedPages: 8, impact: 'high', effort: 'low', confidence: 'high', urgency: 'immediate',
    category: 'metadata', status: 'pending', autoApplicable: true,
    estimatedTrafficChange: '+5-15% CTR improvement', dataSupport: 'best-practice',
    steps: ['Review each page\'s content', 'Generate optimized meta descriptions using AI', 'Review and approve generated descriptions', 'Apply to pages'],
  },
  {
    id: 'r2', title: 'Expand thin content on product page', description: 'Product page has only 420 words — significantly below the 1,500+ word average for competing product pages.',
    reason: 'Thin content provides insufficient information for search engines to understand the page topic. Competing pages in this niche average 2,800 words with detailed specifications, comparisons, and FAQs.',
    affectedUrl: '/products/premium-seo-plugin', affectedPages: 1, impact: 'high', effort: 'high', confidence: 'medium', urgency: 'soon',
    category: 'content', status: 'pending', autoApplicable: false,
    estimatedTrafficChange: null, dataSupport: 'estimated',
    steps: ['Research competing product pages', 'Create content outline with key sections', 'Write comprehensive product description', 'Add comparison tables and FAQs', 'Optimize images with alt text', 'Add Product schema with complete data'],
  },
  {
    id: 'r3', title: 'Fix keyword cannibalization: "seo tools"', description: '3 pages are competing for the same search query "best seo tools", splitting ranking signals.',
    reason: 'When multiple pages target the same keyword, search engines may not rank any of them well because ranking signals are分散. Consolidating or differentiating target keywords improves overall visibility.',
    affectedUrl: null, affectedPages: 3, impact: 'high', effort: 'medium', confidence: 'high', urgency: 'immediate',
    category: 'keywords', status: 'pending', autoApplicable: false,
    estimatedTrafficChange: '+20-40% for primary page', dataSupport: 'measured',
    steps: ['Identify the strongest page for the primary keyword', 'Update other pages to target related but different keywords', 'Add internal links from supporting pages to the primary page', 'Update meta descriptions to reflect differentiated targeting'],
  },
  {
    id: 'r4', title: 'Add internal links from 12 orphan pages', description: '12 pages have no incoming internal links, making them difficult for search engines to discover.',
    reason: 'Orphan pages receive no link equity from other pages and may not be discovered during crawling. Internal links are one of the strongest on-page ranking signals.',
    affectedUrl: null, affectedPages: 12, impact: 'medium', effort: 'low', confidence: 'high', urgency: 'soon',
    category: 'links', status: 'pending', autoApplicable: true,
    estimatedTrafficChange: '+10-25% indexation improvement', dataSupport: 'best-practice',
    steps: ['Review orphan pages and their content', 'Identify relevant source pages for linking', 'Generate contextual anchor text suggestions', 'Add links (requires approval)'],
  },
  {
    id: 'r5', title: 'Add FAQ schema to 5 eligible pages', description: '5 pages have question-and-answer content structures that qualify for FAQ schema.',
    reason: 'FAQ schema can generate rich results in search, significantly increasing visibility and click-through rates. Pages with FAQ rich results typically see 20-30% more clicks.',
    affectedUrl: null, affectedPages: 5, impact: 'medium', effort: 'low', confidence: 'high', urgency: 'soon',
    category: 'schema', status: 'in-progress', autoApplicable: true,
    estimatedTrafficChange: '+20-30% CTR for eligible pages', dataSupport: 'measured',
    steps: ['Identify Q&A content patterns in eligible pages', 'Generate FAQ JSON-LD schema', 'Validate schema output', 'Add to pages'],
  },
  {
    id: 'r6', title: 'Optimize 11 images with missing alt text', description: '11 images across the site are missing descriptive alt attributes.',
    reason: 'Alt text helps search engines understand image content and is required for accessibility compliance. Images without alt text miss image search ranking opportunities.',
    affectedUrl: null, affectedPages: 6, impact: 'low', effort: 'low', confidence: 'high', urgency: 'planned',
    category: 'content', status: 'pending', autoApplicable: true,
    estimatedTrafficChange: null, dataSupport: 'best-practice',
    steps: ['Review each image', 'Generate descriptive alt text using AI', 'Review suggestions for accuracy', 'Apply approved alt text'],
  },
  {
    id: 'r7', title: 'Create new page: "Local SEO Checklist"', description: 'Keyword research identifies a content gap for "local seo checklist" — a high-volume, low-competition topic not currently covered.',
    reason: 'The site has strong local SEO content but lacks a comprehensive checklist page. This topic has estimated monthly searches of 4,400 with low competition, and the existing content cluster provides strong topical authority.',
    affectedUrl: null, affectedPages: 0, impact: 'high', effort: 'high', confidence: 'medium', urgency: 'planned',
    category: 'content', status: 'pending', autoApplicable: false,
    estimatedTrafficChange: null, dataSupport: 'ai-analysis',
    steps: ['Create content brief with target keywords', 'Draft comprehensive checklist content', 'Add relevant internal links to existing local SEO content', 'Optimize metadata and schema', 'Publish and monitor'],
  },
  {
    id: 'r8', title: 'Improve Contact page content and schema', description: 'Contact page has only 150 words and no structured data — critical for local SEO.',
    reason: 'The contact page is essential for local businesses. Adding comprehensive contact information, a map, business hours, and LocalBusiness schema enables rich results with phone numbers and addresses.',
    affectedUrl: '/contact', affectedPages: 1, impact: 'medium', effort: 'medium', confidence: 'high', urgency: 'soon',
    category: 'technical', status: 'pending', autoApplicable: false,
    estimatedTrafficChange: null, dataSupport: 'best-practice',
    steps: ['Expand content with business details', 'Add Google Maps embed', 'Include business hours and multiple contact methods', 'Add LocalBusiness schema', 'Generate optimized meta description'],
  },
  {
    id: 'r9', title: 'Add Service schema to services page', description: 'The SEO Services page is missing Service schema markup.',
    reason: 'Service schema helps search engines understand offered services and can generate rich results showing service type, provider, and area served.',
    affectedUrl: '/services/seo', affectedPages: 1, impact: 'medium', effort: 'low', confidence: 'high', urgency: 'planned',
    category: 'schema', status: 'pending', autoApplicable: true,
    estimatedTrafficChange: null, dataSupport: 'best-practice',
    steps: ['Configure Service schema properties', 'Validate JSON-LD output', 'Add to page'],
  },
  {
    id: 'r10', title: 'Create content cluster for "technical SEO"', description: 'Existing technical SEO content is scattered. Organizing into a proper cluster improves topical authority.',
    reason: 'Content clusters with a pillar page and supporting articles signal topical expertise to search engines. The current technical SEO content lacks a clear hub-and-spoke structure.',
    affectedUrl: null, affectedPages: 0, impact: 'high', effort: 'high', confidence: 'medium', urgency: 'optional',
    category: 'structure', status: 'pending', autoApplicable: false,
    estimatedTrafficChange: null, dataSupport: 'ai-analysis',
    steps: ['Create pillar page: "Complete Technical SEO Guide"', 'Identify 8-10 supporting article topics', 'Write or optimize supporting articles', 'Add bidirectional internal links', 'Monitor cluster performance'],
  },
];

export const mockAutomationRules: AutomationRule[] = [
  { id: 'a1', name: 'Generate draft meta descriptions', description: 'Automatically generate meta description drafts for pages missing them. Drafts require approval before publishing.', category: 'metadata', status: 'enabled', riskLevel: 'safe', reversible: true, requiresApproval: true, lastRun: '2 hours ago', timesRun: 24, actionsTaken: 18 },
  { id: 'a2', name: 'Generate draft SEO titles', description: 'Create optimized SEO title suggestions for pages with generic or missing titles.', category: 'metadata', status: 'enabled', riskLevel: 'safe', reversible: true, requiresApproval: true, lastRun: '5 hours ago', timesRun: 18, actionsTaken: 12 },
  { id: 'a3', name: 'Suggest image alt text', description: 'Analyze images and generate descriptive alt text suggestions using AI.', category: 'metadata', status: 'enabled', riskLevel: 'safe', reversible: true, requiresApproval: true, lastRun: '1 day ago', timesRun: 8, actionsTaken: 34 },
  { id: 'a4', name: 'Detect broken internal links', description: 'Scan published content for broken internal links and flag them for review.', category: 'links', status: 'enabled', riskLevel: 'safe', reversible: false, requiresApproval: false, lastRun: '6 hours ago', timesRun: 52, actionsTaken: 0 },
  { id: 'a5', name: 'Generate weekly SEO report', description: 'Automatically compile and deliver a weekly SEO performance summary.', category: 'reports', status: 'enabled', riskLevel: 'safe', reversible: false, requiresApproval: false, lastRun: '3 days ago', timesRun: 12, actionsTaken: 12 },
  { id: 'a6', name: 'Auto-add FAQ schema', description: 'Automatically detect Q&A content patterns and generate FAQ schema drafts.', category: 'schema', status: 'requires-approval', riskLevel: 'moderate', reversible: true, requiresApproval: true, lastRun: '1 week ago', timesRun: 4, actionsTaken: 2 },
  { id: 'a7', name: 'Suggest internal links', description: 'Analyze content and suggest relevant internal linking opportunities.', category: 'links', status: 'enabled', riskLevel: 'safe', reversible: true, requiresApproval: true, lastRun: '12 hours ago', timesRun: 15, actionsTaken: 8 },
  { id: 'a8', name: 'Auto-generate content briefs', description: 'Create content briefs for identified content gaps based on keyword research.', category: 'content', status: 'disabled', riskLevel: 'safe', reversible: true, requiresApproval: true, lastRun: null, timesRun: 0, actionsTaken: 0 },
  { id: 'a9', name: 'Bulk redirect creation', description: 'Automatically create redirects for deleted or moved pages.', category: 'metadata', status: 'disabled', riskLevel: 'high', reversible: true, requiresApproval: true, lastRun: null, timesRun: 0, actionsTaken: 0 },
  { id: 'a10', name: 'Monthly comprehensive audit', description: 'Run a full technical SEO audit at the start of each month.', category: 'reports', status: 'enabled', riskLevel: 'safe', reversible: false, requiresApproval: false, lastRun: '20 days ago', timesRun: 6, actionsTaken: 6 },
];

export const mockAuditLog: AuditEntry[] = [
  { id: 'al1', timestamp: '2024-03-20 14:32:00', action: 'created', user: 'AI Assistant', target: 'Meta description for "WordPress SEO Guide"', targetType: 'metadata', description: 'Generated and applied meta description draft', previousState: null, newState: 'Complete guide to WordPress SEO: Learn on-page optimization, technical SEO, and content strategies to improve your search rankings.', canRollback: true, rolledBack: false },
  { id: 'al2', timestamp: '2024-03-20 14:30:00', action: 'approved', user: 'Admin', target: 'Meta description for "WordPress SEO Guide"', targetType: 'metadata', description: 'Approved AI-generated meta description', previousState: 'Draft', newState: 'Published', canRollback: true, rolledBack: false },
  { id: 'al3', timestamp: '2024-03-20 10:15:00', action: 'created', user: 'AI Assistant', target: 'FAQ schema for "Schema Markup Tutorial"', targetType: 'schema', description: 'Generated FAQ JSON-LD schema from existing Q&A content', previousState: null, newState: 'FAQPage schema with 6 questions', canRollback: true, rolledBack: false },
  { id: 'al4', timestamp: '2024-03-20 10:12:00', action: 'approved', user: 'Admin', target: 'FAQ schema for "Schema Markup Tutorial"', targetType: 'schema', description: 'Approved FAQ schema addition', previousState: 'Draft', newState: 'Applied', canRollback: true, rolledBack: false },
  { id: 'al5', timestamp: '2024-03-19 16:45:00', action: 'updated', user: 'AI Assistant', target: 'Alt text for 4 images on "Best SEO Tools"', targetType: 'metadata', description: 'Generated descriptive alt text for images missing alt attributes', previousState: '4 images without alt text', newState: '4 images with AI-generated alt text', canRollback: true, rolledBack: false },
  { id: 'al6', timestamp: '2024-03-19 16:40:00', action: 'approved', user: 'Admin', target: 'Alt text updates', targetType: 'metadata', description: 'Approved alt text changes after review', previousState: 'Pending review', newState: 'Applied', canRollback: true, rolledBack: false },
  { id: 'al7', timestamp: '2024-03-19 09:00:00', action: 'created', user: 'System', target: 'Weekly SEO Report — Week 12', targetType: 'automation', description: 'Automated weekly report generated', previousState: null, newState: 'Report available', canRollback: false, rolledBack: false },
  { id: 'al8', timestamp: '2024-03-18 11:20:00', action: 'updated', user: 'AI Assistant', target: 'Internal links: 3 links added to "SEO Guide"', targetType: 'links', description: 'Added contextual internal links to related content', previousState: '5 internal links', newState: '8 internal links', canRollback: true, rolledBack: false },
  { id: 'al9', timestamp: '2024-03-18 11:18:00', action: 'approved', user: 'Admin', target: 'Internal link additions', targetType: 'links', description: 'Approved suggested internal links', previousState: 'Suggested', newState: 'Applied', canRollback: true, rolledBack: false },
  { id: 'al10', timestamp: '2024-03-17 14:00:00', action: 'rolled-back', user: 'Admin', target: 'SEO title for "About Us" page', targetType: 'metadata', description: 'Rolled back AI-generated title change — preferred original', previousState: 'AI: "About SmartRank — Our Story & Mission in SEO"', newState: 'Original: "About Us"', canRollback: false, rolledBack: true },
  { id: 'al11', timestamp: '2024-03-17 13:55:00', action: 'rejected', user: 'Admin', target: 'SEO title for "About Us" page', targetType: 'metadata', description: 'Rejected AI title suggestion — did not match brand voice', previousState: 'Draft', newState: 'Rejected', canRollback: false, rolledBack: false },
  { id: 'al12', timestamp: '2024-03-16 08:30:00', action: 'created', user: 'System', target: 'Technical SEO Audit — March 16', targetType: 'automation', description: 'Scheduled technical audit completed. Found 23 issues.', previousState: null, newState: 'Audit complete: 3 critical, 7 high, 8 medium, 5 low', canRollback: false, rolledBack: false },
];

export const mockKeywordSuggestions: KeywordSuggestion[] = [
  { keyword: 'wordpress seo checklist', intent: 'informational', relevance: 'high', suggestedFor: 'WordPress SEO Guide', reason: 'Closely related to existing content with strong topical overlap. Could be a dedicated section or separate post.', currentRanking: null, volume: '6.6K', dataSource: 'estimated' },
  { keyword: 'how to improve seo ranking', intent: 'informational', relevance: 'high', suggestedFor: 'WordPress SEO Guide', reason: 'High-volume informational query that aligns with existing content expertise.', currentRanking: 24, volume: '14.8K', dataSource: 'measured' },
  { keyword: 'seo plugin comparison', intent: 'commercial', relevance: 'medium', suggestedFor: 'Best SEO Tools', reason: 'Commercial intent query related to existing tools content. Could expand current comparison.', currentRanking: null, volume: '3.2K', dataSource: 'estimated' },
  { keyword: 'json-ld schema examples', intent: 'informational', relevance: 'high', suggestedFor: 'Schema Markup Tutorial', reason: 'Directly related to existing schema content. Users searching this want practical examples.', currentRanking: 18, volume: '5.1K', dataSource: 'measured' },
  { keyword: 'local seo tips for small business', intent: 'informational', relevance: 'medium', suggestedFor: 'New page recommended', reason: 'Content gap identified. Existing local SEO content doesn\'t target small business specifically.', currentRanking: null, volume: '4.4K', dataSource: 'estimated' },
  { keyword: 'best seo tools 2024', intent: 'commercial', relevance: 'high', suggestedFor: 'Best SEO Tools 2024', reason: 'Already targeted but cannibalized across 3 pages. Needs consolidation.', currentRanking: 7, volume: '8.4K', dataSource: 'measured' },
  { keyword: 'technical seo audit checklist', intent: 'informational', relevance: 'high', suggestedFor: 'New page recommended', reason: 'Strong content gap. Site has audit functionality but no public-facing checklist content.', currentRanking: null, volume: '7.2K', dataSource: 'estimated' },
  { keyword: 'woocommerce seo settings', intent: 'informational', relevance: 'medium', suggestedFor: 'New page recommended', reason: 'WooCommerce integration exists but no dedicated guide. Untapped audience.', currentRanking: null, volume: '2.9K', dataSource: 'estimated' },
];

export const mockContentGaps: ContentGap[] = [
  { id: 'cg1', topic: 'Local SEO Checklist for Small Businesses', primaryKeyword: 'local seo checklist', supportingKeywords: ['local seo tips', 'small business seo', 'google maps optimization'], searchIntent: 'informational', estimatedVolume: '4.4K', competition: 'low', recommendedType: 'post', reason: 'High-volume, low-competition topic not covered. Existing local SEO content provides topical authority foundation.', relatedExistingContent: ['SEO Services page', 'About Us page'], priority: 'high', dataSource: 'ai-analysis' },
  { id: 'cg2', topic: 'Technical SEO Audit: Complete Checklist', primaryKeyword: 'technical seo checklist', supportingKeywords: ['technical seo audit', 'seo audit checklist', 'website seo check'], searchIntent: 'informational', estimatedVolume: '7.2K', competition: 'medium', recommendedType: 'post', reason: 'Site has audit functionality but no public-facing guide. Strong opportunity to showcase expertise.', relatedExistingContent: ['Schema Markup Tutorial', 'WordPress SEO Guide'], priority: 'high', dataSource: 'ai-analysis' },
  { id: 'cg3', topic: 'WooCommerce SEO: Product Optimization Guide', primaryKeyword: 'woocommerce seo', supportingKeywords: ['woocommerce product seo', 'ecommerce seo wordpress', 'product page optimization'], searchIntent: 'informational', estimatedVolume: '2.9K', competition: 'low', recommendedType: 'post', reason: 'Plugin supports WooCommerce but no guide exists. Low competition with clear commercial alignment.', relatedExistingContent: ['Premium SEO Plugin product page'], priority: 'medium', dataSource: 'ai-analysis' },
  { id: 'cg4', topic: 'How to Write SEO-Friendly Blog Posts', primaryKeyword: 'seo friendly blog posts', supportingKeywords: ['blog post seo', 'writing for seo', 'blog optimization'], searchIntent: 'informational', estimatedVolume: '9.9K', competition: 'high', recommendedType: 'post', reason: 'High-volume topic. Existing blog content demonstrates expertise but no definitive guide exists.', relatedExistingContent: ['WordPress SEO Guide', 'SEO Blog category'], priority: 'medium', dataSource: 'ai-analysis' },
  { id: 'cg5', topic: 'Schema Markup Examples & Templates', primaryKeyword: 'schema markup examples', supportingKeywords: ['json-ld examples', 'schema.org templates', 'structured data examples'], searchIntent: 'informational', estimatedVolume: '5.1K', competition: 'medium', recommendedType: 'post', reason: 'Related to existing Schema Tutorial. Could serve as a practical companion resource.', relatedExistingContent: ['Schema Markup Tutorial'], priority: 'medium', dataSource: 'ai-analysis' },
];

export const mockCannibalization: CannibalizationAlert[] = [
  { id: 'c1', keyword: 'best seo tools', competingPages: [
    { url: '/best-seo-tools', title: 'Best SEO Tools 2024', score: 67 },
    { url: '/wordpress-seo-guide#tools', title: 'WordPress SEO Guide — Tools Section', score: 92 },
    { url: '/blog/seo-tools-review', title: 'SEO Tools Review', score: 45 },
  ], recommendation: 'Consolidate: Keep /best-seo-tools as primary. Redirect /blog/seo-tools-review. Update WordPress Guide tools section to link to the primary page instead of competing.', severity: 'high' },
  { id: 'c2', keyword: 'schema markup', competingPages: [
    { url: '/schema-markup-tutorial', title: 'Schema Markup Tutorial', score: 85 },
    { url: '/blog/schema-guide', title: 'Schema Guide for Beginners', score: 58 },
  ], recommendation: 'Differentiate: Update /blog/schema-guide to target "schema markup for beginners" specifically. Add clear differentiation in titles and content focus.', severity: 'medium' },
];

export const mockReports: SEOReport[] = [
  {
    id: 'rp1', type: 'weekly', period: 'March 11–17, 2024', generatedAt: '2024-03-18 08:00',
    overallScore: 74, previousScore: 69,
    summary: 'SEO health improved by 5 points this week. Key improvements include adding meta descriptions to 6 pages, fixing 8 broken internal links, and generating FAQ schema for 3 pages. The content analysis identified 2 cannibalization issues that need attention.',
    highlights: [
      { label: 'SEO Health Score', value: '74/100', change: '+5', positive: true },
      { label: 'Pages Analyzed', value: '156', change: '+8', positive: true },
      { label: 'Missing Meta Descriptions', value: '8', change: '-6', positive: true },
      { label: 'Broken Links Fixed', value: '8', change: '+8', positive: true },
      { label: 'Schema Pages', value: '45', change: '+3', positive: true },
      { label: 'Organic Clicks', value: '2,890', change: '+18.2%', positive: true },
    ],
    completedTasks: 14, pendingTasks: 9,
    trafficChange: '+18.2% clicks vs previous week (data from Google Search Console)',
    topImprovements: ['Added meta descriptions to 6 pages', 'Fixed 8 broken internal links', 'Generated FAQ schema for 3 pages', 'Added alt text to 4 images', 'Resolved 1 cannibalization issue'],
    areasForImprovement: ['Product page still has thin content (420 words)', 'Contact page needs expansion and schema', '2 cannibalization issues remain unresolved', '5 pages still missing Open Graph tags'],
    dataLimitations: ['Ranking data requires a connected rank tracking API — currently unavailable', 'Some keyword volume data is estimated, not measured', 'Traffic data has a 2-3 day reporting delay from Google Search Console', 'Image analysis is limited to alt text and file size — visual content analysis requires AI API'],
  },
  {
    id: 'rp2', type: 'monthly', period: 'February 2024', generatedAt: '2024-03-01 08:00',
    overallScore: 69, previousScore: 58,
    summary: 'Significant improvement in February with SEO health score increasing by 11 points. The AI assistant completed 47 tasks, including metadata optimization for 23 pages, schema additions for 12 pages, and content improvements for 5 pages. Organic traffic increased by 34% compared to January.',
    highlights: [
      { label: 'SEO Health Score', value: '69/100', change: '+11', positive: true },
      { label: 'Tasks Completed', value: '47', change: '+22 vs Jan', positive: true },
      { label: 'Pages Optimized', value: '34', change: '+18', positive: true },
      { label: 'Schema Markup Pages', value: '42', change: '+15', positive: true },
      { label: 'Organic Clicks', value: '10,240', change: '+34%', positive: true },
      { label: 'Organic Impressions', value: '62,400', change: '+28%', positive: true },
    ],
    completedTasks: 47, pendingTasks: 12,
    trafficChange: '+34% organic clicks vs January (measured via Google Search Console)',
    topImprovements: ['Optimized metadata for 23 pages', 'Added schema markup to 12 pages', 'Resolved 5 critical technical issues', 'Created 3 new content pieces targeting identified gaps', 'Fixed redirect chains affecting 8 URLs'],
    areasForImprovement: ['Product pages need comprehensive content expansion', 'Local SEO presence needs strengthening', 'Image optimization backlog (40+ images)', 'Content cluster structure needs formalization'],
    dataLimitations: ['Ranking position data unavailable without rank tracking API', 'Keyword difficulty scores are third-party estimates', 'Traffic attribution is limited to organic search — does not include other channels', 'Some metrics have 28-day reporting delay from Google'],
  },
];
