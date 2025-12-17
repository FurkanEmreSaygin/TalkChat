import { useState, useContext, useEffect, useRef } from "react";

// --- Context ve Servisler ---
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import friendService from "../services/friendService"; 

// --- Hook & Components ---
import { useChat } from "../hooks/useChat";
import Sidebar from "../components/chat/Sidebar";
import MessageInput from "../components/chat/MessageInput";
import MessageBubble from "../components/chat/MessageBubble";

export default function ChatPage() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [users, setUsers] = useState([]); // Arkadaş listesi
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);

  // Hook kullanımı
  const { messages, sendMessage } = useChat(socket, user, selectedUser);

  const loadFriends = async () => {
    if (!user?._id) return;
    try {
      const data = await friendService.getFriends();
      const friendList = data.friends || data || [];

      if (Array.isArray(friendList)) {
        setUsers(friendList);
      }
    } catch (error) {
      console.error("Liste yenilenemedi", error);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [user?._id]);

  // 1. ONLINE LİSTESİNİ DİNLE
  useEffect(() => {
    if (!socket) return;
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);
  
  // Friends request accepted
  useEffect(() => {
  if (!socket) return;

  // Biri isteğimi kabul ederse listemi yenile
  socket.on("friendRequestAccepted", () => {
    loadFriends();
  });

  return () => {
    socket.off("friendRequestAccepted");
  };
  }, [socket]);

  // 3. Mesaj gelince kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAvatar = (u) => u?.profilePic || u?.avatar;
  const getName = (u) => u?.userName || u?.username || "User";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* SOL TARA (Sidebar) */}
      <Sidebar
        currentUser={user}
        users={users} // Artık buraya sadece Arkadaşlar gidiyor
        onlineUsers={onlineUsers}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        onLogout={logout}
      />

      {/* SAĞ TARAF (Chat) */}
      <div className="flex-1 flex flex-col h-full relative">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center shrink-0 z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 text-lg overflow-hidden border border-indigo-200">
                {getAvatar(selectedUser) ? (
                  <img
                    src={getAvatar(selectedUser)}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getName(selectedUser)[0].toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {getName(selectedUser)}
                </h2>
                <div className="flex items-center text-xs text-green-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Uçtan Uca Şifreli
                </div>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  message={msg}
                  isMe={msg.sender === user._id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSendMessage={sendMessage} />
          </>
        ) : (
          /* Boş Ekran */
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700">Güvenli Sohbet</h3>
            <p className="mt-2 text-sm text-gray-400">
              Mesajlaşmaya başlamak için soldan bir kişi seç.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
