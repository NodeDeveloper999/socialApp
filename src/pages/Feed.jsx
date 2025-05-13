import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import PostForm from './components/PostForm';
import PostCard from './components/PostCard';
import { ApiEndPoint } from '../utils/ApiEndPoint';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const loader = useRef(null);
    const token = localStorage.getItem('token');


    const fetchPosts = async () => {
        setLoading(true);

        // Wait for 3 seconds
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const res = await axios.get(`${ApiEndPoint}posts/paginated?page=${page}&limit=7`);
            const fetchedPosts = res.data;

            if (fetchedPosts.length < 7) setHasMore(false);

            setPosts((prevPosts) => {
                const newPosts = fetchedPosts.filter(
                    (post) => !prevPosts.some((existingPost) => existingPost._id === post._id)
                );
                return [...prevPosts, ...newPosts];
            });
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (page === 1 || posts.length >= (page - 1) * 7) {
            fetchPosts();
        }
    }, [page]);

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, loading]);

    useEffect(() => {
        const option = {
            root: null,
            rootMargin: '20px',
            threshold: 1.0,
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (loader.current) observer.observe(loader.current);

        return () => observer.disconnect();
    }, [handleObserver]);

    const handleAddPost = (newPost) => {
        setPosts((prev) => [newPost, ...prev]);
    };

    const handleLikePost = (postIndex) => {
        const updated = [...posts];
        updated[postIndex].likes += 1;
        setPosts(updated);
    };

    // const handleLikeComment = (postIndex, commentIndex) => {
    //     const updated = [...posts];
    //     updated[postIndex].comments[commentIndex].likes += 1;
    //     setPosts(updated);
    // };

    const handleAddComment = (postIndex, text) => {
        const updated = [...posts];
        updated[postIndex].comments.push({ text, likes: 0, replies: [] });
        setPosts(updated);
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts(prev =>
            prev.map(post => post._id === updatedPost._id ? updatedPost : post)
        );
    };
    const handleReplyToComment = (postIndex, commentIndex, replyText) => {
        const updated = [...posts];
        updated[postIndex].comments[commentIndex].replies.push({ text: replyText, likes: 0 });
        setPosts(updated);
    };

    return (
        <div
            className="min-h-screen p-6 space-y-8 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('https://www.w3schools.com/w3images/fjords.jpg')" }}
        >
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">Social Feed</h1>

            <div className="w-full max-w-xl mx-auto bg-white/90 p-6 rounded-xl shadow-lg">
                <PostForm onAddPost={handleAddPost} />
            </div>

            <div className="space-y-6">
                {posts.map((post, idx) => (
                    <div key={post._id || idx} className="max-w-3xl mx-auto">
                        <PostCard
                            post={post}
                            postIndex={idx}
                            onLikePost={handleLikePost}
                            // onLikeComment={handleLikeComment}
                            onReplyToComment={handleReplyToComment}
                            setPosts={setPosts}
                            userId={token}
                            fetchPosts={fetchPosts} // replace with actual user ID
                            onPostUpdate={handlePostUpdate}
                        />

                    </div>
                ))}
                {hasMore && (
                    <div ref={loader} className="h-10 flex justify-center items-center">
                        {loading ? <span className="text-white">Loading more posts...</span> : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
