import { create } from 'zustand';
import { orgApi, operationsApi } from '../api';

export const useAppStore = create((set, get) => ({
  departments: [
    { id: 1, name: 'Engineering', head: 'Aditi Rao', parent: '--', status: 'Active' },
    { id: 2, name: 'Facilities', head: 'Rohan Mehta', parent: '--', status: 'Active' },
    { id: 3, name: 'Field ops (West)', head: 'Samir Iqbal', parent: 'Field Ops', status: 'Inactive' },
  ],

  categories: [
    { id: 1, name: 'Electronics', description: 'Laptops, screens, accessories' },
    { id: 2, name: 'Furniture', description: 'Desks, chairs, whiteboards' },
    { id: 3, name: 'Vehicles', description: 'Company cars and vans' },
  ],

  employees: [
    { id: 1, name: 'Priya Shah', email: 'priya@company.com', dept: 'Engineering', role: 'Employee', status: 'Active' },
    { id: 2, name: 'Arjun Nair', email: 'arjun@company.com', dept: 'Facilities', role: 'Asset Manager', status: 'Active' },
    { id: 3, name: 'Aditi Rao', email: 'aditi@company.com', dept: 'Engineering', role: 'Department Head', status: 'Active' },
  ],

  assets: [
    { id: 1, tag: 'AF-0114', name: 'Dell XPS 15', category: 'Electronics', status: 'Allocated', location: 'HQ - Floor 2', holder: 'Priya Shah', cost: '$1,800', condition: 'Good', serialNumber: 'DX15-2024-0901', acquisitionDate: '2024-03-15', isShared: false },
    { id: 2, tag: 'AF-0062', name: 'Epson Projector', category: 'Electronics', status: 'Under Maintenance', location: 'Room B2', holder: 'Facilities', cost: '$650', condition: 'Needs Service', serialNumber: 'EP-PRJ-4421', acquisitionDate: '2023-08-20', isShared: true },
    { id: 3, tag: 'AF-0201', name: 'Ergo Chair', category: 'Furniture', status: 'Available', location: 'Warehouse', holder: '--', cost: '$250', condition: 'Excellent', serialNumber: 'EC-001-WH', acquisitionDate: '2024-01-10', isShared: false },
    { id: 4, tag: 'AF-0310', name: 'MacBook Pro 16', category: 'Electronics', status: 'Available', location: 'IT Store', holder: '--', cost: '$2,400', condition: 'New', serialNumber: 'MBP16-2024-1120', acquisitionDate: '2024-11-20', isShared: false },
    { id: 5, tag: 'AF-0312', name: 'Company Van', category: 'Vehicles', status: 'Available', location: 'Parking B', holder: '--', cost: '$28,000', condition: 'Good', serialNumber: 'VAN-FL-312', acquisitionDate: '2023-05-01', isShared: true },
    { id: 6, tag: 'AF-0099', name: 'Standing Desk', category: 'Furniture', status: 'Lost', location: 'Unknown', holder: '--', cost: '$700', condition: 'Unknown', serialNumber: 'SD-099-ENG', acquisitionDate: '2023-06-10', isShared: false },
  ],

  bookings: [
    { id: 1, resource: 'Conference room B2', startTime: '09:00', endTime: '10:00', bookedBy: 'Procurement Team', status: 'Upcoming', date: '2026-07-12' },
    { id: 2, resource: 'Company Van AF-312', startTime: '14:00', endTime: '17:00', bookedBy: 'Samir Iqbal', status: 'Upcoming', date: '2026-07-12' },
  ],

  maintenanceTickets: [
    { id: 1, title: 'Projector bulb not turning on', asset: 'AF-0062', status: 'Pending', priority: 'High', technician: '', description: 'Bulb flickers and goes off after 5 minutes', requestDate: '2026-07-10' },
    { id: 2, title: 'AC unit noisy compressor', asset: 'AF-0103', status: 'Approved', priority: 'Medium', technician: '', description: 'Loud rattling noise from compressor unit', requestDate: '2026-07-08' },
    { id: 3, title: 'Printer jam parts ordered', asset: 'AF-0912', status: 'In Progress', priority: 'Low', technician: 'Vijay Kumar', description: 'Paper jam mechanism broken, parts on order', requestDate: '2026-07-05' },
  ],

  // --- Transfer Requests (NEW) ---
  transferRequests: [
    { id: 1, assetTag: 'AF-0114', fromUser: 'Priya Shah', toUser: 'Arjun Nair', reason: 'Project reassignment to Facilities', status: 'Pending', requestDate: '2026-07-11' },
  ],

  // --- Allocation History (NEW) ---
  allocationHistory: [
    { id: 1, assetTag: 'AF-0114', user: 'Priya Shah', department: 'Engineering', allocatedDate: '2024-03-15', expectedReturn: '2026-08-15', returnedDate: null, conditionNotes: '', status: 'Active' },
    { id: 2, assetTag: 'AF-0062', user: 'Facilities', department: 'Facilities', allocatedDate: '2023-08-20', expectedReturn: null, returnedDate: '2026-07-01', conditionNotes: 'Bulb needs replacement', status: 'Returned' },
    { id: 3, assetTag: 'AF-0201', user: 'Rajesh Kumar', department: 'Engineering', allocatedDate: '2024-01-10', expectedReturn: '2024-06-10', returnedDate: '2024-06-08', conditionNotes: 'Good condition, minor scuff on base', status: 'Returned' },
  ],

  // --- Audit Cycles (NEW - replaces hardcoded single audit) ---
  auditCycles: [
    {
      id: 1,
      title: 'Q3 Audit — Engineering Dept',
      scope: 'Engineering',
      scopeType: 'department',
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      auditors: [{ id: 3, name: 'Aditi Rao' }, { id: 2, name: 'Arjun Nair' }],
      status: 'Open',
      items: [
        { tag: 'AF-0114', name: 'Dell XPS 15', location: 'Desk 692', status: 'Verified' },
        { tag: 'AF-0912', name: 'Office Chair', location: 'Desk 114', status: 'Missing' },
        { tag: 'AF-9823', name: 'Monitor', location: 'Desk 613', status: 'Damaged' },
      ],
    },
    {
      id: 2,
      title: 'Q2 Audit — Facilities',
      scope: 'Facilities',
      scopeType: 'department',
      startDate: '2026-04-01',
      endDate: '2026-04-15',
      auditors: [{ id: 2, name: 'Arjun Nair' }],
      status: 'Closed',
      items: [
        { tag: 'AF-0062', name: 'Epson Projector', location: 'Room B2', status: 'Verified' },
        { tag: 'AF-0099', name: 'Standing Desk', location: 'Desk 301', status: 'Missing' },
      ],
    },
  ],

  notifications: [
    { id: 1, type: 'Allocations', text: 'Laptop AF-0114 assigned to Priya Shah', time: '12m ago', read: false },
    { id: 2, type: 'Approvals', text: 'Maintenance request AF-0055 approved', time: '18m ago', read: false },
    { id: 3, type: 'Bookings', text: 'Booking confirmed: Room B2 : 2:00 to 3:00 PM', time: '1h ago', read: true },
    { id: 4, type: 'Transfers', text: 'Transfer request for AF-0114 submitted by Priya Shah', time: '2h ago', read: false },
    { id: 5, type: 'Alerts', text: 'Overdue return: AF-0221 was due 3 days ago', time: '1d ago', read: false },
    { id: 6, type: 'Alerts', text: 'Audit discrepancy flagged: AF-0099 missing', time: '2d ago', read: true },
    { id: 7, type: 'Approvals', text: 'Transfer approved: AF-0062 to Facilities dept', time: '3d ago', read: true },
  ],

  // --- Activity Log (NEW) ---
  activityLog: [
    { id: 1, user: 'Admin', action: 'Created department', entity: 'Engineering', timestamp: '2026-07-10 09:15' },
    { id: 2, user: 'Arjun Nair', action: 'Registered asset', entity: 'AF-0310 MacBook Pro 16', timestamp: '2026-07-10 10:30' },
    { id: 3, user: 'Priya Shah', action: 'Raised maintenance request', entity: 'AF-0062 Projector', timestamp: '2026-07-10 14:22' },
    { id: 4, user: 'Admin', action: 'Promoted employee', entity: 'Arjun Nair → Asset Manager', timestamp: '2026-07-11 08:00' },
    { id: 5, user: 'Admin', action: 'Created audit cycle', entity: 'Q3 Audit — Engineering Dept', timestamp: '2026-07-11 11:45' },
    { id: 6, user: 'Aditi Rao', action: 'Approved transfer request', entity: 'AF-0062 to Facilities', timestamp: '2026-07-12 09:00' },
  ],

  // ==============================
  // DEPARTMENT ACTIONS
  // ==============================
  addDepartment: (dept) => set((state) => ({
    departments: [...state.departments, { id: Date.now(), ...dept }],
    activityLog: [{ id: Date.now(), user: 'Admin', action: 'Created department', entity: dept.name, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),
  updateDepartment: (id, updates) => set((state) => ({
    departments: state.departments.map(d => d.id === id ? { ...d, ...updates } : d),
    activityLog: [{ id: Date.now(), user: 'Admin', action: 'Updated department', entity: updates.name || `ID:${id}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),
  toggleDepartmentStatus: (id) => set((state) => ({
    departments: state.departments.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d),
  })),
  deleteDepartment: (id) => set((state) => ({
    departments: state.departments.filter(d => d.id !== id)
  })),

  // ==============================
  // CATEGORY ACTIONS
  // ==============================
  addCategory: (cat) => set((state) => ({
    categories: [...state.categories, { id: Date.now(), ...cat }],
    activityLog: [{ id: Date.now(), user: 'Admin', action: 'Created category', entity: cat.name, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),
  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),

  // ==============================
  // EMPLOYEE ACTIONS
  // ==============================
  addEmployee: (emp) => set((state) => ({
    employees: [...state.employees, { id: Date.now(), ...emp }],
    activityLog: [{ id: Date.now(), user: 'Admin', action: 'Added employee', entity: emp.name, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),
  promoteEmployee: (id, newRole) => set((state) => {
    const emp = state.employees.find(e => e.id === id);
    return {
      employees: state.employees.map(e => e.id === id ? { ...e, role: newRole } : e),
      activityLog: [{ id: Date.now(), user: 'Admin', action: 'Changed role', entity: `${emp?.name || 'Employee'} → ${newRole}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
    };
  }),
  toggleEmployeeStatus: (id) => set((state) => ({
    employees: state.employees.map(e => e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e),
  })),

  // ==============================
  // ASSET ACTIONS
  // ==============================
  registerAsset: (asset) => set((state) => ({
    assets: [...state.assets, { id: Date.now(), status: 'Available', holder: '--', ...asset }],
    activityLog: [{ id: Date.now(), user: 'Current User', action: 'Registered asset', entity: `${asset.tag} ${asset.name}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
    notifications: [{ id: Date.now(), type: 'Allocations', text: `New asset registered: ${asset.tag} - ${asset.name}`, time: 'Just now', read: false }, ...state.notifications],
  })),
  updateAssetStatus: (tag, newStatus) => set((state) => ({
    assets: state.assets.map(a => a.tag === tag ? { ...a, status: newStatus, holder: ['Lost', 'Retired', 'Disposed', 'Available'].includes(newStatus) ? '--' : a.holder } : a),
    activityLog: [{ id: Date.now(), user: 'Admin', action: `Changed asset status to ${newStatus}`, entity: tag, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),
  allocateAsset: (tag, holder, expectedReturn) => set((state) => ({
    assets: state.assets.map(a => a.tag === tag ? { ...a, status: 'Allocated', holder } : a),
    allocationHistory: [{ id: Date.now(), assetTag: tag, user: holder, department: '--', allocatedDate: new Date().toISOString().split('T')[0], expectedReturn: expectedReturn || null, returnedDate: null, conditionNotes: '', status: 'Active' }, ...state.allocationHistory],
    activityLog: [{ id: Date.now(), user: 'Admin', action: 'Allocated asset', entity: `${tag} to ${holder}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
    notifications: [{ id: Date.now(), type: 'Allocations', text: `Asset ${tag} allocated to ${holder}`, time: 'Just now', read: false }, ...state.notifications],
  })),
  returnAsset: (tag, conditionNotes) => set((state) => ({
    assets: state.assets.map(a => a.tag === tag ? { ...a, status: 'Available', holder: '--' } : a),
    allocationHistory: state.allocationHistory.map(h => h.assetTag === tag && h.status === 'Active' ? { ...h, status: 'Returned', returnedDate: new Date().toISOString().split('T')[0], conditionNotes: conditionNotes || '' } : h),
    activityLog: [{ id: Date.now(), user: 'Current User', action: 'Returned asset', entity: tag, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),

  // ==============================
  // TRANSFER REQUEST ACTIONS (NEW)
  // ==============================
  createTransferRequest: (request) => set((state) => ({
    transferRequests: [...state.transferRequests, { id: Date.now(), status: 'Pending', requestDate: new Date().toISOString().split('T')[0], ...request }],
    activityLog: [{ id: Date.now(), user: request.fromUser, action: 'Submitted transfer request', entity: `${request.assetTag} → ${request.toUser}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
    notifications: [{ id: Date.now(), type: 'Transfers', text: `Transfer request: ${request.assetTag} from ${request.fromUser} to ${request.toUser}`, time: 'Just now', read: false }, ...state.notifications],
  })),
  approveTransferRequest: (id) => set((state) => {
    const req = state.transferRequests.find(r => r.id === id);
    if (!req) return state;
    return {
      transferRequests: state.transferRequests.map(r => r.id === id ? { ...r, status: 'Approved' } : r),
      assets: state.assets.map(a => a.tag === req.assetTag ? { ...a, holder: req.toUser } : a),
      allocationHistory: [
        { id: Date.now(), assetTag: req.assetTag, user: req.toUser, department: '--', allocatedDate: new Date().toISOString().split('T')[0], expectedReturn: null, returnedDate: null, conditionNotes: 'Via transfer', status: 'Active' },
        ...state.allocationHistory.map(h => h.assetTag === req.assetTag && h.status === 'Active' ? { ...h, status: 'Transferred', returnedDate: new Date().toISOString().split('T')[0] } : h),
      ],
      activityLog: [{ id: Date.now(), user: 'Admin', action: 'Approved transfer', entity: `${req.assetTag} → ${req.toUser}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
      notifications: [{ id: Date.now(), type: 'Transfers', text: `Transfer approved: ${req.assetTag} re-allocated to ${req.toUser}`, time: 'Just now', read: false }, ...state.notifications],
    };
  }),
  rejectTransferRequest: (id) => set((state) => {
    const req = state.transferRequests.find(r => r.id === id);
    return {
      transferRequests: state.transferRequests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r),
      notifications: [{ id: Date.now(), type: 'Transfers', text: `Transfer rejected: ${req?.assetTag || 'unknown'}`, time: 'Just now', read: false }, ...state.notifications],
    };
  }),

  // ==============================
  // BOOKING ACTIONS
  // ==============================
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, { id: Date.now(), status: 'Upcoming', ...booking }],
    notifications: [{ id: Date.now(), type: 'Bookings', text: `Booking confirmed: ${booking.resource} ${booking.startTime}-${booking.endTime}`, time: 'Just now', read: false }, ...state.notifications],
  })),
  cancelBooking: (id) => set((state) => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b),
  })),

  // ==============================
  // MAINTENANCE ACTIONS
  // ==============================
  raiseTicket: (ticket) => set((state) => ({
    maintenanceTickets: [...state.maintenanceTickets, { id: Date.now(), status: 'Pending', technician: '', requestDate: new Date().toISOString().split('T')[0], ...ticket }],
    activityLog: [{ id: Date.now(), user: 'Current User', action: 'Raised maintenance request', entity: `${ticket.asset} - ${ticket.title}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
    notifications: [{ id: Date.now(), type: 'Approvals', text: `Maintenance request raised: ${ticket.asset} - ${ticket.title}`, time: 'Just now', read: false }, ...state.notifications],
  })),
  updateTicketStatus: (id, newStatus, technician) => set((state) => {
    const updatedTickets = state.maintenanceTickets.map(t => {
      if (t.id === id) {
        const updates = { status: newStatus };
        if (technician) updates.technician = technician;
        return { ...t, ...updates };
      }
      return t;
    });
    const targetTicket = state.maintenanceTickets.find(t => t.id === id);
    let updatedAssets = state.assets;
    if (targetTicket) {
      if (newStatus === 'Approved') {
        updatedAssets = state.assets.map(a => a.tag === targetTicket.asset ? { ...a, status: 'Under Maintenance' } : a);
      } else if (newStatus === 'Resolved') {
        updatedAssets = state.assets.map(a => a.tag === targetTicket.asset ? { ...a, status: 'Available', condition: 'Good' } : a);
      }
    }
    return {
      maintenanceTickets: updatedTickets,
      assets: updatedAssets,
      notifications: [{ id: Date.now(), type: 'Approvals', text: `Maintenance ${targetTicket?.asset}: status → ${newStatus}`, time: 'Just now', read: false }, ...state.notifications],
    };
  }),

  // ==============================
  // AUDIT ACTIONS (FULLY NEW)
  // ==============================
  createAuditCycle: (cycle) => set((state) => ({
    auditCycles: [{ id: Date.now(), status: 'Open', items: [], ...cycle }, ...state.auditCycles],
    activityLog: [{ id: Date.now(), user: 'Admin', action: 'Created audit cycle', entity: cycle.title, timestamp: new Date().toLocaleString() }, ...state.activityLog],
  })),
  updateAuditItemStatus: (cycleId, tag, status) => set((state) => ({
    auditCycles: state.auditCycles.map(cycle => cycle.id === cycleId ? {
      ...cycle,
      items: cycle.items.map(item => item.tag === tag ? { ...item, status } : item)
    } : cycle)
  })),
  closeAuditCycle: (cycleId) => set((state) => {
    const cycle = state.auditCycles.find(c => c.id === cycleId);
    const missingTags = cycle ? cycle.items.filter(i => i.status === 'Missing').map(i => i.tag) : [];
    return {
      auditCycles: state.auditCycles.map(c => c.id === cycleId ? { ...c, status: 'Closed' } : c),
      assets: state.assets.map(a => missingTags.includes(a.tag) ? { ...a, status: 'Lost' } : a),
      activityLog: [{ id: Date.now(), user: 'Admin', action: 'Closed audit cycle', entity: cycle?.title || `Cycle ${cycleId}`, timestamp: new Date().toLocaleString() }, ...state.activityLog],
      notifications: missingTags.length > 0
        ? [{ id: Date.now(), type: 'Alerts', text: `Audit closed: ${missingTags.length} asset(s) marked Lost (${missingTags.join(', ')})`, time: 'Just now', read: false }, ...state.notifications]
        : state.notifications,
    };
  }),

  // ==============================
  // NOTIFICATION ACTIONS
  // ==============================
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
  })),

  // ==============================
  // COMPUTED HELPERS (used by Dashboard)
  // ==============================
  getOverdueAllocations: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    return state.allocationHistory.filter(h => h.status === 'Active' && h.expectedReturn && h.expectedReturn < today);
  },
  getPendingTransferCount: () => {
    const state = get();
    return state.transferRequests.filter(r => r.status === 'Pending').length;
  },
  getUnreadNotificationCount: () => {
    const state = get();
    return state.notifications.filter(n => !n.read).length;
  },

  // ==============================
  // BACKEND SYNC
  // ==============================
  syncBackendData: async () => {
    try {
      const [depts, cats, emps, bookingsRes, maintenanceRes] = await Promise.all([
        orgApi.getDepartments().catch(() => null),
        orgApi.getCategories().catch(() => null),
        orgApi.getEmployees().catch(() => null),
        operationsApi.getBookings().catch(() => null),
        operationsApi.getMaintenanceRequests().catch(() => null),
      ]);
      set((state) => ({
        departments: Array.isArray(depts) && depts.length > 0 ? depts : state.departments,
        categories: Array.isArray(cats) && cats.length > 0 ? cats : state.categories,
        employees: Array.isArray(emps) && emps.length > 0 ? emps : state.employees,
        bookings: Array.isArray(bookingsRes) && bookingsRes.length > 0 ? bookingsRes : state.bookings,
        maintenanceTickets: Array.isArray(maintenanceRes) && maintenanceRes.length > 0 ? maintenanceRes : state.maintenanceTickets,
      }));
    } catch (err) {
      console.warn('Backend API synchronization offline. Using local dynamic state.', err);
    }
  },
}));
