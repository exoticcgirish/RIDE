import { Camera, User } from "lucide-react";
import { useRef, useState } from "react";

function ProfileAvatar({ user, onUpload }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(user?.profileImage || "");

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    if (onUpload) {
      await onUpload(file);
    }
  };

  return (
    <div className='bg-white rounded-3xl shadow p-8 flex flex-col items-center'>
      <div className='relative'>
        {preview ? (
          <img
            src={preview}
            alt='Profile'
            className='w-40 h-40 rounded-full object-cover border-4 border-blue-500'
          />
        ) : (
          <div className='w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center'>
            <User size={70} />
          </div>
        )}

        <button
          onClick={handleClick}
          className='absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2'
        >
          <Camera size={20} />
        </button>
      </div>

      <input
        type='file'
        hidden
        ref={inputRef}
        accept='image/*'
        onChange={handleChange}
      />

      <h2 className='mt-5 text-2xl font-bold'>{user?.name}</h2>

      <p className='text-gray-500'>{user?.role}</p>
    </div>
  );
}

export default ProfileAvatar;
