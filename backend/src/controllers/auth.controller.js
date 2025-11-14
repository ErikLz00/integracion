import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connection } from "../db.js";

// 🔹 Registrar nuevo usuario
export const registerUser = (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Verificar si el email ya existe
  connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error al registrar usuario" });
    if (results.length > 0) return res.status(400).json({ error: "El email ya está registrado" });

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
    connection.query(sql, [nombre, email, hashedPassword], (err2, result) => {
      if (err2) return res.status(500).json({ error: "Error al crear usuario" });

      res.json({
        success: true,
        message: "Usuario registrado correctamente",
        usuario_id: result.insertId
      });
    });
  });
};

// 🔹 Login de usuario
export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña requeridos" });
  }

  connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error al iniciar sesión" });
    if (results.length === 0) return res.status(401).json({ error: "Usuario no encontrado" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre,email: user.email },
      process.env.JWT_SECRET || "clave_secreta_123",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email
      }
    });
  });
};
