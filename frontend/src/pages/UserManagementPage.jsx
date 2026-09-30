import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  Users,
  UserPlus,
  Shield,
  ChefHat,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
  KeyRound,
  X,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  AlertTriangle,
  Lock
} from 'lucide-react';

export function UserManagementPage() {
  const { currentUser } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'kitchen', // 'admin' | 'manager' | 'kitchen'
    email: '',
    phone: '',
    password: '',
    status: 'Active'
  });

  const loadStaff = () => {
    const list = authService.getStaffUsers();
    setStaffList(list);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      username: '',
      role: 'kitchen',
      email: '',
      phone: '',
      password: '',
      status: 'Active'
    });
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      username: staff.username,
      role: staff.role,
      email: staff.email,
      phone: staff.phone || '',
      password: '', // leave blank if unchanged
      status: staff.status || 'Active'
    });
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide full name, username, and email.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Please assign a temporary or permanent portal password.');
      return;
    }

    try {
      authService.createStaffUser(formData, currentUser?.name || 'Administrator');
      loadStaff();
      setIsAddModalOpen(false);
      showFeedback(`Successfully registered new staff member: "${formData.name}".`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create staff user.');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Full name and email cannot be empty.');
      return;
    }

    try {
      const updates = {
        name: formData.name.trim(),
        role: formData.role,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status
      };
      if (formData.password.trim()) {
        updates.password = formData.password.trim();
      }

      authService.updateStaffUser(editingStaff.username, updates, currentUser?.name || 'Administrator');
      loadStaff();
      setIsEditModalOpen(false);
      showFeedback(`Updated details for @${editingStaff.username}.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update staff user.');
    }
  };

  const handleDelete = (username) => {
    if (username.toLowerCase() === 'admin') {
      alert('The root system administrator cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently remove staff account @${username}?`)) {
      try {
        authService.deleteStaffUser(username, currentUser?.name || 'Administrator');
        loadStaff();
        showFeedback(`Staff user @${username} was removed.`);
      } catch (err) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  const handleToggleStatus = (staff) => {
    if (staff.username.toLowerCase() === 'admin') return;
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      authService.updateStaffUser(
        staff.username,
        { status: newStatus },
        currentUser?.name || 'Administrator'
      );
      loadStaff();
      showFeedback(`Status for @${staff.username} changed to ${newStatus}.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = staffList.length;
    const admins = staffList.filter(s => s.role === 'admin' || s.username === 'admin').length;
    const managers = staffList.filter(s => s.role === 'manager').length;
    const kitchen = staffList.filter(s => s.role === 'kitchen').length;
    return { total, admins, managers, kitchen };
  }, [staffList]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'ADMIN' && (s.role === 'admin' || s.username === 'admin')) ||
        (roleFilter === 'MANAGER' && s.role === 'manager') ||
        (roleFilter === 'KITCHEN' && s.role === 'kitchen');

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q));

      return matchRole && matchSearch;
    });
  }, [staffList, roleFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1527] via-[#0b1424] to-[#070b13] p-6 rounded-2xl border border-[#1e2a40] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Enterprise Administration
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Staff &amp; User Management</span>
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Grant portal access, authorize personnel across roles, and provision accounts for Kitchen Staff, General Managers, and Administrators.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 border border-emerald-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff Member</span>
        </button>
      </div>

      {/* Toast Notification */}
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
        {/* Total Staff */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#94a3b8] mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Total Staff Roster</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.total}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Authorized personnel accounts</div>
        </div>

        {/* Administrators */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Administrators</span>
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.admins}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Full system &amp; security access</div>
        </div>

        {/* Managers */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-sky-400 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>General Managers</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.managers}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Front desk &amp; room operations</div>
        </div>

        {/* Kitchen Staff */}
        <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Kitchen Personnel</span>
            <ChefHat className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.kitchen}</div>
          <div className="text-[11px] text-[#64748b] mt-1">Live culinary queue fulfillment</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0d1527] border border-[#1e2a40] p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[#64748b]"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#131e36]'
            }`}
          >
            All Roles ({stats.total})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              roleFilter === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#131e36]'
            }`}
          >
            <Shield className="w-3 h-3 text-emerald-400" />
            Admins ({stats.admins})
          </button>
          <button
            onClick={() => setRoleFilter('MANAGER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              roleFilter === 'MANAGER'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#131e36]'
            }`}
          >
            <Briefcase className="w-3 h-3 text-sky-400" />
            Managers ({stats.managers})
          </button>
          <button
            onClick={() => setRoleFilter('KITCHEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              roleFilter === 'KITCHEN'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#131e36]'
            }`}
          >
            <ChefHat className="w-3 h-3 text-amber-400" />
            Kitchen Staff ({stats.kitchen})
          </button>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091120] text-[#64748b] uppercase tracking-wider font-bold border-b border-[#1e2a40]">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a40]/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#64748b]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-[#334155]" />
                      <p className="text-sm font-semibold text-[#94a3b8]">No staff accounts match your filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setRoleFilter('ALL');
                        }}
                        className="text-xs text-emerald-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isRootAdmin = staff.username.toLowerCase() === 'admin';
                  const roleBadgeColor =
                    staff.role === 'admin' || isRootAdmin
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                      : staff.role === 'manager'
                      ? 'bg-sky-950/80 text-sky-300 border-sky-800/60'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800/60';

                  const RoleIcon =
                    staff.role === 'admin' || isRootAdmin
                      ? Shield
                      : staff.role === 'manager'
                      ? Briefcase
                      : ChefHat;

                  const initials = staff.name
                    ? staff.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                    : staff.username.slice(0, 2).toUpperCase();

                  return (
                    <tr key={staff.username} className="hover:bg-[#101b33] transition-colors">
                      {/* Staff Member */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-md border ${
                            staff.role === 'admin' || isRootAdmin
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white border-emerald-400/30'
                              : staff.role === 'manager'
                              ? 'bg-gradient-to-tr from-sky-600 to-blue-700 text-white border-sky-400/30'
                              : 'bg-gradient-to-tr from-amber-600 to-orange-700 text-white border-amber-400/30'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              <span>{staff.name}</span>
                              {isRootAdmin && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 uppercase">
                                  Root
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748b] font-mono">
                              @{staff.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleBadgeColor}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">
                            {staff.role === 'admin' || isRootAdmin
                              ? 'Administrator'
                              : staff.role === 'manager'
                              ? 'General Manager'
                              : 'Kitchen Staff'}
                          </span>
                        </span>
                      </td>

                      {/* Contact Details */}
                      <td className="px-5 py-4 text-[#94a3b8]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-white/90">
                            <Mail className="w-3 h-3 text-[#64748b]" />
                            <span className="truncate max-w-[200px]">{staff.email}</span>
                          </div>
                          {staff.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                              <Phone className="w-3 h-3" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(staff)}
                          disabled={isRootAdmin}
                          title={isRootAdmin ? 'Root admin status is locked' : 'Click to toggle status'}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            staff.status === 'Active'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/40'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/40 hover:bg-rose-900/40'
                          } ${isRootAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          <span>{staff.status || 'Active'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(staff)}
                            title="Edit Staff Information"
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e2a40] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isRootAdmin && (
                            <button
                              onClick={() => handleDelete(staff.username)}
                              title="Delete Staff Account"
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Staff Member */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between p-5 border-b border-[#1e2a40] bg-[#091120]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Register New Staff Member</h3>
                  <p className="text-[11px] text-[#94a3b8]">Create authorized account with portal credentials</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chef Marco Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Username & Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Username <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. chef_marco"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Operational Role <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kitchen">Kitchen Staff (Culinary Queue)</option>
                    <option value="manager">General Manager (Operations)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Work Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. marco@luxurypalace.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (800) 555-0145"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                  Initial Portal Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Set login password..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-[#64748b] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-[#64748b] mt-1">Staff member can use either their username or email along with this password to log in.</p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2a40]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white hover:bg-[#131e36] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 border border-emerald-500/40 transition-all"
                >
                  Create &amp; Authorize Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff Member */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border border-[#1e2a40] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between p-5 border-b border-[#1e2a40] bg-[#091120]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Edit Staff Member</h3>
                  <p className="text-[11px] text-[#94a3b8]">Updating credentials for @{editingStaff?.username}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Role & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Assigned Role
                  </label>
                  <select
                    value={formData.role}
                    disabled={editingStaff?.username === 'admin'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="manager">General Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    disabled={editingStaff?.username === 'admin'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Reset Password */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 uppercase tracking-wider">
                  Reset Password (leave empty to keep current)
                </label>
                <input
                  type="text"
                  placeholder="New password..."
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-lg bg-[#070b13] border border-[#1e2a40] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2a40]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white hover:bg-[#131e36] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-semibold text-xs shadow-md shadow-sky-600/30 border border-sky-500/40 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;
