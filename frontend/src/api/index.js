import axiosClient from './axiosClient';

// Authentication APIs (/api/auth)
export const authApi = {
  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data.data;
  },
  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data.data;
  },
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  verifyOtp: async (email, otp) => {
    const response = await axiosClient.post('/auth/verify-otp', { email, otp });
    return response.data;
  },
  resetPassword: async (email, newPassword) => {
    const response = await axiosClient.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },
};

// Organization Setup APIs (/api/org)
export const orgApi = {
  getDepartments: async () => {
    const response = await axiosClient.get('/org/departments');
    return response.data.data;
  },
  createDepartment: async (deptData) => {
    const response = await axiosClient.post('/org/departments', deptData);
    return response.data.data;
  },
  getCategories: async () => {
    const response = await axiosClient.get('/org/categories');
    return response.data.data;
  },
  createCategory: async (categoryData) => {
    const response = await axiosClient.post('/org/categories', categoryData);
    return response.data.data;
  },
  getEmployees: async () => {
    const response = await axiosClient.get('/org/employees');
    return response.data.data;
  },
  updateEmployeeRole: async (id, role) => {
    const response = await axiosClient.put(`/org/employees/${id}/role`, { role });
    return response.data.data;
  },
};

// Asset APIs (/api/assets)
export const assetApi = {
  getAssets: async () => {
    const response = await axiosClient.get('/assets');
    return response.data.data;
  },
  registerAsset: async (assetData) => {
    const response = await axiosClient.post('/assets', assetData);
    return response.data.data;
  },
  updateAsset: async (id, assetData) => {
    const response = await axiosClient.put(`/assets/${id}`, assetData);
    return response.data.data;
  },
  returnAsset: async (id) => {
    const response = await axiosClient.put(`/assets/${id}/return`);
    return response.data.data;
  },
};

// Operations APIs (/api/operations)
export const operationsApi = {
  getAllocations: async () => {
    const response = await axiosClient.get('/operations/allocations');
    return response.data.data;
  },
  allocateAsset: async (allocationData) => {
    const response = await axiosClient.post('/operations/allocations', allocationData);
    return response.data.data;
  },
  getTransfers: async () => {
    const response = await axiosClient.get('/operations/transfers');
    return response.data.data;
  },
  createTransfer: async (transferData) => {
    const response = await axiosClient.post('/operations/transfers', transferData);
    return response.data.data;
  },
  getBookings: async () => {
    const response = await axiosClient.get('/operations/bookings');
    return response.data.data;
  },
  createBooking: async (bookingData) => {
    const response = await axiosClient.post('/operations/bookings', bookingData);
    return response.data.data;
  },
  getMaintenanceRequests: async () => {
    const response = await axiosClient.get('/operations/maintenance');
    return response.data.data;
  },
  createMaintenanceRequest: async (maintenanceData) => {
    const response = await axiosClient.post('/operations/maintenance', maintenanceData);
    return response.data.data;
  },
  updateMaintenanceStatus: async (id, status) => {
    const response = await axiosClient.put(`/operations/maintenance/${id}/status`, { status });
    return response.data.data;
  },
};

// Audit APIs (/api/audits)
export const auditApi = {
  getAudits: async () => {
    const response = await axiosClient.get('/audits');
    return response.data.data;
  },
  createAudit: async (auditData) => {
    const response = await axiosClient.post('/audits', auditData);
    return response.data.data;
  },
  closeAudit: async (id) => {
    const response = await axiosClient.put(`/audits/${id}/close`);
    return response.data.data;
  },
  updateAuditItem: async (cycleId, itemId, data) => {
    const response = await axiosClient.put(`/audits/${cycleId}/items/${itemId}`, data);
    return response.data.data;
  },
};
