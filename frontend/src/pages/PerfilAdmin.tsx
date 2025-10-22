// frontend/src/pages/PerfilAdmin.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/admin/NavbarAdmin";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface UserData {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  usuario: string;
  tipo: string;
  tipoDocumento?: string;
  documento?: string;
  direccion?: string;
  genero?: string;
  fechaNacimiento?: string;
}

const PerfilAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Estados para edición de perfil
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    direccion: "",
  });

  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data.user;
      setUserData(user);
      setFormData({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        correo: user.correo || "",
        direccion: user.direccion || "",
      });
    } catch (err) {
      console.error("Error cargando perfil:", err);
      toast.error("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE}/api/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(res.data.user);
      setEditMode(false);
      toast.success("Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("Error actualizando perfil:", err);
      toast.error(err?.response?.data?.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE}/api/users/me/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Contraseña actualizada correctamente");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Error cambiando contraseña:", err);
      toast.error(err?.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <NavbarAdmin />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div>
        <NavbarAdmin />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-600">Error al cargar el perfil</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAdmin />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005f7f] to-[#003b5eff] rounded-2xl p-8 mb-6 text-white">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-full">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-[#003b5eff]">
                {userData.nombres.charAt(0)}{userData.apellidos.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userData.nombres} {userData.apellidos}</h1>
              <p className="text-white/80 text-lg">Administrador</p>
              <p className="text-white/60 text-sm">@{userData.usuario}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-[#003b5eff] text-white rounded-lg hover:bg-[#005f7f] transition"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombres</label>
                      <input
                        type="text"
                        value={formData.nombres}
                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos</label>
                      <input
                        type="text"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          nombres: userData.nombres,
                          apellidos: userData.apellidos,
                          correo: userData.correo,
                          direccion: userData.direccion || "",
                        });
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-[#003b5eff] text-white rounded-lg hover:bg-[#005f7f] disabled:opacity-50"
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombres</p>
                      <p className="text-lg font-semibold text-gray-800">{userData.nombres}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Apellidos</p>
                      <p className="text-lg font-semibold text-gray-800">{userData.apellidos}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Correo Electrónico</p>
                    <p className="text-lg font-semibold text-gray-800">{userData.correo}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Usuario</p>
                    <p className="text-lg font-semibold text-gray-800">@{userData.usuario}</p>
                  </div>

                  {userData.documento && (
                    <div>
                      <p className="text-sm text-gray-500">Documento</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {userData.tipoDocumento} {userData.documento}
                      </p>
                    </div>
                  )}

                  {userData.direccion && (
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-lg font-semibold text-gray-800">{userData.direccion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Acciones */}
          <div className="space-y-6">
            {/* Seguridad */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Seguridad</h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#005f7f] to-[#003b5eff] text-white rounded-lg hover:shadow-lg transition font-semibold"
              >
                🔒 Cambiar Contraseña
              </button>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Rol</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold">Tipo de Usuario</p>
                  <p className="text-2xl font-bold text-blue-700 capitalize">{userData.tipo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cambiar Contraseña</h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Contraseña actual */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none pr-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#003b5eff] outline-none pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#003b5eff] text-white rounded-lg hover:bg-[#005f7f] disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Cambiar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilAdmin;