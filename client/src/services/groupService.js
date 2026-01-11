import api from "./api";
import cryptoService from "./cryptoService";
import hybridCryptoService from "./hybridCryptoService"; // Eğer gerekirse

const groupService = {
  // --- GRUP OLUŞTURMA ---
  createGroup: async (groupName, selectedUsers, currentUser) => {
    try {
      // RSA Anahtar Çifti Üret
      const groupKeyPair = await cryptoService.generateKeyPair();
      const groupPublicKey = groupKeyPair.publicKey;
      const groupPrivateKey = groupKeyPair.privateKey;

      // 2. Üye Listesini Hazırla
      const allMembers = [...selectedUsers, currentUser];
      
      const preparedMembers = [];

      for (const member of allMembers) {
        if (!member.publicKey) {
          console.warn(`⚠️ ${member.userName} kullanıcısının Public Key'i yok, gruba eklenemedi.`);
          continue;
        }
        const encryptedGroupKey = hybridCryptoService.encrypt(groupPrivateKey, member.publicKey);

        if (!encryptedGroupKey) {
            throw new Error(`${member.userName} için anahtar şifreleme başarısız.`);
        }

        preparedMembers.push({
          user: member._id, 
          encryptedKey: encryptedGroupKey, 
          role: member._id === currentUser._id ? "admin" : "member"
        });
      }

      const payload = {
        name: groupName,
        publicGroupKey: groupPublicKey, 
        members: preparedMembers,     
        admin: currentUser._id
      };

      console.log("🚀 Grup oluşturma isteği gönderiliyor...", payload);
      
      const response = await api.post("/groups/create", payload);
      return response.data;

    } catch (error) {
      console.error("Grup Oluşturma Hatası:", error);
      throw error;
    }
  },
  // --- KULLANICININ GRUPLARINI GETİR ---
  getMyGroups: async () => {
    const response = await api.get("/groups/my-groups");
    return response.data;
  }
};

export default groupService;