/**
 * System Audit Trail Service for MAHARAJA Hotel Management System
 * Handles compliance logging, chronological event tracking, and report exports.
 */

const AUDIT_STORAGE_KEY = 'hotel_audit_trail';

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'AUD-1001',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    action: 'Administrator Authentication',
    category: 'Authentication',
    details: 'User "admin" logged into the Executive Enterprise Portal from Front Desk Terminal #1.',
    actor: 'Eleanor Vance',
    role: 'Administrator',
    severity: 'SUCCESS',
    ip: '192.168.1.101',
    metadata: { terminal: 'FD-Terminal-01', browser: 'Chrome 122 / Win64' }
  },
  {
    id: 'AUD-1002',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    action: 'VIP Guest Reservation Created',
    category: 'Reservations',
    details: 'New reservation #GH-2026-104 confirmed for Suite 501 (3 nights, Artisan Dining package).',
    actor: 'Eleanor Vance',
    role: 'Administrator',
    severity: 'INFO',
    ip: '192.168.1.101',
    metadata: { reservationId: 'GH-2026-104', roomNumber: '501', guest: 'Lord Harrison Sterling' }
  },
  {
    id: 'AUD-1003',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // 1.5 hours ago
    action: 'Room Turnover Status Updated',
    category: 'Room Matrix',
    details: 'Room 304 turnover marked as "Inspection Complete & Ready for Guest" by Lead Housekeeper.',
    actor: 'Arthur Pendelton',
    role: 'General Manager',
    severity: 'INFO',
    ip: '192.168.1.105',
    metadata: { roomNumber: '304', previousStatus: 'Cleaning', newStatus: 'Ready' }
  },
  {
    id: 'AUD-1004',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(), // ~2.3 hours ago
    action: 'Kitchen Room Service Order Dispatched',
    category: 'Kitchen',
    details: 'Order #K-104 (Executive Lunch × 2) prepared and dispatched to Room 204.',
    actor: 'Chef Marco Silva',
    role: 'Kitchen Staff',
    severity: 'SUCCESS',
    ip: '192.168.1.120',
    metadata: { orderId: 'K-104', roomNumber: '204', itemsCount: 2 }
  },
  {
    id: 'AUD-1005',
    timestamp: new Date(Date.now() - 1000 * 60 * 210).toISOString(), // 3.5 hours ago
    action: 'Failed Login Attempt Warning',
    category: 'Authentication',
    details: 'Failed authentication attempt with username "unknown_staff" from IP 192.168.1.199. Blocked by security filter.',
    actor: 'System Firewall',
    role: 'Security System',
    severity: 'WARNING',
    ip: '192.168.1.199',
    metadata: { attemptedUser: 'unknown_staff', attempts: 1 }
  },
  {
    id: 'AUD-1006',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(), // ~5 hours ago
    action: 'System Initialization & Database Health Check',
    category: 'System',
    details: 'Enterprise SQL LocalDB verified. 50 rooms online, live occupancy gauge synced at 100% data integrity.',
    actor: 'Automated Daemon',
    role: 'System',
    severity: 'INFO',
    ip: '127.0.0.1',
    metadata: { totalRooms: 50, activeBookings: 18 }
  }
];

export const auditService = {
  /**
   * Retrieve all audit logs sorted with newest first
   */
  getAuditLogs: () => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default luxury operational logs
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(DEFAULT_AUDIT_LOGS));
      return DEFAULT_AUDIT_LOGS;
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      return DEFAULT_AUDIT_LOGS;
    }
  },

  /**
   * Log an event into the persistent audit trail
   */
  logEvent: ({
    action,
    category = 'General',
    details,
    actor = 'Administrator',
    role = 'Admin',
    severity = 'INFO', // 'INFO' | 'SUCCESS' | 'WARNING' | 'SECURITY'
    metadata = {}
  }) => {
    try {
      const currentLogs = auditService.getAuditLogs();
      const newEntry = {
        id: `AUD-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        action,
        category,
        details,
        actor,
        role,
        severity,
        ip: '192.168.1.101', // Local enterprise workstation
        metadata
      };

      const updated = [newEntry, ...currentLogs];
      // Keep up to 500 recent events
      const trimmed = updated.slice(0, 500);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
      return newEntry;
    } catch (err) {
      console.error('Error recording audit log event:', err);
      return null;
    }
  },

  /**
   * Export audit logs to downloadable CSV or JSON file
   */
  exportAuditLogs: (format = 'csv') => {
    const logs = auditService.getAuditLogs();
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'json') {
      const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonContent);
      downloadAnchor.setAttribute('download', `MAHARAJA_Audit_Trail_${timestampStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return;
    }

    // Default CSV format
    const headers = ['Audit ID', 'Timestamp', 'Category', 'Severity', 'Action', 'Actor', 'Role', 'IP Address', 'Details'];
    const rows = logs.map(l => [
      `"${l.id}"`,
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.category}"`,
      `"${l.severity}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.actor.replace(/"/g, '""')}"`,
      `"${l.role}"`,
      `"${l.ip || '127.0.0.1'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `MAHARAJA_Audit_Trail_${timestampStr}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * Clear all audit logs and reset with a fresh archive marker
   */
  clearLogs: (archivedBy = 'Administrator') => {
    try {
      const resetLogs = [
        {
          id: `AUD-${Date.now().toString().slice(-6)}`,
          timestamp: new Date().toISOString(),
          action: 'Audit Log Archive & Purge Executed',
          category: 'User Management',
          details: `All previous audit log records were archived and cleared by ${archivedBy}.`,
          actor: archivedBy,
          role: 'Administrator',
          severity: 'WARNING',
          ip: '192.168.1.101',
          metadata: { action: 'purge', status: 'completed' }
        }
      ];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(resetLogs));
      return resetLogs;
    } catch (err) {
      console.error('Error clearing audit logs:', err);
      return [];
    }
  }
};
