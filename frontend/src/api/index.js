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
};

// Organization Setup APIs (/api/org)
export const orgApi = {
  getDepartments: async () => {
    const response = await axiosClient.get('/org/departments');
    return response.data;
  },
  createDepartment: async (deptData) => {
    const response = await axiosClient.post('/org/departments', deptData);
    return response.data;
  },
  getCategories: async () => {
    const response = await axiosClient.get('/org/categories');
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await axiosClient.post('/org/categories', categoryData);
    return response.data;
  },
  getEmployees: async () => {
    const response = await axiosClient.get('/org/employees');
    return response.data;
  },
  updateEmployeeRole: async (id, role) => {
    const response = await axiosClient.put(`/org/employees/${id}/role`, { role });
    return response.data;
  },
};

// Operations APIs (/api/operations)
export const operationsApi = {
  getAllocations: async () => {
    const response = await axiosClient.get('/operations/allocations');
    return response.data;
  },
  allocateAsset: async (allocationData) => {
    const response = await axiosClient.post('/operations/allocations', allocationData);
    return response.data;
  },
  getBookings: async () => {
    const response = await axiosClient.get('/operations/bookings');
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await axiosClient.post('/operations/bookings', bookingData);
    return response.data;
  },
  getMaintenanceRequests: async () => {
    const response = await axiosClient.get('/operations/maintenance');
    return response.data;
  },
  createMaintenanceRequest: async (maintenanceData) => {
    const response = await axiosClient.post('/operations/maintenance', maintenanceData);
    return response.data;
  },
};
