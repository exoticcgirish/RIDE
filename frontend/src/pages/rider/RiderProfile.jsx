import ProfileAvatar from "../../components/rider/ProfileAvatar";
import ProfileCard from "../../components/rider/ProfileCard";
import ProfileForm from "../../components/rider/ProfileForm";

const RiderProfile = ({ user }) => {
  return (
    <div className='page-shell rider-profile-page'>
      <div className='page-header'>
        <div>
          <p className='page-label'>My Profile</p>
          <h1>Welcome back, {user?.name || "Rider"}</h1>
        </div>
      </div>

      <div className='profile-grid'>
        <ProfileAvatar user={user} />
        <ProfileCard user={user} />
      </div>

      <div className='page-card'>
        <h2>Edit Details</h2>
        <ProfileForm user={user} />
      </div>
    </div>
  );
};

export default RiderProfile;
