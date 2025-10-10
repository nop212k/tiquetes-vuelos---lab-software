// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import RegisterPage from "./pages/Registro";
import RegisterAdmin from "./pages/RegistroAdmin";
import LoginPage from "./pages/Login";
import Cliente from "./pages/Cliente";
import Root from "./pages/Root"; 
import Admin from "./pages/Admin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import CrearVuelosForm from "./components/admin/CrearVuelosForm";
import SearchForm from "./components/SearchForm";
import Footer from "./components/Footer";
import { useEffect } from "react";

function App() {
  // Verificar si hay un token en localStorage al iniciar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token en App.tsx:', token ? 'Presente' : 'No encontrado');
  }, []);

  return (
    <Router>
      {/* ToastContainer debe estar fuera de <Routes> */}
      <ToastContainer position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/registro-admin" element={<RegisterAdmin />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cliente" element={<ProtectedRoute requiredRole="cliente"><Cliente /></ProtectedRoute>}/>
        <Route path="/root" element={<ProtectedRoute requiredRole="root"><Root /></ProtectedRoute>}/>
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/crear-vuelos" element={<ProtectedRoute requiredRole="admin"><CrearVuelosForm /></ProtectedRoute>}/>
        <Route path="/search" element={<SearchForm />} />
      </Routes>
    </Router>
  );
}

export default App;
