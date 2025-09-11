import React, { useState } from 'react';
import './EditPassword.css'; // (Opcional) Crea un archivo CSS para estilos

interface EditPasswordProps {
  onPasswordUpdated: () => void; // Callback para recargar la interfaz
}

const EditPassword: React.FC<EditPasswordProps> = ({ onPasswordUpdated }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones según el caso de uso
    if (currentPassword !== 'password123') { // Simulación: Reemplaza con verificación real
      setMessage('La contraseña ingresada no coincide con la que tienes actualmente.');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setMessage('La contraseña no cumple con las políticas de seguridad, recuerde que debe tener mínimo 8 caracteres, contener al menos una letra mayúscula y un número. Los símbolos como #,$,%,&, etc. no están permitidos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    // Simulación de actualización en la base de datos
    setMessage('Contraseña actualizada con éxito.');
    onPasswordUpdated(); // Recarga la interfaz
    // Aquí iría la lógica real para actualizar la base de datos
  };

  const isValidPassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasNumber && !hasSpecialChar;
  };

  return (
    <div className="edit-password-container">
      <h2>Editar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Contraseña Actual:</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nueva Contraseña:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Repetir Nueva Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default EditPassword;