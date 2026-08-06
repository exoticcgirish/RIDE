import { useEffect, useState } from "react";
import { getDriverProfile } from "../../services/driverApi";
import { useNavigate } from "react-router-dom";

function DriverProfile() {
  const [driver, setDriver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getDriverProfile();
      setDriver(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!driver) return <h2>Loading...</h2>;

  return (
    <div className='max-w-5xl mx-auto p-8'>
      <div className='bg-white rounded-xl shadow p-8'>
        <h1 className='text-3xl font-bold mb-8'>Driver Profile</h1>

        <div className='grid md:grid-cols-2 gap-6'>
          <Info title='Full Name' value={driver.full_name} />

          <Info title='Email' value={driver.email} />

          <Info title='Phone' value={driver.phone} />

          <Info title='Vehicle Name' value={driver.vehicleName} />

          <Info title='Vehicle Number' value={driver.vehicleNumber} />

          <Info title='Vehicle Color' value={driver.vehicleColor} />

          <Info title='Seats' value={driver.totalSeats} />

          <Info title='Status' value={driver.approvalStatus} />
        </div>

        <button
          onClick={() => navigate("/driver/edit-profile")}
          className='mt-8 bg-yellow-400 px-6 py-3 rounded-lg'
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div className='border rounded-lg p-4'>
      <h3 className='text-gray-500'>{title}</h3>

      <p className='font-bold mt-2'>{value || "Not Provided"}</p>
    </div>
  );
}

export default DriverProfile;
