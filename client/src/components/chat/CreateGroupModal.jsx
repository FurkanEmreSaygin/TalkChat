import { useState } from "react";
import { X } from "lucide-react"; // İkon seti (yoksa "x" yazabilirsin)

export default function CreateGroupModal({ onClose, friends, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  const toggleFriend = (friend) => {
    if (selectedFriends.includes(friend)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== friend));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length === 0) return;

    // Hook'tan gelen create fonksiyonunu çağır
    await onCreate(groupName, selectedFriends);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Yeni Grup Oluştur</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Grup İsmi..."
            className="w-full p-2 border rounded mb-4"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />

          {/* Arkadaş Listesi */}
          <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
            <p className="text-sm text-gray-500 mb-2">Üyeleri Seç ({selectedFriends.length})</p>
            {friends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => toggleFriend(friend)}
                className={`flex items-center p-2 cursor-pointer rounded ${
                  selectedFriends.includes(friend) ? "bg-green-100" : "hover:bg-gray-100"
                }`}
              >
                <img src={friend.profilePic || friend.avatar} alt={friend.userName} className="w-8 h-8 rounded-full mr-3" />
                <span>{friend.userName}</span>
                {selectedFriends.includes(friend) && <span className="ml-auto text-green-600">✓</span>}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={selectedFriends.length === 0 || !groupName}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Oluştur
          </button>
        </form>
      </div>
    </div>
  );
}
