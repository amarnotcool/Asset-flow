import { create } from 'zustand';
import { orgApi, operationsApi } from '../api';

export const useAppStore = create((set) => ({
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
    { id: 1, tag: 'AF-0114', name: 'Dell XPS 15', category: 'Electronics', status: 'Allocated', location: 'HQ - Floor 2', holder: 'Priya Shah', cost: '$1,800', condition: 'Good' },
    { id: 2, tag: 'AF-0062', name: 'Epson Projector', category: 'Electronics', status: 'Under Maintenance', location: 'Room B2', holder: 'Facilities', cost: '$650', condition: 'Needs Service' },
    { id: 3, tag: 'AF-0201', name: 'Ergo Chair', category: 'Furniture', status: 'Available', location: 'Warehouse', holder: '--', cost: '$250', condition: 'Excellent' },
    { id: 4, tag: 'AF-0310', name: 'MacBook Pro 16', category: 'Electronics', status: 'Available', location: 'IT Store', holder: '--', cost: '$2,400', condition: 'New' },
  ],

  bookings: [
    { id: 1, resource: 'Conference room B2', startTime: '09:00', endTime: '10:00', bookedBy: 'Procurement Team', status: 'Confirmed' },
    { id: 2, resource: 'Company Van AF-312', startTime: '14:00', endTime: '17:00', bookedBy: 'Samir Iqbal', status: 'Confirmed' },
  ],

  maintenanceTickets: [
    { id: 1, title: 'Projector bulb not turning on', asset: 'AF-0062', status: 'Pending', priority: 'High' },
    { id: 2, title: 'AC unit noisy compressor', asset: 'AF-0103', status: 'Approved', priority: 'Medium' },
    { id: 3, title: 'Printer jam parts ordered', asset: 'AF-0912', status: 'In Progress', priority: 'Low' },
  ],

  audits: [
    {
      id: 1,
      title: 'Q3 Audit - Engineering Dept - 1-15 Jul',
      auditors: 'A. Rao, S. Iqbal',
      closed: false,
      items: [
        { tag: 'AF-0114', name: 'Dell laptop', location: 'Desk 692', status: 'Verified' },
        { tag: 'AF-0912', name: 'Office chair', location: 'Desk 114', status: 'Missing' },
        { tag: 'AF-9823', name: 'Monitor', location: 'Desk 613', status: 'Damaged' },
      ],
    },
  ],

  notifications: [
    { id: 1, type: 'Allocations', text: 'Laptop AF-0114 assigned to Priya Shah', time: '12m ago' },
    { id: 2, type: 'Approvals', text: 'Maintenance request AF-0055 approved', time: '18m ago' },
    { id: 3, type: 'Bookings', text: 'Booking confirmed: Room B2 : 2:00 to 3:00 PM', time: '1h ago' },
  ],

  // Department Actions
  addDepartment: (dept) => set((state) => ({
    departments: [...state.departments, { id: Date.now(), ...dept }]
  })),
  deleteDepartment: (id) => set((state) => ({
    departments: state.departments.filter(d => d.id !== id)
  })),

  // Category Actions
  addCategory: (cat) => set((state) => ({
    categories: [...state.categories, { id: Date.now(), ...cat }]
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),

  // Employee Actions
  addEmployee: (emp) => set((state) => ({
    employees: [...state.employees, { id: Date.now(), ...emp }]
  })),
  promoteEmployee: (id, newRole) => set((state) => ({
    employees: state.employees.map(e => e.id === id ? { ...e, role: newRole } : e)
  })),

  // Asset Actions
  registerAsset: (asset) => set((state) => ({
    assets: [...state.assets, { id: Date.now(), status: 'Available', holder: '--', ...asset }]
  })),
  allocateAsset: (tag, holder) => set((state) => ({
    assets: state.assets.map(a => a.tag === tag ? { ...a, status: 'Allocated', holder } : a)
  })),
  returnAsset: (tag) => set((state) => ({
    assets: state.assets.map(a => a.tag === tag ? { ...a, status: 'Available', holder: '--' } : a)
  })),

  // Booking Actions
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, { id: Date.now(), ...booking }]
  })),

  // Maintenance Actions
  raiseTicket: (ticket) => set((state) => ({
    maintenanceTickets: [...state.maintenanceTickets, { id: Date.now(), status: 'Pending', ...ticket }]
  })),
  updateTicketStatus: (id, newStatus) => set((state) => {
    const updatedTickets = state.maintenanceTickets.map(t => t.id === id ? { ...t, status: newStatus } : t);
    const targetTicket = state.maintenanceTickets.find(t => t.id === id);
    let updatedAssets = state.assets;
    if (targetTicket) {
      if (newStatus === 'Approved' || newStatus === 'In Progress') {
        updatedAssets = state.assets.map(a => a.tag === targetTicket.asset ? { ...a, status: 'Under Maintenance' } : a);
      } else if (newStatus === 'Resolved') {
        updatedAssets = state.assets.map(a => a.tag === targetTicket.asset ? { ...a, status: 'Available' } : a);
      }
    }
    return { maintenanceTickets: updatedTickets, assets: updatedAssets };
  }),

  // Audit Actions
  updateAuditItemStatus: (auditId, tag, status) => set((state) => ({
    audits: state.audits.map(audit => audit.id === auditId ? {
      ...audit,
      items: audit.items.map(item => item.tag === tag ? { ...item, status } : item)
    } : audit)
  })),
  closeAuditCycle: (auditId) => set((state) => ({
    audits: state.audits.map(audit => audit.id === auditId ? { ...audit, closed: true } : audit)
  })),

  // Backend API Synchronization
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
