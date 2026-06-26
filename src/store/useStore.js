import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      /**
       * Stores auth data after a successful login response.
       * @param {{ token: string, userId: number, fullName: string, email: string, role: string }} data
       */
      setAuth: (data) => {
        const { token, userId, fullName, email, role } = data;
        localStorage.setItem('token', token);
        set({ token, user: { id: userId, fullName, email, role } });
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },

      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'rent-pro-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('token', state.token);
        }
      },
    }
  )
);
