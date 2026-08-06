import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Phone,
  Save,
  CheckCircle2,
} from "lucide-react";

import { updateProfile } from "../../services/userApi";

const EditProfile = ({ user, onUpdateProfile }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    college: user?.college || "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Sync state if user prop loads late asynchronously
  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      college: "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        college: formData.college,
      };

      const res = await updateProfile(payload);

      const updatedUser = res.data.user || res.data.data || res.data.rider;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setFormData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        college: updatedUser.college || "",
      });

      onUpdateProfile?.(updatedUser);

      setSuccess(true);

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='max-w-4xl mx-auto px-6 py-8'>
        {/* Header */}
        <div className='flex items-center gap-5 mb-10'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition cursor-pointer shadow-sm'
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <p className='text-yellow-500 font-semibold uppercase tracking-wider text-sm'>
              Account Settings
            </p>
            <h1 className='text-4xl font-bold text-gray-900'>Edit Profile</h1>
            <p className='text-gray-500 mt-1'>
              Update your personal details and campus info.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-10'
        >
          {/* Success Banner */}
          {success && (
            <div className='mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-3'>
              <CheckCircle2 size={20} className='text-green-600' />
              <p className='text-sm font-medium'>
                Profile updated successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className='mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-medium'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Full Name */}
              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  Full Name
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-4 text-yellow-500 pointer-events-none'>
                    <User size={20} />
                  </div>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Enter your full name'
                    className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  Email Address
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-4 text-yellow-500 pointer-events-none'>
                    <Mail size={20} />
                  </div>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Enter your email'
                    className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  Phone Number
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-4 text-yellow-500 pointer-events-none'>
                    <Phone size={20} />
                  </div>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder='Enter your phone number'
                    className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
                  />
                </div>
              </div>

              {/* College / Campus */}
              <div>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                  College / Campus
                </label>
                <div className='relative flex items-center'>
                  <div className='absolute left-4 text-yellow-500 pointer-events-none'>
                    <GraduationCap size={20} />
                  </div>
                  <input
                    type='text'
                    name='college'
                    value={formData.college}
                    onChange={handleChange}
                    placeholder='Enter your college name'
                    className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='pt-6 flex items-center justify-end gap-4 border-t border-gray-100'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='px-6 py-3.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition cursor-pointer'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={saving}
                className='bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3.5 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50'
              >
                {saving ? (
                  <div className='w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin' />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
