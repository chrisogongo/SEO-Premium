import React, { useState } from 'react';
import {
  Bot, Brain, Target, AlertTriangle, CheckCircle2, XCircle, Clock,
  TrendingUp, TrendingDown, Eye, FileText, Link2, Code2, Shield,
  Zap, BarChart3, ChevronDown, ChevronRight, ArrowRight, ArrowUpRight,
  ArrowDownRight, RefreshCw, Play, Pause, Settings2, History,
  Download, Filter, Search, Lightbulb, Layers, GitBranch,
  AlertCircle, Info, ExternalLink, Copy, Check, X, RotateCcw,
  Activity, Sparkles, BookOpen, MessageSquare, PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  mockContentAnalysis, mockRecommendations, mockAutomationRules,
  mockAuditLog, mockKeywordSuggestions, mockContentGaps,
  mockCannibalization, mockReports,
  type ContentAnalysis, type Recommendation, type AutomationRule,
  type AuditEntry, type Priority, type Impact, type Effort, type Confidence
} from './data';

type TabId = 'overview' | 'analysis' | 'recommendations' | 'keywords' | 'automation' | 'reports' | 'audit';

// ============================================================
// UTILITY COMPONENTS
// ============================================================

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }) {
  const colors = {
    default: 'bg-slate-700/50 text-slate-300',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[variant]}`}>{children}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    critical: { label: 'Critical', variant: 'danger' as const },
    high: { label: 'High', variant: 'warning' as const },
    medium: { label: 'Medium', variant: 'info' as const },
    low: { label: 'Low', variant: 'default' as const },
  };
  const c = config[priority];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const config = { high: 'danger' as const, medium: 'warning' as const, low: 'default' as const };
  return <Badge variant={config[impact]}>Impact: {impact}</Badge>;
}

function EffortBadge({ effort }: { effort: Effort }) {
  const config = { low: 'success' as const, medium: 'info' as const, high: 'purple' as const };
  return <Badge variant={config[effort]}>Effort: {effort}</Badge>;
}

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const config = { high: 'success' as const, medium: 'warning' as const, low: 'danger' as const };
  return <Badge variant={config[confidence]}>Confidence: {confidence}</Badge>;
}

function DataSourceBadge({ source }: { source: string }) {
  const config: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'default' | 'purple' }> = {
    'measured': { label: '📊 Measured Data', variant: 'success' },
    'estimated': { label: '📈 Estimated', variant: 'warning' },
    'best-practice': { label: '📋 Best Practice', variant: 'info' },
    'ai-analysis': { label: '🤖 AI Analysis', variant: 'purple' },
    'ai-suggestion': { label: '🤖 AI Suggestion', variant: 'purple' },
    'unavailable': { label: '⚠️ Unavailable', variant: 'default' },
  };
  const c = config[source] || config['unavailable'];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function ScoreBar({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const h = size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2';
  return (
    <div className={`w-full ${h} bg-slate-700 rounded-full overflow-hidden`}>
      <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${score}%` }}></div>
    </div>
  );
}

function ScoreCircle({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#334155" strokeWidth="4" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold text-white">{score}</span>
    </div>
  );
}

// ============================================================
// TAB: OVERVIEW
// ============================================================

function OverviewTab() {
  const totalIssues = mockContentAnalysis.reduce((acc, p) => acc + p.issues.length, 0);
  const criticalPages = mockContentAnalysis.filter(p => p.status === 'critical').length;
  const avgScore = Math.round(mockContentAnalysis.reduce((acc, p) => acc + p.seoScore, 0) / mockContentAnalysis.length);
  const pendingRecs = mockRecommendations.filter(r => r.status === 'pending').length;
  const autoRules = mockAutomationRules.filter(r => r.status === 'enabled').length;

  const scoreTrend = [
    { week: 'W1', score: 58 }, { week: 'W2', score: 61 }, { week: 'W3', score: 63 },
    { week: 'W4', score: 65 }, { week: 'W5', score: 67 }, { week: 'W6', score: 69 },
    { week: 'W7', score: 71 }, { week: 'W8', score: 74 },
  ];

  const taskCompletion = [
    { month: 'Oct', completed: 8, pending: 22 },
    { month: 'Nov', completed: 15, pending: 18 },
    { month: 'Dec', completed: 25, pending: 15 },
    { month: 'Jan', completed: 35, pending: 12 },
    { month: 'Feb', completed: 47, pending: 9 },
    { month: 'Mar', completed: 14, pending: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* AI Status Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <Brain size={28} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">AI SEO Assistant is Active</h3>
            <p className="text-sm text-slate-400 mt-1">
              Analyzing <strong className="text-white">{mockContentAnalysis.length} pages</strong> across your website. 
              Found <strong className="text-yellow-400">{totalIssues} issues</strong> and generated <strong className="text-indigo-400">{mockRecommendations.length} recommendations</strong>.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 size={12} /> {autoRules} automation rules active
              </span>
              <span className="flex items-center gap-1.5 text-xs text-blue-400">
                <Activity size={12} /> Last analysis: 2 hours ago
              </span>
              <span className="flex items-center gap-1.5 text-xs text-purple-400">
                <Sparkles size={12} /> AI credits: 753 / 1,000 remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">AI SEO Score</span>
            <TrendingUp size={14} className="text-green-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{avgScore}</span>
            <span className="text-sm text-green-400 mb-0.5">+16 vs 8 weeks ago</span>
          </div>
          <ScoreBar score={avgScore} />
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Critical Issues</span>
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <span className="text-2xl font-bold text-white">{criticalPages}</span>
          <p className="text-xs text-slate-400 mt-1">pages need urgent attention</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Pending Actions</span>
            <Clock size={14} className="text-yellow-400" />
          </div>
          <span className="text-2xl font-bold text-white">{pendingRecs}</span>
          <p className="text-xs text-slate-400 mt-1">recommendations awaiting action</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Tasks Completed</span>
            <CheckCircle2 size={14} className="text-green-400" />
          </div>
          <span className="text-2xl font-bold text-white">14</span>
          <p className="text-xs text-slate-400 mt-1">this week (+7 vs last week)</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">SEO Score Trend (8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[50, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Task Completion Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="completed" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="pending" fill="#475569" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-green-500"></div><span className="text-xs text-slate-400">Completed</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-slate-600"></div><span className="text-xs text-slate-400">Pending</span></div>
          </div>
        </div>
      </div>

      {/* Priority Actions & Content Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Top Priority Actions</h3>
            <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">View all →</span>
          </div>
          <div className="space-y-3">
            {mockRecommendations.filter(r => r.urgency === 'immediate' || r.impact === 'high').slice(0, 4).map(rec => (
              <div key={rec.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{rec.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <PriorityBadge priority={rec.urgency === 'immediate' ? 'critical' : 'high'} />
                      <ImpactBadge impact={rec.impact} />
                      {rec.autoApplicable && <Badge variant="purple">Auto-fixable</Badge>}
                    </div>
                  </div>
                  <button className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30 flex-shrink-0">
                    Act
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Content Gaps Identified</h3>
            <span className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300">View all →</span>
          </div>
          <div className="space-y-3">
            {mockContentGaps.slice(0, 4).map(gap => (
              <div key={gap.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{gap.topic}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="text-indigo-400">{gap.primaryKeyword}</span> • Est. volume: {gap.estimatedVolume}
                    </p>
                    <div className="flex gap-1.5 mt-1.5">
                      <DataSourceBadge source={gap.dataSource} />
                      <Badge variant={gap.competition === 'low' ? 'success' : gap.competition === 'medium' ? 'warning' : 'danger'}>
                        Competition: {gap.competition}
                      </Badge>
                    </div>
                  </div>
                  <button className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 flex-shrink-0">
                    Brief
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Recent AI Activity</h3>
        <div className="space-y-2">
          {mockAuditLog.slice(0, 6).map(entry => (
            <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                entry.action === 'created' ? 'bg-blue-500/20 text-blue-400' :
                entry.action === 'approved' ? 'bg-green-500/20 text-green-400' :
                entry.action === 'rejected' || entry.action === 'rolled-back' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {entry.action === 'created' ? <Sparkles size={12} /> :
                 entry.action === 'approved' ? <Check size={12} /> :
                 entry.action === 'rejected' ? <X size={12} /> :
                 entry.action === 'rolled-back' ? <RotateCcw size={12} /> :
                 <RefreshCw size={12} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">{entry.description}</p>
                <p className="text-xs text-slate-500">{entry.user} • {entry.timestamp}</p>
              </div>
              {entry.canRollback && !entry.rolledBack && (
                <button className="text-xs text-slate-400 hover:text-white flex-shrink-0">Rollback</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: CONTENT ANALYSIS
// ============================================================

function ContentAnalysisTab() {
  const [selectedPage, setSelectedPage] = useState<ContentAnalysis | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockContentAnalysis.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (selectedPage) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedPage(null)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to all pages
        </button>

        {/* Page Header */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={selectedPage.type === 'product' ? 'purple' : selectedPage.type === 'post' ? 'info' : 'default'}>
                  {selectedPage.type}
                </Badge>
                <Badge variant={selectedPage.status === 'optimized' ? 'success' : selectedPage.status === 'needs-work' ? 'warning' : 'danger'}>
                  {selectedPage.status.replace('-', ' ')}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedPage.title}</h2>
              <p className="text-sm text-slate-400 mt-1 font-mono">{selectedPage.url}</p>
            </div>
            <ScoreCircle score={selectedPage.seoScore} size={80} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-700/50">
            <div><p className="text-xs text-slate-400">Words</p><p className="text-lg font-bold text-white">{selectedPage.wordCount}</p></div>
            <div><p className="text-xs text-slate-400">Internal Links</p><p className="text-lg font-bold text-white">{selectedPage.internalLinks}</p></div>
            <div><p className="text-xs text-slate-400">External Links</p><p className="text-lg font-bold text-white">{selectedPage.externalLinks}</p></div>
            <div><p className="text-xs text-slate-400">Images</p><p className="text-lg font-bold text-white">{selectedPage.images}</p></div>
            <div><p className="text-xs text-slate-400">Missing Alt</p><p className={`text-lg font-bold ${selectedPage.imagesMissingAlt > 0 ? 'text-red-400' : 'text-green-400'}`}>{selectedPage.imagesMissingAlt}</p></div>
          </div>
        </div>

        {/* Keyword & Intent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Target Keywords</h3>
            {selectedPage.primaryKeyword ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                  <Target size={14} className="text-indigo-400" />
                  <span className="text-sm text-white font-medium">{selectedPage.primaryKeyword}</span>
                  <Badge variant="info">Primary</Badge>
                </div>
                {selectedPage.secondaryKeywords.map(kw => (
                  <div key={kw} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-slate-300">{kw}</span>
                    <Badge>Secondary</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-300">⚠️ No primary keyword assigned</p>
                <p className="text-xs text-slate-400 mt-1">AI recommends: "premium seo plugin" based on page content analysis</p>
                <button className="mt-2 text-xs px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30">Assign Keyword</button>
              </div>
            )}
            {selectedPage.searchIntent && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Detected Search Intent</p>
                <Badge variant="purple">{selectedPage.searchIntent}</Badge>
                <p className="text-xs text-slate-400 mt-2">
                  {selectedPage.searchIntent === 'informational' && 'Users want to learn. Structure content with clear explanations, examples, and educational headings.'}
                  {selectedPage.searchIntent === 'commercial' && 'Users are comparing options. Include comparisons, pros/cons, pricing, and clear differentiators.'}
                  {selectedPage.searchIntent === 'transactional' && 'Users want to buy. Include clear CTAs, pricing, trust signals, and purchase information.'}
                  {selectedPage.searchIntent === 'navigational' && 'Users seek a specific page. Ensure brand name is prominent and navigation is clear.'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">AI Suggestions</h3>
            <div className="space-y-2">
              {selectedPage.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-lg">
                  <Lightbulb size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <button className="text-xs px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30">Generate Meta</button>
                <button className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">AI Content Brief</button>
                <button className="text-xs px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30">Suggest Links</button>
                <button className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">Add Schema</button>
              </div>
            </div>
          </div>
        </div>

        {/* Issues */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Detected Issues ({selectedPage.issues.length})</h3>
          <div className="space-y-3">
            {selectedPage.issues.map(issue => (
              <div key={issue.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={issue.severity} />
                      <Badge>{issue.category}</Badge>
                      {issue.autoFixable && <Badge variant="purple">Auto-fixable</Badge>}
                    </div>
                    <p className="text-sm text-white font-medium">{issue.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{issue.description}</p>
                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                      <p className="text-slate-300"><strong className="text-indigo-400">Why it matters:</strong> {issue.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {issue.autoFixable && (
                      <button className="text-xs px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded hover:bg-indigo-500/30">Auto-fix</button>
                    )}
                    <button className="text-xs px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded hover:bg-slate-700">Fix manually</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Change */}
        {selectedPage.seoScore !== selectedPage.previousScore && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Score History</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400">Previous</p>
                <p className="text-lg font-bold text-slate-400">{selectedPage.previousScore}</p>
              </div>
              <ArrowRight size={20} className="text-slate-500" />
              <div className="text-center">
                <p className="text-xs text-slate-400">Current</p>
                <p className="text-lg font-bold text-white">{selectedPage.seoScore}</p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${selectedPage.seoScore > selectedPage.previousScore ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {selectedPage.seoScore > selectedPage.previousScore ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-sm font-medium">{selectedPage.seoScore - selectedPage.previousScore > 0 ? '+' : ''}{selectedPage.seoScore - selectedPage.previousScore}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Content Analysis</h2>
          <p className="text-sm text-slate-400">AI analysis of all published content</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <RefreshCw size={14} /> Re-analyze All
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search pages..." className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none">
          <option value="all">All Status</option>
          <option value="optimized">Optimized</option>
          <option value="needs-work">Needs Work</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Content Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Page</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Keyword</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Intent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Issues</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(page => (
                <tr key={page.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer" onClick={() => setSelectedPage(page)}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-white font-medium truncate max-w-[200px]">{page.title}</p>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-[200px]">{page.url}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ScoreCircle score={page.seoScore} size={36} />
                      {page.seoScore !== page.previousScore && (
                        <span className={`text-xs ${page.seoScore > page.previousScore ? 'text-green-400' : 'text-red-400'}`}>
                          {page.seoScore > page.previousScore ? '+' : ''}{page.seoScore - page.previousScore}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {page.primaryKeyword ? (
                      <span className="text-xs text-indigo-400">{page.primaryKeyword}</span>
                    ) : (
                      <span className="text-xs text-red-400">None set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {page.searchIntent ? (
                      <Badge variant="purple">{page.searchIntent}</Badge>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${page.issues.length > 3 ? 'text-red-400' : page.issues.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {page.issues.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={page.status === 'optimized' ? 'success' : page.status === 'needs-work' ? 'warning' : 'danger'}>
                      {page.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight size={16} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: RECOMMENDATIONS
// ============================================================

function RecommendationsTab() {
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = mockRecommendations.filter(r => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const urgencyOrder = { immediate: 0, soon: 1, planned: 2, optional: 3 };
    const impactOrder = { high: 0, medium: 1, low: 2 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
          <p className="text-sm text-slate-400">Prioritized by impact, effort, confidence, and urgency</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-700">Export Plan</button>
          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700">Generate Action Plan</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-xs focus:border-indigo-500 focus:outline-none">
          <option value="all">All Categories</option>
          <option value="content">Content</option>
          <option value="metadata">Metadata</option>
          <option value="technical">Technical</option>
          <option value="links">Links</option>
          <option value="schema">Schema</option>
          <option value="keywords">Keywords</option>
          <option value="structure">Structure</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-xs focus:border-indigo-500 focus:outline-none">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-slate-400">{sorted.length} recommendations</span>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {sorted.map(rec => (
          <div key={rec.id} className={`bg-slate-800/50 border rounded-xl overflow-hidden transition-all ${
            rec.status === 'completed' ? 'border-green-500/20' :
            rec.status === 'in-progress' ? 'border-blue-500/20' :
            'border-slate-700/50'
          }`}>
            {/* Header */}
            <div className="p-4 cursor-pointer" onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {rec.status === 'completed' && <CheckCircle2 size={14} className="text-green-400" />}
                    {rec.status === 'in-progress' && <Clock size={14} className="text-blue-400" />}
                    <h4 className={`text-sm font-medium ${rec.status === 'completed' ? 'text-green-300 line-through' : 'text-white'}`}>{rec.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{rec.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <ImpactBadge impact={rec.impact} />
                    <EffortBadge effort={rec.effort} />
                    <ConfidenceBadge confidence={rec.confidence} />
                    <Badge variant={rec.urgency === 'immediate' ? 'danger' : rec.urgency === 'soon' ? 'warning' : rec.urgency === 'planned' ? 'info' : 'default'}>
                      {rec.urgency}
                    </Badge>
                    {rec.autoApplicable && <Badge variant="purple">Auto-fixable</Badge>}
                    {rec.affectedPages > 0 && <Badge>{rec.affectedPages} pages</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {rec.status === 'pending' && rec.autoApplicable && (
                    <button className="text-xs px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30" onClick={e => e.stopPropagation()}>
                      Auto-fix
                    </button>
                  )}
                  {rec.status === 'pending' && (
                    <button className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30" onClick={e => e.stopPropagation()}>
                      Start
                    </button>
                  )}
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedRec === rec.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedRec === rec.id && (
              <div className="px-4 pb-4 border-t border-slate-700/30 pt-4 space-y-4">
                {/* Reason */}
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-indigo-400 font-medium mb-1">💡 Why this matters</p>
                  <p className="text-sm text-slate-300">{rec.reason}</p>
                </div>

                {/* Data Support */}
                <div className="flex items-center gap-3">
                  <DataSourceBadge source={rec.dataSupport} />
                  {rec.estimatedTrafficChange && (
                    <span className="text-xs text-green-400">📈 Est. {rec.estimatedTrafficChange}</span>
                  )}
                  {rec.affectedUrl && (
                    <span className="text-xs text-slate-400 font-mono">{rec.affectedUrl}</span>
                  )}
                </div>

                {/* Steps */}
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-2">Action Steps</p>
                  <div className="space-y-1.5">
                    {rec.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                        <span className="text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Note */}
                {rec.status === 'completed' && rec.completedDate && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400">✓ Completed on {rec.completedDate}</p>
                    {rec.measuredResult && <p className="text-xs text-green-300 mt-1">📊 Result: {rec.measuredResult}</p>}
                  </div>
                )}

                {/* Important Disclaimer */}
                <div className="p-2 bg-slate-900/30 rounded text-xs text-slate-500 flex items-start gap-2">
                  <Info size={12} className="flex-shrink-0 mt-0.5" />
                  <span>
                    {rec.dataSupport === 'measured' && 'This recommendation is supported by measured data from connected services.'}
                    {rec.dataSupport === 'estimated' && 'This recommendation uses estimated data. Actual results may vary.'}
                    {rec.dataSupport === 'best-practice' && 'This recommendation is based on SEO best practices and industry standards.'}
                    {rec.dataSupport === 'ai-analysis' && 'This recommendation is based on AI analysis. Review before implementing.'}
                    {' No ranking improvement is guaranteed.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB: KEYWORDS & CONTENT GAPS
// ============================================================

function KeywordsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'suggestions' | 'gaps' | 'cannibalization'>('suggestions');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Keyword Intelligence</h2>
        <p className="text-sm text-slate-400">AI-powered keyword suggestions, content gap analysis, and cannibalization detection</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 w-fit">
        {[
          { id: 'suggestions' as const, label: 'Keyword Suggestions', icon: <Lightbulb size={14} /> },
          { id: 'gaps' as const, label: 'Content Gaps', icon: <Layers size={14} /> },
          { id: 'cannibalization' as const, label: 'Cannibalization', icon: <GitBranch size={14} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeSubTab === tab.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-3">
              <Info size={12} className="inline mr-1" />
              Keywords are suggested based on analysis of your existing content, search patterns, and topical relevance. Data sources are clearly labeled.
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Keyword</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Intent</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Volume</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Current Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Suggested For</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Source</th>
                </tr>
              </thead>
              <tbody>
                {mockKeywordSuggestions.map((kw, i) => (
                  <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="px-4 py-3">
                      <p className="text-sm text-white font-medium">{kw.keyword}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{kw.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={kw.intent === 'informational' ? 'info' : kw.intent === 'commercial' ? 'warning' : kw.intent === 'transactional' ? 'success' : 'default'}>
                        {kw.intent}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">{kw.volume || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {kw.currentRanking ? (
                        <span className="text-sm text-white font-medium">#{kw.currentRanking}</span>
                      ) : (
                        <span className="text-xs text-slate-500">Not ranking</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-indigo-400">{kw.suggestedFor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <DataSourceBadge source={kw.dataSource} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'gaps' && (
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400">
              <Info size={12} className="inline mr-1" />
              Content gaps are topics your site should cover based on keyword research, existing content analysis, and topical authority opportunities. These are recommendations — not guarantees of traffic.
            </p>
          </div>
          {mockContentGaps.map(gap => (
            <div key={gap.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <PriorityBadge priority={gap.priority} />
                    <Badge variant="purple">{gap.recommendedType}</Badge>
                    <DataSourceBadge source={gap.dataSource} />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{gap.topic}</h4>
                  <p className="text-xs text-indigo-400 mt-1">Primary: {gap.primaryKeyword}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {gap.supportingKeywords.map(kw => (
                      <span key={kw} className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded">{kw}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span>Intent: <strong className="text-white">{gap.searchIntent}</strong></span>
                    <span>Volume: <strong className="text-white">{gap.estimatedVolume || 'Unknown'}</strong></span>
                    <span>Competition: <strong className={gap.competition === 'low' ? 'text-green-400' : gap.competition === 'medium' ? 'text-yellow-400' : 'text-red-400'}>{gap.competition}</strong></span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{gap.reason}</p>
                  {gap.relatedExistingContent.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Related:</span>
                      {gap.relatedExistingContent.map(c => (
                        <span key={c} className="text-xs text-indigo-400">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">Create Brief</button>
                  <button className="text-xs px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30">AI Draft</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'cannibalization' && (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-300 font-medium">{mockCannibalization.length} keyword cannibalization issues detected</p>
                <p className="text-xs text-slate-400 mt-1">Multiple pages are competing for the same search queries, which can prevent any of them from ranking well. Consolidating or differentiating targets is recommended.</p>
              </div>
            </div>
          </div>
          {mockCannibalization.map(alert => (
            <div key={alert.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <PriorityBadge priority={alert.severity} />
                <span className="text-sm font-semibold text-white">"{alert.keyword}"</span>
                <span className="text-xs text-slate-400">— {alert.competingPages.length} competing pages</span>
              </div>
              <div className="space-y-2 mb-4">
                {alert.competingPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{page.title}</p>
                      <p className="text-xs text-slate-400 font-mono">{page.url}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScoreBar score={page.score} size="sm" />
                      <span className="text-xs text-slate-300 w-8 text-right">{page.score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-xs text-indigo-400 font-medium mb-1">🤖 AI Recommendation</p>
                <p className="text-sm text-slate-300">{alert.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TAB: AUTOMATION RULES
// ============================================================

function AutomationTab() {
  const [rules, setRules] = useState(mockAutomationRules);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? {
      ...r,
      status: r.status === 'enabled' ? 'disabled' as const : 'enabled' as const
    } : r));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Automation Rules</h2>
        <p className="text-sm text-slate-400">Configure safe, reversible automated tasks. All changes require approval unless explicitly marked as safe.</p>
      </div>

      {/* Safety Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Safety-First Automation</p>
            <p className="text-xs text-slate-400 mt-1">
              Automated actions are limited to safe, reversible operations. Content publishing, URL changes, bulk redirects, metadata deletion, and significant live page changes always require explicit approval. 
              All automated changes are logged and can be rolled back.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(rule => (
          <div key={rule.id} className={`bg-slate-800/50 border rounded-xl p-5 transition-all ${
            rule.status === 'enabled' ? 'border-green-500/20' :
            rule.status === 'requires-approval' ? 'border-yellow-500/20' :
            'border-slate-700/50'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  rule.status === 'enabled' ? 'bg-green-500' :
                  rule.status === 'requires-approval' ? 'bg-yellow-500' : 'bg-slate-500'
                }`}></div>
                <h4 className="text-sm font-semibold text-white">{rule.name}</h4>
              </div>
              <button onClick={() => toggleRule(rule.id)}
                className={`w-10 h-5 rounded-full relative transition-colors ${rule.status !== 'disabled' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${rule.status !== 'disabled' ? 'right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">{rule.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant={rule.riskLevel === 'safe' ? 'success' : rule.riskLevel === 'moderate' ? 'warning' : 'danger'}>
                Risk: {rule.riskLevel}
              </Badge>
              <Badge variant={rule.reversible ? 'info' : 'default'}>
                {rule.reversible ? 'Reversible' : 'Not reversible'}
              </Badge>
              {rule.requiresApproval && <Badge variant="warning">Requires approval</Badge>}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
              <div className="text-xs text-slate-400">
                {rule.lastRun ? (
                  <span>Last run: {rule.lastRun} • {rule.actionsTaken} actions</span>
                ) : (
                  <span>Never run</span>
                )}
              </div>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">Configure</button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Queue */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Pending Approvals</h3>
          <Badge variant="warning">3 pending</Badge>
        </div>
        <div className="space-y-3">
          {[
            { id: 'pa1', action: 'Generated meta description for "Contact" page', suggestion: 'Get expert SEO services from SmartRank. Contact us for a free consultation and custom strategy for your business.', risk: 'safe' },
            { id: 'pa2', action: 'Add 4 internal links to "Best SEO Tools"', suggestion: 'Links to: WordPress SEO Guide, Schema Tutorial, Technical SEO Basics, Content Marketing Tips', risk: 'safe' },
            { id: 'pa3', action: 'Generate FAQ schema for "WordPress SEO Guide"', suggestion: '8 questions detected in content. Schema will be generated as draft for review.', risk: 'moderate' },
          ].map(item => (
            <div key={item.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <p className="text-sm text-white">{item.action}</p>
              <p className="text-xs text-slate-400 mt-1">{item.suggestion}</p>
              <div className="flex items-center gap-2 mt-2">
                <button className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">Approve</button>
                <button className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Reject</button>
                <button className="text-xs px-3 py-1 bg-slate-700/50 text-slate-300 rounded hover:bg-slate-700">Edit</button>
                <Badge variant={item.risk === 'safe' ? 'success' : 'warning'}>{item.risk} risk</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: REPORTS
// ============================================================

function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState(mockReports[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">SEO Reports</h2>
          <p className="text-sm text-slate-400">Weekly and monthly performance reports with measured data and clear limitations</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-700 flex items-center gap-1.5">
            <Download size={12} /> Export PDF
          </button>
          <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 flex items-center gap-1.5">
            <Sparkles size={12} /> Generate Report
          </button>
        </div>
      </div>

      {/* Report Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {mockReports.map(report => (
          <button key={report.id} onClick={() => setSelectedReport(report)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedReport.id === report.id ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
            }`}>
            {report.type === 'weekly' ? '📊' : '📈'} {report.period}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={selectedReport.type === 'weekly' ? 'info' : 'purple'}>{selectedReport.type} report</Badge>
                <span className="text-xs text-slate-400">Generated: {selectedReport.generatedAt}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{selectedReport.period}</h3>
              <p className="text-sm text-slate-400 mt-2">{selectedReport.summary}</p>
            </div>
            <ScoreCircle score={selectedReport.overallScore} size={72} />
          </div>
          {selectedReport.trafficChange && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-300">📈 {selectedReport.trafficChange}</p>
            </div>
          )}
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {selectedReport.highlights.map((h, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">{h.label}</p>
              <p className="text-lg font-bold text-white mt-1">{h.value}</p>
              <p className={`text-xs mt-0.5 ${h.positive ? 'text-green-400' : 'text-red-400'}`}>{h.change}</p>
            </div>
          ))}
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">✅ Completed Improvements</h4>
            <div className="space-y-2">
              {selectedReport.topImprovements.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-400">
              <span>{selectedReport.completedTasks} tasks completed</span>
              <span>{selectedReport.pendingTasks} tasks pending</span>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">⚡ Areas for Improvement</h4>
            <div className="space-y-2">
              {selectedReport.areasForImprovement.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <AlertCircle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Limitations */}
        <div className="bg-slate-800/50 border border-yellow-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-300 mb-2">Data Limitations & Disclaimers</h4>
              <p className="text-xs text-slate-400 mb-2">This report clearly distinguishes between measured data, estimates, and unavailable information:</p>
              <ul className="space-y-1">
                {selectedReport.dataLimitations.map((limitation, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-yellow-400/50">•</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-3 italic">
                No ranking improvement is guaranteed. Results depend on many factors including competition, algorithm changes, and content quality. This report presents available data and recommendations — not promises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TAB: AUDIT LOG
// ============================================================

function AuditLogTab() {
  const [filterType, setFilterType] = useState('all');

  const filtered = mockAuditLog.filter(e => filterType === 'all' || e.targetType === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Audit Log</h2>
          <p className="text-sm text-slate-400">Complete history of all changes with rollback capability</p>
        </div>
        <button className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-700 flex items-center gap-1.5">
          <Download size={12} /> Export Log
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'metadata', 'content', 'schema', 'links', 'redirect', 'automation', 'settings'].map(type => (
          <button key={type} onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === type ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}>
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700/30">
          {filtered.map(entry => (
            <div key={entry.id} className="p-4 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  entry.action === 'created' ? 'bg-blue-500/20 text-blue-400' :
                  entry.action === 'updated' ? 'bg-indigo-500/20 text-indigo-400' :
                  entry.action === 'approved' ? 'bg-green-500/20 text-green-400' :
                  entry.action === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  entry.action === 'rolled-back' ? 'bg-orange-500/20 text-orange-400' :
                  entry.action === 'deleted' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {entry.action === 'created' ? <Sparkles size={14} /> :
                   entry.action === 'updated' ? <RefreshCw size={14} /> :
                   entry.action === 'approved' ? <Check size={14} /> :
                   entry.action === 'rejected' ? <X size={14} /> :
                   entry.action === 'rolled-back' ? <RotateCcw size={14} /> :
                   entry.action === 'deleted' ? <XCircle size={14} /> :
                   <Play size={14} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white font-medium">{entry.target}</span>
                    <Badge variant={
                      entry.action === 'created' ? 'info' :
                      entry.action === 'approved' ? 'success' :
                      entry.action === 'rejected' || entry.action === 'rolled-back' ? 'danger' :
                      'default'
                    }>
                      {entry.action}
                    </Badge>
                    <Badge>{entry.targetType}</Badge>
                    {entry.rolledBack && <Badge variant="warning">Rolled back</Badge>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{entry.description}</p>
                  
                  {/* State Changes */}
                  {(entry.previousState || entry.newState) && (
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      {entry.previousState && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-300 rounded">{entry.previousState}</span>
                      )}
                      {entry.previousState && entry.newState && <ArrowRight size={10} className="text-slate-500" />}
                      {entry.newState && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-300 rounded">{entry.newState}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">{entry.user}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{entry.timestamp}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {entry.canRollback && !entry.rolledBack && (
                    <button className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 flex items-center gap-1">
                      <RotateCcw size={10} /> Rollback
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <Brain size={16} /> },
    { id: 'analysis', label: 'Content Analysis', icon: <FileText size={16} /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={16} />, badge: String(mockRecommendations.filter(r => r.status === 'pending').length) },
    { id: 'keywords', label: 'Keywords', icon: <Target size={16} /> },
    { id: 'automation', label: 'Automation', icon: <Zap size={16} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} /> },
    { id: 'audit', label: 'Audit Log', icon: <History size={16} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI SEO Assistant</h1>
            <p className="text-sm text-slate-400">Intelligent analysis, recommendations, and automation for your SEO strategy</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1 bg-slate-800/30 p-1 rounded-xl border border-slate-700/50">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}>
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-500/30 text-indigo-300 rounded text-xs">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'analysis' && <ContentAnalysisTab />}
        {activeTab === 'recommendations' && <RecommendationsTab />}
        {activeTab === 'keywords' && <KeywordsTab />}
        {activeTab === 'automation' && <AutomationTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'audit' && <AuditLogTab />}
      </div>
    </div>
  );
}
