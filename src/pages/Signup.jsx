import React, { useState } from 'react';
import axios from 'axios';
import { ApiEndPoint } from '../utils/ApiEndPoint';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/ds8jwhyoj/image/upload';
const CLOUDINARY_PRESET = 'Socailapp_AWS';


const Signup = () => {
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    bio: '',
    profilePicture: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG)');
      return;
    }

    // Validate file size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);

      // Add timestamp for cache busting
      formData.append('timestamp', Date.now() / 1000 | 0);

      console.log('Uploading file:', file);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      console.log('Cloudinary response:', response.data);
      return response.data.secure_url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please upload a profile picture');
      return;
    }

    if (!form.username || !form.password) {
      setError('Username and password are required');
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload image
      const imageUrl = await uploadImageToCloudinary(imageFile);

      console.log('imageUrl successful:', imageUrl);
      form.profilePicture = imageUrl
      // Step 2: Submit form
      const response = await axios.post(`${ApiEndPoint}users/signup`, {
        ...form,
      });

      console.log('Signup successful:', response.data);
      alert('Signup successful!');
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Signup failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg space-y-4"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Sign Up</h2>

        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <textarea
            name="bio"
            placeholder="Tell us about yourself..."
            value={form.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 rounded-lg transition ${uploading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing Up...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;