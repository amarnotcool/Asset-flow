import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // { id, name, email, role, department_id }
  isAuthenticated: false,
  
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
