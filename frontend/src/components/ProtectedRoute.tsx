import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from "react";
import { toast } from 'react-toastify';
import { getMe } from '../services/api';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'cliente' | 'admin' | 'root';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      // Verificar si hay un token en localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        console.log('No hay token en localStorage');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Verificando token con el backend...');
        // Verificar el token con el backend
        const response = await getMe();
        console.log('Respuesta del backend:', response);
        
        if (!response || !response.user) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        setIsAuthenticated(true);
        
        if (requiredRole) {
          const userRole = response.user?.tipo?.toLowerCase();
          console.log('Rol requerido:', requiredRole, 'Rol del usuario:', userRole);
          setHasRequiredRole(userRole === requiredRole);
        } else {
          setHasRequiredRole(true);
        }
      } catch (error: any) {
        console.error('Error al verificar autenticación:', error);
        setError(error?.message || 'Error de autenticación');
        // Si hay un error, limpiar el token y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setHasRequiredRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [requiredRole]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    toast.error(`Error de autenticación: ${error}`);
  }

  if (!isAuthenticated) {
    toast.error('Debe iniciar sesión para acceder a esta página');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRequiredRole) {
    toast.error('No tiene permisos para acceder a esta página');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;