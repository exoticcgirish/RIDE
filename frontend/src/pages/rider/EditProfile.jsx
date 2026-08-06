import { useNavigate } from "react-router-dom";

const EditProfile = ({ user }) => {
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
          <p className='page-label'>Edit Profile</p>
          <h1>Update your details</h1>
        </div>
      </div>
      <div className='page-card'>
        <p>Name: {user?.name || "N/A"}</p>
        <p>Email: {user?.email || "N/A"}</p>
        <p>Phone: {user?.phone || "N/A"}</p>
        <p>College: {user?.college || "N/A"}</p>
      </div>
    </div>
  );
};

export default EditProfile;
