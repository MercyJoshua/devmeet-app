import { create } from 'zustand';

type UserState = {
  id: number; // Add the user id
  username: string;
  full_name: string;
  setUser: (id: number, username: string, full_name: string) => void;
  clearUser: () => void;
};

const useUserStore = create<UserState>((set) => ({
  id: 0, // Initialize user id to 0
  username: '',
  full_name: '',
  setUser: (id, username, full_name) => set({ id, username, full_name }),
  clearUser: () => set({ id: 0, username: '', full_name: '' }),
}));

export default useUserStore;


