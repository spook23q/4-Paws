import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
  role?: "owner" | "sitter";
};

const WEB_TOKEN_KEY = "4paws_session_token";

export async function getSessionToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      // On web, check localStorage for token (used for email/password auth)
      if (typeof window !== "undefined") {
        const token = window.localStorage.getItem(WEB_TOKEN_KEY);
        if (token) {
          return token;
        }
      }
      // Fall back to cookie-based auth (OAuth flow sets cookies)
      return null;
    }

    // Use SecureStore for native
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get session token:", error);
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // On web, store token in localStorage for tRPC Bearer auth
      if (typeof window !== "undefined") {
        window.localStorage.setItem(WEB_TOKEN_KEY, token);
      }
      return;
    }

    // Use SecureStore for native
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.error("[Auth] Failed to set session token:", error);
    throw error;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // On web, remove token from localStorage
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(WEB_TOKEN_KEY);
      }
      return;
    }

    // Use SecureStore for native
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error("[Auth] Failed to remove session token:", error);
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    let info: string | null = null;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      info = window.localStorage.getItem(USER_INFO_KEY);
    } else {
      info = await SecureStore.getItemAsync(USER_INFO_KEY);
    }

    if (!info) {
      return null;
    }
    const user = JSON.parse(info);
    return user;
  } catch (error) {
    console.error("[Auth] Failed to get user info:", error);
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      return;
    }

    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("[Auth] Failed to set user info:", error);
  }
}

export async function clearUserInfo(): Promise<void> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.removeItem(USER_INFO_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch (error) {
    console.error("[Auth] Failed to clear user info:", error);
  }
}
