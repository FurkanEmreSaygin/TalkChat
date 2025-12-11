import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Varsayılan olarak /auth sayfasına git */}
        <Route path="/" element={<Navigate to="/auth" />} />

        {/* Login/Register Ekranı */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Sohbet Ekranı */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
