import { useState, useEffect } from "react";
import messageService from "../services/messageService";
import cryptoService from "../services/cryptoService";
import hybridCryptoService from "../services/hybridCryptoService";
import toast from "react-hot-toast";

// --- YARDIMCI: ŞİFRE ÇÖZME ---
const decryptMessageContent = (msg, currentUserId, privateKey) => {
  if (!privateKey) return "🔑 Anahtar yok";

  try {
    const targetContent = msg.sender === currentUserId ? msg.senderContent : msg.content;
    if (!targetContent) return "⚠️ İçerik Boş";

    if (msg.type === "image") {
      return hybridCryptoService.decrypt(targetContent, privateKey) || "⚠️ Resim Çözülemedi";
    }

    if (targetContent.startsWith("{") && targetContent.includes('"key":')) {
      return hybridCryptoService.decrypt(targetContent, privateKey) || "⚠️ Resim Çözülemedi";
    }

    const decryptedText = cryptoService.decrypt(targetContent, privateKey);
    return decryptedText?.startsWith("⚠️") ? "⚠️ Şifre Çözülemedi" : decryptedText;
  } catch (error) {
    console.error("Decryption Error:", error);
    return "⚠️ Hata";
  }
};

export const useChat = (socket, currentUser, selectedUser) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. MESAJLARI ÇEK (API)
  useEffect(() => {
    if (!selectedUser?._id || !currentUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      const privateKey = localStorage.getItem("privateKey");

      try {
        const history = await messageService.getMessages(selectedUser._id);
        const rawMessages = history.messages || history || [];

        const processedMessages = rawMessages.map((msg) => ({
          ...msg,
          content: decryptMessageContent(msg, currentUser._id, privateKey),
        }));

        setMessages(processedMessages);
      } catch (err) {
        console.error("Mesajlar alınamadı", err);
        toast.error("Sohbet geçmişi yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  // 2. SOCKET: MESAJ VE OKUNDU BİLDİRİMLERİ
  useEffect(() => {
    if (!socket || !selectedUser) return;

    // A) Yeni Mesaj Geldiğinde
    const handleNewMessage = (message) => {
      if (message.sender === selectedUser._id) {
        const privateKey = localStorage.getItem("privateKey");
        const decryptedContent = decryptMessageContent(message, currentUser._id, privateKey);

        setMessages((prev) => [...prev, { ...message, content: decryptedContent }]);

        // Sohbet açıkken mesaj gelirse anında okundu yap
        if (!message.isRead) {
          socket.emit("markMessagesAsRead", { senderId: selectedUser._id });
        }
      }
    };

    // B) Benim Mesajım Okunduğunda (Mavi Tik)
    const handleMessagesRead = ({ readerId }) => {
      if (readerId === selectedUser._id) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, selectedUser, currentUser]);

  // 3. MESAJ GÖNDERME FONKSİYONU
  const sendMessage = async ({ text, image, type }) => {
    if (!selectedUser || !currentUser.publicKey || !selectedUser.publicKey) {
      toast.error("Bağlantı veya anahtar hatası!");
      return;
    }

    const contentToEncrypt = type === "image" ? image : text;
    if (!contentToEncrypt) return;

    try {
      const service = type === "image" ? hybridCryptoService : cryptoService;

      const encryptedForMe = service.encrypt(contentToEncrypt, currentUser.publicKey);
      const encryptedForRecipient = service.encrypt(contentToEncrypt, selectedUser.publicKey);

      if (!encryptedForMe || !encryptedForRecipient) throw new Error("Şifreleme başarısız");

      socket.emit("sendMessage", {
        recipientId: selectedUser._id,
        content: encryptedForRecipient,
        senderContent: encryptedForMe,
        type: type,
      });

      const optimisticMessage = {
        _id: Date.now(),
        sender: currentUser._id,
        content: contentToEncrypt,
        type: type,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
    } catch (error) {
      console.error("Send Error:", error);
      toast.error("Mesaj gönderilemedi.");
    }
  };

  // --- 4. OTOMATİK OKUNDU İŞARETLEME (EKSİK OLAN KISIM) ---
  useEffect(() => {
    if (!socket || !selectedUser || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    // Eğer son mesaj karşıdan geldiyse ve okunmamışsa
    if (lastMsg.sender === selectedUser._id && !lastMsg.isRead) {
      // A) Backend'e haber ver (Veritabanında true yap)
      // (Servis fonksiyonunda sadece senderId yeterli olabilir, API yapına göre)
      messageService.markAsRead(selectedUser._id).catch((e) => console.error("Mark read API error:", e));

      // B) Socket ile anlık haber ver (Mavi tik yak)
      socket.emit("markMessagesAsRead", { senderId: selectedUser._id });
    }
  }, [messages, selectedUser, socket]);

  return { messages, sendMessage, loading };
};
