import { useState, useEffect } from "react";
import messageService from "../services/messageService";
import cryptoService from "../services/cryptoService";
import toast from "react-hot-toast";

export const useChat = (socket, currentUser, selectedUser) => {
  const [messages, setMessages] = useState([]);

  const tryDecryptMessage = (msg) => {
    const privateKey = localStorage.getItem("privateKey");
    if (!privateKey) return "🔑 Özel anahtar bulunamadı";

    try {
      if (msg.sender === currentUser._id) {
        
        if (msg.senderContent) {
          const decrypted = cryptoService.decrypt( msg.senderContent, privateKey );
          return decrypted?.startsWith("⚠️") ? "⚠️ Şifre Çözülemedi": decrypted;
        }

        return msg.content.length > 50 && !msg.content.includes(" ") ? "🔒 (Şifreli)" : msg.content;
      }

      if (msg.recipient === currentUser._id) {
        const decrypted = cryptoService.decrypt(msg.content, privateKey);
        return decrypted?.startsWith("⚠️") ? msg.content : decrypted;
      }

      return msg.content;

    } catch (error) {
      return "⚠️ Hata";
    }
  };

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const history = await messageService.getMessages(selectedUser._id);
        const rawMessages = history.messages || history || [];

        const processedMessages = rawMessages.map((msg) => ({ ...msg, content: tryDecryptMessage(msg) }));

        setMessages(processedMessages);
      } catch (err) {
        console.error("Mesajlar alınamadı", err);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (message) => {
      if (message.sender === selectedUser._id) {
        const decryptedContent = tryDecryptMessage(message);
        setMessages((prev) => [ ...prev, { ...message, content: decryptedContent }]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  const sendMessage = (text) => {
    if (!selectedUser) {
      toast.error("Lütfen bir kullanıcı seçin!");
      return;
    }
    if (!currentUser.publicKey) {
      toast.error( "Sizin şifreleme anahtarınız eksik! Lütfen tekrar giriş yapın.");
      return;
    }
    if (!selectedUser.publicKey) {
      toast.error(`${selectedUser.userName} kişisinin açık anahtarı yok. Mesaj gönderilemez!`);
      return;
    }

    const encryptedForMe = cryptoService.encrypt(text, currentUser.publicKey);
    const encryptedForRecipient = cryptoService.encrypt(text, selectedUser.publicKey );

    if (!encryptedForMe || !encryptedForRecipient) {
      toast.error("Mesaj şifrelenirken bir hata oluştu!");
      return;
    }

    socket.emit("sendMessage", {
      recipientId: selectedUser._id,
      content: encryptedForRecipient,
      senderContent: encryptedForMe,
    });

    const optimisticMessage = {
      _id: Date.now(),
      sender: currentUser._id,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
  };

  return { messages, sendMessage };
};
