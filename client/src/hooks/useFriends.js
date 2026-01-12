import { useState, useEffect, useCallback, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import friendService from "../services/friendService";
import toast from "react-hot-toast";

// selectedChat parametresini ekledik
export const useFriends = (currentUser, selectedChat) => {
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const { socket } = useContext(SocketContext);

  // 1. VERİLERİ ÇEK
  const loadData = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const data = await friendService.getFriendsAndRequests();
      let friendsList = [],
        requestsList = [];

      if (Array.isArray(data.friends)) friendsList = data.friends;
      else if (data.friends?.friends) friendsList = data.friends.friends;

      if (Array.isArray(data.requests)) requestsList = data.requests;
      else if (data.requests?.requests) requestsList = data.requests.requests;

      setUsers(friendsList);
      setPendingRequests(requestsList);

      // Backend'den gelen okunmamış sayıları state'e işle 
      const initialCounts = {};
      friendsList.forEach((friend) => {
        // Backend servisindeki unreadCount buraya geliyor
        if (friend.unreadCount > 0) {
          initialCounts[friend._id] = friend.unreadCount;
        }
      });
      setUnreadCounts(initialCounts);

    } catch (error) {

      console.error("Veri çekme hatası:", error);
      setUsers([]);
      setPendingRequests([]);

    }
  }, [currentUser]);

  // İlk Yükleme
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 2. SOCKET DİNLEYİCİLERİ
  useEffect(() => {
    if (!socket) return;

    // A) Online Listesi
    const handleInitialOnlineList = (onlineIds) => {
      if (Array.isArray(onlineIds)) setOnlineUsers(onlineIds);
    };

    // B) Durum Değişimi
    const handleStatusUpdate = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        if (status === "online") return prev.includes(userId) ? prev : [...prev, userId];
        return prev.filter((id) => id !== userId);
      });
    };

    // C) Arkadaşlık İstekleri
    const handleNewRequest = ({ senderName }) => {
      toast(`${senderName || "Biri"} sana arkadaşlık isteği gönderdi! 🔔`);
      loadData();
    };

    const handleRequestAccepted = ({ accepterName }) => {
      toast.success(`${accepterName || "Arkadaşın"} isteğini kabul etti! 🎉`);
      loadData();
    };

    // ---D) CANLI MESAJ GELDİĞİNDE SAYIYI ARTIR ---
    const handleNewMessage = (message) => {
      if (message.recipient === currentUser._id) {
        // Ve eğer o an o kişiyle konuşmuyorsam
        const currentChatId = selectedChat?._id || selectedChat;

        if (message.sender !== currentChatId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [message.sender]: (prev[message.sender] || 0) + 1,
          }));

          // Opsiyonel: Bildirim sesi çalınabilir
        }
      }
    };

    socket.on("getOnlineFriends", handleInitialOnlineList);
    socket.on("friendStatusUpdate", handleStatusUpdate);
    socket.on("newFriendRequest", handleNewRequest);
    socket.on("friendRequestAccepted", handleRequestAccepted);
    socket.on("newMessage", handleNewMessage); 

    return () => {
      socket.off("getOnlineFriends", handleInitialOnlineList);
      socket.off("friendStatusUpdate", handleStatusUpdate);
      socket.off("newFriendRequest", handleNewRequest);
      socket.off("friendRequestAccepted", handleRequestAccepted);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, loadData, currentUser, selectedChat]); 

  // --- Mesajları Okundu Yap  ---
  const markMessagesAsRead = (friendId) => {
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[friendId]; // Sayacı sil (0 yap)
      return newCounts;
    });
  };

  //  --- Arkadaşlık İstekleri ve Silme İşlemleri ---
  const sendFriendRequest = async (recipientId) => {
    try {
      await friendService.sendFriendRequest(recipientId);
      socket.emit("sendFriendRequest", { recipientId });
      toast.success("İstek gönderildi!");
    } catch {
      toast.error("İstek gönderilemedi.");
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const requestObj = pendingRequests.find((r) => r._id === requestId);
      const senderId = requestObj?.sender?._id || requestObj?.sender;
      await friendService.acceptFriendRequest(requestId);
      if (senderId) socket.emit("acceptFriendRequest", { senderId });
      toast.success("Arkadaş eklendi! 🎉");
      loadData();
    } catch {
      toast.error("İşlem başarısız.");
    }
  };

  const removeFriend = async (friendId) => {
    if (!window.confirm("Bu kişiyi silmek istediğine emin misin?")) return;
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
    unreadCounts, 
    markMessagesAsRead, 
    loadData,
    sendFriendRequest,
    acceptRequest,
    removeFriend,
    loadFriends: loadData,
  };
};
