import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import cryptoService from "../services/cryptoService"

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { login } = useContext(AuthContext); // Context'ten login fonksiyonunu çek
  const navigate = useNavigate(); // Sayfa yönlendirmesi için

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // 1. Backend'e sor
      const data = await authService.login(email, password);


      if (data.encryptedPrivateKey) {
        // 1. Paketi kullanıcının girdiği şifreyle aç
        const privateKey = cryptoService.decryptPrivateKey(
          data.encryptedPrivateKey,
          password
        );

        if (privateKey) {
          // 2. Anahtarı yerine koy! 🎉
          localStorage.setItem("privateKey", privateKey);
        } else {
          alert("Anahtar çözülemedi! Şifre yanlış olabilir mi?"); // Teorik olarak login geçtiyse bu olmaz
        }
      }

      const userData = {
        _id: data.userId,
        email: email,
        username: data.userName,
        publicKey: data.publicKey,
        profilePic: data.profilePic || data.avatar || "",
      };
      login(userData, data.token);

      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Giriş başarısız!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
          ChatTalk Giriş
        </h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">
              E-posta
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none"
          >
            Giriş Yap
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Hesabın yok mu?{" "}
          <button
            onClick={() => navigate("/register")} // Direkt tıklayınca çalışır
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
}
