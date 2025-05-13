import React, { useState } from 'react';
import axios from 'axios';
import { ApiEndPoint } from '../../utils/ApiEndPoint';

const EditPostModal = ({ post, onClose, onPostUpdate }) => {
  const [caption, setCaption] = useState(post.caption);
  const [images, setImages] = useState(post.images);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${ApiEndPoint}posts/updatepost/${post._id}`, {
        caption,
        images
      });
      onPostUpdate(res.data.post);
      onClose();
    } catch (err) {
      console.error('Error updating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg w-96 space-y-4">
        <h2 className="text-lg font-semibold">Edit Post</h2>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {/* Optional: Add UI to edit/remove/add images */}
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((img, i) => (
            <img key={i} src={img} alt="img" className="w-16 h-16 object-cover rounded" />
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="text-gray-600">Cancel</button>
          <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-4 py-1 rounded"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
