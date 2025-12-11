import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext"; // Context'i çağırdık

import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";

function App() {
  const { token, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center mt-10">Yükleniyor...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Eğer Token varsa Chat'e, yoksa Auth sayfasına yönlendir */}
        <Route
          path="/"
          element={token ? <Navigate to="/chat" /> : <Navigate to="/auth" />}
        />

        {/* Giriş yapmamışsa Auth sayfasını göster, yapmışsa Chat'e at */}
        <Route
          path="/auth"
          element={!token ? <LoginPage /> : <Navigate to="/chat" />}
        />

        {/* Chat sayfası KORUMALI ROTA (Protected Route) */}
        {/* Token yoksa zorla Login'e gönder */}
        <Route
          path="/chat"
          element={token ? <ChatPage /> : <Navigate to="/auth" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
