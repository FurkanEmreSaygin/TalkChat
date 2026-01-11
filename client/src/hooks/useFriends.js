import { useState, useEffect, useCallback, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import friendService from "../services/friendService";
import toast from "react-hot-toast";

export const useFriends = (currentUser) => {
  const [users, setUsers] = useState([]); // Arkadaş Listesi
  const [pendingRequests, setPendingRequests] = useState([]); // Bekleyen İstekler
  const [onlineUsers, setOnlineUsers] = useState([]); // Online ID Listesi
  const { socket } = useContext(SocketContext);

  // 1. VERİLERİ ÇEK (API)
  const loadData = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const data = await friendService.getFriendsAndRequests();
      let friendsList = [],
        requestsList = [];

      // Backend'den gelen veriyi güvenli şekilde ayıkla
      if (Array.isArray(data.friends)) friendsList = data.friends;
      else if (data.friends?.friends) friendsList = data.friends.friends;

      if (Array.isArray(data.requests)) requestsList = data.requests;
      else if (data.requests?.requests) requestsList = data.requests.requests;

      setUsers(friendsList);
      setPendingRequests(requestsList);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setUsers([]);
      setPendingRequests([]);
    }
  }, [currentUser]);

  // İlk açılışta verileri yükle
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. SOCKET DİNLEYİCİLERİ (DÜZELTİLDİ)
  useEffect(() => {
    if (!socket) return;

    // A) İlk Online Listesi (Backend: 'getOnlineFriends')
    const handleInitialOnlineList = (onlineIds) => {
      // Backend direkt ID array'i gönderiyor: ["id1", "id2"]
      if (Array.isArray(onlineIds)) {
        setOnlineUsers(onlineIds);
      }
    };

    // B) Canlı Durum Değişimi (Backend: 'friendStatusUpdate')
    const handleStatusUpdate = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        if (status === "online") {
          // Listede yoksa ekle
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          // Listeden çıkar
          return prev.filter((id) => id !== userId);
        }
      });
    };

    // C) Yeni Arkadaşlık İsteği Geldiğinde (Backend: 'newFriendRequest')
    const handleNewRequest = ({ senderName }) => {
      toast(`${senderName || "Biri"} sana arkadaşlık isteği gönderdi! 🔔`, {
        duration: 4000,
        position: "top-right",
      });
      loadData(); // Listeyi yenile ki istek görünsün
    };

    // D) İsteğim Kabul Edildiğinde (Backend: 'friendRequestAccepted')
    const handleRequestAccepted = ({ accepterName }) => {
      toast.success(`${accepterName || "Arkadaşın"} isteğini kabul etti! 🎉`);
      loadData(); // Listeyi yenile ki arkadaş listesinde görünsün
    };

    // Listener'ları Tanımla (İsimler Backend ile birebir aynı)
    socket.on("getOnlineFriends", handleInitialOnlineList);
    socket.on("friendStatusUpdate", handleStatusUpdate);
    socket.on("newFriendRequest", handleNewRequest);
    socket.on("friendRequestAccepted", handleRequestAccepted);

    // Temizlik (Cleanup)
    return () => {
      socket.off("getOnlineFriends", handleInitialOnlineList);
      socket.off("friendStatusUpdate", handleStatusUpdate);
      socket.off("newFriendRequest", handleNewRequest);
      socket.off("friendRequestAccepted", handleRequestAccepted);
    };
  }, [socket, loadData]);

  // --- FONKSİYONLAR ---

  // 1. İSTEK GÖNDERME (Hem API hem Socket)
  // Not: Bunu AddFriendModal içinde kullanman veya oraya prop olarak geçmen gerekebilir.
  const sendFriendRequest = async (recipientId) => {
    try {
      await friendService.sendFriendRequest(recipientId);

      // Socket ile karşı tarafa "Bak sana istek attım" sinyali gönder
      socket.emit("sendFriendRequest", { recipientId });

      toast.success("İstek gönderildi!");
    } catch {
      toast.error("İstek gönderilemedi.");
    }
  };

  // 2. İSTEK KABUL ETME (Hem API hem Socket)
  const acceptRequest = async (requestId) => {
    try {
      // İsteği gönderen kişinin ID'sini bulmamız lazım (Socket sinyali için)
      const requestObj = pendingRequests.find((r) => r._id === requestId);
      const senderId = requestObj?.sender?._id || requestObj?.sender;

      await friendService.acceptFriendRequest(requestId);

      // Socket ile karşı tarafa "Kabul ettim" sinyali gönder
      if (senderId) {
        socket.emit("acceptFriendRequest", { senderId });
      }

      toast.success("Arkadaş eklendi! 🎉");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("İşlem başarısız.");
    }
  };

  // 3. ARKADAŞ SİLME
  const removeFriend = async (friendId) => {
    if (!window.confirm("Bu kişiyi silmek istediğine emin misin?")) return;

    // Optimistic Update
    setUsers((prev) => prev.filter((u) => u._id !== friendId));

    try {
      await friendService.removeFriend(friendId);
      toast.success("Silindi.");
    } catch {
      toast.error("Hata oluştu.");
      loadData();
    }
  };

  return {
    users,
    onlineUsers,
    pendingRequests,
    loadData,
    sendFriendRequest, // Bunu dışarı açtık
    acceptRequest,
    removeFriend,
    loadFriends: loadData,
  };
};
