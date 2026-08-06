// src/hooks/useProfile.js

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/userApi";

const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Logged-in User Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProfile();

      setProfile(response.data.rider || response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  // Update Profile
  const saveProfile = async (data) => {
    try {
      setLoading(true);
      setError("");

      const response = await updateProfile(data);

      setProfile(response.data.rider || response.data.user);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (err) {
      const message = err.response?.data?.message || "Profile update failed.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    saveProfile,
  };
};

export default useProfile;
