import { create } from "zustand";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "CRITICAL" | "HIGH" | "INFO" | "SUCCESS";
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationState {
  notifications: AdminNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AdminNotification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const DEFAULT_NOTIFICATIONS: AdminNotification[] = [
  { id: "n-1", title: "Payment Failure Spike", message: "Nagad payment failure rate reached 4.2% in last 15 mins", type: "CRITICAL", read: false, createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), link: "/payments" },
  { id: "n-2", title: "High Booking Traffic", message: "Avatar 3 IMAX shows reached 98% occupancy rate", type: "INFO", read: false, createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), link: "/shows" },
  { id: "n-3", title: "Pending Refund Request", message: "Customer requested ৳1,500 refund for cancelled show #SHW-8812", type: "HIGH", read: false, createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), link: "/refunds" },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: DEFAULT_NOTIFICATIONS,
  unreadCount: DEFAULT_NOTIFICATIONS.filter((n) => !n.read).length,
  addNotification: (n) => {
    const newNotif: AdminNotification = {
      ...n,
      id: `n-${crypto.randomUUID().slice(0, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((item) => !item.read).length,
      };
    });
  },
  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((item) => !item.read).length,
      };
    });
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
