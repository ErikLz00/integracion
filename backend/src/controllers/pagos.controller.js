import { connection } from "../db.js";

// Registrar un nuevo pago
export const registrarPago = (req, res) => {
  const { curso_id, monto, metodo_pago } = req.body;
  const usuario_id = req.user.id; // viene del token

  if (!curso_id || !monto || !metodo_pago) {
    return res.status(400).json({ message: "Faltan datos del pago" });
  }

  const query = `
    INSERT INTO pagos (usuario_id, curso_id, monto, metodo_pago, fecha_pago)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(query, [usuario_id, curso_id, monto, metodo_pago], (err, result) => {
    if (err) {
      console.error("Error al registrar pago:", err);
      return res.status(500).json({ message: "Error al registrar pago" });
    }

    res.status(201).json({
      message: "Pago registrado correctamente",
      pagoId: result.insertId
    });
  });
};

// Obtener pagos del usuario logueado
export const obtenerPagos = (req, res) => {
  const id_usuario = req.user.id;

  const query = `
    SELECT p.id_pago, c.nombre AS curso, p.monto, p.metodo_pago, p.fecha_pago
    FROM pagos p
    INNER JOIN cursos c ON p.curso_id = c.curso_id
    WHERE p.usuario_id = ?
  `;

  connection.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error("Error al obtener pagos:", err);
      return res.status(500).json({ message: "Error al obtener pagos" });
    }

    res.json(results);
  });
};


