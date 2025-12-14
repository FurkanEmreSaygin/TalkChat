import React, { useState } from "react";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSendMessage(text);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t flex shrink-0"
    >
      <input
        type="text"
        className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Şifreli mesajını yaz..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white font-bold rounded-r-lg hover:bg-blue-600 transition-colors"
      >
        Gönder
      </button>
    </form>
  );
};

export default MessageInput;
