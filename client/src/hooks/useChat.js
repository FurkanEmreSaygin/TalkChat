import { useState, useEffect } from "react";
import messageService from "../services/messageService";
import cryptoService from "../services/cryptoService";
import hybridCryptoService from "../services/hybridCryptoService";
import toast from "react-hot-toast";

// --- Helper: Şifre Çözme ---
const decryptMessageContent = (msg, currentUserId, privateKey, groupKey = null) => {
  if (!privateKey) return "🔑 Anahtar yok";

  try {
    // Mesajı BEN attıysam -> 'senderContent'
    if (msg.sender === currentUserId || msg.sender?._id === currentUserId) {
      return tryDecrypt(msg.senderContent, privateKey);
    }

    // Mesaj BAŞKASINDAN geldiyse -> 'content'
    // Eğer grup anahtarı (groupKey) varsa onu kullan, yoksa kişisel privateKey kullan
    const keyToUse = groupKey || privateKey;
    return tryDecrypt(msg.content, keyToUse);
  } catch (error) {
    console.error("Decryption Error:", error);
    return "⚠️ Hata";
  }
};

const tryDecrypt = (cipherText, key) => {
  if (!cipherText) return "⚠️ İçerik Boş";
  try {
    // Hibrit (Resim/Uzun Metin)
    if (typeof cipherText === "string" && cipherText.startsWith("{") && cipherText.includes('"key":')) {
      return hybridCryptoService.decrypt(cipherText, key) || "⚠️ Medya Çözülemedi";
    }
    // Standart RSA
    const text = cryptoService.decrypt(cipherText, key);
    return text && !text.startsWith("⚠️") ? text : "⚠️ Şifre Hatası";
  } catch  {
    return "⚠️ Hata";
  }
};

export const useChat = (socket, currentUser, selectedChat) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupPrivateKey, setGroupPrivateKey] = useState(null);

  // 0. GRUP ANAHTARINI HAZIRLA (Sadece Grup Seçiliyse)
  useEffect(() => {
    if (selectedChat?.isGroup && currentUser?._id && selectedChat.members) {
      const myPrivateKey = localStorage.getItem("privateKey");
      const myMemberInfo = selectedChat.members.find((m) => (m.user._id || m.user) === currentUser._id);

      if (myMemberInfo && myMemberInfo.encryptedKey) {
        const decryptedGroupKey = hybridCryptoService.decrypt(myMemberInfo.encryptedKey, myPrivateKey);
        setGroupPrivateKey(decryptedGroupKey);
      } else {
        setGroupPrivateKey(null);
      }
    } else {
      setGroupPrivateKey(null);
    }
  }, [selectedChat, currentUser]);

  // 1. MESAJLARI ÇEK VE OKUNDU YAP
  useEffect(() => {
    if (!selectedChat?._id || !currentUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      const privateKey = localStorage.getItem("privateKey");

      try {
        const response = await messageService.getMessages(selectedChat._id);
        const rawMessages = Array.isArray(response) ? response : response.messages || [];

        const processedMessages = rawMessages.map((msg) => ({
          ...msg,
          content: decryptMessageContent(msg, currentUser._id, privateKey, selectedChat.isGroup ? groupPrivateKey : null),
        }));

        setMessages(processedMessages);

        // --- OKUNDU İŞARETLEME (Sohbeti açınca) ---
        // Eğer okunmamış mesajlar varsa ve gönderen ben değilsem
        const unreadExists = processedMessages.some((m) => m.sender !== currentUser._id && !m.isRead);

        if (unreadExists && !selectedChat.isGroup) {
          // Gruplarda okundu bilgisi şimdilik kapalı
          // Backend'e bildir
          messageService.markAsRead(selectedChat._id).catch((err) => console.error(err));
          // Socket ile karşıya bildir (Mavi tik yansın)
          socket?.emit("markMessagesAsRead", {
            senderId: selectedChat._id,
            recipientId: currentUser._id,
          });
        }
      } catch (err) {
        console.error("Mesajlar alınamadı", err);
        toast.error("Sohbet yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    // Grup ise anahtarın çözülmesini bekle, değilse direkt yükle
    if (!selectedChat.isGroup || groupPrivateKey) {
      fetchMessages();
    }
  }, [selectedChat, currentUser, groupPrivateKey, socket]);

  // 2. SOCKET DİNLEME (Canlı Mesaj + Mavi Tik)
  useEffect(() => {
    if (!socket || !selectedChat) return;

    // A) Yeni Mesaj Geldiğinde
    const handleNewMessage = (message) => {
      // Çift mesajı önle (Ben attıysam zaten ekranda var)
      if (message.sender === currentUser._id) return;

      const isRelevant = message.sender === selectedChat._id || message.recipient === selectedChat._id;

      if (isRelevant) {
        const privateKey = localStorage.getItem("privateKey");
        const decryptedText = decryptMessageContent(message, currentUser._id, privateKey, groupPrivateKey);

        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, { ...message, content: decryptedText }];
        });

        // Sohbet açıkken mesaj geldi -> Anında Okundu Yap
        if (!message.isRead && !selectedChat.isGroup) {
          socket.emit("markMessagesAsRead", {
            senderId: message.sender,
            recipientId: message.recipient,
          });
        }
      }
    };

    // B) Mavi Tik (Karşı taraf okuduğunda)
    const handleMessagesRead = ({ readerId, recipientId }) => {
      // Eğer şu an konuştuğum kişi (selectedChat) mesajlarımı okuduysa
      // VEYA ben okuduğumda kendi ekranımda da güncellenmesi için
      if (readerId === selectedChat._id || recipientId === selectedChat._id) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, selectedChat, currentUser, groupPrivateKey]);

  // 3. MESAJ GÖNDERME
  const sendMessage = async ({ text, image, type }) => {
    const targetPublicKey = selectedChat.isGroup ? selectedChat.publicGroupKey : selectedChat.publicKey;

    if (!targetPublicKey) {
      toast.error("Anahtar eksik!");
      return;
    }

    const contentToEncrypt = type === "image" ? image : text;
    if (!contentToEncrypt) return;

    try {
      const service = type === "image" ? hybridCryptoService : cryptoService;

      const encryptedForRecipient = service.encrypt(contentToEncrypt, targetPublicKey);
      const encryptedForMe = service.encrypt(contentToEncrypt, currentUser.publicKey);

      if (!encryptedForMe || !encryptedForRecipient) throw new Error("Şifreleme hatası");

      await messageService.sendMessage({
        recipientId: selectedChat._id,
        content: encryptedForRecipient,
        senderContent: encryptedForMe,
        type: type,
      });

      // Ekrana Ekle (Optimistic)
      const optimisticMessage = {
        _id: Date.now(),
        sender: currentUser._id,
        recipient: selectedChat._id,
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

  return { messages, sendMessage, loading };
};
