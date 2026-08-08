import { motion } from "framer-motion";
import { User, Mail, GraduationCap, Phone, ShieldCheck } from "lucide-react";

const ProfileCard = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='bg-white rounded-3xl shadow-lg hover:shadow-xl transition p-8 max-w-xl mx-auto border border-gray-100'
    >
      <div className='flex items-center gap-5 pb-6 border-b border-gray-100'>
        <div className='w-20 h-20 rounded-full bg-yellow-400 text-gray-900 font-bold text-2xl flex items-center justify-center shadow-md shrink-0'>
          {getInitials(user?.name)}
        </div>

        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {user?.name || "User Profile"}
            </h2>
            <ShieldCheck size={20} className='text-yellow-500' />
          </div>
          <p className='text-sm text-gray-500 mt-1'>
            {user?.role ? user.role.toUpperCase() : "RIDER"}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
        <div className='bg-gray-50 rounded-2xl p-4 flex items-center gap-4'>
          <div className='w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0'>
            <User size={20} />
          </div>
          <div>
            <p className='text-xs text-gray-500 font-medium'>Full Name</p>
            <p className='text-sm font-semibold text-gray-900 mt-0.5'>
              {user?.name || "Not provided"}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className='bg-gray-50 rounded-2xl p-4 flex items-center gap-4'>
          <div className='w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0'>
            <Mail size={20} />
          </div>
          <div className='overflow-hidden'>
            <p className='text-xs text-gray-500 font-medium'>Email Address</p>
            <p className='text-sm font-semibold text-gray-900 mt-0.5 truncate'>
              {user?.email || "Not provided"}
            </p>
          </div>
        </div>

        {/* College */}
        <div className='bg-gray-50 rounded-2xl p-4 flex items-center gap-4'>
          <div className='w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0'>
            <GraduationCap size={20} />
          </div>
          <div className='overflow-hidden'>
            <p className='text-xs text-gray-500 font-medium'>
              College / Campus
            </p>
            <p className='text-sm font-semibold text-gray-900 mt-0.5 truncate'>
              {user?.college || "Not provided"}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className='bg-gray-50 rounded-2xl p-4 flex items-center gap-4'>
          <div className='w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0'>
            <Phone size={20} />
          </div>
          <div>
            <p className='text-xs text-gray-500 font-medium'>Phone Number</p>
            <p className='text-sm font-semibold text-gray-900 mt-0.5'>
              {user?.phone || "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
