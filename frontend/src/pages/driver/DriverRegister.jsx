import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerDriver } from "../../services/authApi";

function DriverRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    vehicleType: "",
    vehicleModel: "",
    vehicleNumber: "",
    vehicleColor: "",
    availableSeats: 4,
    licenseNumber: "",
    rcNumber: "",
    aadhaarNumber: "",
    experience: 0,
    collegeName: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await registerDriver(formData);

      alert("Registration successful.\nWaiting for admin approval.");

      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 py-10'>
      <div className='max-w-4xl mx-auto bg-white rounded-xl shadow p-8'>
        <h1 className='text-3xl font-bold mb-8'>Driver Registration</h1>

        <form onSubmit={handleSubmit} className='grid md:grid-cols-2 gap-5'>
          <input
            name='full_name'
            placeholder='Full Name'
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />

          <input
            name='email'
            type='email'
            placeholder='Email'
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />

          <input
            name='password'
            type='password'
            placeholder='Password'
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />

          <input
            name='phone'
            placeholder='Phone Number'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <select
            name='vehicleType'
            onChange={handleChange}
            className='border p-3 rounded'
            required
          >
            <option value=''>Vehicle Type</option>
            <option value='Auto'>Auto</option>
            <option value='Car'>Car</option>
            <option value='Bike'>Bike</option>
          </select>

          <input
            name='vehicleModel'
            placeholder='Vehicle Model'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='vehicleNumber'
            placeholder='Vehicle Number'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='vehicleColor'
            placeholder='Vehicle Color'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='licenseNumber'
            placeholder='Driving License Number'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='rcNumber'
            placeholder='RC Number'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='aadhaarNumber'
            placeholder='Aadhaar Number'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='collegeName'
            placeholder='College'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='experience'
            type='number'
            placeholder='Driving Experience'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <input
            name='availableSeats'
            type='number'
            min='1'
            max='8'
            placeholder='Available Seats'
            onChange={handleChange}
            className='border p-3 rounded'
          />

          <div className='md:col-span-2'>
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-yellow-400 hover:bg-yellow-500 p-4 rounded-lg font-bold'
            >
              {loading ? "Registering..." : "Register as Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DriverRegister;
