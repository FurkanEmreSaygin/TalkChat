import { X, Upload, Check } from "lucide-react";
import { useProfile, AVATAR_SEEDS } from "../../hooks/useProfile";

export default function ProfileModal({ onClose }) {
  const {
    selectedAvatar,
    isLoading,
    handleFileUpload,
    handleSelectAvatar,
    handleSave: originalSave,
  } = useProfile();

  const handleSaveAndExit = async () => {
    try {
      await originalSave(); 

      setTimeout(() => {
        onClose(); 
        window.location.reload();
      }, 1000);
    } catch  {
        // Hata durumunda modal kapanmaz
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Profilini Özelleştir</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sol: Önizleme */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full border-4 border-blue-100 p-1 relative">
                <img src={selectedAvatar} className="w-full h-full rounded-full object-cover bg-gray-50" />
              </div>
            </div>

            {/* Sağ: Seçenekler */}
            <div className="md:col-span-2 space-y-6">
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 transition">
                <Upload size={20} className="mr-2" />
                <span className="text-sm">Kendi Fotoğrafını Yükle</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>

              <div className="grid grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 border rounded-xl">
                {AVATAR_SEEDS.map((seed) => (
                  <button
                    key={seed}
                    onClick={() => handleSelectAvatar(seed)}
                    className="relative rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500"
                  >
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`} alt={seed} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">
            Vazgeç
          </button>
          <button
            onClick={handleSaveAndExit} // Düzeltilmiş fonksiyon
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-md"
          >
            {isLoading ? "Kaydediliyor..." : "Kaydet ve Kapat"}
          </button>
        </div>
      </div>
    </div>
  );
}
