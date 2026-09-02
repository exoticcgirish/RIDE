import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Car,
  Hash,
  Palette,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getDriverProfile,
  updateDriverProfile,
} from "../../services/driverApi";

function DriverProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    vehicleNumber: "",
    vehicleModel: "",
    vehicleColor: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await getDriverProfile();

        console.log("Driver profile response:", response.data);

        const user =
          response.data?.data || response.data?.user || response.data;

        if (user) {
          setForm({
            name: user.name || user.full_name || "",
            phone: user.phone || "",
            vehicleType: user.vehicleType || "",
            vehicleNumber: user.vehicleNumber || "",
            vehicleModel: user.vehicleModel || "",
            vehicleColor: user.vehicleColor || "",
          });
        }
      } catch (error) {
        console.error("Profile error:", error);

        setMessage({
          type: "error",
          text:
            error.response?.data?.message || "Failed to load driver profile.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (message.text) {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your name.",
      });
      return;
    }

    if (!form.phone.trim()) {
      setMessage({
        type: "error",
        text: "Please enter your phone number.",
      });
      return;
    }

    try {
      setSaving(true);

      setMessage({
        type: "",
        text: "",
      });

      await updateDriverProfile(form);

      setMessage({
        type: "success",
        text: "Driver profile updated successfully.",
      });
    } catch (error) {
      console.error("Update profile error:", error);

      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (name) => {
    const cleanName = String(name || "").trim();

    return cleanName ? cleanName.charAt(0).toUpperCase() : "D";
  };

  const driverInitial = useMemo(() => getInitial(form.name), [form.name]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f8f9fb] flex items-center justify-center px-5'>
        <div className='bg-white rounded-3xl border border-gray-100 shadow-lg px-10 py-12 text-center max-w-sm w-full'>
          <div className='w-14 h-14 mx-auto rounded-2xl bg-[#fff5d6] flex items-center justify-center'>
            <Loader2 size={28} className='text-[#fdbd00] animate-spin' />
          </div>

          <h2 className='text-xl font-extrabold text-[#172033] mt-6'>
            Loading Profile
          </h2>

          <p className='text-gray-400 text-sm mt-2'>
            Getting your driver information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fb] text-[#172033]'>
      {/* ================= HEADER ================= */}

      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='h-[76px] flex items-center justify-between'>
            {/* Logo */}

            <button
              type='button'
              onClick={() =>
                navigate("/dashboard", {
                  replace: true,
                })
              }
              className='group text-left'
            >
              <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight leading-none'>
                <span className='text-[#172033]'>Ride</span>
                <span className='text-[#fdbd00]'>Link</span>
              </h1>

              <p className='text-[11px] sm:text-xs text-gray-400 mt-1'>
                Driver Dashboard
              </p>
            </button>

            {/* Header Right */}

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => navigate("/dashboard")}
                className='hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition font-semibold text-sm'
              >
                <ArrowLeft size={17} />
                Dashboard
              </button>

              <div className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-extrabold text-lg shadow-sm'>
                {driverInitial}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10'>
        {/* Back button mobile */}

        <button
          type='button'
          onClick={() => navigate("/dashboard")}
          className='sm:hidden flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#172033] mb-6 transition'
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* ================= PAGE TITLE ================= */}

        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5'>
            <div>
              <p className='text-xs sm:text-sm font-bold text-[#f0ad00] uppercase tracking-[0.18em]'>
                Driver Account
              </p>

              <h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight mt-2'>
                Driver Profile
              </h1>

              <p className='text-gray-500 mt-2 text-sm sm:text-base'>
                Manage your personal and vehicle information.
              </p>
            </div>

            {/* Profile Preview */}

            <div className='flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm'>
              <div className='w-11 h-11 rounded-full bg-[#172033] text-white flex items-center justify-center font-extrabold'>
                {driverInitial}
              </div>

              <div>
                <p className='text-xs text-gray-400'>Driver</p>

                <p className='font-extrabold text-sm'>
                  {form.name || "Your Name"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FEEDBACK ================= */}

        {message.text && (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 flex items-start gap-3 ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={21} className='mt-0.5 shrink-0' />
            ) : (
              <AlertCircle size={21} className='mt-0.5 shrink-0' />
            )}

            <div>
              <p className='font-bold text-sm'>
                {message.type === "success"
                  ? "Success"
                  : "Something went wrong"}
              </p>

              <p className='text-sm mt-0.5'>{message.text}</p>
            </div>
          </div>
        )}

        {/* ================= PROFILE CARD ================= */}

        <form
          onSubmit={handleSubmit}
          className='bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden'
        >
          {/* ================= PERSONAL HEADER ================= */}

          <div className='px-5 sm:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-white to-[#fffdf5]'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-[#fff5d6] flex items-center justify-center'>
                <User size={23} className='text-[#e7a900]' />
              </div>

              <div>
                <h2 className='text-lg sm:text-xl font-extrabold'>
                  Personal Information
                </h2>

                <p className='text-sm text-gray-400 mt-1'>
                  Your basic account details
                </p>
              </div>
            </div>
          </div>

          {/* ================= PERSONAL FORM ================= */}

          <div className='p-5 sm:p-8'>
            <div className='grid md:grid-cols-2 gap-6'>
              {/* NAME */}

              <div>
                <label
                  htmlFor='driver-name'
                  className='flex items-center gap-2 text-sm font-bold text-gray-700'
                >
                  <User size={16} />
                  Full Name
                </label>

                <div className='relative mt-2'>
                  <input
                    id='driver-name'
                    name='name'
                    type='text'
                    value={form.name}
                    onChange={handleChange}
                    placeholder='Enter your full name'
                    autoComplete='name'
                    className='w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 pr-4 text-[#172033] font-medium outline-none transition placeholder:text-gray-400 focus:bg-white focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/10'
                  />
                </div>
              </div>

              {/* PHONE */}

              <div>
                <label
                  htmlFor='driver-phone'
                  className='flex items-center gap-2 text-sm font-bold text-gray-700'
                >
                  <Phone size={16} />
                  Phone Number
                </label>

                <input
                  id='driver-phone'
                  name='phone'
                  type='tel'
                  value={form.phone}
                  onChange={handleChange}
                  placeholder='Enter phone number'
                  autoComplete='tel'
                  className='w-full h-12 mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-[#172033] font-medium outline-none transition placeholder:text-gray-400 focus:bg-white focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/10'
                />
              </div>
            </div>
          </div>

          {/* ================= VEHICLE HEADER ================= */}

          <div className='px-5 sm:px-8 py-6 border-y border-gray-100 bg-gradient-to-r from-white to-[#fffdf5]'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-[#fff5d6] flex items-center justify-center'>
                <Car size={24} className='text-[#e7a900]' />
              </div>

              <div>
                <h2 className='text-lg sm:text-xl font-extrabold'>
                  Vehicle Information
                </h2>

                <p className='text-sm text-gray-400 mt-1'>
                  Details about the vehicle you use for rides
                </p>
              </div>
            </div>
          </div>

          {/* ================= VEHICLE FORM ================= */}

          <div className='p-5 sm:p-8'>
            <div className='grid md:grid-cols-2 gap-6'>
              {/* VEHICLE TYPE */}

              <div>
                <label
                  htmlFor='vehicle-type'
                  className='flex items-center gap-2 text-sm font-bold text-gray-700'
                >
                  <Car size={16} />
                  Vehicle Type
                </label>

                <input
                  id='vehicle-type'
                  name='vehicleType'
                  value={form.vehicleType}
                  onChange={handleChange}
                  placeholder='e.g. Bike,Car'
                  className='w-full h-12 mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-[#172033] font-medium outline-none transition placeholder:text-gray-400 focus:bg-white focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/10'
                />
              </div>

              <div>
                <label
                  htmlFor='vehicle-number'
                  className='flex items-center gap-2 text-sm font-bold text-gray-700'
                >
                  <Hash size={16} />
                  Vehicle Number
                </label>

                <input
                  id='vehicle-number'
                  name='vehicleNumber'
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder='e.g. UP16AB1234'
                  className='w-full h-12 mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 uppercase text-[#172033] font-medium outline-none transition placeholder:text-gray-400 placeholder:normal-case focus:bg-white focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/10'
                />
              </div>

              {/* MODEL */}

              <div>
                <label
                  htmlFor='vehicle-model'
                  className='flex items-center gap-2 text-sm font-bold text-gray-700'
                >
                  <Car size={16} />
                  Vehicle Model
                </label>

                <input
                  id='vehicle-model'
                  name='vehicleModel'
                  value={form.vehicleModel}
                  onChange={handleChange}
                  placeholder='e.g. Swift, Creta, City'
                  className='w-full h-12 mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-[#172033] font-medium outline-none transition placeholder:text-gray-400 focus:bg-white focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/10'
                />
              </div>

              {/* COLOR */}

              <div>
                <label
                  htmlFor='vehicle-color'
                  className='flex items-center gap-2 text-sm font-bold text-gray-700'
                >
                  <Palette size={16} />
                  Vehicle Color
                </label>

                <input
                  id='vehicle-color'
                  name='vehicleColor'
                  value={form.vehicleColor}
                  onChange={handleChange}
                  placeholder='e.g. White, Black, Silver'
                  className='w-full h-12 mt-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-[#172033] font-medium outline-none transition placeholder:text-gray-400 focus:bg-white focus:border-[#fdbd00] focus:ring-4 focus:ring-[#fdbd00]/10'
                />
              </div>
            </div>

            {/* ================= VEHICLE PREVIEW ================= */}

            <div className='mt-8 rounded-2xl bg-[#f8f9fb] border border-gray-100 p-5'>
              <div className='flex items-center justify-between gap-4 mb-4'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-wider text-gray-400'>
                    Vehicle Preview
                  </p>

                  <p className='font-extrabold mt-1'>
                    {form.vehicleModel || form.vehicleType || "Your Vehicle"}
                  </p>
                </div>

                <div className='w-11 h-11 rounded-xl bg-white border border-gray-100 flex items-center justify-center'>
                  <Car size={21} className='text-[#172033]' />
                </div>
              </div>

              <div className='grid grid-cols-3 gap-3'>
                <div className='bg-white rounded-xl p-3 border border-gray-100'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-400'>
                    Type
                  </p>

                  <p className='font-bold text-sm mt-1 truncate'>
                    {form.vehicleType || "—"}
                  </p>
                </div>

                <div className='bg-white rounded-xl p-3 border border-gray-100'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-400'>
                    Number
                  </p>

                  <p className='font-bold text-sm mt-1 truncate uppercase'>
                    {form.vehicleNumber || "—"}
                  </p>
                </div>

                <div className='bg-white rounded-xl p-3 border border-gray-100'>
                  <p className='text-[10px] uppercase tracking-wide text-gray-400'>
                    Color
                  </p>

                  <p className='font-bold text-sm mt-1 truncate'>
                    {form.vehicleColor || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= ACTIONS ================= */}

            <div className='mt-8 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4'>
              <button
                type='button'
                onClick={() => navigate("/dashboard")}
                className='w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold transition'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={saving}
                className='w-full sm:w-auto min-w-[170px] bg-[#fdbd00] hover:bg-[#efb000] active:bg-[#dfa400] disabled:bg-gray-200 disabled:text-gray-400 text-[#172033] px-7 py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:cursor-not-allowed'
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className='animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ================= FOOTER NOTE ================= */}

        <div className='mt-6 flex items-start gap-3 px-1'>
          <AlertCircle size={16} className='text-gray-400 mt-0.5 shrink-0' />

          <p className='text-xs sm:text-sm text-gray-400'>
            Keep your phone number and vehicle information accurate so riders
            can identify the correct driver and vehicle.
          </p>
        </div>
      </main>
    </div>
  );
}

export default DriverProfile;
