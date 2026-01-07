import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister"; // Hook'u import et

export default function RegisterPage() {
  const { formData, handleChange, error, isLoading, handleRegister } = useRegister();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">ChatTalk Kayıt</h2>

        {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">Kullanıcı Adı</label>
            <input
              name="userName"
              type="text"
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-700">E-posta</label>
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
            <label className="block mb-2 text-sm font-bold text-gray-700">Şifre</label>
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
            disabled={isLoading}
            className={`w-full px-4 py-2 font-bold text-white rounded focus:outline-none ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Anahtarlar Oluşturuluyor..." : "Kayıt Ol"}
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
