import React from "react";

// Bu bileşen "Props" alır:
// - currentUser: Giriş yapmış kişi (Profil için)
// - users: Listelenecek diğer kullanıcılar
// - selectedUser: Şu an kimle konuşuyoruz? (Mavi boyamak için)
// - onSelectUser: Birine tıklayınca ne yapayım?
// - onLogout: Çıkış butonuna basınca ne yapayım?

const Sidebar = ({ currentUser, users, onlineUsers, selectedUser, onSelectUser, onLogout }) => {
    
  return (
    <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col h-full">
      {/* Profil Alanı */}
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
            {currentUser?.username
              ? currentUser.username[0].toUpperCase()
              : "?"}
          </div>
          <span className="font-semibold text-gray-700">
            {currentUser?.username || "Ben"}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-red-500 hover:underline font-bold"
        >
          Çıkış
        </button>
      </div>

      {/* Kullanıcı Listesi */}
      <div className="flex-1 overflow-y-auto p-2">
        {users.map((u) => {
            // Kullanıcı online mı kontrol et
            const isOnline = onlineUsers.includes(u._id);

            return (
              <div
                key={u._id}
                onClick={() => onSelectUser(u)}
                className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors relative ${
                  selectedUser?._id === u._id
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {/* Avatar ve Yeşil Nokta */}
                <div className="relative mr-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                    {u.userName ? u.userName[0].toUpperCase() : "U"}
                    </div>
                    {/* YEŞİL NOKTA BURADA */}
                    {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    {u.userName}
                  </h3>
                  <p className="text-xs text-gray-400">
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