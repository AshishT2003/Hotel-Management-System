const STORAGE_KEY = 'maharaja_housekeeping_tasks_v4';

const DEFAULT_ROOMS = [
  // Floor 1 - Single ($149)
  { roomNumber: '101', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: 'Maria Sanchez', inspectedBy: 'Chief Housekeeper', notes: 'Daily freshening complete', lastCleanedAt: new Date(Date.now() - 3600000).toISOString() },
  { roomNumber: '102', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: 'Maria Sanchez', inspectedBy: 'Chief Housekeeper', notes: 'Ready for guest', lastCleanedAt: new Date(Date.now() - 7200000).toISOString() },
  { roomNumber: '103', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '104', floor: 1, type: 'Single', status: 'Cleaning', priority: 'Normal', attendantName: 'On-Duty Attendant', inspectedBy: null, notes: 'Departed guest turnover required', lastCleanedAt: null },
  { roomNumber: '105', floor: 1, type: 'Single', status: 'Cleaning', priority: 'Normal', attendantName: 'Elena Rostova', inspectedBy: null, notes: 'Stripping bed linens', lastCleanedAt: null },
  { roomNumber: '106', floor: 1, type: 'Single', status: 'Dirty', priority: 'Normal', attendantName: null, inspectedBy: null, notes: 'Automated turnover task after guest checkout', lastCleanedAt: null },
  { roomNumber: '107', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '108', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '109', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '110', floor: 1, type: 'Single', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },

  // Floor 2 - Double ($299)
  { roomNumber: '201', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '202', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '203', floor: 2, type: 'Double', status: 'Inspection', priority: 'High', attendantName: 'Maria Sanchez', inspectedBy: null, notes: 'Deep cleaned, awaiting supervisor sign-off', lastCleanedAt: null },
  { roomNumber: '204', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '205', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '206', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '207', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '208', floor: 2, type: 'Double', status: 'Cleaning', priority: 'High', attendantName: 'On-Duty Attendant', inspectedBy: null, notes: 'Express turnover needed for VIP arrival at 2 PM', lastCleanedAt: null },
  { roomNumber: '209', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '210', floor: 2, type: 'Double', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },

  // Floor 3 - Twin ($349)
  { roomNumber: '301', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '302', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '303', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '304', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '305', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '306', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '307', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '308', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '309', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '310', floor: 3, type: 'Twin', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },

  // Floor 4 - Duplex ($399)
  { roomNumber: '401', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '402', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '403', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '404', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '405', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '406', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '407', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '408', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '409', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '410', floor: 4, type: 'Duplex', status: 'Ready', priority: 'Normal', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },

  // Floor 5 - Presidential Suites ($499)
  { roomNumber: '501', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: 'Maria Sanchez', inspectedBy: 'General Manager', notes: 'VIP presidential setup verified', lastCleanedAt: new Date(Date.now() - 1800000).toISOString() },
  { roomNumber: '502', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '503', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '504', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '505', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '506', floor: 5, type: 'Suite', status: 'Cleaning', priority: 'VIP', attendantName: 'Elena Rostova', inspectedBy: null, notes: 'Jacuzzi sanitization and fresh orchids replenishment', lastCleanedAt: null },
  { roomNumber: '507', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '508', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '509', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
  { roomNumber: '510', floor: 5, type: 'Suite', status: 'Ready', priority: 'VIP', attendantName: null, inspectedBy: null, notes: null, lastCleanedAt: null },
];

const VALID_TRANSITIONS = {
  Ready: ['Dirty'],
  Dirty: ['Cleaning'],
  Cleaning: ['Inspection', 'Dirty'],
  Inspection: ['Ready', 'Cleaning']
};

function getStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROOMS));
      return DEFAULT_ROOMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 50) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROOMS));
      return DEFAULT_ROOMS;
    }
    return parsed;
  } catch {
    return DEFAULT_ROOMS;
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save housekeeping tasks:', err);
  }
}

export const housekeepingService = {
  getTasks: async (statusFilter = 'All') => {
    try {
      const url = statusFilter && statusFilter !== 'All' 
        ? `/api/housekeeping/tasks?status=${encodeURIComponent(statusFilter)}` 
        : '/api/housekeeping/tasks';
      const res = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(1200) : undefined });
      if (res.ok) {
        const data = await res.json();
        saveTasks(data);
        return data;
      }
    } catch {
      // Fallback to local storage
    }

    const all = getStoredTasks();
    if (!statusFilter || statusFilter === 'All') return all;
    return all.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase());
  },

  updateStatus: async (roomNumber, { status, attendantName, inspectedBy, notes, priority }) => {
    try {
      const res = await fetch(`/api/housekeeping/rooms/${roomNumber}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, attendantName, inspectedBy, notes, priority }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(1500) : undefined
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getStoredTasks();
        const index = current.findIndex(t => t.roomNumber === roomNumber);
        if (index >= 0) {
          current[index] = updated;
          saveTasks(current);
        }
        return updated;
      }
    } catch {
      // Fallback
    }

    const current = getStoredTasks();
    const index = current.findIndex(t => t.roomNumber === roomNumber);
    if (index < 0) {
      throw new Error(`Room ${roomNumber} not found.`);
    }

    const currentTask = current[index];
    if (status && status !== currentTask.status) {
      const allowed = VALID_TRANSITIONS[currentTask.status] || [];
      if (!allowed.includes(status)) {
        throw new Error(`Invalid state transition: Cannot change room status from '${currentTask.status}' to '${status}'. Valid next step: ${allowed.join(', ')}.`);
      }
    }

    let finalAttendant = attendantName !== undefined ? attendantName : currentTask.attendantName;
    if (status === 'Cleaning' && !finalAttendant) {
      finalAttendant = 'On-Duty Attendant';
    }

    let finalInspectedBy = inspectedBy !== undefined ? inspectedBy : currentTask.inspectedBy;
    if (status === 'Ready' && !finalInspectedBy) {
      finalInspectedBy = 'Executive Housekeeper';
    }

    current[index] = {
      ...currentTask,
      status: status || currentTask.status,
      attendantName: finalAttendant,
      inspectedBy: finalInspectedBy,
      notes: notes !== undefined ? notes : currentTask.notes,
      priority: priority !== undefined ? priority : currentTask.priority,
      lastCleanedAt: status === 'Ready' ? new Date().toISOString() : currentTask.lastCleanedAt,
      updatedAt: new Date().toISOString()
    };
    saveTasks(current);
    return current[index];
  },

  getStats: async () => {
    try {
      const res = await fetch('/api/housekeeping/stats', { signal: AbortSignal.timeout ? AbortSignal.timeout(1200) : undefined });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const all = getStoredTasks();
    return {
      totalRooms: all.length,
      readyCount: all.filter(t => t.status === 'Ready').length,
      dirtyCount: all.filter(t => t.status === 'Dirty').length,
      cleaningCount: all.filter(t => t.status === 'Cleaning').length,
      inspectionCount: all.filter(t => t.status === 'Inspection').length,
      vipPriorityCount: all.filter(t => t.priority === 'VIP' || t.priority === 'High').length
    };
  },

  triggerCheckoutTurnover: async (roomNumber, vipTier = 'Silver') => {
    try {
      await fetch(`/api/housekeeping/rooms/${roomNumber}/checkout-clean?vipTier=${encodeURIComponent(vipTier)}`, {
        method: 'POST',
        signal: AbortSignal.timeout ? AbortSignal.timeout(1200) : undefined
      });
    } catch {
      // Fallback
    }

    const priority = vipTier === 'Platinum' ? 'VIP' : vipTier === 'Gold' ? 'High' : 'Normal';
    return await housekeepingService.updateStatus(roomNumber, {
      status: 'Dirty',
      priority,
      notes: `Automated turnover task after guest checkout. Priority: ${priority}.`
    });
  }
};
