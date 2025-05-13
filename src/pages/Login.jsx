import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ApiEndPoint } from '../utils/ApiEndPoint';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      toast.error("❗ Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${ApiEndPoint}users/login`, form);
      toast.success(`✅ Welcome back, ${res.data.user.username}!`);

      localStorage.setItem("token", res.data.user._id);
      navigate('/feed');
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Login failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085')] bg-cover bg-center opacity-20 z-0"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={goToSignup}
            className="w-full bg-white text-blue-600 border border-blue-400 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            Go to Signup
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
