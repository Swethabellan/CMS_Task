import { create } from "zustand"

interface AuthState {
  isAuthenticated: boolean
  admin: { email: string; name: string } | null
  login: (email: string, name: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  admin: null,
  login: (email, name) => set({ isAuthenticated: true, admin: { email, name } }),
  logout: () => set({ isAuthenticated: false, admin: null }),
}))

interface NotificationState {
  notifications: Array<{
    id: string
    message: string
    type: "complaint" | "success" | "info"
    timestamp: Date
  }>
  addNotification: (message: string, type: "complaint" | "success" | "info") => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Math.random().toString(36).substr(2, 9),
          message,
          type,
          timestamp: new Date(),
        },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
