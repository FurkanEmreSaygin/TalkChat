import { useEffect, useState, useContext, useRef } from "react";
import userService from "../services/userService";
import messageService from "../services/messageService";
import cryptoService from "../services/cryptoService"; // Şifreleme Servisi
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

  const tryDecryptMessage = (msg) => {
    if (msg.recipient === user._id) {
      const privateKey = localStorage.getItem("privateKey");
      if (!privateKey) return "🔑 Özel anahtar bulunamadı";

      const decrypted = cryptoService.decrypt(msg.content, privateKey);

      return decrypted.startsWith("⚠️") ? msg.content : decrypted;
    }

    if (msg.sender === user._id) {
      if (msg.content.length > 50 && !msg.content.includes(" ")) {
        return "🔒 (Şifreli Mesaj - İçeriği sadece alıcı görebilir)";
      }
      return msg.content;
    }

    return msg.content;
  };

  // 1. KULLANICILARI GETİR
  useEffect(() => {
    userService.getAllUsers().then((data) => {
      setUsers(data.filter((u) => u._id !== user._id));
    });
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const history = await messageService.getMessages(selectedUser._id);
        const rawMessages = history.messages || history || [];

        const processedMessages = rawMessages.map((msg) => ({
          ...msg,
          content: tryDecryptMessage(msg),
        }));

        setMessages(processedMessages);
      } catch (err) {
        console.error("Mesajlar alınamadı", err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (selectedUser && message.sender === selectedUser._id) {
        const decryptedContent = tryDecryptMessage(message);
        setMessages((prev) => [
          ...prev,
          { ...message, content: decryptedContent },
        ]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser]); 

  // 4. OTOMATİK SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. MESAJ GÖNDERME (KRİTİK BÖLÜM)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    if (!selectedUser.publicKey || selectedUser.publicKey.length < 50) {
      alert(
        "Bu kullanıcının açık anahtarı (Public Key) yok. Mesaj şifrelenemez!"
      );
      return;
    }

    const encryptedContent = cryptoService.encrypt(
      newMessage,
      selectedUser.publicKey
    );

    if (!encryptedContent) {
      alert("Şifreleme sırasında hata oluştu.");
      return;
    }

    socket.emit("sendMessage", {
      recipientId: selectedUser._id,
      content: encryptedContent,
    });

    const optimisticMessage = {
      _id: Date.now(),
      sender: user._id,
      content: newMessage, 
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- SOL TARA (SIDEBAR) --- */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Profil */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
              {user?.username ? user.username[0].toUpperCase() : "?"}
            </div>
            <span className="font-semibold text-gray-700">
              {user?.username || "Ben"}
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
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
                {u.userName ? u.userName[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  {u.userName}
                </h3>
                <p className="text-xs text-gray-400">
                  Şifreli sohbet için tıkla
                </p>
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
                {selectedUser.userName
                  ? selectedUser.userName[0].toUpperCase()
                  : "?"}
              </div>
              <h2 className="text-lg font-bold">{selectedUser.userName} 🔒</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => {
                const isMe = msg.sender === user._id;

                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow break-words ${
                        isMe
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`text-[10px] block text-right mt-1 opacity-70`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t flex"
            >
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şifreli mesajını yaz..."
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
              <h3 className="text-xl font-bold text-gray-500">
                Güvenli Sohbet
              </h3>
              <p>Mesajlaşmak için soldan bir kişi seç.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
