import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from './context/SocketContext.jsx';
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
