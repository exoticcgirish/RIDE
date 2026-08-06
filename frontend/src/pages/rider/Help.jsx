import { useNavigate } from "react-router-dom";

const Help = () => {
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
          <p className='page-label'>Help</p>
          <h1>Need help?</h1>
        </div>
      </div>
      <div className='page-card'>
        <p>Contact support at support@ridelink.example.com.</p>
      </div>
    </div>
  );
};

export default Help;
