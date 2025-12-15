import { useState, useContext, useEffect } from "react";
// 1. Navigasyon için gerekli kanca (Hook)
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import userService from "../services/userService";
import toast from "react-hot-toast";

// 50 tane rastgele avatar ismi üretir (Avatar1, Avatar2...)
const AVATAR_SEEDS = Array.from({ length: 50 }, (_, i) => `Avatar${i + 1}`);

export default function ProfilePage() {
  const { user, login } = useContext(AuthContext);

  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    if (user) {
      const currentPic = user.profilePic || user.avatar;
      const currentName = user.userName || user.username || "User";

      // Eğer kayıtlı resim varsa ve 'undefined' değilse onu göster
      if (currentPic && !currentPic.includes("undefined")) {
        setSelectedAvatar(currentPic);
      } else {
        // Yoksa isme göre varsayılan bir tane göster
        setSelectedAvatar(
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentName}`
        );
      }
    }
  }, [user]);

  const handleFileUpload = async (e) => {
    
    const file = e.target.files[0];

    if (!file) return;
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

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleSelectAvatar = (seed) => {
    setSelectedAvatar(
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`
    );
  };

  const handleSave = async () => {
    try {
      const response = await userService.updateProfile(selectedAvatar);

      const currentToken = localStorage.getItem("token");
      login(response.user, currentToken);

      toast.success("Profil güncellendi! Sohbete dönülüyor... 🚀");

      setTimeout(() => {navigate("/chat")}, 1000);

    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Güncelleme başarısız oldu.");
    }
  };

  // Kullanıcı verisi henüz gelmediyse bekle
  if (!user)
    return (
      <div className="p-10 text-center">Kullanıcı verisi yükleniyor...</div>
    );

  const displayName = user.userName || user.username || "Kullanıcı";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      {/* 4. SOL ÜST: GERİ DÖN BUTONU */}
      <button
        onClick={() => navigate("/chat")} // Direkt tıklayınca çalışır
        className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow text-gray-600 hover:bg-gray-50 font-bold flex items-center gap-2 transition-transform active:scale-95 z-50"
      >
        <span>⬅️</span> Sohbet'e Dön
      </button>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 shrink-0">
          Profilini Düzenle
        </h2>

        {/* --- ÜST KISIM: ÖNİZLEME --- */}
        <div className="flex flex-col items-center mb-4 shrink-0">
          <div className="w-28 h-28 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-100 mb-2 shadow-md relative group">
            {selectedAvatar ? (
              <img
                src={selectedAvatar}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-3xl font-bold text-gray-500">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            @{displayName}
          </h3>

          {/* FOTOĞRAF YÜKLEME BUTONU */}
          <div className="mt-2">
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-1 px-3 rounded transition-colors inline-flex items-center gap-1"
            >
              📷 Fotoğraf Yükle
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* --- ALT KISIM: SEÇENEKLER --- */}
        <div className="mb-4 flex-1 overflow-hidden flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            veya bir Avatar Seç:
          </label>

          <div className="grid grid-cols-4 gap-3 overflow-y-auto p-2 border border-gray-200 rounded-lg custom-scrollbar">
            {AVATAR_SEEDS.map((seed) => {
              const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
              const isSelected = selectedAvatar === avatarUrl;
              
              return (
                <div
                  key={seed}
                  onClick={() => handleSelectAvatar(seed)}
                  className={`cursor-pointer rounded-lg p-1 border-2 transition-all hover:bg-gray-50 aspect-square flex items-center justify-center ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt={seed}
                    loading="lazy"
                    className="w-full h-full"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* KAYDET BUTONU */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95 transform shrink-0"
        >
          Kaydet ve Çık
        </button>
      </div>
    </div>
  );
}
