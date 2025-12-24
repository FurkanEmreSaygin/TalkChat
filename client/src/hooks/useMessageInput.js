import { useState, useRef } from "react";
import toast from "react-hot-toast";

export const useMessageInput = (onSendMessage) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null); // Base64 hali
  const [preview, setPreview] = useState(null); // Ekranda göstermek için
  
  const fileInputRef = useRef(null);

  // 1. Dosya Seçme Olayı
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Boyut Kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
        toast.error("Dosya boyutu 2MB'dan küçük olmalı!");
        return;
    }

    // Okuma işlemi
    const reader = new FileReader();
    reader.onloadend = () => {
        setImage(reader.result);
        setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 2. Resmi İptal Etme
  const cancelImage = () => {
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 3. Gönderme Olayı
  const handleSend = (e) => {
    e.preventDefault();
    
    // Boş ise gönderme
    if (!text.trim() && !image) return;

    // Üst bileşene (ChatPage -> useChat) veriyi ilet
    onSendMessage({
        text: text,
        image: image,
        type: image ? "image" : "text"
    });

    // Temizlik
    setText("");
    cancelImage();
  };

  return {
    text, setText,
    preview,
    fileInputRef,
    handleFileChange,
    handleSend,
    cancelImage
  };
};