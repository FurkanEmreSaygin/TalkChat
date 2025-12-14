import React from "react";

const MessageBubble = ({ message, isMe }) => {
  // Tarih formatlama
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg shadow break-words ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none" // Gönderen (Biz)
            : "bg-white text-gray-800 rounded-bl-none" // Alıcı (Karşı Taraf)
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <span
          className={`text-[10px] block text-right mt-1 ${
            isMe ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
