import { useEffect, useState, useContext } from "react";
import userService from "../services/userService";
import { AuthContext } from "../context/AuthContext";

export default function ChatPage() {
  const { user, logout } = useContext(AuthContext); // Giriş yapmış kullanıcı bilgisi
  const [users, setUsers] = useState([]); // Kullanıcı listesi
  const [selectedUser, setSelectedUser] = useState(null); // O an mesajlaştığımız kişi
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await userService.getAllUsers();
        const filteredUsers = userList.filter((u) => u._id !== user._id);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Kullanıcılar yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- SOL TARA (SIDEBAR) --- */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Üst Başlık (Profilim) */}
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <div className="flex items-center">
            {/* Profil Resmi (Varsayılan) */}
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
              {user.username ? user.username[0].toUpperCase() : "?"}
            </div>
            <span className="font-semibold text-gray-700">{user.username}</span>
          </div>
          {/* Çıkış Butonu */}
          <button
            onClick={logout}
            className="text-xs text-red-500 hover:underline"
          >
            Çıkış
          </button>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center text-gray-500 mt-4">Yükleniyor...</p>
          ) : (
            users.map((u) => (
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
                  <p className="text-xs text-gray-500">Çevrimdışı (Şimdilik)</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- SAĞ TARAF (CHAT ALANI) --- */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          // Biri seçiliyse burası görünecek (İleride dolduracağız)
          <div className="flex items-center justify-center h-full bg-gray-50">
            <h2 className="text-2xl text-gray-400">
              {selectedUser.userName} ile sohbet ediyorsun
            </h2>
          </div>
        ) : (
          // Kimse seçili değilse burası
          <div className="flex items-center justify-center h-full bg-gray-50">
            <h2 className="text-2xl text-gray-400">
              Sohbet etmek için birini seç
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
