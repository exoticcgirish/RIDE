const ProfileCard = ({ user }) => {
  return (
    <div className='profile-card'>
      <h2>Profile</h2>

      <p>Name : {user?.name || "Not provided"}</p>

      <p>Email : {user?.email || "Not provided"}</p>

      <p>College : {user?.college || "Not provided"}</p>

      <p>Phone : {user?.phone || "Not provided"}</p>
    </div>
  );
};

export default ProfileCard;
