import forge from "node-forge";

const cryptoService = {
  generateKeyPair: async () => {
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 },(err, keypair) => {

          if (err) return reject(err);

          const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
          const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

          resolve({ publicKey: publicKeyPem, privateKey: privateKeyPem });
        }
      );
    });
  },

  encrypt: (message, publicKeyPem) => {
    try {

      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encrypted = publicKey.encrypt(forge.util.encodeUtf8(message),"RSA-OAEP");

      return forge.util.encode64(encrypted);

    } catch (error) {

      console.error("encrypt error:", error);
      return null;

    }
  },

  decrypt: (encryptedMessageBase64, privateKeyPem) => {
    try {

      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      const encrypted = forge.util.decode64(encryptedMessageBase64);

      const decrypted = privateKey.decrypt(encrypted, "RSA-OAEP");
      return forge.util.decodeUtf8(decrypted);

    } catch (error) {

      console.error("decrypt error:", error);
      return " Bu mesaj çözülemedi (Anahtar hatası).";

    }
  },
};

export default cryptoService;
