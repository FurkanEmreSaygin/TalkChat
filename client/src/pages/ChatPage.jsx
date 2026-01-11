import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { useChat } from "../hooks/useChat";
import Sidebar from "../components/chat/Sidebar";
import MessageInput from "../components/chat/MessageInput";
import MessageBubble from "../components/chat/MessageBubble";

export default function ChatPage() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  // Artık sadece "User" değil, genel "Chat" (Grup veya Kişi) tutuyoruz
  const [selectedChat, setSelectedChat] = useState(null);

  const messagesEndRef = useRef(null);

  // Mesajlaşma Hook'u
  const { messages, sendMessage, loading } = useChat(socket, user, selectedChat);

  // Otomatik Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Yardımcılar
  const getChatName = (chat) => chat?.name || chat?.userName || "Sohbet";

  const getChatImage = (chat) => {
    if (!chat) return null;
    return chat.profilePic || chat.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${getChatName(chat)}`;
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* SOL TARAF (SIDEBAR) */}
      {/* FIX: onSelectChat prop'unu doğru isimlendirdik */}
      <Sidebar currentUser={user} onSelectChat={(chat) => setSelectedChat(chat)} onLogout={logout} />

      {/* SAĞ TARAF (CHAT AREA) */}
      <div className="flex-1 flex flex-col h-full relative">
        {selectedChat ? (
          <>
            {/* HEADER */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center shrink-0 z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 border overflow-hidden">
                <img src={getChatImage(selectedChat)} className="w-full h-full object-cover" alt="chat-avatar" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{getChatName(selectedChat)}</h2>

                <div className={`flex items-center text-xs font-medium ${selectedChat.isGroup ? "text-indigo-500" : "text-green-600"}`}>
                  {selectedChat.isGroup ? (
                    <span>Grup Sohbeti • {selectedChat.members?.length || 0} Üye</span>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Uçtan Uca Şifreli
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MESAJ LİSTESİ */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#efeae2] flex flex-col gap-2 custom-scrollbar">
              {loading ? (
                <div className="text-center mt-10 text-gray-400">Yükleniyor...</div>
              ) : messages.length === 0 ? (
                <div className="text-center mt-10 text-gray-400 opacity-60">
                  <p>Henüz mesaj yok. İlk mesajı sen at!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  // Sender kontrolü (Object veya String ID gelebilir)
                  const senderId = msg.sender?._id || msg.sender;
                  const isMe = senderId === user._id;

                  return <MessageBubble key={index} message={msg} isMe={isMe} isGroup={selectedChat.isGroup} />;
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT ALANI */}
            <MessageInput onSendMessage={sendMessage} />
          </>
        ) : (
          /* BOŞ EKRAN */
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700">Güvenli Sohbet</h3>
            <p className="mt-2 text-sm text-gray-400">Mesajlaşmaya başlamak için soldan bir kişi veya grup seç.</p>
          </div>
        )}
      </div>
    </div>
  );
}
