import { useNavigate } from "react-router-dom";

const Payments = () => {
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
          <p className='page-label'>Payments</p>
          <h1>Payment methods</h1>
        </div>
      </div>
      <div className='page-card'>
        <p>No payment methods configured.</p>
      </div>
    </div>
  );
};

export default Payments;
