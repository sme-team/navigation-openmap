// ./src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { authService } from "@/services/auth.service";
import { googleAuthService } from "@/services/google-auth.service";

import {
  getLocalStorage,
  removeItemLocalStorage,
  setLocalStorage,
} from "@/utils/api-helpers";

import { createModuleLogger, AppModules } from "@/logger";
const logger = createModuleLogger(AppModules.AUTH_CONTEXT);

interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  name?: string;
  role: string;
  avatar?: string;
  phone?: string;
  location?: string;
  auth_provider?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    userData: User,
    token: string,
    refreshToken?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  getGoogleAuthUrl: (callbackUrl?: string) => Promise<string | null>;
  handleGoogleCallback: (code: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to normalize user data from different auth sources
 
const normalizeUserData = (
  profile: any,
  authProvider: "google" | "regular"
): User => {
  const baseData = {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    location: profile.location,
  };

  if (authProvider === "google") {
    return {
      ...baseData,
      name: profile.full_name || profile.name || profile.username,
      full_name: profile.full_name || profile.name,
      avatar: profile.avatar_url || profile.avatar, // ✅ Handle both field names
      auth_provider: "google",
    };
  }

  return {
    ...baseData,
    name: profile.username,
    full_name: profile.full_name || profile.username,
    avatar: profile.avatar_url || profile.avatar, // ✅ Support avatar for regular auth too
    auth_provider: "regular",
  };
};

// Helper to detect if user is Google auth user
const isGoogleAuthUser = (user: any): boolean => {
  if (!user) return false;
  return (
    user.auth_provider === "google" ||
    (user.avatar && user.avatar.includes("googleusercontent.com"))
  );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    loading: true,
  });

  // Use ref to prevent double initialization in React 18 Strict Mode
  const initRef = useRef(false);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Prevent double initialization in Strict Mode
    if (initRef.current) {
      logger.debug("⏭️ Auth already initialized, skipping");
      return;
    }

    // If initialization is in progress, don't start another one
    if (initPromiseRef.current) {
      logger.debug("⏳ Auth initialization already in progress");
      return;
    }
    initRef.current = true;

    const initAuth = async () => {
      try {
        const token = getLocalStorage("blog_token");
        const userStr = getLocalStorage("blog_user");

        logger.debug("Initializing auth state", {
          hasToken: !!token,
          hasUser: !!userStr,
        });

        if (!token || !userStr) {
          setState({ user: null, isLoggedIn: false, loading: false });
          return;
        }

        const cachedUser = JSON.parse(userStr);

        // Set initial state with cached data
        setState({
          user: cachedUser,
          isLoggedIn: true,
          loading: true, // Still loading while verifying
        });

        // Verify token validity in background
        try {
          const isGoogleAuth = isGoogleAuthUser(cachedUser);
          let userProfile = null;
          let authMethod = "";

          // Only try Google OAuth if we're confident it's a Google user
          if (isGoogleAuth) {
            try {
              logger.debug("🔍 Verifying Google OAuth user...");
              const googleProfile = await googleAuthService.getUserProfile();

              // Check for proper response structure
              if (
                googleProfile &&
                googleProfile.success &&
                googleProfile.data?.user
              ) {
                userProfile = normalizeUserData(
                  googleProfile.data.user,
                  "google"
                );
                authMethod = "google";
                logger.debug("✅ Google auth verified successfully");
              } else {
                logger.debug(
                  "⚠️ Google OAuth response invalid, falling back to regular auth",
                  {
                    hasSuccess: !!googleProfile?.success,
                    hasData: !!googleProfile?.data,
                    hasUser: !!googleProfile?.data?.user,
                  }
                );
              }
            } catch (googleError: any) {
              const status =
                googleError?.response?.status || googleError?.statusCode;
              logger.debug("Google auth verification failed", {
                status,
                message: googleError?.message,
              });

              if (status === 401) {
                logger.debug(
                  "🔄 Google token expired, interceptor will refresh"
                );
              }
            }
          }

          // Try regular auth endpoint if:
          // 1. Not a Google user, OR
          // 2. Google auth failed with non-401 error
          if (!userProfile && !isGoogleAuth) {
            try {
              logger.debug("🔍 Verifying regular auth user...");
              const regularProfile = await authService.getCurrentUser();

              if (regularProfile && regularProfile.user) {
                userProfile = normalizeUserData(regularProfile.user, "regular");
                authMethod = "regular";
                logger.debug("✅ Regular auth verified successfully");
              }
            } catch (regularError: any) {
              const status =
                regularError?.response?.status || regularError?.statusCode;

              // Only log non-401 errors
              if (status !== 401) {
                logger.debug("⚠️ Regular auth verification error", {
                  status,
                  message: regularError?.message,
                });
              }
            }
          }

          if (userProfile) {
            // Update with fresh data from server
            setLocalStorage("blog_user", JSON.stringify(userProfile));
            setState({
              user: userProfile,
              isLoggedIn: true,
              loading: false,
            });
            logger.debug("✅ User data refreshed from server", {
              method: authMethod,
              hasAvatar: !!userProfile.avatar,
              authProvider: userProfile.auth_provider,
            });
          } else {
            // Keep cached data if server verification fails
            setState({
              user: cachedUser,
              isLoggedIn: true,
              loading: false,
            });
            logger.debug(
              "⚠️ Using cached user data (server verification failed)",
              {
                hasAvatar: !!cachedUser.avatar,
              }
            );
          }
        } catch (error) {
          // On complete failure, keep cached auth state
          logger.debug(
            "⚠️ Token verification failed, using cached data",
            error
          );
          setState({
            user: cachedUser,
            isLoggedIn: true,
            loading: false,
          });
        }
      } catch (error) {
        logger.error("❌ Auth initialization error", error);
        setState({
          user: null,
          isLoggedIn: false,
          loading: false,
        });
      }
    };
    initPromiseRef.current = initAuth();
  }, []);

  const login = async (
    userData: User,
    token: string,
    refreshToken?: string
  ) => {
    try {
      // Store tokens and user data
      setLocalStorage("blog_token", token);
      setLocalStorage("blog_user", JSON.stringify(userData));

      if (refreshToken) {
        setLocalStorage("blog_refresh_token", refreshToken);
      }

      setState({
        user: userData,
        isLoggedIn: true,
        loading: false,
      });

      logger.debug("✅ User logged in successfully", {
        userId: userData.id,
        username: userData.username,
        hasAvatar: !!userData.avatar,
        authProvider: userData.auth_provider,
      });
    } catch (error) {
      logger.error("❌ Login error", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getLocalStorage("blog_refresh_token");
      const user = state.user;

      // Call appropriate logout API based on auth provider
      if (refreshToken && user) {
        try {
          if (isGoogleAuthUser(user)) {
            await googleAuthService.logout();
            logger.debug("Google OAuth logout called");
          } else {
            await authService.logout();
            logger.debug("Regular logout called");
          }
        } catch (error) {
          logger.debug(
            "Logout API call failed, continuing with local logout",
            error
          );
        }
      }
    } catch (error) {
      logger.error("Logout error", error);
    } finally {
      // Clear local storage
      removeItemLocalStorage("blog_token");
      removeItemLocalStorage("blog_refresh_token");
      removeItemLocalStorage("blog_user");

      setState({
        user: null,
        isLoggedIn: false,
        loading: false,
      });

      logger.debug("✅ User logged out successfully");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };
      setLocalStorage("blog_user", JSON.stringify(updatedUser));

      logger.debug("User data updated", {
        fields: Object.keys(userData),
        hasAvatar: !!updatedUser.avatar,
      });

      return {
        ...prev,
        user: updatedUser,
      };
    });
  };

  const getGoogleAuthUrl = async (
    callbackUrl?: string
  ): Promise<string | null> => {
    try {
      const response = await googleAuthService.getAuthUrlWithCallback(
        callbackUrl?.trim()
      );

      if (response.success && response.data?.authUrl) {
        logger.debug("Google auth URL retrieved");
        return response.data.authUrl;
      }

      throw new Error(response.message || "Failed to get Google auth URL");
    } catch (error) {
      logger.error("Failed to get Google auth URL", error);
      return null;
    }
  };

  const handleGoogleCallback = async (code: string): Promise<boolean> => {
    try {
      const response = await googleAuthService.handleCallback(code);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Use normalizeUserData helper
        const userData = normalizeUserData(user, "google");

        await login(userData, accessToken, refreshToken);
        logger.debug("✅ Google callback successful", {
          userId: userData.id,
          hasAvatar: !!userData.avatar,
        });
        return true;
      }

      throw new Error(response.message || "Authentication failed");
    } catch (error) {
      logger.error("❌ Google callback failed", error);
      return false;
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const refreshToken = getLocalStorage("blog_refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const user = state.user;
      let newAccessToken: string | null = null;

      if (isGoogleAuthUser(user)) {
        // Use Google auth service
        const response = await googleAuthService.refreshToken(refreshToken);
        if (response.success && response.data?.accessToken) {
          newAccessToken = response.data.accessToken;
          setLocalStorage("blog_token", newAccessToken as string);
          logger.debug("✅ Google access token refreshed");
        }
      } else {
        // Use regular auth service
        const response = await authService.refreshToken(refreshToken);
        if (response.accessToken) {
          newAccessToken = response.accessToken;
          setLocalStorage("blog_token", newAccessToken);
          if (response.refreshToken) {
            setLocalStorage("blog_refresh_token", response.refreshToken);
          }
          logger.debug("✅ Regular access token refreshed");
        }
      }

      if (newAccessToken) {
        return newAccessToken;
      }

      throw new Error("Token refresh failed");
    } catch (error) {
      logger.debug("❌ Token refresh failed, logging out user", error);
      await logout();
      return null;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    getGoogleAuthUrl,
    handleGoogleCallback,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
 