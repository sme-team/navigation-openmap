// ./src/components/login/RegisterContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { createModuleLogger, AppModules } from "@/logger";
import { authService } from "@/services/auth.service";

const logger = createModuleLogger(AppModules.REGISTER_CONTENT);

const RegisterContent: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  const validateForm = () => {
    if (!formData.username.trim()) {
      logger.error(AppModules.REGISTER_CONTENT, "Username is required");
      setStatus({
        type: "error",
        message: "Username is required",
      });
      return false;
    }

    if (!formData.email.trim()) {
      logger.error(AppModules.REGISTER_CONTENT, "Email is required");
      setStatus({
        type: "error",
        message: "Email is required",
      });
      return false;
    }

    if (!formData.password) {
      logger.error(AppModules.REGISTER_CONTENT, "Password is required");
      setStatus({
        type: "error",
        message: "Password is required",
      });
      return false;
    }

    if (formData.password.length < 6) {
      logger.error(
        AppModules.REGISTER_CONTENT,
        "Password must be at least 6 characters long"
      );
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters long",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      logger.error(AppModules.REGISTER_CONTENT, "Passwords do not match");
      setStatus({
        type: "error",
        message: "Passwords do not match",
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      logger.error(AppModules.REGISTER_CONTENT, "Invalid email address");
      setStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus({
      type: "loading",
      message: "Creating account...",
    });

    try {
      logger.debug("Attempting registration", {
        username: formData.username,
        email: formData.email,
      });

      const response = await authService.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.user) {
        logger.debug("Registration successful", { userId: response.user.id });
        setStatus({
          type: "success",
          message: "Account created successfully! Please sign in to continue.",
        });

        // Clear form
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect to login after delay
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error: any) {
      logger.error(AppModules.REGISTER_CONTENT, "Registration failed", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";

      setStatus({
        type: "error",
        message: errorMessage,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Register Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-green-600 to-blue-600 text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
            <p className="text-green-100 text-sm">
              Create your account to get started
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <StatusMessage />

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Create a password"
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
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
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                <span>
                  {loading ? "Creating Account..." : "Create Account"}
                </span>
              </button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By creating an account, you agree to our{" "}
                <LocalizedLink
                  href="/terms"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  Terms of Service
                </LocalizedLink>{" "}
                and{" "}
                <LocalizedLink
                  href="/privacy"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
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
            Already have an account?{" "}
            <LocalizedLink
              href="/login"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              Sign in here
            </LocalizedLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterContent;
