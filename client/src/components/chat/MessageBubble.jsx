import React from "react";
import toast from "react-hot-toast";

const MessageBubble = ({ message, isMe }) => {
  // Mesajın resim olup olmadığını kontrol et
  const isImage = message.type === "image";

  // Tarih formatlama (Saat:Dakika)
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Metni kopyalama özelliği (Opsiyonel ama kullanışlı)
  const handleCopy = () => {
    if (message.content && !message.content.startsWith("⚠️")) {
      navigator.clipboard.writeText(message.content);
      toast.success("Kopyalandı");
    }
  };

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 animate-fade-in`}>
      <div
        className={`relative max-w-[70%] p-3 rounded-lg shadow-sm ${
          isMe
            ? "bg-green-100 text-gray-800 rounded-tr-none" // Benim mesajım (Yeşil)
            : "bg-white text-gray-800 rounded-tl-none" // Karşı taraf (Beyaz)
        }`}
      >
        {/* --- İÇERİK ALANI --- */}
        {isImage ? (
          // EĞER RESİMSE
          message.content && !message.content.startsWith("⚠️") ? (
            <img
              src={message.content}
              alt="Encrypted Content"
              className="rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(message.content)} // Tıklayınca tam boy aç
            />
          ) : (
            // RESİM ÇÖZÜLEMEDİYSE
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-2 rounded border border-red-100">
              <span>⚠️</span>
              <span className="text-xs font-bold">Resim Çözülemedi</span>
            </div>
          )
        ) : (
          // EĞER METİNSE
          <p className="text-sm break-words leading-relaxed cursor-pointer" onClick={handleCopy} title="Kopyalamak için tıkla">
            {message.content}
          </p>
        )}

        {/* --- TARİH VE TİK --- */}
        <div className="text-[10px] text-gray-500 text-right mt-1 flex items-center justify-end gap-1 select-none">
          <span>{formatTime(message.createdAt)}</span>

          {/* Sadece benim mesajlarımda tik göster */}
          {isMe && (
            <span>
              {message.isRead ? (
                // Mavi Çift Tik (Okundu)
                <span className="text-blue-500 text-xs font-bold">✓✓</span>
              ) : (
                // Gri Tik (İletildi)
                <span className="text-gray-400 text-xs font-bold">✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
