import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddFriendModal from "./AddFriendModal";

const Sidebar = ({ currentUser, users, pendingRequests, onlineUsers, selectedUser, onSelectUser, onLogout, onFriendAdded, onAcceptRequest }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getAvatar = (u) => {
    const pic = u?.profilePic || u?.avatar;
    if (!pic || (typeof pic === "string" && pic.includes("undefined"))) return null;
    return pic;
  };

  const getName = (u) => u?.userName || u?.username || "User";
  const getInitial = (u) => getName(u)?.[0]?.toUpperCase() || "?";

  return (
    <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col h-full relative">
      <AddFriendModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFriendAdded={onFriendAdded} />

      {/* --- HEADER --- */}
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/profile")}>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3 overflow-hidden border border-blue-600 relative shrink-0">
            {getAvatar(currentUser) ? (
              <img src={getAvatar(currentUser)} alt="Me" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">{getInitial(currentUser)}</span>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-gray-700 leading-tight truncate">{getName(currentUser)}</span>
            <span className="text-[10px] text-gray-400">Profili Düzenle</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
            title="Arkadaş Ekle"
          >
            <span className="font-bold text-lg pb-1">+</span>
          </button>
          <button
            onClick={onLogout}
            className="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0"
          >
            Çıkış
          </button>
        </div>
      </div>

      {/* --- LİSTE ALANI --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* YENİ BÖLÜM: BEKLEYEN İSTEKLER (Varsa Göster) */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mb-2 border-b border-orange-100 bg-orange-50">
            <h3 className="text-xs font-bold text-orange-600 px-4 py-2 uppercase tracking-wide">
              Bekleyen İstekler ({pendingRequests.length})
            </h3>
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-orange-100 transition-colors border-b border-orange-100 last:border-0"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0 overflow-hidden">
                    {getAvatar(req.sender) ? (
                      <img src={getAvatar(req.sender)} alt="Sender" className="w-full h-full object-cover" />
                    ) : (
                      getInitial(req.sender)
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 truncate">{getName(req.sender)}</span>
                </div>
                {/* KABUL ET BUTONU */}
                <button
                  onClick={() => onAcceptRequest(req._id)}
                  className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-orange-600 font-medium shadow-sm active:scale-95 transition-all"
                >
                  Kabul Et
                </button>
              </div>
            ))}
          </div>
        )}

        {/* --- MEVCUT ARKADAŞLAR --- */}
        <div className="p-2">
          {users.length === 0 && pendingRequests.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">
              Henüz kimse yok :( <br /> Yukarıdan arkadaş ekleyebilirsin.
            </div>
          )}

          {users.map((u) => {
            const isOnline = onlineUsers?.includes(u._id);
            return (
              <div
                key={u._id}
                onClick={() => onSelectUser(u)}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors relative group ${
                  selectedUser?._id === u._id
                    ? "bg-blue-100 border-l-4 border-blue-500 shadow-sm"
                    : "hover:bg-gray-100 border-l-4 border-transparent"
                }`}
              >
                <div className="relative mr-3 shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden border border-gray-300">
                    {getAvatar(u) ? (
                      <img src={getAvatar(u)} alt={getName(u)} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{getInitial(u)}</span>
                    )}
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{getName(u)}</h3>
                  <p className={`text-xs ${isOnline ? "text-green-600 font-medium" : "text-gray-400"}`}>
                    {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
