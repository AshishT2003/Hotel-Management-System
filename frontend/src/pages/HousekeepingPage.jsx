import React, { useState, useEffect } from 'react';
import { RoomStatusBoard } from '../components/housekeeping/RoomStatusBoard';
import { useHotel } from '../context/HotelContext';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  ShieldCheck,
  BedDouble
} from 'lucide-react';

export function HousekeepingPage() {
  const { housekeepingTasks, updateHousekeepingStatus, refreshHousekeeping, showToast } = useHotel();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRooms: 50,
    readyCount: 0,
    dirtyCount: 0,
    cleaningCount: 0,
    inspectionCount: 0,
    vipPriorityCount: 0
  });

  useEffect(() => {
    if (housekeepingTasks && housekeepingTasks.length > 0) {
      setStats({
        totalRooms: housekeepingTasks.length,
        readyCount: housekeepingTasks.filter(t => t.status === 'Ready').length,
        dirtyCount: housekeepingTasks.filter(t => t.status === 'Dirty').length,
        cleaningCount: housekeepingTasks.filter(t => t.status === 'Cleaning').length,
        inspectionCount: housekeepingTasks.filter(t => t.status === 'Inspection').length,
        vipPriorityCount: housekeepingTasks.filter(t => t.priority === 'VIP' || t.priority === 'High').length
      });
    }
  }, [housekeepingTasks]);

  const handleUpdate = async (roomNumber, updateData) => {
    setLoading(true);
    try {
      await updateHousekeepingStatus(roomNumber, updateData);
      showToast(`Room ${roomNumber} updated to ${updateData.status}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update room status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await refreshHousekeeping();
    setLoading(false);
    showToast('Housekeeping matrix refreshed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Luxury Operations Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#070b13] via-[#091b24] to-[#0a1529] border border-[#1e2a40] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-950/80 border border-teal-800/60 text-[10px] font-black uppercase tracking-wider text-teal-400">
              <Sparkles className="w-3 h-3 text-teal-300" />
              <span>Luxury Services Orchestration • Phase 1</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <BedDouble className="w-7 h-7 text-emerald-400" />
              <span>Housekeeping &amp; Room Turnover Engine</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#94a3b8] max-w-2xl leading-relaxed">
              Real-time room sanitization state machine (<strong className="text-white">Dirty → Cleaning → Inspection → Ready</strong>). 
              Synchronized with the front desk reservations matrix and VIP guest preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Synchronize Housekeeping with Room Matrix"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2d3d5a] bg-[#0d1527] hover:bg-[#131e36] text-white text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#070b13] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Real-Time Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ready / Inspected */}
        <div className="p-4 rounded-2xl bg-[#0d1527] border border-emerald-500/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Ready / Clean</p>
            <p className="text-2xl font-black text-white mt-1 tabular-nums">{stats.readyCount}</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Available for Check-In</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Turnover Needed */}
        <div className="p-4 rounded-2xl bg-[#0d1527] border border-rose-500/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Turnover Needed</p>
            <p className="text-2xl font-black text-rose-300 mt-1 tabular-nums">{stats.dirtyCount}</p>
            <p className="text-[10px] text-rose-400 font-semibold mt-0.5">Departed / Auto-Queued</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Cleaning in Progress */}
        <div className="p-4 rounded-2xl bg-[#0d1527] border border-sky-500/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">In Cleaning</p>
            <p className="text-2xl font-black text-sky-300 mt-1 tabular-nums">{stats.cleaningCount}</p>
            <p className="text-[10px] text-sky-400 font-semibold mt-0.5">Attendants on Line</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800/50 flex items-center justify-center text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Inspection Required */}
        <div className="p-4 rounded-2xl bg-[#0d1527] border border-amber-500/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Awaiting Audit</p>
            <p className="text-2xl font-black text-amber-300 mt-1 tabular-nums">{stats.inspectionCount}</p>
            <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Supervisor Inspection</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Interactive Room Status Board */}
      <RoomStatusBoard
        tasks={housekeepingTasks}
        onUpdateStatus={handleUpdate}
        loading={loading}
      />
    </div>
  );
}

export default HousekeepingPage;
