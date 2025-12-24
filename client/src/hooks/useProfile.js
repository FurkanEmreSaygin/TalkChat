import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import userService from "../services/userService";
import toast from "react-hot-toast";

export const AVATAR_SEEDS = Array.from({ length: 50 }, (_, i) => `Avatar${i + 1}`);

export const useProfile = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Sayfa açılınca mevcut resmi yükle
  useEffect(() => {
    if (user) {
      const currentPic = user.profilePic || user.avatar;
      const currentName = user.userName || user.username || "User";

      if (currentPic && !currentPic.includes("undefined")) {
        setSelectedAvatar(currentPic);
      } else {
        setSelectedAvatar(`https://api.dicebear.com/9.x/avataaars/svg?seed=${currentName}`);
      }
    }
  }, [user]);

  // 2. Dosyayı Base64 formatına çevir (Helper)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  // 3. Dosya Seçme Olayı
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Boyut kontrolü (500KB)
    if (file.size > 500 * 1024) {
      toast.error("Dosya boyutu 500KB'dan küçük olmalı!");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setSelectedAvatar(base64);
      toast.success("Fotoğraf yüklendi! Kaydetmeyi unutma.");
    } catch (error) {
      console.error(error);
      toast.error("Resim işlenirken hata oluştu.");
    }
  };

  // 4. Avatar Seçme Olayı
  const handleSelectAvatar = (seed) => {
    setSelectedAvatar(`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);
  };

  // 5. Kaydetme Olayı
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await userService.updateProfile(selectedAvatar);

      // Context'i güncelle (Token değişmese bile user bilgisini yenile)
      const currentToken = localStorage.getItem("token");
      login(response.user, currentToken);

      toast.success("Profil güncellendi! Sohbete dönülüyor... 🚀");
      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Güncelleme başarısız oldu.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    selectedAvatar,
    isLoading,
    handleFileUpload,
    handleSelectAvatar,
    handleSave,
    navigate, // Geri dön butonu için lazım
  };
};
