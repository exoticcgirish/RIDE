import { useState, useEffect } from "react";

const ProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",

    phone: user?.phone || "",

    college: user?.college || "",

    gender: user?.gender || "",

    emergencyContact: user?.emergencyContact || "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        college: user.college || "",
        gender: user.gender || "",
        emergencyContact: user.emergencyContact || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name='name'
        value={formData.name}
        placeholder='Name'
        onChange={handleChange}
      />

      <input
        name='phone'
        value={formData.phone}
        placeholder='Phone'
        onChange={handleChange}
      />

      <input
        name='college'
        value={formData.college}
        placeholder='College'
        onChange={handleChange}
      />

      <select name='gender' value={formData.gender} onChange={handleChange}>
        <option value=''>Gender</option>
        <option value='Male'>Male</option>
        <option value='Female'>Female</option>
        <option value='Other'>Other</option>
      </select>

      <input
        name='emergencyContact'
        value={formData.emergencyContact}
        placeholder='Emergency Contact'
        onChange={handleChange}
      />

      <button type='submit'>Save Profile</button>
    </form>
  );
};

export default ProfileForm;
