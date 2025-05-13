// UserDetailsModal.js
import React from 'react';

const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">User Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div
                    key={user._id}
                    // onClick={() => handleUserClick(user)}
                    className="flex justify-center space-x-3 cursor-pointer hover:bg-gray-100 p-1 rounded"
                >
                    <img src={user.profilePicture} alt="profile" className="w-20 h-20 rounded-full object-cover" />

                </div>
                <div className="space-y-3">

                    <p><strong>Username:</strong> {user?.username}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Bio:</strong> {user?.bio}</p>
                    {/* Add more user details as needed */}
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;