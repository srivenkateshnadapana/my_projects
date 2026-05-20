// src/utils/authStore.js
import { StorageService } from "../services/storage";

let subscribers = [];

export const authStore = {
  subscribe: (callback) => {
    subscribers.push(callback);
    return () => {
      subscribers = subscribers.filter((s) => s !== callback);
    };
  },

  notify: (user) => {
    const newState = {
      isAuthenticated: !!user,
      user: user,
    };
    subscribers.forEach((callback) => callback(newState));
  },

  getState: () => StorageService.getAuthState(),
  getSnapshot: () => StorageService.getAuthState(),
};
