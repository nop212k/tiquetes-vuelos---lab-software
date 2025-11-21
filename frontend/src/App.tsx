// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import RegisterPage from "./pages/Registro";
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
import EditarVueloForm from "./components/admin/EditarVueloForm";
import SearchForm from "./components/SearchForm";
import PerfilAdmin from "./pages/PerfilAdmin";
import PerfilCliente from "./pages/PerfilCliente";
import PerfilRoot from "./pages/PerfilRoot";
import Historial from "./pages/Historial"; // 👈 AGREGAR ESTA LÍNEA
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
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas de Cliente */}
        <Route path="/cliente" element={<ProtectedRoute requiredRole="cliente"><Cliente /></ProtectedRoute>}/>
        <Route path="/perfil-cliente" element={<ProtectedRoute requiredRole="cliente"><PerfilCliente /></ProtectedRoute>}/>
        <Route path="/historial" element={<ProtectedRoute requiredRole="cliente"><Historial /></ProtectedRoute>}/>
        
        {/* Rutas de Root */}
        <Route path="/root" element={<ProtectedRoute requiredRole="root"><Root /></ProtectedRoute>}/>
        <Route path="/perfil-root" element={<ProtectedRoute requiredRole="root"><PerfilRoot /></ProtectedRoute>}/>
        
        {/* Rutas de Admin */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>}/>
        <Route path="/perfil-admin" element={<ProtectedRoute requiredRole="admin"><PerfilAdmin /></ProtectedRoute>}/>
        <Route path="/crear-vuelos" element={<ProtectedRoute requiredRole="admin"><CrearVuelosForm /></ProtectedRoute>}/>
        
        {/* 👇 AGREGAR ESTA RUTA PARA EDITAR VUELOS */}
        <Route 
          path="/editar-vuelo/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <EditarVueloForm />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas públicas */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/search" element={<SearchForm />} />
        
        {/* Redireccionar rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;