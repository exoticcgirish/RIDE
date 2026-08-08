import { useState, useEffect } from "react";
import {
  User,
  Phone,
  GraduationCap,
  Users,
  PhoneCall,
  Save,
} from "lucide-react";
import { updateProfile } from "../../services/userApi";

const ProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    college: user?.college || "",
    gender: user?.gender || "",
    emergencyContact: user?.emergencyContact || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      college: "",
      gender: "",
      emergencyContact: "",
    });
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const payload = {
      ...formData,
      gender: formData.gender ? formData.gender.toLowerCase() : undefined,
    };

    try {
      const res = await updateProfile(payload);

      const updatedUser = res.data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setFormData({
        name: updatedUser.name || "",
        phone: updatedUser.phone || "",
        college: updatedUser.college || "",
        gender: updatedUser.gender || "",
        emergencyContact: updatedUser.emergencyContact || "",
      });

      onUpdate?.(updatedUser);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {success && (
        <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium'>
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='relative flex items-center'>
          <div className='absolute left-4 text-yellow-500 pointer-events-none'>
            <User size={18} />
          </div>
          <input
            name='name'
            value={formData.name}
            placeholder='Full Name'
            onChange={handleChange}
            className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
            required
          />
        </div>
        <div className='relative flex items-center'>
          <div className='absolute left-4 text-yellow-500 pointer-events-none'>
            <Phone size={18} />
          </div>
          <input
            name='phone'
            value={formData.phone}
            placeholder='Phone Number'
            onChange={handleChange}
            className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
          />
        </div>

        {/* College */}
        <div className='relative flex items-center'>
          <div className='absolute left-4 text-yellow-500 pointer-events-none'>
            <GraduationCap size={18} />
          </div>
          <input
            name='college'
            value={formData.college}
            placeholder='College / Campus'
            onChange={handleChange}
            className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
          />
        </div>
        <div className='relative flex items-center'>
          <div className='absolute left-4 text-yellow-500 pointer-events-none'>
            <Users size={18} />
          </div>
          <select
            name='gender'
            value={formData.gender}
            onChange={handleChange}
            className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition appearance-none cursor-pointer'
          >
            <option value=''>Select Gender</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='other'>Other</option>
          </select>
        </div>
        <div className='relative flex items-center md:col-span-2'>
          <div className='absolute left-4 text-yellow-500 pointer-events-none'>
            <PhoneCall size={18} />
          </div>
          <input
            name='emergencyContact'
            value={formData.emergencyContact}
            placeholder='Emergency Contact'
            onChange={handleChange}
            className='w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition'
          />
        </div>
      </div>

      <div className='flex justify-end pt-2'>
        <button
          type='submit'
          disabled={saving}
          className='bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50'
        >
          {saving ? (
            <div className='w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin' />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
      
    </form>
  );
};

export default ProfileForm;
