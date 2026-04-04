import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Auth from "@/lib/_core/auth";
import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";

type UserRole = "owner" | "sitter";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  profilePhoto: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (user: User, rememberMe?: boolean, token?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "@4paws_user";
const REMEMBER_ME_KEY = "@4paws_remember_me";
const CREDENTIALS_KEY = "4paws_credentials";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userData: User, rememberMe: boolean = false, token?: string) => {
    try {
      // Store user data in AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");

      // Store JWT session token if provided
      if (token) {
        await Auth.setSessionToken(token);

        // On web, also establish the session cookie via the API server
        if (Platform.OS === "web") {
          try {
            const apiBase = getApiBaseUrl();
            await fetch(`${apiBase}/api/auth/session`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              credentials: "include",
            });
          } catch (e) {
            console.warn("[Auth] Failed to establish web session cookie:", e);
          }
        }
      }

      setUser(userData);
    } catch (error) {
      console.error("Failed to save user:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear user data
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);

      // Clear JWT session token
      await Auth.removeSessionToken();

      // Clear stored credentials if Remember Me was enabled
      try {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
      } catch (e) {
        // SecureStore not available on web
      }

      // On web, clear the session cookie via the API server
      if (Platform.OS === "web") {
        try {
          const apiBase = getApiBaseUrl();
          await fetch(`${apiBase}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (e) {
          console.warn("[Auth] Failed to clear web session cookie:", e);
        }
      }

      setUser(null);
    } catch (error) {
      console.error("Failed to sign out:", error);
      throw error;
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
