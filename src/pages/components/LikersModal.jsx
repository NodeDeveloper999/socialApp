import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { ApiEndPoint } from '../../utils/ApiEndPoint';
import UserDetailModal from './UserDetailModal'; // Make sure this exists

const LikersModal = ({ postId, onClose }) => {
    const [likers, setLikers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const loaderRef = useRef(null);

    const fetchLikers = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const res = await axios.get(`${ApiEndPoint}posts/${postId}/likers?page=${page}&limit=20`);
            setLikers((prev) => [...prev, ...res.data.users]);
            setHasMore(page < res.data.totalPages);
            setPage((prev) => prev + 1);
        } catch (err) {
            console.error('Error fetching likers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
            fetchLikers();
        }
    }, [hasMore, loading]);

    useEffect(() => {
        const option = { threshold: 1 };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const closeUserDetail = () => {
        setSelectedUser(null);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-[80vh] overflow-y-auto relative">
                    <h2 className="text-lg font-semibold mb-2">Liked by</h2>
                    <button className="absolute top-2 right-2 text-gray-600" onClick={onClose}>✕</button>
                    <div className="space-y-3">
                        {likers.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => handleUserClick(user)}
                                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-1 rounded"
                            >
                                <img src={user.profilePicture} alt="profile" className="w-8 h-8 rounded-full object-cover" />
                                <span>{user.username}</span>
                            </div>
                        ))}
                        {loading && <div className="text-center text-gray-500">Loading...</div>}
                        <div ref={loaderRef}></div>
                    </div>
                </div>
            </div>

            {selectedUser && (
                <UserDetailModal user={selectedUser} onClose={closeUserDetail} />
            )}
        </>
    );
};

export default LikersModal;
