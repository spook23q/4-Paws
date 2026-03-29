import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

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
  signIn: (user: User, rememberMe?: boolean) => Promise<void>;
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

  const signIn = async (userData: User, rememberMe: boolean = false) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
      setUser(userData);
    } catch (error) {
      console.error("Failed to save user:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      // Clear stored credentials if Remember Me was enabled
      try {
        await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
      } catch (e) {
        // SecureStore not available on web
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
