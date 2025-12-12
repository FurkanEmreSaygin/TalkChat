import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/authService";
import cryptoService from "../services/cryptoService"; // <--- Yeni Kasa Dairemiz
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // İşlem uzun sürebilir, butonu kitleyelim

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form elemanlarını tek yerden yönetelim
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. KRİPTOGRAFİK İŞLEM BAŞLIYOR 🔐
      // Arka planda (Web Worker) anahtar çifti üretiliyor...
      console.log("Anahtarlar üretiliyor...");
      const keyPair = await cryptoService.generateKeyPair();
      console.log("Anahtarlar hazır!");

      // 2. BACKEND'E KAYIT OL (Public Key ile birlikte)
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        keyPair.publicKey // <--- Sunucuya giden Asma Kilit
      );

      // 3. HEMEN GİRİŞ YAP (Otomatik Login)
      // Kayıt bitti, token almak için login oluyoruz
      const loginData = await authService.login(
        formData.email,
        formData.password
      );

      // 4. ÖNEMLİ: PRIVATE KEY'İ SAKLA 🗝️
      // Bunu sunucuya göndermedik, kullanıcının cebine (Local) koyuyoruz.
      localStorage.setItem("privateKey", keyPair.privateKey);

      // 5. Context'i Güncelle ve Yönlendir
      const userData = {
        _id: loginData.userId,
        email: formData.email,
        username: loginData.userName,
      };

      login(userData, loginData.token);
      navigate("/chat");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Kayıt işlemi başarısız!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          ChatTalk Kayıt
        </h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">
              Kullanıcı Adı
            </label>
            <input
              name="username"
              type="text"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">
              E-posta
            </label>
            <input
              name="email"
              type="email"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700">
              Şifre
            </label>
            <input
              name="password"
              type="password"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-bold text-white rounded focus:outline-none ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {loading ? "Anahtarlar Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Zaten hesabın var mı?{" "}
          <Link to="/auth" className="text-blue-500 hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
