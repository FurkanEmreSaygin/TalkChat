const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: "Çok fazla istek gönderdiniz, lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: "Çok fazla başarısız giriş denemesi. Lütfen 1 saat bekleyin.",
  },
});

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 60,
  message: {
    error: "Çok hızlı mesaj gönderiyorsunuz! Biraz yavaşlayın 🚀",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, messageLimiter };
