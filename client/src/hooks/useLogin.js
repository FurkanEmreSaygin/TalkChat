import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/authService";
import cryptoService from "../services/cryptoService";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Backend'den giriş yap
      const data = await authService.login(email, password);

      // 2. Şifreli Private Key varsa, kullanıcının şifresiyle çöz
      if (data.encryptedPrivateKey) {
        const privateKey = cryptoService.decryptPrivateKey(data.encryptedPrivateKey, password);

        if (privateKey) {
          localStorage.setItem("privateKey", privateKey);
        } else {
          // Normalde şifre doğruysa buraya düşmez ama ek güvenlik kontrolü
          throw new Error("Anahtar şifresi çözülemedi!");
        }
      }

      // 3. Kullanıcı verisini hazırla ve Context'e yaz
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
      console.error("Login Error:", err);
      setError(err.response?.data?.error || err.message || "Giriş başarısız!");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
  };
};
