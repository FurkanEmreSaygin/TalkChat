import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin"; // Hook'u import et

export default function LoginPage() {
  // Tüm mantığı tek satırda çekiyoruz
  const { email, setEmail, password, setPassword, error, isLoading, handleLogin } = useLogin();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">ChatTalk Giriş</h2>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">E-posta</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-700">Şifre</label>
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
            disabled={isLoading}
            className={`w-full px-4 py-2 font-bold text-white rounded focus:outline-none ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Hesabın yok mu?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
