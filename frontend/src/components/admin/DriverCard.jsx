function DriverCard({ driver, onApprove, onReject }) {
  return (
    <div className='bg-white rounded-xl shadow p-5'>
      <h2 className='text-xl font-bold'>{driver.full_name}</h2>

      <p>{driver.email}</p>

      <p>{driver.phone}</p>

      <p>{driver.vehicleType}</p>

      <p>{driver.vehicleNumber}</p>

      <div className='flex gap-3 mt-5'>
        <button
          onClick={() => onApprove(driver._id)}
          className='bg-green-500 text-white px-5 py-2 rounded'
        >
          Approve
        </button>

        <button
          onClick={() => onReject(driver._id)}
          className='bg-red-500 text-white px-5 py-2 rounded'
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default DriverCard;
