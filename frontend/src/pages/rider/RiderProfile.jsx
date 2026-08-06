import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserCheck } from "lucide-react";

import ProfileAvatar from "../../components/rider/ProfileAvatar";
import ProfileCard from "../../components/rider/ProfileCard";
import ProfileForm from "../../components/rider/ProfileForm";
import { getProfile } from "../../services/userApi";

const RiderProfile = ({ user: initialUser }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialUser || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await getProfile();

      console.log("PROFILE RESPONSE:", res.data);

      const data = res.data?.rider || res.data?.user || res.data?.data;

      console.log("PROFILE DATA:", data);

      setProfile(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      await loadProfile();
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    const mergedUser = {
      ...profile,
      ...updatedData,
    };

    setProfile(mergedUser);
    localStorage.setItem("user", JSON.stringify(mergedUser));
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div className='flex items-center gap-5'>
            <button
              onClick={() => navigate("/dashboard")}
              className='w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition cursor-pointer shadow-sm'
            >
              <ArrowLeft size={22} />
            </button>

            <div>
              <p className='text-yellow-500 font-semibold uppercase tracking-wider text-sm'>
                My Profile
              </p>
              <h1 className='text-4xl font-bold text-gray-900'>
                Welcome back, {profile?.name || "Rider"}
              </h1>
              <p className='text-gray-500 mt-1'>
                Manage your profile information and account preferences.
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center gap-3'>
            <div className='bg-white rounded-2xl shadow-md px-6 py-4 flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center'>
                <UserCheck size={20} />
              </div>
              <div>
                <p className='text-xs text-gray-500 font-medium'>
                  Account Status
                </p>
                <p className='text-sm font-bold text-gray-900'>Active Rider</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='bg-white rounded-3xl shadow-lg p-16 text-center'>
            <div className='flex justify-center'>
              <div className='w-14 h-14 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin'></div>
            </div>
            <h2 className='text-2xl font-bold mt-8'>Loading Profile...</h2>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className='bg-red-100 border border-red-200 rounded-3xl p-8 text-center'>
            <p className='text-red-700 font-semibold'>{error}</p>
            <button
              onClick={loadProfile}
              className='mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold transition'
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='space-y-8'
          >
            {/* Top Grid: Avatar & Profile Card */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
              <div className='lg:col-span-1'>
                <ProfileAvatar user={profile} onUpload={uploadProfilePhoto} />
              </div>
              <div className='lg:col-span-2'>
                <ProfileCard user={profile} />
              </div>
            </div>

            {/* Edit Form Section */}
            <div className='bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10'>
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                Edit Details
              </h2>
              <ProfileForm user={profile} onUpdate={handleProfileUpdate} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RiderProfile;
