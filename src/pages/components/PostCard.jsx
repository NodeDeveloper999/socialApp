import React, { useState } from 'react';
import axios from 'axios';
import { ApiEndPoint } from '../../utils/ApiEndPoint';
import ErrorModal from './ErrorModal';
import { CommentItem } from './Comment';
import LikersModal from './LikersModal';
import UserDetailsModal from './UserDetailModal';
import EditPostModal from './EditModel';

const PostCard = ({ post, postIndex, userId, setPosts, fetchPosts, onPostUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [visibleComments, setVisibleComments] = useState(3);
    const [errorMessage, setErrorMessage] = useState('');
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [showLikers, setShowLikers] = useState(false);
    const [showLikersModal, setShowLikersModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

   const isPostLiked = post.likes?.some(like =>
    typeof like === 'string' ? like === userId : like._id === userId
);
    
   const handlePostLike = async () => {
    const wasLiked = isPostLiked;

    // Optimistic update
    setPosts(prevPosts => {
        const updated = [...prevPosts];
        const postToUpdate = updated[postIndex];

        if (wasLiked) {
            // Remove like (assumes likes is an array of ObjectIds or objects with _id)
            postToUpdate.likes = postToUpdate.likes.filter(like =>
                typeof like === 'string' ? like !== userId : like._id !== userId
            );
        } else {
            // Add like as a string (consistent format)
            postToUpdate.likes = [...(postToUpdate.likes || []), userId];
        }

        return updated;
    });

    try {
        const res = await axios.post(`${ApiEndPoint}posts/like`, {
            postId: post._id,
            userId,
        });

        // Ensure local state matches server response (especially if backend returns full like user objects)
        setPosts(prevPosts => {
            const updated = [...prevPosts];
            updated[postIndex].likes = res.data.likes;
            return updated;
        });

    } catch (err) {
        console.error('Like error:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to like post');
        
        // Optionally revert on error
        // fetchPosts();
    }
};


    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        // Generate temporary ID for optimistic update
        const tempId = Date.now().toString();

        // Optimistic update
        setPosts(prevPosts => {
            const updated = [...prevPosts];
            updated[postIndex].comments = [
                ...(updated[postIndex].comments || []),
                {
                    _id: tempId,
                    text: newComment,
                    user: { _id: userId }, // Minimal user data
                    createdAt: new Date().toISOString(),
                    likes: [],
                    replies: []
                }
            ];
            return updated;
        });

        setNewComment('');

        try {
            const res = await axios.post(`${ApiEndPoint}posts/comment`, {
                postId: post._id,
                userId,
                text: newComment,
            });

            // Replace the temporary comment with the real one from server
            setPosts(prevPosts => {
                const updated = [...prevPosts];
                const commentIndex = updated[postIndex].comments.findIndex(c => c._id === tempId);
                if (commentIndex !== -1) {
                    updated[postIndex].comments[commentIndex] = res.data.comment;
                }
                return updated;
            });
        } catch (err) {
            console.error('Comment error:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to submit comment');

            // Remove the optimistic comment on error
            setPosts(prevPosts => {
                const updated = [...prevPosts];
                updated[postIndex].comments = updated[postIndex].comments.filter(c => c._id !== tempId);
                return updated;
            });
        }
    };

    const handleReplySubmit = async (postIdx, parentCommentId, text) => {
        if (!text.trim()) return;

        // Generate temporary ID for optimistic update
        const tempId = Date.now().toString();

        // Optimistic update
        setPosts(prevPosts => {
            const updated = [...prevPosts];

            const insertReply = (comments) => {
                for (let comment of comments) {
                    if (!comment.replies) {
                        comment.replies = [];
                    }

                    if (comment._id === parentCommentId) {
                        comment.replies.push({
                            _id: tempId,
                            text,
                            user: { _id: userId },
                            createdAt: new Date().toISOString(),
                            likes: [],
                            parentComment: parentCommentId
                        });
                        return true;
                    }

                    if (comment.replies?.length) {
                        if (insertReply(comment.replies)) return true;
                    }
                }
                return false;
            };

            insertReply(updated[postIdx].comments);
            return updated;
        });

        try {
            const res = await axios.post(`${ApiEndPoint}posts/comment`, {
                postId: post._id,
                userId,
                text,
                parentComment: parentCommentId,
            });

            // Replace the temporary reply with the real one from server
            setPosts(prevPosts => {
                const updated = [...prevPosts];

                const updateReply = (comments) => {
                    for (let comment of comments) {
                        if (comment.replies) {
                            const replyIndex = comment.replies.findIndex(r => r._id === tempId);
                            if (replyIndex !== -1) {
                                comment.replies[replyIndex] = res.data.comment;
                                return true;
                            }

                            if (updateReply(comment.replies)) return true;
                        }
                    }
                    return false;
                };

                updateReply(updated[postIdx].comments);
                return updated;
            });
        } catch (err) {
            console.error('Reply error:', err);
            setErrorMessage(err.response?.data?.message || 'Failed to submit reply');

            // Remove the optimistic reply on error
            setPosts(prevPosts => {
                const updated = [...prevPosts];

                const removeReply = (comments) => {
                    for (let comment of comments) {
                        if (comment.replies) {
                            comment.replies = comment.replies.filter(r => r._id !== tempId);
                            removeReply(comment.replies);
                        }
                    }
                };

                removeReply(updated[postIdx].comments);
                return updated;
            });
        }
    };

    const onLikeComment = async (postIdx, commentId) => {
    // Find the comment and check current like status
    let targetComment = null;
    const findComment = (comments) => {
        for (let comment of comments) {
            if (comment._id === commentId) {
                targetComment = comment;
                return true;
            }
            if (comment.replies?.length) {
                if (findComment(comment.replies)) return true;
            }
        }
        return false;
    };
    findComment(post.comments);

    if (!targetComment) return;

    const isCurrentlyLiked = targetComment.likes?.includes(userId);

    // Optimistic update
    setPosts(prevPosts => {
        return prevPosts.map((p, idx) => {
            if (idx !== postIdx) return p;

            const updateCommentLikes = (comments) => {
                return comments.map(comment => {
                    if (comment._id !== commentId) {
                        // If not target comment, check replies
                        if (comment.replies?.length) {
                            return {
                                ...comment,
                                replies: updateCommentLikes(comment.replies)
                            };
                        }
                        return comment;
                    }

                    // This is the target comment - update likes
                    if (isCurrentlyLiked) {
                        // Remove like
                        const newLikes = (comment.likes || []).filter(like => like !== userId);
                        return { ...comment, likes: newLikes };
                    } else {
                        // Add like
                        const newLikes = [...(comment.likes || []), userId];
                        return { ...comment, likes: newLikes };
                    }
                });
            };

            return {
                ...p,
                comments: updateCommentLikes(p.comments)
            };
        });
    });

    try {
        await axios.put(`${ApiEndPoint}posts/like-comment`, {
            postId: post._id,
            commentId,
            userId,
        });

    } catch (err) {
        console.error('Like error:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to like comment');

        // Optionally revert
        // fetchPosts();
    }
};



    // const [isEditing, setIsEditing] = useState(false);
    // const [editedCaption, setEditedCaption] = useState(post.caption || '');
    // const handleEditClick = () => {
    //     setIsEditing(true);
    // };

    const [showEditModal, setShowEditModal] = useState(false);






    const handleDeleteClick = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await axios.delete(`${ApiEndPoint}posts/deletepost/${post._id}`);
            let delPostId = post._id

            setPosts((prevPosts) => prevPosts.filter(post => post._id !== delPostId));


            // Optionally: remove from UI or refresh
            // onPostDelete(post._id); // This function should be passed from parent
        } catch (err) {
            console.error('Failed to delete post:', err);
            setErrorMessage('Error deleting post.');
        }
    };


    const handlePostUpdate = (updatedPost) => {
        setPosts(prev => prev.map(post => post._id === updatedPost._id ? updatedPost : post));
    };


    return (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
            {post.user?.username ? (
                <span
                    onClick={() => handleUserClick(post.user)}
                    className="font-bold text-lg text-blue-700 cursor-pointer hover:underline"
                >
                    {post.user.username}
                </span>
            ) : (
                <span className="font-bold text-lg text-blue-700">You</span>
            )}

            {post.caption && <p>{post.caption}</p>}

            <div className="grid grid-cols-3 gap-2 mt-2">
                {post.images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Post ${idx}`}
                        className="rounded-lg object-cover w-full h-32"
                    />
                ))}
            </div>

            <div className="flex items-center mt-4 space-x-4">
                <button
                    onClick={handlePostLike}
                    className={`flex items-center space-x-1 ${isPostLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                    <span>{isPostLiked ? '❤️' : '🤍'}</span>
                    <span>Like</span>
                </button>

                <div className="flex items-center space-x-1 relative">
                    <span>{post.likes?.length || 0}</span>
                    <button
                        onClick={() => setShowLikersModal(true)}
                        className="text-gray-500 hover:text-blue-500"
                    >
                        👥
                    </button>

                    {showLikers && (
                        <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-3 z-10 w-48">
                            <div className="font-semibold mb-2">Liked by</div>
                            {post.likes?.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {post.likes.map((user) => (
                                        <div key={user._id} className="flex items-center">
                                            <span>{user.username || `User ${user._id}`}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>No likes yet</div>
                            )}
                            <button
                                onClick={() => setShowLikers(false)}
                                className="text-sm text-blue-500 mt-2"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <h3 className="font-semibold">Comments ({post.comments?.length || 0})</h3>
                {commentsVisible && post.comments?.slice(0, visibleComments).map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        postIndex={postIndex}
                        onReplySubmit={handleReplySubmit}
                        onLike={onLikeComment}
                        userId={userId}
                    />
                ))}

                {post.comments?.length > visibleComments && commentsVisible && (
                    <button
                        className="text-sm text-blue-500 mt-2"
                        onClick={() => setVisibleComments(prev => prev + 5)}
                    >
                        Load more comments
                    </button>
                )}

                <button
                    className="text-sm text-blue-500 mt-2 block"
                    onClick={() => setCommentsVisible(!commentsVisible)}
                >
                    {commentsVisible ? 'Hide comments' : 'Show comments'}
                </button>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="text-sm text-red-600 hover:underline"
                    >
                        🗑️ Delete
                    </button>
                </div>

            </div>

            <div className="mt-4">
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                />
                <button
                    onClick={handleCommentSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                    disabled={!newComment.trim()}
                >
                    Submit Comment
                </button>
            </div>
            {showLikersModal && (
                <LikersModal
                    postId={post._id}
                    onClose={() => setShowLikersModal(false)}
                />
            )}


            {selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {showEditModal && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdate={onPostUpdate}
                />
            )}


            <ErrorModal message={errorMessage} onClose={() => setErrorMessage('')} />
        </div>
    );
};

export default PostCard;