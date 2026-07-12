import { create } from 'zustand';

// Rehydrate user from localStorage on initial load
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const storedToken = localStorage.getItem('token');

export const useAuthStore = create((set) => ({
  user: storedUser,
  isAuthenticated: !!(storedUser && storedToken),

  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
