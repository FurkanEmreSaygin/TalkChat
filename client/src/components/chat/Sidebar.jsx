import { useState, useContext } from "react";
import { useFriends } from "../../hooks/useFriends";
import { useGroups } from "../../hooks/useGroups";
import AddFriendModal from "./AddFriendModal";
import CreateGroupModal from "./CreateGroupModal";
import ProfileModal from "./ProfileModal"; // Profil modalı eklendi
import { AuthContext } from "../../context/AuthContext";
import { Users, UserPlus, MessageSquare, LogOut, Trash2, Camera } from "lucide-react";

export default function Sidebar({ onSelectChat, currentUser }) {
  const { users: friends, pendingRequests, acceptRequest, loadData, onlineUsers, removeFriend } = useFriends(currentUser);

  const { logout } = useContext(AuthContext);
  const { groups, createGroup, loadGroups } = useGroups();

  // Modallar için State'ler
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); 

  // Sohbet Seçme Fonksiyonu
  const handleSelect = (item, type) => {
    onSelectChat({ ...item, isGroup: type === "group" });
  };

  // Yardımcılar
  const getAvatar = (u) => {
    const pic = u?.profilePic || u?.avatar;
    if (!pic || (typeof pic === "string" && pic.includes("undefined"))) return null;
    return pic;
  };

  const getName = (u) => u?.userName || u?.username || "User";

  return (
    <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col h-full relative z-20">
      {/* --- MODALLAR --- */}

      {/* Profil Düzenleme Modalı */}
      {isProfileModalOpen && (
        <ProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          onUpdate={() => {
            setIsProfileModalOpen(false); 
            loadData(); 
          }}
        />
      )}

      {/* Arkadaş Ekleme Modalı */}
      <AddFriendModal
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        onFriendAdded={() => {
          loadData();
          setIsFriendModalOpen(false);
        }}
      />

      {/* Grup Oluşturma Modalı */}
      {isGroupModalOpen && (
        <CreateGroupModal
          onClose={() => setIsGroupModalOpen(false)}
          friends={friends}
          onCreate={async (name, selected) => {
            await createGroup(name, selected);
            loadGroups();
          }}
        />
      )}

      {/* --- HEADER --- */}
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0 shadow-sm">
        {/* Kullanıcı Profil Alanı - Tıklanabilir */}
        <div
          className="flex items-center gap-3 overflow-hidden cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-all group"
          onClick={() => setIsProfileModalOpen(true)}
          title="Profili Düzenle"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border border-blue-700 shrink-0 relative overflow-hidden">
            {getAvatar(currentUser) ? (
              <img src={getAvatar(currentUser)} alt="Me" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>{getName(currentUser)?.[0]?.toUpperCase()}</span>
            )}
            {/* Hover durumunda çıkan kamera ikonu */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700 truncate max-w-[100px]">{getName(currentUser)}</span>
            <span className="text-[10px] text-blue-500 font-medium group-hover:underline">Düzenlemek için tıkla</span>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
            title="Grup Oluştur"
          >
            <Users size={18} className="text-gray-600" />
          </button>

          <button
            onClick={() => setIsFriendModalOpen(true)}
            className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition shadow-sm"
            title="Arkadaş Ekle"
          >
            <UserPlus size={18} />
          </button>

          <button onClick={logout} title="Çıkış Yap" className="text-red-500 hover:bg-red-50 p-2 rounded-full transition ml-1">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* --- LİSTELER --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Bekleyen İstekler */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mb-2 border-b border-orange-100 bg-orange-50">
            <h3 className="text-xs font-bold text-orange-600 px-4 py-2 uppercase tracking-wide">
              Bekleyen İstekler ({pendingRequests.length})
            </h3>
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-orange-100 border-b border-orange-100 last:border-0"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0">
                    {getAvatar(req.sender) ? (
                      <img src={getAvatar(req.sender)} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getName(req.sender)?.[0]
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 truncate">{getName(req.sender)}</span>
                </div>
                <button
                  onClick={() => acceptRequest(req._id)}
                  className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-orange-600 transition"
                >
                  Kabul Et
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Gruplar */}
        {groups.length > 0 && <div className="px-4 py-2 bg-gray-100 text-xs font-bold text-gray-500 mt-2 border-y">GRUPLAR</div>}

        {groups.map((group) => (
          <div
            key={group._id}
            onClick={() => handleSelect(group, "group")}
            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b transition"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 font-bold border border-indigo-200 shrink-0">
              {getAvatar(group) ? (
                <img src={getAvatar(group)} alt={group.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users size={20} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 truncate">{group.name}</h3>
              <p className="text-xs text-gray-500 truncate">{group.members?.length} üye • Grup</p>
            </div>
          </div>
        ))}

        {/* Arkadaşlar */}
        <div className="px-4 py-2 bg-gray-100 text-xs font-bold text-gray-500 mt-2 border-y">ARKADAŞLAR ({friends?.length || 0})</div>

        {Array.isArray(friends) &&
          friends.map((friend) => {
            const isUserOnline = onlineUsers.includes(friend._id);

            return (
              <div key={friend._id} className="flex items-center p-3 hover:bg-gray-50 border-b transition group relative">
                <div className="flex items-center flex-1 cursor-pointer" onClick={() => handleSelect(friend, "user")}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 shrink-0 relative border">
                    {getAvatar(friend) ? (
                      <img src={getAvatar(friend)} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getName(friend)?.[0]
                    )}
                    {isUserOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{getName(friend)}</h3>
                    <p className={`text-xs ${isUserOnline ? "text-green-600 font-bold" : "text-gray-400"}`}>
                      {isUserOnline ? "Çevrimiçi" : "Çevrimdışı"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFriend(friend._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition"
                  title="Arkadaşı Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

        {/* Boş Durum */}
        {friends.length === 0 && groups.length === 0 && (
          <div className="text-center text-gray-400 mt-10 p-4">
            <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Henüz sohbet yok.</p>
            <p className="text-xs mt-1">Yeni bir arkadaş ekleyerek veya grup kurarak başla.</p>
          </div>
        )}
      </div>
    </div>
  );
}
