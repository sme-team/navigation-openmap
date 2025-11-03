// ./src/components/login/DashboardContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  User,
  Activity,
  Clock,
  Loader2,
  Settings,
  Bell,
  FileText,
  Download,
  Upload,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Shield,
} from "lucide-react";

import { userService } from "@/services/user.service";

import { LocalizedLink } from "@/components/ui/LocalizedLink";

import { createModuleLogger, AppModules } from "@/logger";

const logger = createModuleLogger(AppModules.DASHBOARD_CONTENT);

interface DashboardStats {
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  monthlyViews: number[];
  recentActivities: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "login" | "post" | "comment" | "like" | "view";
  description: string;
  timestamp: string;
  metadata?: any;
}

const DashboardContent: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">(
    "30d"
  );

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      logger.debug("User not logged in, redirecting to login");
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  // Load dashboard data
  useEffect(() => {
    if (user && isLoggedIn) {
      loadDashboardData();
    }
  }, [user, isLoggedIn, selectedPeriod]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      logger.debug("Loading dashboard data", {
        userId: user.id,
        period: selectedPeriod,
      });

      // Use real API endpoint
      const dashboardData = await userService.getDashboard();

      // Transform API response to match our interface
      setStats({
        totalViews: dashboardData.stats?.totalViews || 0,
        totalPosts: dashboardData.stats?.totalPosts || 0,
        totalComments: dashboardData.stats?.totalComments || 0,
        totalLikes: dashboardData.stats?.totalLikes || 0,
        monthlyViews: dashboardData.stats?.monthlyViews || [],
        recentActivities: dashboardData.recentActivities || [],
      });

      logger.debug("Dashboard data loaded successfully", { userId: user.id });
    } catch (error: any) {
      logger.error("Error loading dashboard data", error);
      setStatus({
        type: "error",
        message:
          error.response?.data?.message || "Failed to load dashboard data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return Shield;
      case "post":
        return FileText;
      case "comment":
        return MessageSquare;
      case "like":
        return Heart;
      case "view":
        return Eye;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login":
        return "text-green-500 bg-green-50";
      case "post":
        return "text-blue-500 bg-blue-50";
      case "comment":
        return "text-purple-500 bg-purple-50";
      case "like":
        return "text-red-500 bg-red-50";
      case "view":
        return "text-gray-500 bg-gray-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getUserInitials = (user: any) => {
    const displayName = user?.full_name || user?.name || user?.username || "U";
    const cleanName = displayName.includes("@")
      ? displayName.split("@")[0]
      : displayName;
    const parts = cleanName
      .split(/[\s_]+/)
      .filter((part: string) => part.length > 0);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return parts
      .slice(0, 2)
      .map((part: string) => part[0])
      .join("")
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={(user.full_name || user.name) as string}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white/30 border-opacity-30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xl font-bold border-4 border-white/30 border-opacity-30">
                    {getUserInitials(user)}
                  </div>
                )}

                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-blue-100">
                    Welcome back, {user.full_name || user.name || user.username}
                    !
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <LocalizedLink
                  href="/profile"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </LocalizedLink>
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {status.type === "error" && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{status.message}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats?.totalViews?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500 ml-2">
                from last month
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Posts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats?.totalPosts || "0"}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+3</span>
              <span className="text-sm text-gray-500 ml-2">this month</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Comments
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats?.totalComments || "0"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+15</span>
              <span className="text-sm text-gray-500 ml-2">this week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Likes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats?.totalLikes || "0"}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+28</span>
              <span className="text-sm text-gray-500 ml-2">this week</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activities
                </h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPeriod}
                    onChange={(e) =>
                      setSelectedPeriod(e.target.value as "7d" | "30d" | "90d")
                    }
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentActivities?.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    const colorClasses = getActivityColor(activity.type);

                    return (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}
                        >
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {(!stats?.recentActivities ||
                    stats.recentActivities.length === 0) && (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No recent activities
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Account Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <LocalizedLink
                  href="/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Edit Profile
                  </span>
                </LocalizedLink>

                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Download className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Export Data
                  </span>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Upload className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Import Content
                  </span>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Account Settings
                  </span>
                </button>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Account Type
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Member Since
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    User ID
                  </span>
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {user.id.substring(0, 12)}...
                  </span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Status
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      API Status
                    </span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    Online
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Database
                    </span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cache
                    </span>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">
                    Warming
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
