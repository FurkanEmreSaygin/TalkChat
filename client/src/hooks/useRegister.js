import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/authService";
import cryptoService from "../services/cryptoService";

export const useRegister = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Tarayıcıda RSA Anahtar Çifti (Public/Private) Üret
      // (Bu işlem biraz işlemci gücü gerektirir)
      const { publicKey, privateKey } = await cryptoService.generateKeyPair();

      // 2. Private Key'i kullanıcının şifresiyle (AES) şifrele
      const encryptedPrivateKey = cryptoService.encryptPrivateKey(privateKey, formData.password);

      // 3. Sunucuya Kayıt Ol (Public Key ve Şifreli Private Key'i gönder)
      await authService.register(formData.userName, formData.email, formData.password, publicKey, encryptedPrivateKey);

      // 4. Otomatik Giriş Yap
      const loginData = await authService.login(formData.email, formData.password);

      // 5. Private Key'i tarayıcı hafızasına (Local Storage) kaydet
      localStorage.setItem("privateKey", privateKey);

      const userData = {
        _id: loginData.userId,
        email: formData.email,
        userName: loginData.userName,
        publicKey: loginData.publicKey,
      };

      login(userData, loginData.token);
      navigate("/chat");
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.error || "Kayıt işlemi başarısız!");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    error,
    isLoading,
    handleRegister,
  };
};
