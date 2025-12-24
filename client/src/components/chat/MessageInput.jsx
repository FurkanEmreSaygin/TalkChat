import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function MessageInput({ onSendMessage }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); 
  
  const fileInputRef = useRef(null); // Gizli inputa tıklamak için referans


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        toast.error("Dosya boyutu 2MB'dan küçük olmalı!");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setImage(reader.result); 
        setPreview(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image) return;

    onSendMessage({
        text: text,
        image: image,
        type: image ? "image" : "text"
    });

    setText("");
    cancelImage();
  };

  const cancelImage = () => {
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 bg-gray-100 border-t">
      
      {/* --- RESİM ÖNİZLEME ALANI (Varsa göster) --- */}
      {preview && (
          <div className="mb-2 relative inline-block">
              <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300 shadow-sm" />
              <button 
                onClick={cancelImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              >
                  X
              </button>
          </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        
        {/* GİZLİ DOSYA INPUTU */}
        <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
        />

        {/* ATAÇ BUTONU (Dosya Seçtiren) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          title="Resim Ekle"
        >
          {/* Ataş İkonu (SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>

        {/* YAZI INPUTU */}
        <input
          type="text"
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 px-4"
          placeholder="Bir mesaj yaz..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        {/* GÖNDER BUTONU */}
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!text.trim() && !image}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}