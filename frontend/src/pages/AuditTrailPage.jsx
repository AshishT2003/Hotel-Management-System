import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';
import {
  History,
  Shield,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  User,
  Laptop,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

export function AuditTrailPage() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadLogs = () => {
    const data = auditService.getAuditLogs();
    setLogs(data);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleExportCSV = () => {
    auditService.exportAuditLogs('csv');
    showFeedback('Audit trail successfully exported as CSV spreadsheet.');
  };

  const handleExportJSON = () => {
    auditService.exportAuditLogs('json');
    showFeedback('Audit trail successfully exported as JSON audit bundle.');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to archive and clear all previous audit logs? A record of this action will be kept.')) {
      const reset = auditService.clearLogs(currentUser?.name || 'Administrator');
      setLogs(reset);
      showFeedback('Audit trail archived and cleared.');
    }
  };

  // Categories list
  const categories = ['ALL', 'Authentication', 'User Management', 'Reservations', 'Room Matrix', 'Kitchen', 'System'];

  // Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const authCount = logs.filter(l => l.category === 'Authentication').length;
    const securityWarnings = logs.filter(l => l.severity === 'WARNING' || l.severity === 'SECURITY').length;
    const opsCount = logs.filter(l => ['Reservations', 'Room Matrix', 'Kitchen'].includes(l.category)).length;
    return { total, authCount, securityWarnings, opsCount };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchCat = selectedCategory === 'ALL' || log.category === selectedCategory;
      const matchSev = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        log.actor.toLowerCase().includes(q) ||
        (log.ip && log.ip.includes(q));

      return matchCat && matchSev && matchQuery;
    });
  }, [logs, selectedCategory, selectedSeverity, searchQuery]);

  // Relative time helper
  const getRelativeTime = (isoString) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1527] via-[#0b1424] to-[#070b13] p-6 rounded-2xl border border-[#1e2a40] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Compliance &amp; Security Governance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-amber-400" />
            <span>System Audit Trail &amp; Activity Log</span>
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Immutable chronological record of administrator operations, staff authentications, guest reservations, room matrix turnovers, and kitchen dispatches.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadLogs}
            title="Refresh logs"
            className="p-2.5 rounded-xl text-[#94a3b8] hover:text-white bg-[#0d1527] border border-[#1e2a40] hover:bg-[#131e36] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#131e36] hover:bg-[#1e2a40] text-emerald-300 border border-emerald-500/30 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#131e36] hover:bg-[#1e2a40] text-sky-300 border border-sky-500/30 transition-all shadow-sm"
          >
            <FileCode className="w-4 h-4 text-sky-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all"
            title="Archive and purge logs"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Purge</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Logged Events */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Total Events</span>
            <History className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.total}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Recorded audit entries</div>
        </div>

        {/* Security & Auth */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Security &amp; Auth</span>
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.authCount}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Logins &amp; session events</div>
        </div>

        {/* Operational Actions */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-sky-400 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Operational Changes</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.opsCount}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Rooms, bookings &amp; orders</div>
        </div>

        {/* Security Alerts / Warnings */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-rose-400 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Security Warnings</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics.securityWarnings}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Failed attempts &amp; alerts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, user, IP, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-[#64748b]"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[#94a3b8] font-semibold">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="h-10 px-3 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#131e36]'
              }`}
            >
              {cat === 'ALL' ? `All Categories (${metrics.total})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091120] text-[#64748b] uppercase tracking-wider font-bold border-b border-[#1e2a40]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Category &amp; Severity</th>
                <th className="px-5 py-3.5">Action &amp; Description</th>
                <th className="px-5 py-3.5">Actor / Origin</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a40]/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#64748b]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-[#334155]" />
                      <p className="text-sm font-semibold text-[#94a3b8]">No audit log events match your filters.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('ALL');
                          setSelectedSeverity('ALL');
                        }}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedRowId === log.id;
                  const severityStyle =
                    log.severity === 'SUCCESS'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : log.severity === 'WARNING' || log.severity === 'SECURITY'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                      : 'bg-sky-950/80 text-sky-300 border-sky-800/60';

                  const SeverityIcon =
                    log.severity === 'SUCCESS'
                      ? CheckCircle2
                      : log.severity === 'WARNING' || log.severity === 'SECURITY'
                      ? AlertTriangle
                      : Info;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-[#101b33] transition-colors">
                        {/* Timestamp */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#64748b]" />
                            <span>{new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <div className="text-[11px] text-[#64748b] flex items-center gap-1.5 mt-0.5">
                            <span>{new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span className="text-amber-400/90 font-medium">{getRelativeTime(log.timestamp)}</span>
                          </div>
                        </td>

                        {/* Category & Severity */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#131e36] text-[#c2cddc] border border-[#1e2a40]">
                              {log.category}
                            </span>
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${severityStyle}`}>
                                <SeverityIcon className="w-3 h-3" />
                                <span>{log.severity}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Action & Description */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm">
                            {log.action}
                          </div>
                          <p className="text-[11px] text-[#94a3b8] mt-0.5 max-w-md leading-relaxed">
                            {log.details}
                          </p>
                        </td>

                        {/* Actor / Origin */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{log.actor}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5 font-mono">
                            <Laptop className="w-3 h-3 text-[#64748b]" />
                            <span>{log.ip || '127.0.0.1'}</span>
                            {log.role && (
                              <>
                                <span>•</span>
                                <span className="text-[#94a3b8]">{log.role}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Details Expand */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e2a40] transition-colors"
                          >
                            <span className="text-[11px] font-semibold">{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON Metadata */}
                      {isExpanded && (
                        <tr className="bg-[#080d18] border-b border-[#1e2a40]">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="bg-[#050810] border border-[#1e2a40] rounded-xl p-4 space-y-2 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-[#64748b] border-b border-[#1e2a40] pb-2">
                                <span className="font-bold text-white">Event Log Payload ({log.id})</span>
                                <span>ISO: {log.timestamp}</span>
                              </div>
                              <pre className="text-emerald-400 overflow-x-auto p-2">
                                {JSON.stringify(log, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AuditTrailPage;
