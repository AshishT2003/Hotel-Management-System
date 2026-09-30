import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Check, 
  RefreshCw, 
  UserCheck, 
  Filter,
  Search,
  X
} from 'lucide-react';

export function RoomStatusBoard({ tasks = [], onUpdateStatus, loading = false }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingRooms, setUpdatingRooms] = useState(new Set());

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeFilter === 'All' || task.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesFloor = selectedFloor === 'All' || String(task.floor) === String(selectedFloor);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      task.roomNumber.toLowerCase().includes(query) ||
      (task.attendantName && task.attendantName.toLowerCase().includes(query)) ||
      (task.notes && task.notes.toLowerCase().includes(query)) ||
      (task.priority && task.priority.toLowerCase().includes(query)) ||
      (task.type && task.type.toLowerCase().includes(query));
    return matchesStatus && matchesFloor && matchesSearch;
  });

  const statusConfig = {
    Ready: {
      label: 'Ready / Inspected',
      badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 shadow-sm shadow-emerald-950/40',
      dotClass: 'bg-emerald-400',
      cardBorder: 'border-emerald-500/20 hover:border-emerald-500/40',
      actionLabel: 'Mark Dirty',
      actionIcon: RefreshCw,
      nextStatus: 'Dirty'
    },
    Dirty: {
      label: 'Turnover Needed',
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800/60 shadow-sm shadow-rose-950/40 animate-pulse',
      dotClass: 'bg-rose-400',
      cardBorder: 'border-rose-500/30 hover:border-rose-500/50 bg-rose-950/5',
      actionLabel: 'Start Cleaning',
      actionIcon: Play,
      nextStatus: 'Cleaning'
    },
    Cleaning: {
      label: 'Cleaning in Progress',
      badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-800/60 shadow-sm shadow-sky-950/40',
      dotClass: 'bg-sky-400 animate-ping',
      cardBorder: 'border-sky-500/30 hover:border-sky-500/50 bg-sky-950/5',
      actionLabel: 'Call Inspection',
      actionIcon: Check,
      nextStatus: 'Inspection'
    },
    Inspection: {
      label: 'Inspection Required',
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/60 shadow-sm shadow-amber-950/40',
      dotClass: 'bg-amber-400',
      cardBorder: 'border-amber-500/30 hover:border-amber-500/50 bg-amber-950/5',
      actionLabel: 'Approve & Ready',
      actionIcon: CheckCircle2,
      nextStatus: 'Ready'
    }
  };

  const handleAction = async (task) => {
    if (updatingRooms.has(task.roomNumber) || loading) return;

    const config = statusConfig[task.status] || statusConfig.Ready;
    const nextStatus = config.nextStatus;
    
    let attendantName = task.attendantName;
    let inspectedBy = task.inspectedBy;

    if (nextStatus === 'Cleaning' && !attendantName) {
      attendantName = 'On-Duty Attendant';
    }
    if (nextStatus === 'Ready') {
      inspectedBy = 'Executive Housekeeper';
    }

    setUpdatingRooms(prev => new Set(prev).add(task.roomNumber));
    try {
      await onUpdateStatus(task.roomNumber, {
        status: nextStatus,
        attendantName,
        inspectedBy
      });
    } finally {
      setUpdatingRooms(prev => {
        const next = new Set(prev);
        next.delete(task.roomNumber);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter, Floor & Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d1527] border border-[#1e2a40] shadow-sm">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Dirty', 'Cleaning', 'Inspection', 'Ready'].map(st => {
            const count = st === 'All' ? tasks.length : tasks.filter(t => t.status.toLowerCase() === st.toLowerCase()).length;
            const isActive = activeFilter === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setActiveFilter(st)}
                aria-label={`Filter by ${st} (${count} rooms)`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30 border border-emerald-500/30'
                    : 'bg-[#0a1120] text-[#94a3b8] hover:text-white hover:bg-[#131e36] border border-[#1e2a40]'
                }`}
              >
                <span>{st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-[#1e2a40] text-[#cbd5e1]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Floor Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Instant Search Bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room # or staff..."
              aria-label="Search rooms or attendants"
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-[#0a1120] border border-[#1e2a40] text-xs text-white placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Floor Filter Tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-xs text-[#64748b] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Floor:
            </span>
            {['All', '1', '2', '3', '4', '5'].map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFloor(f)}
                aria-label={`Filter by Floor ${f}`}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  selectedFloor === f
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0a1120] text-[#94a3b8] hover:text-white hover:bg-[#131e36]'
                }`}
              >
                {f === 'All' ? 'All' : `F${f}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 50-Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {filteredTasks.map(task => {
          const cfg = statusConfig[task.status] || statusConfig.Ready;
          const ActionIcon = cfg.actionIcon;
          const isVip = task.priority === 'VIP';
          const isHigh = task.priority === 'High';
          const isUpdating = updatingRooms.has(task.roomNumber);

          return (
            <div
              key={task.roomNumber}
              className={`p-4 rounded-2xl bg-[#0d1527] border ${cfg.cardBorder} transition-all hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden group min-h-[160px]`}
            >
              {/* VIP / HIGH glow flags */}
              {isVip && (
                <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border-l border-b border-amber-500/40 text-[9px] font-black uppercase text-amber-300 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  <span>VIP</span>
                </div>
              )}
              {isHigh && (
                <div className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg bg-rose-500/20 border-l border-b border-rose-500/40 text-[9px] font-black uppercase text-rose-300 flex items-center gap-1 shadow-sm">
                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                  <span>HIGH</span>
                </div>
              )}

              {/* Room & Tier */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-white font-mono tracking-tight">
                    {task.roomNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748b]">
                    Floor {task.floor}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] font-medium mt-0.5">
                  {task.type || task.roomType || 'Deluxe'} Tier
                </p>
              </div>

              {/* Status Pill & Metadata */}
              <div className="space-y-1.5">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                  <span>{cfg.label}</span>
                </div>

                {task.attendantName ? (
                  <p className="text-[10px] text-[#94a3b8] truncate flex items-center gap-1" title={task.attendantName}>
                    <UserCheck className="w-3 h-3 text-[#64748b] shrink-0" />
                    <span className="truncate">Attendant: <strong className="text-white">{task.attendantName}</strong></span>
                  </p>
                ) : (task.status === 'Cleaning' || task.status === 'Inspection') ? (
                  <p className="text-[10px] text-amber-400/90 font-semibold truncate flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Attendant: <strong>Unassigned</strong></span>
                  </p>
                ) : null}

                {task.notes && (
                  <p className="text-[10px] text-[#64748b] italic truncate" title={task.notes}>
                    "{task.notes}"
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-[#1e2a40]/60">
                <button
                  type="button"
                  onClick={() => handleAction(task)}
                  disabled={isUpdating || loading}
                  aria-label={`${cfg.actionLabel} for Room ${task.roomNumber}`}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:ring-offset-[#0d1527] ${
                    task.status === 'Dirty'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30'
                      : task.status === 'Cleaning'
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-900/30'
                      : task.status === 'Inspection'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/30'
                      : 'bg-[#131e36] hover:bg-[#1a2947] text-[#94a3b8] hover:text-white border border-[#1e2a40]'
                  } ${(isUpdating || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <ActionIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{cfg.actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoomStatusBoard;
