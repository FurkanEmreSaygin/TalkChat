import React from "react";
import toast from "react-hot-toast";

const MessageBubble = ({ message, isMe }) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Mesaj kopyalandı! 📋");
  };
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
        onClick={handleCopy} // Tıklama olayını ekle
        className={`max-w-xs px-4 py-2 rounded-lg shadow break-words cursor-pointer active:scale-95 transition-transform ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none hover:bg-blue-600"
            : "bg-white text-gray-800 rounded-bl-none hover:bg-gray-50"
        }`}
        title="Kopyalamak için tıkla" // Mouse üzerine gelince ipucu
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
