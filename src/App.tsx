import React, { useState } from 'react';
import { 
  LayoutDashboard, Search, FileText, Bot, Key, Code2, 
  Globe, Link2, MapPin, BarChart3, ShoppingBag, Image,
  ArrowRightLeft, AlertTriangle, Settings, HelpCircle,
  FileDown, Puzzle, CreditCard, Menu, X, ChevronDown,
  TrendingUp, TrendingDown, CheckCircle2, AlertCircle,
  Zap, Shield, Database, Eye, ExternalLink, Star,
  ArrowUpRight, ArrowDownRight, Activity, Target
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

// Types
type PageType = 'dashboard' | 'onpage' | 'ai-assistant' | 'keywords' | 'schema' | 'sitemap' | 'audit' | 'redirects' | 'internal-links' | 'local-seo' | 'search-console' | 'rank-tracker' | 'woocommerce' | 'image-seo' | 'settings' | 'setup' | 'documentation';

// Mock Data
const seoHealthData = { score: 78, issues: 23, improvements: 12 };

const trafficData = [
  { date: 'Jan', clicks: 1240, impressions: 8900 },
  { date: 'Feb', clicks: 1580, impressions: 9800 },
  { date: 'Mar', clicks: 1890, impressions: 11200 },
  { date: 'Apr', clicks: 2100, impressions: 12400 },
  { date: 'May', clicks: 2450, impressions: 13800 },
  { date: 'Jun', clicks: 2890, impressions: 15200 },
];

const issueDistribution = [
  { name: 'Critical', value: 3, color: '#ef4444' },
  { name: 'High', value: 7, color: '#f97316' },
  { name: 'Medium', value: 8, color: '#eab308' },
  { name: 'Low', value: 5, color: '#22c55e' },
];

const keywordData = [
  { keyword: 'wordpress seo plugin', position: 3, change: 2, volume: '12.1K' },
  { keyword: 'best seo tools 2024', position: 7, change: -1, volume: '8.4K' },
  { keyword: 'on-page optimization', position: 5, change: 3, volume: '6.2K' },
  { keyword: 'schema markup generator', position: 12, change: 5, volume: '4.8K' },
  { keyword: 'xml sitemap wordpress', position: 4, change: 0, volume: '3.9K' },
  { keyword: 'meta description tips', position: 8, change: -2, volume: '2.1K' },
];

const auditIssues = [
  { id: 1, type: 'critical', title: 'Missing meta descriptions', count: 12, url: '/blog/*', fixable: true },
  { id: 2, type: 'critical', title: 'Broken internal links', count: 5, url: '/products/*', fixable: true },
  { id: 3, type: 'high', title: 'Missing alt text on images', count: 23, url: 'Multiple pages', fixable: true },
  { id: 4, type: 'high', title: 'Duplicate title tags', count: 4, url: '/category/*', fixable: true },
  { id: 5, type: 'medium', title: 'Long meta descriptions', count: 8, url: '/blog/*', fixable: true },
  { id: 6, type: 'medium', title: 'Missing canonical tags', count: 3, url: '/tag/*', fixable: true },
  { id: 7, type: 'low', title: 'Missing Open Graph tags', count: 15, url: 'Multiple pages', fixable: true },
  { id: 8, type: 'low', title: 'Long URLs detected', count: 6, url: '/blog/*', fixable: false },
];

const schemaTypes = [
  { type: 'Organization', status: 'active', pages: 1 },
  { type: 'WebSite', status: 'active', pages: 1 },
  { type: 'Article', status: 'active', pages: 45 },
  { type: 'BreadcrumbList', status: 'active', pages: 156 },
  { type: 'Product', status: 'active', pages: 28 },
  { type: 'FAQPage', status: 'active', pages: 8 },
  { type: 'LocalBusiness', status: 'active', pages: 3 },
  { type: 'VideoObject', status: 'inactive', pages: 0 },
];

const redirectRules = [
  { id: 1, source: '/old-page', target: '/new-page', type: '301', status: 'active', hits: 234 },
  { id: 2, source: '/blog/old-post', target: '/blog/new-post', type: '301', status: 'active', hits: 89 },
  { id: 3, source: '/promo', target: '/offers', type: '302', status: 'active', hits: 45 },
  { id: 4, source: '/legacy/product', target: '/shop/product', type: '301', status: 'inactive', hits: 12 },
];

const internalLinkSuggestions = [
  { source: 'Best SEO Practices 2024', target: 'On-Page Optimization Guide', anchor: 'on-page optimization techniques', reason: 'Related topic with high relevance', status: 'pending' },
  { source: 'WordPress Setup Guide', target: 'Schema Markup Tutorial', anchor: 'structured data implementation', reason: 'Logical next step for readers', status: 'pending' },
  { source: 'Content Marketing Tips', target: 'Keyword Research Methods', anchor: 'keyword research strategies', reason: 'Supporting topic cluster', status: 'approved' },
  { source: 'Technical SEO Basics', target: 'XML Sitemap Guide', anchor: 'creating XML sitemaps', reason: 'Directly related technical topic', status: 'pending' },
];

const localBusinessData = {
  name: 'SmartRank Demo Business',
  address: '123 SEO Street, Digital City, DC 10001',
  phone: '+1 (555) 123-4567',
  email: 'info@smartrank-demo.com',
  hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
  categories: ['Digital Marketing', 'SEO Services', 'Web Development'],
  areas: ['New York', 'New Jersey', 'Connecticut'],
};

// Sidebar Menu Items
const menuItems: { id: PageType; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'setup', label: 'Setup Wizard', icon: <Zap size={20} /> },
  { id: 'onpage', label: 'On-Page SEO', icon: <FileText size={20} /> },
  { id: 'ai-assistant', label: 'AI SEO Assistant', icon: <Bot size={20} />, badge: 'AI' },
  { id: 'keywords', label: 'Keyword Research', icon: <Key size={20} /> },
  { id: 'audit', label: 'Technical SEO Audit', icon: <Shield size={20} /> },
  { id: 'schema', label: 'Schema Generator', icon: <Code2 size={20} /> },
  { id: 'sitemap', label: 'XML Sitemaps', icon: <Globe size={20} /> },
  { id: 'redirects', label: 'Redirect Manager', icon: <ArrowRightLeft size={20} /> },
  { id: 'internal-links', label: 'Internal Links', icon: <Link2 size={20} /> },
  { id: 'local-seo', label: 'Local SEO', icon: <MapPin size={20} /> },
  { id: 'search-console', label: 'Search Console', icon: <BarChart3 size={20} /> },
  { id: 'rank-tracker', label: 'Rank Tracker', icon: <Target size={20} /> },
  { id: 'woocommerce', label: 'WooCommerce SEO', icon: <ShoppingBag size={20} /> },
  { id: 'image-seo', label: 'Image SEO', icon: <Image size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  { id: 'documentation', label: 'Documentation', icon: <HelpCircle size={20} /> },
];

// Components
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#1e293b" strokeWidth="8" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, changeType, icon }: { title: string; value: string; change?: string; changeType?: 'up' | 'down' | 'neutral'; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-green-400' : changeType === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
              {changeType === 'up' ? <ArrowUpRight size={14} /> : changeType === 'down' ? <ArrowDownRight size={14} /> : null}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Page Components
function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your website's SEO health and performance</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Activity size={16} /> Run Quick Audit
        </button>
      </div>

      {/* SEO Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm text-slate-400 mb-4">Overall SEO Health</h3>
          <ScoreRing score={seoHealthData.score} />
          <p className="text-sm text-slate-400 mt-4">{seoHealthData.issues} issues found</p>
        </div>
        <StatCard title="Organic Clicks" value="2,890" change="+18.2% vs last month" changeType="up" icon={<TrendingUp size={20} />} />
        <StatCard title="Impressions" value="15.2K" change="+12.5% vs last month" changeType="up" icon={<Eye size={20} />} />
        <StatCard title="Avg. Position" value="6.4" change="-0.8 vs last month" changeType="up" icon={<Target size={20} />} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Search Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="clicks" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="impressions" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div><span className="text-sm text-slate-400">Clicks</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-400"></div><span className="text-sm text-slate-400">Impressions</span></div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Issues by Priority</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={issueDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {issueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            {issueDistribution.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues Table & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Detected Issues</h3>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All →</button>
          </div>
          <div className="space-y-3">
            {auditIssues.slice(0, 5).map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${issue.type === 'critical' ? 'bg-red-500' : issue.type === 'high' ? 'bg-orange-500' : issue.type === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="text-sm text-white font-medium">{issue.title}</p>
                    <p className="text-xs text-slate-400">{issue.count} instances • {issue.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {issue.fixable && <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded">Auto-fix</span>}
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">Fix</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'Generate Sitemap', icon: <Globe size={16} />, color: 'bg-blue-500/10 text-blue-400' },
              { label: 'Run Full Audit', icon: <Shield size={16} />, color: 'bg-purple-500/10 text-purple-400' },
              { label: 'AI Content Brief', icon: <Bot size={16} />, color: 'bg-pink-500/10 text-pink-400' },
              { label: 'Check Redirects', icon: <ArrowRightLeft size={16} />, color: 'bg-amber-500/10 text-amber-400' },
              { label: 'Schema Validator', icon: <Code2 size={16} />, color: 'bg-cyan-500/10 text-cyan-400' },
            ].map(action => (
              <button key={action.label} className="w-full flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-indigo-500/30 transition-all text-left">
                <div className={`p-2 rounded-lg ${action.color}`}>{action.icon}</div>
                <span className="text-sm text-white">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent SEO Changes</h3>
        <div className="space-y-3">
          {[
            { action: 'Updated meta description for "Homepage"', time: '2 hours ago', user: 'Admin' },
            { action: 'Added Product schema to 3 product pages', time: '5 hours ago', user: 'Admin' },
            { action: 'Fixed 5 broken internal links', time: '1 day ago', user: 'Admin' },
            { action: 'Generated AI meta descriptions for 12 posts', time: '2 days ago', user: 'AI Assistant' },
            { action: 'Updated XML sitemap', time: '3 days ago', user: 'System' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-green-400" />
                <span className="text-sm text-slate-300">{item.action}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{item.user}</span>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OnPageSEOPage() {
  const [focusKeyphrase, setFocusKeyphrase] = useState('wordpress seo plugin');
  const [seoTitle, setSeoTitle] = useState('SmartRank AI SEO - Best WordPress SEO Plugin 2024');
  const [metaDesc, setMetaDesc] = useState('SmartRank AI SEO is the most advanced WordPress SEO plugin. Optimize your content, generate schema markup, manage sitemaps, and improve rankings with AI-powered tools.');

  const checks = [
    { label: 'Focus keyphrase in title', status: 'pass' },
    { label: 'Focus keyphrase in meta description', status: 'pass' },
    { label: 'SEO title length (50-60 chars)', status: 'pass' },
    { label: 'Meta description length (120-160 chars)', status: 'pass' },
    { label: 'Focus keyphrase in URL', status: 'pass' },
    { label: 'Focus keyphrase in first paragraph', status: 'pass' },
    { label: 'Keyphrase density (0.5-3%)', status: 'warning' },
    { label: 'Heading structure (H1-H6)', status: 'pass' },
    { label: 'Image alt text includes keyphrase', status: 'fail' },
    { label: 'Internal links present', status: 'pass' },
    { label: 'External links present', status: 'pass' },
    { label: 'Content length (300+ words)', status: 'pass' },
    { label: 'Readability score', status: 'pass' },
    { label: 'Canonical URL set', status: 'pass' },
    { label: 'Open Graph tags present', status: 'warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">On-Page SEO Editor</h1>
        <p className="text-slate-400 mt-1">Optimize your content for search engines with real-time analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Google Preview */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Google Search Preview</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-indigo-500/20 text-indigo-400 rounded-full">Desktop</button>
                <button className="px-3 py-1 text-xs bg-slate-700/50 text-slate-400 rounded-full">Mobile</button>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-blue-700 text-lg font-medium hover:underline cursor-pointer truncate">{seoTitle}</p>
              <p className="text-green-700 text-sm mt-1">https://example.com/{focusKeyphrase.replace(/\s+/g, '-')}</p>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{metaDesc}</p>
            </div>
          </div>

          {/* SEO Fields */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">SEO Fields</h3>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Focus Keyphrase</label>
              <input type="text" value={focusKeyphrase} onChange={e => setFocusKeyphrase(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">SEO Title <span className="text-slate-500">({seoTitle.length}/60)</span></label>
              <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${seoTitle.length > 60 ? 'bg-red-500' : seoTitle.length > 50 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min((seoTitle.length / 60) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Meta Description <span className="text-slate-500">({metaDesc.length}/160)</span></label>
              <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none resize-none" />
              <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${metaDesc.length > 160 ? 'bg-red-500' : metaDesc.length > 120 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min((metaDesc.length / 160) * 100, 100)}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Canonical URL</label>
                <input type="text" placeholder="https://example.com/page" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Robots Meta</label>
                <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                  <option>index, follow</option>
                  <option>noindex, follow</option>
                  <option>index, nofollow</option>
                  <option>noindex, nofollow</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">OG Title</label>
                <input type="text" placeholder="Open Graph title" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Schema Type</label>
                <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                  <option>Article</option>
                  <option>WebPage</option>
                  <option>Product</option>
                  <option>BlogPosting</option>
                  <option>FAQPage</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">SEO Score</h3>
              <ScoreRing score={82} size={80} />
            </div>
            <div className="space-y-2">
              {checks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {check.status === 'pass' ? <CheckCircle2 size={14} className="text-green-400" /> :
                   check.status === 'warning' ? <AlertCircle size={14} className="text-yellow-400" /> :
                   <X size={14} className="text-red-400" />}
                  <span className={check.status === 'pass' ? 'text-slate-300' : check.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}>{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">AI Suggestions</h3>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-sm text-indigo-300">💡 Add the focus keyphrase to at least one image alt text for better image SEO.</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-300">🔗 Consider adding 2-3 more internal links to related content.</p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm text-cyan-300">📝 Add Open Graph image for better social sharing appearance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIAssistantPage() {
  const [selectedTask, setSelectedTask] = useState('meta-description');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const tasks = [
    { id: 'meta-description', label: 'Meta Description', icon: '📝' },
    { id: 'seo-title', label: 'SEO Title', icon: '🏷️' },
    { id: 'blog-article', label: 'Blog Article', icon: '📄' },
    { id: 'content-brief', label: 'Content Brief', icon: '📋' },
    { id: 'product-description', label: 'Product Description', icon: '🛍️' },
    { id: 'faq-section', label: 'FAQ Section', icon: '❓' },
    { id: 'alt-text', label: 'Image Alt Text', icon: '🖼️' },
    { id: 'content-outline', label: 'Content Outline', icon: '📑' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const samples: Record<string, string> = {
        'meta-description': 'SmartRank AI SEO is the most comprehensive WordPress SEO plugin for 2024. Generate optimized meta descriptions, schema markup, and content with AI-powered tools. Improve your search rankings today.',
        'seo-title': 'SmartRank AI SEO: #1 WordPress SEO Plugin with AI Content Tools | 2024 Guide',
        'blog-article': '# How to Optimize Your WordPress Site for SEO in 2024\n\nSearch engine optimization continues to evolve, and WordPress site owners need to stay ahead of the curve. In this comprehensive guide, we\'ll walk you through the most effective SEO strategies...\n\n## 1. Focus on Core Web Vitals\n\nGoogle\'s emphasis on page experience means your site needs to load fast, be interactive, and maintain visual stability...\n\n## 2. Create Helpful, People-First Content\n\nThe Helpful Content Update rewards content that genuinely serves user needs. Focus on expertise, experience, and comprehensive coverage of your topic...\n\n## 3. Implement Structured Data\n\nSchema markup helps search engines understand your content better. Use SmartRank AI\'s schema generator to add appropriate structured data...',
        'content-brief': '# Content Brief: WordPress SEO Best Practices\n\n**Target Keyword:** wordpress seo best practices\n**Secondary Keywords:** wordpress optimization, seo tips, wordpress plugin\n**Search Intent:** Informational\n**Target Word Count:** 2,500-3,000 words\n**Target Audience:** WordPress site owners, beginner to intermediate\n\n## Outline\n1. Introduction (200 words)\n2. Why WordPress SEO Matters (300 words)\n3. Essential SEO Settings (500 words)\n4. On-Page Optimization Checklist (600 words)\n5. Technical SEO for WordPress (400 words)\n6. Content Strategy Tips (300 words)\n7. Conclusion & Next Steps (200 words)\n\n## Key Points to Cover\n- XML sitemaps configuration\n- Schema markup implementation\n- Internal linking strategy\n- Image optimization\n- Mobile responsiveness',
        'product-description': 'Transform your WordPress SEO strategy with SmartRank AI — the intelligent SEO plugin that combines powerful optimization tools with cutting-edge AI assistance.\n\n**Key Features:**\n• AI-powered content optimization\n• Real-time SEO analysis\n• Automated schema markup generation\n• XML sitemap management\n• Technical SEO auditing\n• Keyword research tools\n• Internal link suggestions\n• WooCommerce integration\n\n**Why Choose SmartRank AI?**\nUnlike other SEO plugins, SmartRank AI doesn\'t just tell you what\'s wrong — it helps you fix it. Our AI assistant generates optimized meta descriptions, suggests content improvements, and creates schema markup automatically.\n\nPerfect for bloggers, e-commerce stores, and businesses looking to improve their organic search visibility.',
        'faq-section': '## Frequently Asked Questions\n\n### What is SmartRank AI SEO?\nSmartRank AI SEO is a comprehensive WordPress plugin that combines traditional SEO tools with artificial intelligence to help you optimize your website for search engines.\n\n### Do I need AI features to use the plugin?\nNo! All core SEO features work without AI. The AI assistant is an optional enhancement that helps generate and optimize content faster.\n\n### Is SmartRank AI compatible with WooCommerce?\nYes, SmartRank AI includes dedicated WooCommerce SEO features for optimizing product pages, categories, and shop pages.\n\n### How does the technical SEO audit work?\nThe audit scans your website for common SEO issues like broken links, missing meta tags, duplicate content, and schema errors. Results are prioritized by impact and can be auto-fixed where safe.',
        'alt-text': 'Professional WordPress dashboard showing SEO health score of 78 out of 100, with charts displaying organic traffic growth and search performance metrics over six months',
        'content-outline': '# Content Outline: Complete Guide to Technical SEO\n\n## I. Introduction\n- What is technical SEO?\n- Why it matters for rankings\n- Technical SEO vs. on-page SEO\n\n## II. Site Architecture\n- URL structure best practices\n- Internal linking strategy\n- Breadcrumb navigation\n- Category/taxonomy organization\n\n## III. Crawlability & Indexability\n- robots.txt configuration\n- XML sitemaps\n- Canonical tags\n- Pagination handling\n- JavaScript rendering considerations\n\n## IV. Page Speed & Performance\n- Core Web Vitals optimization\n- Image optimization\n- Caching strategies\n- CDN implementation\n\n## V. Mobile Optimization\n- Responsive design\n- Mobile-first indexing\n- AMP considerations\n\n## VI. Security\n- HTTPS implementation\n- Security headers\n- Mixed content issues\n\n## VII. Structured Data\n- Schema.org types\n- JSON-LD implementation\n- Rich results eligibility\n\n## VIII. Monitoring & Maintenance\n- Regular audit schedule\n- Tools and automation\n- Performance tracking',
      };
      setGeneratedContent(samples[selectedTask] || 'Content will be generated here...');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI SEO Assistant</h1>
        <p className="text-slate-400 mt-1">Generate and optimize SEO content with artificial intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Task Selection */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Content Type</h3>
          <div className="space-y-1">
            {tasks.map(task => (
              <button key={task.id} onClick={() => setSelectedTask(task.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedTask === task.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                <span>{task.icon}</span>
                <span>{task.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Configuration</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Primary Keyword</label>
              <input type="text" defaultValue="wordpress seo plugin" className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Audience</label>
              <input type="text" defaultValue="WordPress site owners" className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tone of Voice</label>
              <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>Professional</option>
                <option>Conversational</option>
                <option>Technical</option>
                <option>Friendly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Language</label>
              <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Content Length</label>
              <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>Short (150-300 words)</option>
                <option>Medium (500-800 words)</option>
                <option>Long (1000-2000 words)</option>
                <option>Comprehensive (2000+ words)</option>
              </select>
            </div>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {isGenerating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</> : <><Bot size={16} /> Generate with AI</>}
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">AI Provider</h3>
            <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none mb-3">
              <option>OpenAI (GPT-4)</option>
              <option>Anthropic (Claude)</option>
              <option>Google (Gemini)</option>
            </select>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>API Credits Used</span>
              <span className="text-indigo-400">247 / 1,000</span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '24.7%' }}></div>
            </div>
          </div>
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Generated Content</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700">Copy</button>
              <button className="px-3 py-1.5 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">Apply to Post</button>
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4 min-h-[400px] border border-slate-700/30">
            {generatedContent ? (
              <div className="prose prose-inverse prose-sm max-w-none">
                {generatedContent.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mb-2">{line.replace('# ', '')}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} className="text-md font-medium text-white mt-3 mb-1">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white">{line.replace(/\*\*/g, '')}</p>;
                  if (line.startsWith('•') || line.startsWith('-')) return <p key={i} className="text-slate-300 pl-4">• {line.replace(/^[•-]\s*/, '')}</p>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} className="text-slate-300 leading-relaxed">{line}</p>;
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <Bot size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400">Configure your settings and click "Generate with AI"</p>
                <p className="text-sm text-slate-500 mt-1">Content will appear here</p>
              </div>
            )}
          </div>
          {generatedContent && (
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <span>📊 Word count: {generatedContent.split(/\s+/).length}</span>
              <span>🎯 Keyphrase density: 1.8%</span>
              <span>📖 Readability: Good</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KeywordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Keyword Research</h1>
          <p className="text-slate-400 mt-1">Manage, organize, and track your target keywords</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">+ Add Keywords</button>
      </div>

      {/* Keyword Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Keywords" value="156" icon={<Key size={20} />} />
        <StatCard title="Keyword Groups" value="12" icon={<Database size={20} />} />
        <StatCard title="Mapped to Pages" value="89" change="57% coverage" changeType="neutral" icon={<Link2 size={20} />} />
        <StatCard title="Cannibalization Alerts" value="3" change="Needs attention" changeType="down" icon={<AlertTriangle size={20} />} />
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Search keywords..." className="flex-1 min-w-[200px] px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
          <select className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
            <option>All Groups</option>
            <option>SEO Tools</option>
            <option>WordPress</option>
            <option>Content Marketing</option>
          </select>
          <select className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
            <option>All Intents</option>
            <option>Informational</option>
            <option>Commercial</option>
            <option>Transactional</option>
            <option>Navigational</option>
          </select>
          <button className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Export CSV</button>
        </div>
      </div>

      {/* Keyword Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Keyword</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Volume</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Position</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Change</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Intent</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Mapped To</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keywordData.map((kw, i) => (
              <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="px-6 py-3">
                  <span className="text-sm text-white font-medium">{kw.keyword}</span>
                </td>
                <td className="px-6 py-3 text-sm text-slate-300">{kw.volume}</td>
                <td className="px-6 py-3">
                  <span className="text-sm text-white font-medium">{kw.position}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={`flex items-center gap-1 text-sm ${kw.change > 0 ? 'text-green-400' : kw.change < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {kw.change > 0 ? <ArrowUpRight size={14} /> : kw.change < 0 ? <ArrowDownRight size={14} /> : '—'}
                    {kw.change !== 0 ? Math.abs(kw.change) : ''}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-full">Informational</span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-sm text-slate-400">/blog/seo-guide</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                    <button className="text-xs text-slate-400 hover:text-white">Map</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Topic Clusters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Topic Clusters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'WordPress SEO', keywords: 24, pillar: 'WordPress SEO Guide', color: 'border-indigo-500/30' },
            { name: 'Technical SEO', keywords: 18, pillar: 'Technical SEO Checklist', color: 'border-purple-500/30' },
            { name: 'Content Marketing', keywords: 15, pillar: 'Content Strategy Guide', color: 'border-cyan-500/30' },
          ].map(cluster => (
            <div key={cluster.name} className={`p-4 bg-slate-900/50 rounded-lg border ${cluster.color}`}>
              <h4 className="text-sm font-semibold text-white">{cluster.name}</h4>
              <p className="text-xs text-slate-400 mt-1">Pillar: {cluster.pillar}</p>
              <p className="text-xs text-slate-400 mt-1">{cluster.keywords} keywords</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(cluster.keywords / 30) * 100}%` }}></div>
                </div>
                <span className="text-xs text-slate-400">{Math.round((cluster.keywords / 30) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SchemaPage() {
  const schemaExample = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "SmartRank AI SEO Plugin Review",
  "description": "A comprehensive review of the SmartRank AI SEO plugin for WordPress",
  "author": {
    "@type": "Person",
    "name": "John Smith"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-03-20",
  "publisher": {
    "@type": "Organization",
    "name": "SmartRank",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/smartrank-review"
  }
}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Schema Markup Generator</h1>
        <p className="text-slate-400 mt-1">Generate and validate structured data for rich search results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schema Types */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Schema Types</h3>
          <div className="space-y-2">
            {schemaTypes.map(schema => (
              <div key={schema.type} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${schema.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                  <span className="text-sm text-white">{schema.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{schema.pages} pages</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${schema.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {schema.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schema Configuration */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Configure Schema</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Schema Type</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>Article</option>
                <option>BlogPosting</option>
                <option>Product</option>
                <option>Organization</option>
                <option>LocalBusiness</option>
                <option>FAQPage</option>
                <option>WebPage</option>
                <option>VideoObject</option>
                <option>Event</option>
                <option>Person</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Apply To</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>All Posts</option>
                <option>All Pages</option>
                <option>Products</option>
                <option>Specific URL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Author Name</label>
              <input type="text" defaultValue="John Smith" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Organization Name</label>
              <input type="text" defaultValue="SmartRank" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <button className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              Generate Schema
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">JSON-LD Output</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg">✓ Valid</button>
              <button className="px-3 py-1 text-xs bg-slate-700/50 text-slate-300 rounded-lg">Copy</button>
            </div>
          </div>
          <pre className="bg-slate-900/50 rounded-lg p-4 text-xs text-green-300 overflow-auto max-h-[400px] border border-slate-700/30">
            {schemaExample}
          </pre>
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-300">✓ Schema validated successfully. No errors detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Technical SEO Audit</h1>
          <p className="text-slate-400 mt-1">Comprehensive website audit for technical SEO issues</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Export Report</button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Shield size={16} /> Start New Audit
          </button>
        </div>
      </div>

      {/* Audit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">3</p>
          <p className="text-sm text-red-300 mt-1">Critical</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">7</p>
          <p className="text-sm text-orange-300 mt-1">High</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">8</p>
          <p className="text-sm text-yellow-300 mt-1">Medium</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">5</p>
          <p className="text-sm text-green-300 mt-1">Low</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-white">156</p>
          <p className="text-sm text-slate-400 mt-1">Pages Scanned</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Detected Issues</h3>
        </div>
        <div className="divide-y divide-slate-700/30">
          {auditIssues.map(issue => (
            <div key={issue.id} className="px-6 py-4 hover:bg-slate-700/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${issue.type === 'critical' ? 'bg-red-500' : issue.type === 'high' ? 'bg-orange-500' : issue.type === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">{issue.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{issue.count} instances affected • {issue.url}</p>
                    <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-400">
                      <strong className="text-slate-300">Why it matters:</strong> {issue.type === 'critical' ? 'Critical SEO issues can prevent pages from being properly indexed and ranked.' : issue.type === 'high' ? 'High-priority issues significantly impact search visibility and user experience.' : 'Medium-priority issues may affect SEO performance over time.'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {issue.fixable && <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded">Auto-fixable</span>}
                  <span className={`text-xs px-2 py-1 rounded capitalize ${issue.type === 'critical' ? 'bg-red-500/10 text-red-400' : issue.type === 'high' ? 'bg-orange-500/10 text-orange-400' : issue.type === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>{issue.type}</span>
                  <button className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30">Fix</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Schedule */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Audit Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400">Last Audit</p>
            <p className="text-white font-medium mt-1">March 20, 2024 at 3:45 AM</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400">Next Scheduled</p>
            <p className="text-white font-medium mt-1">March 27, 2024 at 3:00 AM</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-sm text-slate-400">Frequency</p>
            <select className="mt-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function RedirectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Redirect Manager</h1>
          <p className="text-slate-400 mt-1">Manage 301, 302, and 307 redirects safely</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Import CSV</button>
          <button className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Export</button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">+ Add Redirect</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Redirects" value="24" icon={<ArrowRightLeft size={20} />} />
        <StatCard title="Total Hits (30d)" value="1,847" change="+12% vs last period" changeType="up" icon={<Activity size={20} />} />
        <StatCard title="404 Errors (7d)" value="8" change="-3 vs last week" changeType="up" icon={<AlertTriangle size={20} />} />
        <StatCard title="Loops Detected" value="0" icon={<Shield size={20} />} />
      </div>

      {/* Add Redirect Form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Redirect</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Source URL</label>
            <input type="text" placeholder="/old-page" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Destination URL</label>
            <input type="text" placeholder="/new-page" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Redirect Type</label>
            <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option>301 (Permanent)</option>
              <option>302 (Temporary)</option>
              <option>307 (Temporary)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Add Redirect</button>
          </div>
        </div>
      </div>

      {/* Redirects Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Source</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Destination</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Hits</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {redirectRules.map(rule => (
              <tr key={rule.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="px-6 py-3 text-sm text-white font-mono">{rule.source}</td>
                <td className="px-6 py-3 text-sm text-slate-300 font-mono">{rule.target}</td>
                <td className="px-6 py-3">
                  <span className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded">{rule.type}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${rule.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{rule.status}</span>
                </td>
                <td className="px-6 py-3 text-sm text-slate-300">{rule.hits}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                    <button className="text-xs text-red-400 hover:text-red-300">Delete</button>
                    <button className="text-xs text-slate-400 hover:text-white">Test</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InternalLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Internal Link Assistant</h1>
        <p className="text-slate-400 mt-1">Discover and manage internal linking opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Suggestions" value="34" icon={<Link2 size={20} />} />
        <StatCard title="Orphan Pages" value="5" change="Needs attention" changeType="down" icon={<AlertTriangle size={20} />} />
        <StatCard title="Links Added (30d)" value="18" change="+6 vs last month" changeType="up" icon={<CheckCircle2 size={20} />} />
      </div>

      {/* Suggestions */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Link Suggestions</h3>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Approve All</button>
        </div>
        <div className="space-y-3">
          {internalLinkSuggestions.map((suggestion, i) => (
            <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">From:</span>
                    <span className="text-white font-medium">{suggestion.source}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-indigo-400 font-medium">{suggestion.target}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    <span className="text-slate-300">Anchor:</span> "{suggestion.anchor}"
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="text-slate-300">Reason:</span> {suggestion.reason}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`text-xs px-2 py-1 rounded ${suggestion.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {suggestion.status}
                  </span>
                  {suggestion.status === 'pending' && (
                    <>
                      <button className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">Approve</button>
                      <button className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Dismiss</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orphan Pages */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Orphan Pages (No Internal Links)</h3>
        <div className="space-y-2">
          {['About Us - /about', 'Privacy Policy - /privacy', 'Terms of Service - /terms', 'Old Blog Post - /blog/old-post-2022', 'Archive Page - /archive/2021'].map((page, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
              <span className="text-sm text-white">{page}</span>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">Find Links</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocalSEOPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Local SEO</h1>
        <p className="text-slate-400 mt-1">Manage your business information for local search visibility</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Business Name</label>
              <input type="text" defaultValue={localBusinessData.name} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Address</label>
              <input type="text" defaultValue={localBusinessData.address} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phone</label>
                <input type="text" defaultValue={localBusinessData.phone} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input type="text" defaultValue={localBusinessData.email} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Opening Hours</label>
              <input type="text" defaultValue={localBusinessData.hours} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Business Description</label>
              <textarea rows={3} defaultValue="SmartRank Demo Business provides professional SEO services and digital marketing solutions for businesses of all sizes."
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Categories</label>
              <div className="flex flex-wrap gap-2">
                {localBusinessData.categories.map(cat => (
                  <span key={cat} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs">{cat}</span>
                ))}
              </div>
            </div>
            <button className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Save Business Info</button>
          </div>
        </div>

        {/* Service Areas & Map */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Service Areas</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {localBusinessData.areas.map(area => (
                <span key={area} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm flex items-center gap-2">
                  <MapPin size={12} className="text-indigo-400" /> {area}
                </span>
              ))}
              <button className="px-3 py-1.5 border border-dashed border-slate-600 text-slate-400 rounded-lg text-sm hover:border-indigo-500 hover:text-indigo-400">+ Add Area</button>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">LocalBusiness Schema</h3>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
              <p className="text-sm text-green-300">✓ LocalBusiness schema is active and valid</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-sm">
                <span className="text-slate-400">Schema Type</span>
                <span className="text-white">LocalBusiness</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-sm">
                <span className="text-slate-400">Geo Coordinates</span>
                <span className="text-white">40.7128, -74.0060</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded text-sm">
                <span className="text-slate-400">Price Range</span>
                <span className="text-white">$$</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Locations</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <div>
                  <p className="text-sm text-white font-medium">Main Office - New York</p>
                  <p className="text-xs text-slate-400">123 SEO Street, Digital City</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded">Primary</span>
              </div>
              <button className="w-full p-3 border border-dashed border-slate-600 text-slate-400 rounded-lg text-sm hover:border-indigo-500 hover:text-indigo-400">+ Add Location</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchConsolePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Google Search Console</h1>
          <p className="text-slate-400 mt-1">Monitor your search performance and indexing status</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-green-400">Connected</span>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Search Performance (Last 6 Months)</h3>
          <div className="flex gap-2">
            <select className="px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-xs">
              <option>Last 28 days</option>
              <option>Last 3 months</option>
              <option>Last 6 months</option>
              <option>Last 12 months</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="clicks" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Clicks" value="12,150" change="+23.4% vs previous" changeType="up" icon={<TrendingUp size={20} />} />
        <StatCard title="Impressions" value="71.3K" change="+15.8% vs previous" changeType="up" icon={<Eye size={20} />} />
        <StatCard title="Avg. CTR" value="17.0%" change="+1.2% vs previous" changeType="up" icon={<Activity size={20} />} />
        <StatCard title="Avg. Position" value="6.4" change="-0.8 vs previous" changeType="up" icon={<Target size={20} />} />
      </div>

      {/* Top Queries */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Search Queries</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Query</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Clicks</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Impressions</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">CTR</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-slate-400 uppercase">Position</th>
            </tr>
          </thead>
          <tbody>
            {[
              { query: 'wordpress seo plugin', clicks: 456, impressions: 3200, ctr: '14.3%', position: '4.2' },
              { query: 'best seo tools', clicks: 234, impressions: 2100, ctr: '11.1%', position: '7.8' },
              { query: 'schema markup generator', clicks: 189, impressions: 1400, ctr: '13.5%', position: '5.1' },
              { query: 'xml sitemap wordpress', clicks: 156, impressions: 980, ctr: '15.9%', position: '3.4' },
              { query: 'on-page seo checklist', clicks: 123, impressions: 890, ctr: '13.8%', position: '6.2' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="px-4 py-3 text-sm text-white">{row.query}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{row.clicks}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{row.impressions.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{row.ctr}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{row.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure SmartRank AI SEO plugin settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Website Type</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>Blog</option>
                <option>E-commerce</option>
                <option>Business</option>
                <option>Portfolio</option>
                <option>News/Media</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Site Name</label>
              <input type="text" defaultValue="My Website" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Default Title Separator</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>- (Dash)</option>
                <option>| (Pipe)</option>
                <option>» (Guillemet)</option>
                <option>~ (Tilde)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Enable XML Sitemaps</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Enable Schema Markup</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Enable Redirects</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">AI Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">AI Provider</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google AI</option>
                <option>Custom API</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">API Key</label>
              <input type="password" defaultValue="sk-••••••••••••••••" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Model</label>
              <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                <option>gpt-4-turbo</option>
                <option>gpt-4</option>
                <option>gpt-3.5-turbo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Monthly AI Budget Limit</label>
              <input type="text" defaultValue="$50.00" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">API Usage This Month</span>
                <span className="text-indigo-400">$12.47 / $50.00</span>
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Console */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 size={20} className="text-green-400" />
                  <div>
                    <p className="text-sm text-white font-medium">Google Search Console</p>
                    <p className="text-xs text-green-400">Connected</p>
                  </div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300">Disconnect</button>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-purple-400" />
                  <div>
                    <p className="text-sm text-white font-medium">WooCommerce</p>
                    <p className="text-xs text-purple-400">Detected</p>
                  </div>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">Configure</button>
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-amber-400" />
                  <div>
                    <p className="text-sm text-white font-medium">Rank Tracking API</p>
                    <p className="text-xs text-slate-400">Not configured</p>
                  </div>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">Setup</button>
              </div>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-yellow-400" />
                <div>
                  <p className="text-sm text-white font-medium">Compatibility Notice</p>
                  <p className="text-xs text-yellow-300">Yoast SEO detected. Enable compatibility mode.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Reset to Defaults</button>
        <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Save Settings</button>
      </div>
    </div>
  );
}

function SetupWizardPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Setup Wizard</h1>
        <p className="text-slate-400 mt-1">Get SmartRank AI SEO configured in minutes</p>
      </div>

      {/* Progress */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          {['Site Info', 'Features', 'AI Setup', 'Search Console', 'Complete'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= step ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                {i + 1 <= step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`ml-2 text-sm hidden md:inline ${i + 1 <= step ? 'text-white' : 'text-slate-400'}`}>{label}</span>
              {i < 4 && <div className={`w-8 md:w-16 h-0.5 mx-2 ${i + 1 < step ? 'bg-indigo-600' : 'bg-slate-700'}`}></div>}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-8">
          {step === 1 && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Tell us about your site</h3>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Website Type</label>
                <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                  <option>Blog</option>
                  <option>E-commerce Store</option>
                  <option>Business Website</option>
                  <option>Portfolio</option>
                  <option>News/Media</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Primary Industry</label>
                <input type="text" placeholder="e.g., Technology, Health, Finance" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Target Country</label>
                <input type="text" defaultValue="United States" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Choose your features</h3>
              {['XML Sitemaps', 'Schema Markup', 'Redirect Manager', 'Technical Audits', 'AI Content Assistant', 'Internal Link Suggestions', 'Local SEO', 'WooCommerce SEO'].map(feature => (
                <div key={feature} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-sm text-white">{feature}</span>
                  <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Configure AI Assistant</h3>
              <div>
                <label className="block text-sm text-slate-400 mb-1">AI Provider</label>
                <select className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
                  <option>OpenAI (GPT-4)</option>
                  <option>Anthropic (Claude)</option>
                  <option>Google (Gemini)</option>
                  <option>Skip for now</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">API Key (optional)</label>
                <input type="password" placeholder="sk-..." className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <p className="text-xs text-slate-400">You can configure this later in Settings. AI features are optional - all core SEO tools work without AI.</p>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Connect Google Search Console</h3>
              <p className="text-sm text-slate-400">Connect your Google Search Console account to monitor search performance, clicks, impressions, and more.</p>
              <button className="w-full px-4 py-3 bg-white text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-100 flex items-center justify-center gap-2">
                <BarChart3 size={18} /> Connect with Google
              </button>
              <p className="text-xs text-slate-400 text-center">Or skip this step and connect later</p>
            </div>
          )}
          {step === 5 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Setup Complete!</h3>
              <p className="text-sm text-slate-400">SmartRank AI SEO is ready to help improve your website's search visibility.</p>
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">Go to Dashboard</button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700">
              Previous
            </button>
            <button onClick={() => setStep(Math.min(5, step + 1))}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              {step === 4 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documentation</h1>
        <p className="text-slate-400 mt-1">Complete guide to SmartRank AI SEO plugin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 h-fit sticky top-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contents</h3>
          <nav className="space-y-1">
            {[
              'Getting Started', 'Installation', 'Configuration', 'Dashboard Overview',
              'On-Page SEO', 'AI Assistant', 'Keyword Research', 'Technical Audits',
              'Schema Markup', 'XML Sitemaps', 'Redirect Manager', 'Internal Links',
              'Local SEO', 'Search Console', 'WooCommerce', 'Security', 'API Reference',
              'Troubleshooting', 'Changelog'
            ].map(item => (
              <a key={item} href="#" className="block px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors">{item}</a>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Getting Started</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              SmartRank AI SEO is a comprehensive WordPress SEO plugin that helps you optimize your website for search engines. It combines traditional SEO tools with AI-powered content generation to give you everything you need to improve your organic search visibility.
            </p>
            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Key Features</h3>
            <ul className="space-y-2 text-slate-300">
              {[
                'Complete on-page SEO optimization with real-time analysis',
                'AI-powered content generation and optimization',
                'Technical SEO auditing with automated fixes',
                'Schema markup generator supporting 15+ types',
                'XML sitemap management',
                'Redirect manager with loop detection',
                'Internal link assistant',
                'Local SEO management',
                'Google Search Console integration',
                'Keyword research and tracking',
                'WooCommerce SEO support',
                'Image SEO optimization',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Installation</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Method 1: WordPress Dashboard</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                  <li>Go to Plugins → Add New in your WordPress admin</li>
                  <li>Search for "SmartRank AI SEO"</li>
                  <li>Click Install Now, then Activate</li>
                  <li>Follow the Setup Wizard to configure the plugin</li>
                </ol>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Method 2: Manual Upload</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                  <li>Download the plugin ZIP file</li>
                  <li>Go to Plugins → Add New → Upload Plugin</li>
                  <li>Choose the ZIP file and click Install Now</li>
                  <li>Activate the plugin after installation</li>
                </ol>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">System Requirements</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>• WordPress 5.8 or higher</li>
                  <li>• PHP 7.4 or higher (PHP 8.0+ recommended)</li>
                  <li>• MySQL 5.7 or higher</li>
                  <li>• At least 64MB available memory</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Plugin Architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Core Module', desc: 'Metadata management, settings, admin pages' },
                { title: 'On-Page SEO', desc: 'Content analysis, meta editor, snippet preview' },
                { title: 'AI Engine', desc: 'Content generation, optimization suggestions' },
                { title: 'Schema Engine', desc: 'JSON-LD generation and validation' },
                { title: 'Sitemap Engine', desc: 'XML sitemap generation and management' },
                { title: 'Audit Engine', desc: 'Technical SEO scanning and reporting' },
                { title: 'Redirect Engine', desc: 'URL redirect management and monitoring' },
                { title: 'Integration Layer', desc: 'GSC, WooCommerce, third-party APIs' },
              ].map(mod => (
                <div key={mod.title} className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-sm font-medium text-white">{mod.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Security</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>SmartRank AI SEO follows WordPress security best practices:</p>
              <ul className="space-y-2">
                {[
                  'All user inputs are sanitized before processing',
                  'All outputs are properly escaped to prevent XSS',
                  'Database queries use prepared statements',
                  'Nonces verify all form submissions',
                  'Capability checks on all admin pages',
                  'REST API endpoints require proper authentication',
                  'API keys stored securely using WordPress encryption',
                  'Rate limiting on AI API calls',
                  'Audit logging for sensitive operations',
                  'No modification of WordPress core files',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Shield size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Changelog</h2>
            <div className="space-y-4">
              {[
                { version: '1.5.0', date: 'March 2024', changes: ['Added AI content brief generator', 'Improved schema validation', 'New internal link algorithm', 'Performance optimizations'] },
                { version: '1.4.0', date: 'February 2024', changes: ['WooCommerce SEO module', 'Local SEO improvements', 'Bug fixes and security patches'] },
                { version: '1.3.0', date: 'January 2024', changes: ['Google Search Console integration', 'Rank tracker module', 'Image SEO tools'] },
                { version: '1.2.0', date: 'December 2023', changes: ['AI assistant with multiple providers', 'Keyword research module', 'Technical audit engine'] },
                { version: '1.0.0', date: 'November 2023', changes: ['Initial release', 'On-page SEO editor', 'Schema generator', 'XML sitemaps', 'Redirect manager'] },
              ].map(release => (
                <div key={release.version} className="p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-indigo-400">v{release.version}</span>
                    <span className="text-xs text-slate-500">{release.date}</span>
                  </div>
                  <ul className="space-y-1">
                    {release.changes.map((change, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericPage({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 mt-1">{description}</p>
      </div>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Module Available</h3>
        <p className="text-slate-400 max-w-md mx-auto">This module is fully implemented in the WordPress plugin. View the documentation for setup instructions and feature details.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">View Documentation</button>
          <button className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Configure</button>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'onpage': return <OnPageSEOPage />;
      case 'ai-assistant': return <AIAssistantPage />;
      case 'keywords': return <KeywordsPage />;
      case 'schema': return <SchemaPage />;
      case 'sitemap': return <GenericPage title="XML Sitemaps" description="Manage and configure your XML sitemaps" icon={<Globe size={32} />} />;
      case 'audit': return <AuditPage />;
      case 'redirects': return <RedirectsPage />;
      case 'internal-links': return <InternalLinksPage />;
      case 'local-seo': return <LocalSEOPage />;
      case 'search-console': return <SearchConsolePage />;
      case 'rank-tracker': return <GenericPage title="Rank Tracker" description="Track keyword positions over time" icon={<Target size={32} />} />;
      case 'woocommerce': return <GenericPage title="WooCommerce SEO" description="Optimize your WooCommerce products for search" icon={<ShoppingBag size={32} />} />;
      case 'image-seo': return <GenericPage title="Image SEO" description="Optimize images for search engines" icon={<Image size={32} />} />;
      case 'settings': return <SettingsPage />;
      case 'setup': return <SetupWizardPage />;
      case 'documentation': return <DocumentationPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800/80 border-r border-slate-700/50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">SmartRank AI</h1>
              <p className="text-xs text-slate-400">SEO Plugin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentPage === item.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && <span className="text-xs px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded">{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <Star size={14} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-white font-medium">Pro Version</p>
              <p className="text-xs text-slate-400">Active</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                <span>SmartRank AI SEO</span>
                <span>/</span>
                <span className="text-white">{menuItems.find(m => m.id === currentPage)?.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                <Search size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 relative">
                <AlertTriangle size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
