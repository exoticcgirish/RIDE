import { useNavigate } from "react-router-dom";

const RideHistory = () => {
  const navigate = useNavigate();

  return (
    <div className='page-shell'>
      <div className='page-header'>
        <button
          type='button'
          className='back-btn'
          onClick={() => navigate("/dashboard")}
        >
          ← Back
        </button>
        <div>
          <p className='page-label'>Ride History</p>
          <h1>Your trips</h1>
        </div>
      </div>
      <div className='page-card'>
        <p>No rides found yet.</p>
      </div>
    </div>
  );
};

export default RideHistory;
