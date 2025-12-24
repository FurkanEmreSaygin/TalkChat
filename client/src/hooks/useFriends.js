import { useState, useEffect, useCallback } from "react";
import friendService from "../services/friendService";
import toast from "react-hot-toast";

export const useFriends = (currentUser, socket) => {
  const [users, setUsers] = useState([]); // Mevcut arkadaşlar
  const [pendingRequests, setPendingRequests] = useState([]); // Bekleyen istekler (YENİ)
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. VERİLERİ ÇEKME FONKSİYONU ---
  const loadData = useCallback(async () => {
    if (!currentUser?._id) return;
    setIsLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([friendService.getFriends(), friendService.getPendingRequests()]);

      const friendList = friendsData.friends || friendsData || [];
      const requestList = requestsData || [];

      if (Array.isArray(friendList)) setUsers(friendList);
      if (Array.isArray(requestList)) setPendingRequests(requestList);
    } catch (error) {
      console.error("Veri yükleme hatası", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // --- 2. İSTEK KABUL ETME FONKSİYONU ---
  const acceptRequest = async (requestId) => {
    try {
      // A) Önce isteği kimin attığını listeden bulalım (Socket için lazım)
      const requestDetails = pendingRequests.find((req) => req._id === requestId);
      // B) API'ye "Kabul Et" isteği at
      await friendService.acceptFriendRequest(requestId);
      toast.success("İstek kabul edildi! 🎉");
      // C) Listeleri hemen yenile
      loadData();
      // D) SOCKET İLE KARŞI TARAFA HABER VER
      if (socket && requestDetails) {
        const senderId = requestDetails.sender._id || requestDetails.sender;

        socket.emit("acceptFriendRequest", { senderId: senderId });
      }
    } catch (error) {
      console.error(error);
      toast.error("İstek kabul edilemedi.");
    }
  };

  // --- 3. SOCKET DİNLEYİCİLERİ ---
  useEffect(() => {
    loadData(); // Sayfa açılınca verileri çek
  }, [loadData]);

  useEffect(() => {
    if (!socket) return;

    // Online/Offline durumları
    const handleOnlineFriends = (onlineIds) => setOnlineUsers(onlineIds);
    const handleStatusUpdate = ({ userId, status }) => {
      setOnlineUsers((prev) => {
        if (status === "online") return prev.includes(userId) ? prev : [...prev, userId];
        return prev.filter((id) => id !== userId);
      });
    };

    const handleNewRequest = (data) => {
      toast(`📩 ${data.senderName} sana arkadaşlık isteği gönderdi!`, { icon: "👋" });
      loadData();
    };

    const handleRequestAccepted = () => {
      loadData();
    };

    socket.on("getOnlineFriends", handleOnlineFriends);
    socket.on("friendStatusUpdate", handleStatusUpdate);
    socket.on("newFriendRequest", handleNewRequest);
    socket.on("friendRequestAccepted", handleRequestAccepted);

    return () => {
      socket.off("getOnlineFriends", handleOnlineFriends);
      socket.off("friendStatusUpdate", handleStatusUpdate);
      socket.off("newFriendRequest", handleNewRequest);
      socket.off("friendRequestAccepted", handleRequestAccepted);
    };
  }, [socket, loadData]);

  // Dışarıya hem verileri hem de fonksiyonları açıyoruz
  return { users, pendingRequests, onlineUsers, isLoading, loadFriends: loadData, acceptRequest };
};
