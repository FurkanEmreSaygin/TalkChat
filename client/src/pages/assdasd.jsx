import { useEffect, useState, useContext, useRef } from "react";
// Servisler: Backend ile konuşan API katmanımız
import userService from "../services/userService";
import messageService from "../services/messageService";
// Contextler: Uygulamanın global hafızası (Kimlik ve Soket bağlantısı)
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function ChatPage() {
  // --- 1. GLOBAL VERİLERİN ÇEKİLMESİ ---
  // AuthContext: Giriş yapmış kullanıcının bilgisi (user) ve çıkış fonksiyonu (logout)
  const { user, logout } = useContext(AuthContext);
  // SocketContext: Sunucuyla açık olan canlı bağlantı hattımız
  const { socket } = useContext(SocketContext);

  // --- 2. LOCAL STATE (SAYFA İÇİ DEĞİŞKENLER) ---
  const [users, setUsers] = useState([]); // Sol menüdeki kullanıcı listesi
  const [selectedUser, setSelectedUser] = useState(null); // O an tıkladığımız/konuştuğumuz kişi
  const [messages, setMessages] = useState([]); // Ekranda görünen mesaj balonları
  const [newMessage, setNewMessage] = useState(""); // Inputa yazdığımız yazı

  // --- 3. REFERANSLAR ---
  // Mesaj kutusunun en altını işaret eden görünmez bir çapa.
  // Otomatik scroll (aşağı kaydırma) yapmak için kullanılır.
  const messagesEndRef = useRef(null);

  // --- 4. EFFECT: KULLANICI LİSTESİNİ GETİR ---
  // Sayfa ilk açıldığında veya 'user' değiştiğinde çalışır.
  useEffect(() => {
    userService.getAllUsers().then((data) => {
      // Kendimizi listeden çıkarıyoruz (Kendimizle konuşmayalım diye)
      // filter: ID'si benim ID'me eşit olmayanları al.
      setUsers(data.filter((u) => u._id !== user._id));
    });
  }, [user]);

  // --- 5. EFFECT: ESKİ MESAJLARI GETİR (CRUD - READ) ---
  // Ne zaman 'selectedUser' (seçili kişi) değişirse çalışır.
  useEffect(() => {
    // Eğer kimse seçili değilse (sayfa ilk açıldığında) hiçbir şey yapma.
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        // API'ye git ve bu kişiyle olan TÜM geçmişi çek.
        const history = await messageService.getMessages(selectedUser._id);
        // Gelen veriyi mesaj kutusuna doldur.
        setMessages(history.messages || history || []);
      } catch (err) {
        console.error("Mesajlar alınamadı", err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // --- 6. EFFECT: CANLI MESAJLARI DİNLE (SOCKET.IO) ---
  // Burası uygulamanın KULAĞIDIR. Sunucudan gelen sesleri dinler.
  useEffect(() => {
    // Eğer socket bağlantısı kopuksa dinleme yapma.
    if (!socket) return;

    // SENARYO A: Karşıdan mesaj gelirse (Receiver)
    const handleNewMessage = (message) => {
      // ÖNEMLİ KONTROL: Gelen mesaj, şu an açık olan penceredeki kişiden mi geliyor?
      // Eğer Ahmet ile konuşurken Mehmet'ten mesaj gelirse, Ahmet'in ekranına basma!
      if (selectedUser && message.sender === selectedUser._id) {
        setMessages((prev) => [...prev, message]); // Listeye ekle
      }
    };

    // SENARYO B: Benim mesajım sunucuya ulaştıysa (Sender)
    const handleMessageSent = (data) => {
      if (data.success) {
        // Sunucu "Kaydettim" dediği an mesajı kendi ekranıma da ekliyorum.
        // Neden burası? Çünkü mesajın ID'si ve Tarihi sunucuda oluşuyor.
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // Dinleyicileri (Kulakları) Aç
    socket.on("newMessage", handleNewMessage);
    socket.on("messageSent", handleMessageSent);

    // CLEANUP (TEMİZLİK) FONKSİYONU:
    // Kullanıcı başka bir arkadaşına tıkladığında veya sayfadan çıktığında
    // eski dinleyicileri kapatmalıyız. Yoksa mesajlar 2 kere, 3 kere gelmeye başlar.
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
    };
  }, [socket, selectedUser]); // selectedUser değişince burası sıfırlanıp tekrar kurulur.

  // --- 7. EFFECT: OTOMATİK SCROLL ---
  // 'messages' listesi her değiştiğinde (yeni mesaj gelince) çalışır.
  useEffect(() => {
    // Görünmez referans elemanına "yavaşça" kaydır.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 8. HANDLER: MESAJ GÖNDERME İŞLEMİ ---
  const handleSendMessage = (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    // Boş mesaj veya seçili kullanıcı yoksa dur.
    if (!newMessage.trim() || !selectedUser) return;

    // Sunucuya "Ben mesaj attım" diye bağır (Emit).
    // Dikkat: Ekrana burada basmıyoruz, 'messageSent' olayını bekliyoruz (6. Bölüm).
    socket.emit("sendMessage", {
      recipientId: selectedUser._id,
      content: newMessage,
    });

    setNewMessage(""); // Input kutusunu temizle
  };

  // --- 9. RENDER (GÖRÜNTÜ) KISMI ---
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* SOL TARA (SIDEBAR): Kullanıcı Listesi */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Profil Header */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex items-center">
            {/* Profil Resmi */}
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
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

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-2">
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)} // Tıklayınca 'selectedUser' değişir -> Effect 5 çalışır
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedUser?._id === u._id
                  ? "bg-blue-100 border-l-4 border-blue-500" // Seçiliyse Mavi
                  : "hover:bg-gray-100" // Değilse Gri
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
                {u.userName ? u.userName[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  {u.userName}
                </h3>
                <p className="text-xs text-gray-400">Mesajlaşmak için tıkla</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ TARAF (CHAT ALANI) */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          // BİRİ SEÇİLİYSE BURASI GÖZÜKÜR
          <>
            {/* Chat Başlığı */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold mr-2">
                {selectedUser.userName[0].toUpperCase()}
              </div>
              <h2 className="text-lg font-bold">{selectedUser.userName}</h2>
            </div>

            {/* Mesaj Baloncukları Alanı */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => {
                // Mesajın göndereni ben miyim? (Sağa mı yaslayayım, sola mı?)
                const isMe = msg.sender === user._id;

                return (
                  <div
                    key={index}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg shadow ${
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
              {/* Görünmez Scroll Elemanı (En altta durur) */}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Yazma Inputu */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t flex"
            >
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
          // KİMSE SEÇİLİ DEĞİLSE BURASI GÖZÜKÜR
          <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-500">
                Hoş Geldin, {user?.username}!
              </h3>
              <p>Sohbet etmek için soldan bir arkadaşını seç.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
