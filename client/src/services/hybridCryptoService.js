import forge from "node-forge";
import CryptoJS from "crypto-js";

const hybridCryptoService = {
  encrypt: (largeData, publicKeyPem) => {
    try {
      if (!largeData || !publicKeyPem) return null;

      const aesKey = CryptoJS.lib.WordArray.random(32).toString();

      const encryptedData = CryptoJS.AES.encrypt(largeData, aesKey).toString();

      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encryptedAesKey = publicKey.encrypt(forge.util.encodeUtf8(aesKey), "RSA-OAEP");
      const encryptedAesKeyBase64 = forge.util.encode64(encryptedAesKey);

      return JSON.stringify({
        key: encryptedAesKeyBase64,
        data: encryptedData,
      });
    } catch (error) {
      console.error("Hybrid Encrypt Error:", error);
      return null;
    }
  },

  decrypt: (cipherPackage, privateKeyPem) => {
    try {
      if (!cipherPackage || !privateKeyPem) return null;

      const pkg = JSON.parse(cipherPackage);

      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const encryptedAesKey = forge.util.decode64(pkg.key);
      const aesKey = forge.util.decodeUtf8(privateKey.decrypt(encryptedAesKey, "RSA-OAEP"));

      if (!aesKey) return null;

      const bytes = CryptoJS.AES.decrypt(pkg.data, aesKey);
      const originalData = bytes.toString(CryptoJS.enc.Utf8);

      return originalData;
    } catch (error) {
      console.error("Hybrid Decrypt Error:", error);
      return null;
    }
  },
};

export default hybridCryptoService;
