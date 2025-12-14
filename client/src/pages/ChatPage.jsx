import { useState, useContext, useEffect, useRef } from "react"

// --- Context ve Servisler ---
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import userService from "../services/userService";

// --- Hook ---
import { useChat } from "../hooks/useChat";
import Sidebar from "../components/chat/Sidebar";
import MessageInput from "../components/chat/MessageInput";
import MessageBubble from "../components/chat/MessageBubble";

export default function ChatPage() {
  // 1. Context'ten genel verileri al
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  // 2. Sayfa içi State'ler (UI durumu)
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // 3. Otomatik Scroll için referans
  const messagesEndRef = useRef(null);

  // 4. CUSTOM HOOK  
  const { messages, sendMessage } = useChat(socket, user, selectedUser);

  // 5. Kullanıcı Listesini Getir (Sayfa açılınca)
  useEffect(() => {
    userService.getAllUsers().then((data) => {
      // Kendimiz hariç diğer kullanıcıları listeye koy
      setUsers(data.filter((u) => u._id !== user._id));
    });
  }, [user]);

  // 6. Mesaj geldiğinde en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* SOL TARA (Sidebar Bileşeni) */}
      <Sidebar
        currentUser={user}
        users={users}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
        onLogout={logout}
      />

      {/* SAĞ TARAF (Sohbet Alanı) */}
      <div className="flex-1 flex flex-col h-full relative">
        {selectedUser ? (
          <>
            {/* Sohbet Başlığı (Header) */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center shrink-0 z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3 text-lg">
                {selectedUser.userName
                  ? selectedUser.userName[0].toUpperCase()
                  : "?"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedUser.userName}
                </h2>
                <div className="flex items-center text-xs text-green-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Uçtan Uca Şifreli
                </div>
              </div>
            </div>

            {/* Mesaj Listesi */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]">
              {/* Not: bg-[#efeae2] WhatsApp benzeri bej rengidir */}

              {messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  message={msg}
                  isMe={msg.sender === user._id}
                />
              ))}

              {/* Görünmez kutu (Scroll buraya kayacak) */}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Yazma Alanı (Input Bileşeni) */}
            <MessageInput onSendMessage={sendMessage} />
          </>
        ) : (
          /* Sohbet Seçili Değilse Gösterilecek Boş Ekran */
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700">Güvenli Sohbet</h3>
            <p className="mt-2 text-sm text-gray-400">
              Mesajlaşmaya başlamak için soldan bir kişi seç.
            </p>
            <div className="mt-8 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-xs">
              Bu sohbetler uçtan uca şifreleme (E2EE) ile korunmaktadır.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
