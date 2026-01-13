import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext); 

  useEffect(() => {
    // 1. Kullanıcı varsa bağlan
    if (user) {
      const token = localStorage.getItem("token"); 
      const socketURL = import.meta.env.VITE_SOCKET_URL || "/";

      const newSocket = io(socketURL, {
        auth: {
          token: token,
        },
        path: "/socket.io/",
        reconnection: true,
        reconnectionAttempts: 5,
      });

      newSocket.on("connect", () => {
        console.log("🟢 Socket Bağlandı! ID:", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("🔴 Socket Bağlantı Hatası:", err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        console.log("Socket Kapatıldı.");
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]); 

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
