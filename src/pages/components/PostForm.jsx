import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { uploadImagesToCloudinary } from '../../utils/cloudinary';
import { ApiEndPoint } from '../../utils/ApiEndPoint';

const PostForm = ({ onAddPost }) => {
    const [images, setImages] = useState([]);
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (images.length === 0) return toast.error('Please select images');

        try {
            setLoading(true);

            const imageUrls = await uploadImagesToCloudinary(images);
            const token = localStorage.getItem('token');

            console.log("token", token)
            const res = await axios.post(
                `${ApiEndPoint}posts/create`,
                { caption, images: imageUrls, userId: token },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success('Post created!');
            onAddPost(res.data.post);
            setCaption('');
            setImages([]);
        } catch (err) {
            console.error('Post creation error:', err);
            toast.error('Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4">
            <textarea
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-400"
                rows={3}
            />
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? 'Posting...' : 'Post'}
            </button>
        </form>
    );
};

export default PostForm;
