const ProfileAvatar = ({ user }) => {
  const avatarName = user?.name || "User";
  return (
    <div className='profile-avatar'>
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
          avatarName,
        )}&background=ffd54f&color=212121`}
        alt={`${avatarName} avatar`}
      />

      <button type='button'>Change Photo</button>
    </div>
  );
};

export default ProfileAvatar;
