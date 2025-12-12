import { useEffect, useState, useContext, useRef } from "react";
import userService from "../services/userService";
import messageService from "../services/messageService";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function ChatPage() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  // 1. Kullanıcıları Getir (Sidebar)
  useEffect(() => {
    userService.getAllUsers().then((data) => {
        setUsers(data.filter((u) => u._id !== user._id));
    });
  }, [user]);

  // 2. Mesaj Geçmişini Getir
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const history = await messageService.getMessages(selectedUser._id);
        setMessages(history.messages || history || []); 
      } catch (err) {
        console.error("Mesajlar alınamadı", err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // 3. SOCKET OLAYLARINI DİNLE (DÜZELTME BURADA)
  useEffect(() => {
    if (!socket) return;

    // A. Karşıdan mesaj gelirse (Receiver Modu)
    const handleNewMessage = (message) => {
      // Mesaj şu an konuştuğum kişiden geliyorsa listeye ekle
      if (selectedUser && message.sender === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // B. Benim mesajım başarıyla gittiyse (Sender Modu - DÜZELTME)
    const handleMessageSent = (data) => {
      if (data.success) {
        // Sunucu "Kaydettim" dediği an mesajı kendi ekranıma da ekliyorum.
        // Böylece ID ve Tarih bilgisi sunucudan gelmiş oluyor (Tutarlılık).
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // Dinleyicileri aç
    socket.on("newMessage", handleNewMessage);
    socket.on("messageSent", handleMessageSent); // <--- EKSİK OLAN BUYDU

    // Temizlik
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
    };
  }, [socket, selectedUser]); // user dependency'ye gerek yok

  // 4. Scroll Ayarı
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Mesaj Gönderme
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    // Sunucuya gönder (Ekrana ekleme işini 'messageSent' olayına bıraktık)
    socket.emit("sendMessage", {
      recipientId: selectedUser._id,
      content: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* --- SOL TARA (SIDEBAR) - DÜZELTİLDİ --- */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Üst Başlık (Profilim) - GERİ GELDİ! */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
              {/* Kullanıcı adı yoksa ? koyuyoruz */}
              {user?.username ? user.username[0].toUpperCase() : "?"}
            </div>
            <span className="font-semibold text-gray-700">
               {user?.username || "Kullanıcı"}
            </span>
          </div>
          <button 
            onClick={logout} 
            className="text-xs text-red-500 hover:underline font-bold"
          >
            Çıkış
          </button>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="flex-1 overflow-y-auto p-2">
           {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedUser?._id === u._id 
                  ? "bg-blue-100 border-l-4 border-blue-500" 
                  : "hover:bg-gray-100"
              }`}
            >
                {/* Profil Resmi Yuvarlağı */}
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
                  {u.userName ? u.userName[0].toUpperCase() : "U"}
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-gray-700">{u.userName}</h3>
                   <p className="text-xs text-gray-400">Mesajlaşmak için tıkla</p>
                </div>
            </div>
           ))}
        </div>
      </div>

      {/* --- SAĞ TARAF (CHAT ALANI) --- */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b shadow-sm flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold mr-2">
                 {selectedUser.userName[0].toUpperCase()}
              </div>
              <h2 className="text-lg font-bold">{selectedUser.userName}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => {
                // Mesajı ben mi attım? (User ID kontrolü)
                const isMe = msg.sender === user._id;
                
                return (
                  <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                        isMe ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex">
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bir mesaj yaz..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white font-bold rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Gönder
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-500">Hoş Geldin, {user?.username}!</h3>
                <p>Sohbet etmek için soldan bir arkadaşını seç.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}