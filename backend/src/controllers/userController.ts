import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import bcrypt from "bcryptjs";

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      tipoDocumento,
      documento,
      nombres,
      apellidos,
      fechaNacimiento,
      lugarNacimiento,
      direccion,
      genero,
      correo,
      usuario,
      contrasena,
    } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Verificamos si ya existe usuario o correo
    const existingUser = await userRepository.findOne({
      where: [
        { correo },
        { usuario }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Correo o usuario ya registrado" });
    }

    // Creamos nuevo usuario
    const newUser = new User();
    newUser.tipoDocumento = tipoDocumento;
    newUser.documento = documento;
    newUser.nombres = nombres;
    newUser.apellidos = apellidos;
    newUser.fechaNacimiento = fechaNacimiento;
    newUser.lugarNacimiento = lugarNacimiento;
    newUser.direccion = direccion;
    newUser.genero = genero;
    newUser.correo = correo;
    newUser.usuario = usuario;
    newUser.contrasena = await bcrypt.hash(contrasena, 10);
    
    // Aquí aseguramos que siempre sea cliente
    newUser.tipo = "cliente";

    await userRepository.save(newUser);

    res.status(201).json({ message: "Usuario registrado correctamente", id: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
};
