import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../../../api/api";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/api/candidate/profile");
        setForm(res.data);
      } catch (err) {
        console.log(err)
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const { phone, address, skills } = form;
      const res = await API.put("/api/candidate/profile", { phone, address, skills });
      toast.success("Profile updated");
      setForm(res.data.user);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">My Profile</h2>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={form.name}
            name="name"
            className="w-full border p-2 rounded mt-1"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={form.email}
            name="email"
            className="w-full border p-2 rounded mt-1"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            value={form.phone}
            name="phone"
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={form.address}
            name="address"
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <textarea
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="w-full border p-2 rounded mt-1"
            rows={3}
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
