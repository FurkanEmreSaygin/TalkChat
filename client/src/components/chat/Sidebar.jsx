import React from "react";
import { useNavigate } from "react-router-dom"; 

const Sidebar = ({ currentUser, users, onlineUsers, selectedUser, onSelectUser, onLogout }) => {
  const navigate = useNavigate();

  // --- YARDIMCI FONKSİYONLAR (GÜNCELLENDİ) ---
  
  // 1. Avatar Kontrolü: URL var mı VE içinde 'undefined' yazıyor mu?
  const getAvatar = (u) => {
    const pic = u?.profilePic || u?.avatar;
    // Eğer resim yoksa VEYA link bozuksa (undefined içeriyorsa) null dön.
    if (!pic || (typeof pic === "string" && pic.includes("undefined"))) {
      return null;
    }
    return pic;
  };

  const getName = (u) => u?.userName || u?.username || "User";
  
  const getInitial = (u) => {
    const name = getName(u);
    return name && name.length > 0 ? name[0].toUpperCase() : "?";
  };

  return (
    <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col h-full">
      
      {/* --- SOL ÜST: SENİN PROFİLİN --- */}
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
        <div 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/profile")} 
            title="Profili Düzenle"
        >
          {/* AVATAR KUTUSU */}
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3 overflow-hidden border border-blue-600 relative shrink-0">
             {getAvatar(currentUser) ? (
                 <img 
                    src={getAvatar(currentUser)} 
                    alt="Me" 
                    className="w-full h-full object-cover" 
                 />
             ) : (
                 // Resim yoksa Baş Harf
                 <span className="text-lg">{getInitial(currentUser)}</span>
             )}
          </div>
          
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-gray-700 leading-tight truncate">
                {getName(currentUser)}
            </span>
            <span className="text-[10px] text-gray-400">Profili Düzenle</span>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="text-xs text-red-500 hover:text-red-700 font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors shrink-0"
        >
          Çıkış
        </button>
      </div>

      {/* --- KULLANICI LİSTESİ --- */}
      <div className="flex-1 overflow-y-auto p-2">
        {users.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10">Henüz kimse yok :(</div>
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
                {/* LİSTE AVATARI */}
                <div className="relative mr-3 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden border border-gray-300">
                        {getAvatar(u) ? (
                            <img src={getAvatar(u)} alt={getName(u)} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xl">{getInitial(u)}</span>
                        )}
                    </div>
                    {/* YEŞİL NOKTA */}
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    )}
                </div>

                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {getName(u)}
                  </h3>
                  <p className={`text-xs ${isOnline ? "text-green-600 font-medium" : "text-gray-400"}`}>
                      {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                  </p>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default Sidebar;