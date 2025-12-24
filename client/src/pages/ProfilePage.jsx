import { useProfile, AVATAR_SEEDS } from "../hooks/useProfile"; // Hook'u import et

export default function ProfilePage() {
  const { user, selectedAvatar, isLoading, handleFileUpload, handleSelectAvatar, handleSave, navigate } = useProfile();

  // Kullanıcı verisi henüz gelmediyse bekle
  if (!user) return <div className="p-10 text-center">Kullanıcı verisi yükleniyor...</div>;

  const displayName = user.userName || user.username || "Kullanıcı";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
      <button
        onClick={() => navigate("/chat")}
        className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow text-gray-600 hover:bg-gray-50 font-bold flex items-center gap-2 transition-transform active:scale-95 z-50"
      >
        <span>⬅️</span> Sohbet'e Dön
      </button>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 shrink-0">Profilini Düzenle</h2>

        {/* --- ÖNİZLEME --- */}
        <div className="flex flex-col items-center mb-4 shrink-0">
          <div className="w-28 h-28 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-100 mb-2 shadow-md relative group">
            {selectedAvatar ? (
              <img src={selectedAvatar} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-3xl font-bold text-gray-500">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-700">@{displayName}</h3>

          <div className="mt-2">
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-1 px-3 rounded transition-colors inline-flex items-center gap-1"
            >
              📷 Fotoğraf Yükle
            </label>
            <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>

        {/* --- SEÇENEKLER --- */}
        <div className="mb-4 flex-1 overflow-hidden flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">veya bir Avatar Seç:</label>
          <div className="grid grid-cols-4 gap-3 overflow-y-auto p-2 border border-gray-200 rounded-lg custom-scrollbar">
            {AVATAR_SEEDS.map((seed) => {
              const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
              const isSelected = selectedAvatar === avatarUrl;
              return (
                <div
                  key={seed}
                  onClick={() => handleSelectAvatar(seed)}
                  className={`cursor-pointer rounded-lg p-1 border-2 transition-all hover:bg-gray-50 aspect-square flex items-center justify-center ${
                    isSelected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={avatarUrl} alt={seed} loading="lazy" className="w-full h-full" />
                </div>
              );
            })}
          </div>
        </div>

        {/* KAYDET */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`w-full text-white py-3 rounded-lg font-bold shadow-lg active:scale-95 transform shrink-0 transition-colors ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Kaydediliyor..." : "Kaydet ve Çık"}
        </button>
      </div>
    </div>
  );
}
