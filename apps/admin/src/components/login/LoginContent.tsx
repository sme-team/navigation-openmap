// ./src/components/login/LoginContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Chrome,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Zap,
  Users,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { createModuleLogger, AppModules } from "@/logger";
import { authService } from "@/services/auth.service";
import { googleAuthService } from "@/services/google-auth.service";

const logger = createModuleLogger(AppModules.LOGIN_CONTENT);

const LoginContent: React.FC = () => {
  const { isLoggedIn, handleGoogleCallback, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"google" | "credentials">(
    "credentials"
  );
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      logger.debug("User already logged in, redirecting to home");
      router.push("/");
    }
  }, [isLoggedIn, router]);

  // Handle callback URL parameters (for Google OAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      logger.error(
        AppModules.LOGIN_CONTENT,
        "Authentication error in URL params",
        { error }
      );
      setStatus({
        type: "error",
        message: `Authentication error: ${error}`,
      });
    } else if (code) {
      logger.debug("Processing Google OAuth callback", { code });
      handleCallback(code);
    }
  }, []);

  const handleCallback = async (code: string) => {
    setLoading(true);
    setStatus({
      type: "loading",
      message: "Processing Google authentication...",
    });

    try {
      const success = await handleGoogleCallback(code);

      if (success) {
        logger.debug("Google authentication successful", { code });
        setStatus({
          type: "success",
          message: "Google authentication successful! Redirecting...",
        });

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Redirect after short delay
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        logger.error(AppModules.LOGIN_CONTENT, "Google authentication failed");
        setStatus({
          type: "error",
          message: "Google authentication failed. Please try again.",
        });
      }
    } catch (error) {
      logger.error(
        AppModules.LOGIN_CONTENT,
        "Error during Google authentication",
        error
      );
      setStatus({
        type: "error",
        message: "An error occurred during Google authentication.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setStatus({
      type: "loading",
      message: "Generating Google authentication URL...",
    });

    try {
      const callbackUrl = window.location.origin + window.location.pathname;

      logger.debug("Generating Google auth URL", { callbackUrl });

      const response = await googleAuthService.getAuthUrlWithCallback(
        callbackUrl
      );

      if (response.success && response.data?.authUrl) {
        logger.debug("Redirecting to Google auth URL", {
          authUrl: response.data.authUrl,
        });
        setStatus({
          type: "loading",
          message: "Redirecting to Google...",
        });

        window.location.href = response.data.authUrl;
      } else {
        logger.error(
          AppModules.LOGIN_CONTENT,
          "Failed to generate Google auth URL",
          { message: response.message }
        );
        setStatus({
          type: "error",
          message:
            response.message || "Failed to generate Google authentication URL.",
        });
        setLoading(false);
      }
    } catch (error) {
      logger.error(
        AppModules.LOGIN_CONTENT,
        "Failed to connect to authentication service",
        error
      );
      setStatus({
        type: "error",
        message: "Failed to connect to authentication service.",
      });
      setLoading(false);
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.password) {
      logger.error(AppModules.LOGIN_CONTENT, "Password is required");
      setStatus({
        type: "error",
        message: "Password is required",
      });
      return;
    }

    if (!formData.username && !formData.email) {
      logger.error(
        AppModules.LOGIN_CONTENT,
        "Either username or email is required"
      );
      setStatus({
        type: "error",
        message: "Either username or email is required",
      });
      return;
    }

    setLoading(true);
    setStatus({
      type: "loading",
      message: "Signing in...",
    });

    try {
      logger.debug("Attempting credentials login", {
        username: formData.username || undefined,
        email: formData.email || undefined,
      });

      const response = await authService.login({
        username: formData.username || undefined,
        email: formData.email || undefined,
        password: formData.password,
      });

      if (response.accessToken) {
        // Map API response to our expected user format
        const userData = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          name: response.user.username,
          full_name: response.user.username,
          role: response.user.role,
          avatar: undefined,
        };

        await login(userData, response.accessToken, response.refreshToken);

        logger.debug("Credentials login successful", { userId: userData.id });
        setStatus({
          type: "success",
          message: "Login successful! Redirecting...",
        });

        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (error: any) {
      logger.error(AppModules.LOGIN_CONTENT, "Credentials login failed", {
        message: error.message,
      });
      setStatus({
        type: "error",
        message:
          error.response?.data?.error ||
          error.message ||
          "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const StatusMessage = () => {
    if (status.type === "idle") return null;

    const statusConfig = {
      loading: { icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
      success: {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      error: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    };

    const config = statusConfig[status.type];
    const Icon = config.icon;

    return (
      <div
        className={`${config.bg} border border-opacity-20 rounded-lg p-4 mb-6`}
      >
        <div className="flex items-center space-x-3">
          <Icon
            className={`w-5 h-5 ${config.color} ${
              status.type === "loading" ? "animate-spin" : ""
            }`}
          />
          <p className={`text-sm font-medium ${config.color}`}>
            {status.message}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-blue-100 text-sm">
              Sign in to access your account
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <StatusMessage />

            {/* Login Method Selector */}
            <div className="flex space-x-2 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLoginMethod("credentials")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "credentials"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Email/Username
              </button>
              <button
                onClick={() => setLoginMethod("google")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "google"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Google OAuth
              </button>
            </div>

            {loginMethod === "credentials" ? (
              /* Credentials Login Form */
              <form onSubmit={handleCredentialsLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  or
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  <span>{loading ? "Signing in..." : "Sign In"}</span>
                </button>
              </form>
            ) : (
              /* Google Login */
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5 text-blue-500" />
                )}
                <span>
                  {loading ? "Connecting..." : "Continue with Google"}
                </span>
              </button>
            )}

            {/* Features */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                Why sign in?
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Access personalized content and features</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>Join our community and interact with others</span>
                </div>

                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span>Secure and privacy-focused authentication</span>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By signing in, you agree to our{" "}
                <LocalizedLink
                  href="/terms"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Terms of Service
                </LocalizedLink>{" "}
                and{" "}
                <LocalizedLink
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Privacy Policy
                </LocalizedLink>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need an account?{" "}
            <LocalizedLink
              href="/register"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Sign up here
            </LocalizedLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
