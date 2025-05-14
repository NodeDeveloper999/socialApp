import React, { useState } from 'react';

const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 mt-2">

            <img

              src={user?.profilePicture}

              className="rounded-lg object-cover w-full h-32"
            />

          </div>
          <p><strong>Username:</strong> {user.username || 'Unknown'}</p>
          <p><strong>Bio:</strong> {user?.bio}</p>
        </div>
      </div>
    </div>
  );
};
export const CommentItem = ({
  comment,
  postIndex,
  onReplySubmit,
  onLike,
  userId,
  level = 0,
}) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  console.log(comment)
  // Proper like status check
  const isLiked = comment.likes?.some(like => like === userId) || false;

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReplySubmit(postIndex, comment._id, replyText);
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className={`ml-${level * 4} border-l pl-4 mt-3`}>
      <div className="flex justify-between items-center">
        <div>
          <strong
            className="cursor-pointer hover:text-blue-600 hover:underline"
            onClick={() => setShowUserModal(true)}
          >
            {comment.user?.username || 'User'}:
          </strong> {comment.text}
        </div>
        <button
          onClick={() => onLike(postIndex, comment._id)}
          className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
        >
          {isLiked ? '❤️' : '♡'} {comment.likes?.length || 0}
        </button>
      </div>

      <button
        className="text-sm text-gray-500 mt-1"
        onClick={() => setShowReplyBox(!showReplyBox)}
      >
        Reply
      </button>

      {showReplyBox && (
        <div className="mt-2">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            onClick={handleReply}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-1"
          >
            Submit Reply
          </button>
        </div>
      )}

      {showUserModal && (
        <UserDetailsModal
          user={comment.user}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {comment.replies?.length > 0 &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            postIndex={postIndex}
            onReplySubmit={onReplySubmit}
            onLike={onLike}
            userId={userId}
            level={level + 1}
          />
        ))}
    </div>
  );
};