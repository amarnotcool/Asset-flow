import { create } from 'zustand';
import { orgApi, assetApi, operationsApi, auditApi } from '../api';

export const useAppStore = create((set, get) => ({
  // All state starts empty — populated from database
  departments: [],
  categories: [],
  employees: [],
  assets: [],
  allocations: [],
  transfers: [],
  bookings: [],
  maintenanceTickets: [],
  audits: [],
  isLoading: false,

  // ─── SYNC ALL DATA FROM BACKEND ───
  syncBackendData: async () => {
    set({ isLoading: true });
    try {
      const [depts, cats, emps, assets, allocs, transfers, bookings, maintenance, audits] = await Promise.allSettled([
        orgApi.getDepartments(),
        orgApi.getCategories(),
        orgApi.getEmployees(),
        assetApi.getAssets(),
        operationsApi.getAllocations(),
        operationsApi.getTransfers(),
        operationsApi.getBookings(),
        operationsApi.getMaintenanceRequests(),
        auditApi.getAudits(),
      ]);

      set({
        departments: depts.status === 'fulfilled' ? depts.value : [],
        categories: cats.status === 'fulfilled' ? cats.value : [],
        employees: emps.status === 'fulfilled' ? emps.value : [],
        assets: assets.status === 'fulfilled' ? assets.value : [],
        allocations: allocs.status === 'fulfilled' ? allocs.value : [],
        transfers: transfers.status === 'fulfilled' ? transfers.value : [],
        bookings: bookings.status === 'fulfilled' ? bookings.value : [],
        maintenanceTickets: maintenance.status === 'fulfilled' ? maintenance.value : [],
        audits: audits.status === 'fulfilled' ? audits.value : [],
        isLoading: false,
      });
    } catch (err) {
      console.error('Backend sync error:', err);
      set({ isLoading: false });
    }
  },

  // ─── DEPARTMENT ACTIONS ───
  addDepartment: async (deptData) => {
    try {
      const newDept = await orgApi.createDepartment(deptData);
      set((s) => ({ departments: [...s.departments, newDept] }));
      return newDept;
    } catch (err) {
      throw err;
    }
  },
  deleteDepartment: (id) => set((s) => ({
    departments: s.departments.filter(d => d.id !== id)
  })),

  // ─── CATEGORY ACTIONS ───
  addCategory: async (catData) => {
    try {
      const newCat = await orgApi.createCategory(catData);
      set((s) => ({ categories: [...s.categories, newCat] }));
      return newCat;
    } catch (err) {
      throw err;
    }
  },
  deleteCategory: (id) => set((s) => ({
    categories: s.categories.filter(c => c.id !== id)
  })),

  // ─── EMPLOYEE ACTIONS ───
  promoteEmployee: async (id, newRole) => {
    try {
      await orgApi.updateEmployeeRole(id, newRole);
      set((s) => ({
        employees: s.employees.map(e => e.id === id ? { ...e, role: newRole } : e)
      }));
    } catch (err) {
      throw err;
    }
  },

  // ─── ASSET ACTIONS ───
  registerAsset: async (assetData) => {
    try {
      const newAsset = await assetApi.registerAsset(assetData);
      set((s) => ({ assets: [newAsset, ...s.assets] }));
      return newAsset;
    } catch (err) {
      throw err;
    }
  },

  allocateAsset: async (allocationData) => {
    try {
      const alloc = await operationsApi.allocateAsset(allocationData);
      // Refresh assets and allocations
      const [assets, allocs] = await Promise.all([
        assetApi.getAssets(),
        operationsApi.getAllocations(),
      ]);
      set({ assets, allocations: allocs });
      return alloc;
    } catch (err) {
      throw err;
    }
  },

  returnAsset: async (assetId) => {
    try {
      await assetApi.returnAsset(assetId);
      const [assets, allocs] = await Promise.all([
        assetApi.getAssets(),
        operationsApi.getAllocations(),
      ]);
      set({ assets, allocations: allocs });
    } catch (err) {
      throw err;
    }
  },

  transferAsset: async (transferData) => {
    try {
      await operationsApi.createTransfer(transferData);
      const [assets, allocs, transfers] = await Promise.all([
        assetApi.getAssets(),
        operationsApi.getAllocations(),
        operationsApi.getTransfers(),
      ]);
      set({ assets, allocations: allocs, transfers });
    } catch (err) {
      throw err;
    }
  },

  // ─── BOOKING ACTIONS ───
  addBooking: async (bookingData) => {
    try {
      const newBooking = await operationsApi.createBooking(bookingData);
      set((s) => ({ bookings: [newBooking, ...s.bookings] }));
      return newBooking;
    } catch (err) {
      throw err;
    }
  },

  // ─── MAINTENANCE ACTIONS ───
  raiseTicket: async (ticketData) => {
    try {
      const newTicket = await operationsApi.createMaintenanceRequest(ticketData);
      // Refresh assets + tickets
      const [assets, tickets] = await Promise.all([
        assetApi.getAssets(),
        operationsApi.getMaintenanceRequests(),
      ]);
      set({ assets, maintenanceTickets: tickets });
      return newTicket;
    } catch (err) {
      throw err;
    }
  },

  updateTicketStatus: async (id, newStatus) => {
    try {
      await operationsApi.updateMaintenanceStatus(id, newStatus);
      const [assets, tickets] = await Promise.all([
        assetApi.getAssets(),
        operationsApi.getMaintenanceRequests(),
      ]);
      set({ assets, maintenanceTickets: tickets });
    } catch (err) {
      throw err;
    }
  },

  // ─── AUDIT ACTIONS ───
  createAudit: async (auditData) => {
    try {
      await auditApi.createAudit(auditData);
      const audits = await auditApi.getAudits();
      set({ audits });
    } catch (err) {
      throw err;
    }
  },

  updateAuditItemStatus: async (cycleId, itemId, status) => {
    try {
      await auditApi.updateAuditItem(cycleId, itemId, { status });
      const audits = await auditApi.getAudits();
      set({ audits });
    } catch (err) {
      throw err;
    }
  },

  closeAuditCycle: async (auditId) => {
    try {
      await auditApi.closeAudit(auditId);
      const audits = await auditApi.getAudits();
      set({ audits });
    } catch (err) {
      throw err;
    }
  },
}));
