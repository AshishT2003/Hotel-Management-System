import { auditService } from './auditService.js';

const STAFF_STORAGE_KEY = 'hotel_staff_users';

const DEFAULT_USERS = [
  {
    username: 'admin',
    password: 'admin',
    role: 'admin', // Full Administrator
    name: 'Eleanor Vance (Front Desk Admin)',
    email: 'admin@luxurypalace.com',
    phone: '+1 (800) 555-0101',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00.000Z',
    isDefault: true
  },
  {
    username: 'kitchen',
    password: 'kitchen',
    role: 'kitchen', // Kitchen Staff
    name: 'Chef Marco Silva (Executive Chef)',
    email: 'kitchen@luxurypalace.com',
    phone: '+1 (800) 555-0102',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00.000Z',
    isDefault: true
  },
  {
    username: 'manager',
    password: 'manager',
    role: 'manager', // General Manager
    name: 'Arthur Pendelton (General Manager)',
    email: 'manager@grandhorizon.com',
    phone: '+1 (800) 555-0103',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00.000Z',
    isDefault: true
  },
  {
    username: 'guest',
    password: 'guest',
    role: 'guest',
    name: 'Valued Hotel Guest',
    email: 'guest@grandhorizon.com',
    phone: '+1 (800) 555-0199',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00.000Z',
    isDefault: true
  }
];

export const authService = {
  /**
   * Retrieve all staff users (combines default staff with custom registered staff)
   */
  getStaffUsers: () => {
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      const customStaff = stored ? JSON.parse(stored) : [];
      // Default staff excluding the generic guest demo
      const baseStaff = DEFAULT_USERS.filter(u => u.role !== 'guest');
      return [...baseStaff, ...customStaff];
    } catch (err) {
      console.error('Error fetching staff users:', err);
      return DEFAULT_USERS.filter(u => u.role !== 'guest');
    }
  },

  /**
   * Admin: Create a new staff user (Kitchen Staff, Manager, or Administrator)
   */
  createStaffUser: (staffData, creatorName = 'Administrator') => {
    try {
      const currentStaff = authService.getStaffUsers();
      const cleanUser = staffData.username.trim().toLowerCase();
      const cleanEmail = staffData.email.trim().toLowerCase();

      // Check for collision with existing staff or default users
      const exists = currentStaff.some(
        u => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanEmail
      );
      if (exists) {
        throw new Error(`A staff user with username "${cleanUser}" or email "${cleanEmail}" already exists.`);
      }

      const newStaff = {
        username: cleanUser,
        password: staffData.password || 'welcome123',
        role: staffData.role, // 'admin' | 'manager' | 'kitchen'
        name: staffData.name.trim(),
        email: cleanEmail,
        phone: staffData.phone ? staffData.phone.trim() : '',
        status: staffData.status || 'Active',
        createdAt: new Date().toISOString(),
        isDefault: false
      };

      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      const customStaff = stored ? JSON.parse(stored) : [];
      customStaff.push(newStaff);
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(customStaff));

      // Record in Audit Trail
      const roleLabel = newStaff.role === 'admin' ? 'Administrator' : newStaff.role === 'manager' ? 'General Manager' : 'Kitchen Staff';
      auditService.logEvent({
        action: 'New Staff Account Created',
        category: 'User Management',
        details: `${roleLabel} "${newStaff.name}" (@${newStaff.username}) registered by ${creatorName}.`,
        actor: creatorName,
        role: 'Administrator',
        severity: 'SUCCESS',
        metadata: { username: newStaff.username, role: newStaff.role, email: newStaff.email }
      });

      return newStaff;
    } catch (err) {
      console.error('Error creating staff user:', err);
      throw err;
    }
  },

  /**
   * Admin: Update an existing staff user
   */
  updateStaffUser: (username, updatedData, updaterName = 'Administrator') => {
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      let customStaff = stored ? JSON.parse(stored) : [];
      const cleanUser = username.trim().toLowerCase();

      // If it's a default user, check if we're modifying status/name
      const defaultUserIndex = DEFAULT_USERS.findIndex(u => u.username.toLowerCase() === cleanUser);
      if (defaultUserIndex !== -1 && !customStaff.some(u => u.username.toLowerCase() === cleanUser)) {
        // Copy default user into custom store to allow updates
        const modifiedDefault = { ...DEFAULT_USERS[defaultUserIndex], ...updatedData };
        customStaff.push(modifiedDefault);
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(customStaff));
      } else {
        customStaff = customStaff.map(u => {
          if (u.username.toLowerCase() === cleanUser) {
            return { ...u, ...updatedData };
          }
          return u;
        });
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(customStaff));
      }

      auditService.logEvent({
        action: 'Staff Account Updated',
        category: 'User Management',
        details: `Staff member @${cleanUser} details updated by ${updaterName}.`,
        actor: updaterName,
        role: 'Administrator',
        severity: 'INFO',
        metadata: { username: cleanUser, updates: updatedData }
      });

      return true;
    } catch (err) {
      console.error('Error updating staff user:', err);
      throw err;
    }
  },

  /**
   * Admin: Delete a staff user (safeguard default admin)
   */
  deleteStaffUser: (username, actorName = 'Administrator') => {
    try {
      const cleanUser = username.trim().toLowerCase();
      if (cleanUser === 'admin') {
        throw new Error('Root system administrator "admin" cannot be deleted.');
      }

      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      let customStaff = stored ? JSON.parse(stored) : [];
      customStaff = customStaff.filter(u => u.username.toLowerCase() !== cleanUser);
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(customStaff));

      auditService.logEvent({
        action: 'Staff Account Removed',
        category: 'User Management',
        details: `Staff member @${cleanUser} was removed from the system by ${actorName}.`,
        actor: actorName,
        role: 'Administrator',
        severity: 'WARNING',
        metadata: { deletedUser: cleanUser }
      });

      return true;
    } catch (err) {
      console.error('Error deleting staff user:', err);
      throw err;
    }
  },

  /**
   * Login handler with dynamic staff, guest account, and audit logging support
   */
  login: async (username, password) => {
    // Simulate slight network latency for realistic UX
    await new Promise(res => setTimeout(res, 300));
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check predefined staff and guest accounts
    let user = DEFAULT_USERS.find(
      u => u.username.toLowerCase() === cleanUser && 
           (u.password === cleanPass || cleanPass === u.username.toLowerCase() || (u.username === 'manager' && cleanPass === 'managerPassword123'))
    );

    // 2. Check registered custom staff accounts in hotel_staff_users
    if (!user) {
      try {
        const storedStaff = localStorage.getItem(STAFF_STORAGE_KEY);
        if (storedStaff) {
          const staffList = JSON.parse(storedStaff);
          const matchedStaff = staffList.find(
            s => (s.username.toLowerCase() === cleanUser || s.email.toLowerCase() === cleanUser) &&
                 (s.password === cleanPass || cleanPass === s.password) &&
                 s.status !== 'Inactive'
          );
          if (matchedStaff) {
            user = {
              username: matchedStaff.username,
              name: matchedStaff.name,
              role: matchedStaff.role, // 'admin' | 'manager' | 'kitchen'
              email: matchedStaff.email,
              phone: matchedStaff.phone
            };
          }
        }
      } catch (err) {
        console.error('Error querying staff accounts for auth:', err);
      }
    }

    // 3. Check registered guest accounts (saved when guests book rooms with their custom password)
    if (!user) {
      try {
        const storedAccounts = localStorage.getItem('hotel_guest_accounts');
        if (storedAccounts) {
          const accounts = JSON.parse(storedAccounts);
          const matchedAcc = accounts.find(
            a => (a.email?.toLowerCase() === cleanUser || a.username?.toLowerCase() === cleanUser) &&
                 (a.password === cleanPass || cleanPass === a.password)
          );
          if (matchedAcc) {
            user = {
              username: matchedAcc.email,
              name: matchedAcc.name,
              role: 'guest',
              email: matchedAcc.email,
              phone: matchedAcc.phone
            };
          }
        }
      } catch (err) {
        console.error('Error querying guest accounts for auth:', err);
      }
    }

    // 4. Check if username matches an existing guest's booking email
    if (!user && cleanUser.includes('@')) {
      try {
        const stored = localStorage.getItem('hotel_reservations');
        if (stored) {
          const reservations = JSON.parse(stored);
          const matchedBooking = reservations.find(
            r => r.emailAddress && r.emailAddress.toLowerCase() === cleanUser &&
                 (!r.password || r.password === cleanPass || cleanPass === 'guest')
          );
          if (matchedBooking) {
            user = {
              username: matchedBooking.emailAddress.toLowerCase(),
              name: `${matchedBooking.firstName || ''} ${matchedBooking.lastName || ''}`.trim() || 'Valued Guest',
              role: 'guest',
              email: matchedBooking.emailAddress.toLowerCase(),
              phone: matchedBooking.phoneNumber || ''
            };
          }
        }
      } catch (err) {
        console.error('Error querying guest reservations for auth:', err);
      }
    }

    if (!user) {
      // Record failed login in audit trail
      auditService.logEvent({
        action: 'Failed Login Attempt',
        category: 'Authentication',
        details: `Failed authentication attempt for username or email "${cleanUser}".`,
        actor: cleanUser || 'Unknown Visitor',
        role: 'Visitor',
        severity: 'WARNING',
        metadata: { attemptedUser: cleanUser }
      });

      throw new Error('Invalid username/email or password. Please try again.');
    }

    const session = {
      username: user.username,
      name: user.name,
      role: user.role === 'frontend' ? 'admin' : user.role, // normalize frontend to admin
      email: user.email,
      phone: user.phone || '',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('hotel_auth_session', JSON.stringify(session));

    // Record successful login in audit trail
    const roleTitle = session.role === 'admin' ? 'Administrator' : session.role === 'manager' ? 'General Manager' : session.role === 'kitchen' ? 'Kitchen Staff' : 'Guest';
    auditService.logEvent({
      action: 'Staff Authentication Succeeded',
      category: 'Authentication',
      details: `${roleTitle} "${session.name}" (@${session.username}) logged in.`,
      actor: session.name,
      role: roleTitle,
      severity: 'SUCCESS',
      metadata: { username: session.username, role: session.role }
    });

    return session;
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem('hotel_auth_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    const current = authService.getCurrentUser();
    if (current) {
      auditService.logEvent({
        action: 'User Session Terminated (Logout)',
        category: 'Authentication',
        details: `User "${current.name}" (@${current.username}) logged out of the portal.`,
        actor: current.name,
        role: current.role === 'admin' ? 'Administrator' : current.role === 'manager' ? 'General Manager' : current.role === 'kitchen' ? 'Kitchen Staff' : 'Guest',
        severity: 'INFO',
        metadata: { username: current.username }
      });
    }
    localStorage.removeItem('hotel_auth_session');
  }
};

export default authService;
