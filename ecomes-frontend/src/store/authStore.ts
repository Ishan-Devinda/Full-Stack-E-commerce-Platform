import { atom } from "jotai";

export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authAtom = atom<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

// Initialize auth state from localStorage
if (typeof window !== "undefined") {
  const user = localStorage.getItem("user");
  const accessToken = localStorage.getItem("accessToken");

  if (user && accessToken) {
    authAtom.init = {
      user: JSON.parse(user),
      isAuthenticated: true,
      isLoading: false,
    };
  }
}
