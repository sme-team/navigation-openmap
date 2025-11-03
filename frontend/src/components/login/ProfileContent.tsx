// ./src/components/login/ProfileContent.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Loader2,
  CheckCircle,
  AlertCircle,
  Key,
  Phone,
  MapPin,
} from "lucide-react";
import { createModuleLogger, AppModules } from "@/logger";
import { userService } from "@/services/user.service";
import { uploadFile } from "@/services/api-client";

const logger = createModuleLogger(AppModules.PROFILE_CONTENT);

interface ProfileFormData {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
}

const ProfileContent: React.FC = () => {
  const { user, isLoggedIn, updateUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    avatar_url: "",
  });

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
    logger.trace("User is logged in", { ...user });
  }, [isLoggedIn, router]);

  // Load user profile from API
  useEffect(() => {
    if (user && isLoggedIn) {
      loadUserProfile();
    }
  }, [user, isLoggedIn]);

  const loadUserProfile = async () => {
    try {
      logger.debug("Loading user profile from API");
      const profileData = await userService.getProfile();

      setFormData({
        full_name: profileData.full_name || profileData.username || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        avatar_url: profileData.avatar_url || "",
      });

      logger.debug("User profile loaded successfully");
    } catch (error: any) {
      logger.error("Error loading user profile", error);
      // Fallback to context user data if API fails
      if (user) {
        setFormData({
          full_name: user.full_name || user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "",
          avatar_url: user.avatar || "",
        });
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setStatus({
      type: "loading",
      message: "Updating profile...",
    });

    try {
      logger.debug("Updating user profile", { userId: user.id, formData });

      // Use real API endpoint
      const updatedUser = await userService.updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
      });

      // Update user context with new data
      const updatedUserData = {
        ...user,
        full_name: updatedUser.full_name,
        name: updatedUser.full_name || updatedUser.username,
        phone: updatedUser.phone,
        location: updatedUser.location,
      };

      await updateUser(updatedUserData);

      logger.debug("Profile updated successfully", { userId: user.id });
      setStatus({
        type: "success",
        message: "Profile updated successfully!",
      });

      setIsEditing(false);

      setTimeout(() => {
        setStatus({ type: "idle", message: "" });
      }, 3000);
    } catch (error: any) {
      logger.error("Error updating profile", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "Avatar file size must be less than 5MB.",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setStatus({
        type: "error",
        message: "Please select a valid image file.",
      });
      return;
    }

    setAvatarLoading(true);

    try {
      logger.debug("Uploading avatar", {
        userId: user.id,
        fileName: file.name,
      });

      // Use uploadFile helper from api-client
      const response = await uploadFile("/api/user/avatar", file, "avatar");

      if (response.data && response.data.avatarUrl) {
        const updatedUser = {
          ...user,
          avatar: response.data.avatarUrl,
          avatar_url: response.data.avatarUrl,
        };

        await updateUser(updatedUser);

        logger.debug("Avatar updated successfully", {
          userId: user.id,
          avatarUrl: response.data.avatarUrl,
        });
        setStatus({
          type: "success",
          message: "Avatar updated successfully!",
        });

        setTimeout(() => {
          setStatus({ type: "idle", message: "" });
        }, 3000);
      }
    } catch (error: any) {
      logger.error("Error uploading avatar", error);
      setStatus({
        type: "error",
        message: error.message || "Failed to upload avatar.",
      });
    } finally {
      setAvatarLoading(false);
    }
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
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.full_name || user.name || "User avatar"}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                      {getUserInitials(user)}
                    </div>
                  )}

                  {/* Avatar Upload */}
                  <label className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 rounded-full p-2 cursor-pointer transition-colors shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={avatarLoading}
                    />
                    {avatarLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </label>
                </div>

                <div>
                  <h1 className="text-2xl font-bold">
                    {user.full_name || user.name || user.username}
                  </h1>
                  <p className="text-blue-100 flex items-center mt-1">
                    <Shield className="w-4 h-4 mr-2" />
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-3 rounded-lg transition-colors"
                disabled={loading}
              >
                {isEditing ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <StatusMessage />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h2>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <User className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {user.full_name || user.name || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {user.email}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formData.phone || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your location"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {formData.location || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h2>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <User className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {user.username}
                    </span>
                  </div>
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User ID
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Key className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-mono text-sm">
                      {user.id}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Role
                  </label>
                  <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Shield className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-900 dark:text-white capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      full_name: user.full_name || user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                      location: user.location || "",
                      avatar_url: user.avatar || "",
                    });
                  }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
