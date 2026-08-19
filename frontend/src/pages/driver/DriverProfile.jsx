import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getDriverProfile();

        const user =
          response.data?.data ||
          response.data?.user ||
          response.data;

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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      await updateDriverProfile(form);

      alert("Driver profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-gray-500 font-semibold">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#172033]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard", { replace: true })}
            className="flex items-center gap-2 font-bold hover:text-[#fdbd00] transition"
          >
            <ArrowLeft size={20} />
            Driver Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8">
          <p className="text-sm text-gray-400">
            Driver Account
          </p>

          <h1 className="text-3xl font-extrabold mt-1">
            Driver Profile
          </h1>

          <p className="text-gray-500 mt-2">
            Keep your driver and vehicle information updated.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8"
        >
          <h2 className="text-xl font-extrabold mb-6">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold">
                Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#fdbd00]"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#fdbd00]"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 my-8" />

          <h2 className="text-xl font-extrabold mb-6">
            Vehicle Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              ["vehicleType", "Vehicle Type"],
              ["vehicleNumber", "Vehicle Number"],
              ["vehicleModel", "Vehicle Model"],
              ["vehicleColor", "Vehicle Color"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="text-sm font-semibold">
                  {label}
                </label>

                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#fdbd00]"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-8 bg-[#fdbd00] hover:bg-[#efb000] disabled:bg-gray-200 text-[#172033] px-7 py-3 rounded-xl font-extrabold flex items-center gap-2"
          >
            <Save size={18} />

            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default DriverProfile;