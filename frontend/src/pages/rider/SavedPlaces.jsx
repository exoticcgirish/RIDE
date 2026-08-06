import { useNavigate } from "react-router-dom";

const SavedPlaces = () => {
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
          <p className='page-label'>Saved Places</p>
          <h1>Your favorite locations</h1>
        </div>
      </div>
      <div className='page-card'>
        <p>No saved locations yet.</p>
      </div>
    </div>
  );
};

export default SavedPlaces;
