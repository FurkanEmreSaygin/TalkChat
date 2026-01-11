import React from "react";

export default function MessageBubble({ message, isMe, isGroup }) {
  const alignClass = isMe ? "justify-end" : "justify-start";

  const bgClass = isMe ? "bg-green-100 text-gray-800 rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none";

  const senderName = message.sender?.userName || "Kullanıcı";
  const senderPic = message.sender?.profilePic || message.sender?.avatar;
  const avatarUrl = senderPic || `https://api.dicebear.com/9.x/avataaars/svg?seed=${senderName}`;

  return (
    <div className={`flex ${alignClass} mb-3 group`}>
      {/* GRUP SOHBETİ İÇİN SOLDAKİ AVATAR (Sadece Karşıdan Gelen Mesajsa) */}
      {!isMe && isGroup && (
        <div className="flex flex-col justify-end mr-2">
          <img src={avatarUrl} className="w-8 h-8 rounded-full border shadow-sm object-cover mb-1" alt="avatar" title={senderName} />
        </div>
      )}

      {/* MESAJ KUTUSU */}
      <div className={`max-w-[70%] min-w-[100px] rounded-2xl p-3 shadow-sm relative ${bgClass}`}>
        {/* Grup içindeyse ve mesaj başkasındansa İSİM yaz */}
        {!isMe && isGroup && <p className="text-xs font-bold text-orange-600 mb-1 select-none">{senderName}</p>}

        {/* İÇERİK (Resim veya Yazı) */}
        {message.type === "image" ? (
          <div className="relative">
            <img
              src={message.content}
              alt="Gönderilen resim"
              className="rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(message.content, "_blank")}
            />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* SAAT ve DURUM İKONLARI */}
        <div className="flex justify-end items-center mt-1 space-x-1 select-none opacity-70">
          <span className="text-[10px] text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

          {/* Sadece benim mesajlarımda tik göster */}
          {isMe && (
            <span className={message.isRead ? "text-blue-500" : "text-gray-400"}>
              {message.isRead ? (
                // Çift Tik (Okundu)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L7 17l-5-5" />
                  <path d="m22 10-7.5 7.5L13 16" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
