import { useState, useEffect, useContext } from "react"; 
import { SocketContext } from "../../context/SocketContext"; 
import friendService from "../../services/friendService";
import toast from "react-hot-toast";

export default function AddFriendModal({ isOpen, onClose, onFriendAdded }) {
  const { socket } = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState("search"); 
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (isOpen && activeTab === "requests") {
      loadRequests();
    }
  }, [isOpen, activeTab]);

  const loadRequests = async () => {
    try {
      const data = await friendService.getRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const users = await friendService.searchUsers(query);
      setSearchResults(users);
    } catch (error) {
      toast.error("Arama başarısız.");
    }
  };

  // --- İSTEK GÖNDERME (SOCKET GÜNCELLEMESİ) ---
  const sendRequest = async (userId) => {
    try {
      // 1. API'ye kaydet
      await friendService.sendRequest(userId);
      
      // 2. SOCKET'e Sinyal Gönder (Bildirim Gitmesi İçin)
      if (socket) {
          socket.emit("sendFriendRequest", { recipientId: userId });
      }

      toast.success("Arkadaşlık isteği gönderildi! 🚀");
    } catch (error) {
      toast.error(error.response?.data?.message || "İstek gönderilemedi.");
    }
  };

  // --- KABUL ETME (SOCKET VE REFRESH GÜNCELLEMESİ) ---
  const acceptRequest = async (requestId, senderId) => {
    try {
      // 1. API'de kabul et
      await friendService.acceptRequest(requestId);
      
      // 2. SOCKET'e Sinyal Gönder (Karşı tarafa "Kabul ettim" demek için)
      if (socket) {
          socket.emit("acceptFriendRequest", { senderId: senderId });
      }

      toast.success("Artık arkadaşsınız! 🎉");
      
      // 3. LİSTEYİ YENİLE (ChatPage'i tetikler)
      if (onFriendAdded) onFriendAdded(); 
      
      loadRequests(); 
    } catch (error) {
      console.error(error);
      toast.error("İşlem başarısız.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg text-gray-700">Arkadaş Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-3 font-medium ${activeTab === "search" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("search")}
          >
            Kişi Ara
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${activeTab === "requests" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
            onClick={() => setActiveTab("requests")}
          >
            Gelen İstekler {requests.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{requests.length}</span>}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 h-80 overflow-y-auto custom-scrollbar">
          
          {/* Arama Kısmı */}
          {activeTab === "search" && (
            <>
              <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Kullanıcı adı..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Ara</button>
              </form>

              <div className="space-y-3">
                {searchResults.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.profilePic || user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.userName}`} 
                        className="w-10 h-10 rounded-full bg-gray-200" 
                        alt="avatar"
                      />
                      <span className="font-semibold text-gray-700">{user.userName}</span>
                    </div>
                    <button 
                      onClick={() => sendRequest(user._id)}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold hover:bg-green-200"
                    >
                      Ekle +
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* İstekler Kısmı */}
          {activeTab === "requests" && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-center text-gray-400 mt-10">Hiç bekleyen istek yok 🍃</p>
              ) : (
                requests.map(req => (
                  <div key={req._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <img 
                        src={req.sender.profilePic || req.sender.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.sender.userName}`} 
                        className="w-10 h-10 rounded-full bg-white" 
                        alt="avatar"
                      />
                      <span className="font-bold text-gray-700">{req.sender.userName}</span>
                    </div>
                    {/* acceptRequest'e sender ID'yi de gönderiyoruz */}
                    <button 
                      onClick={() => acceptRequest(req._id, req.sender._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700"
                    >
                      Kabul Et
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}