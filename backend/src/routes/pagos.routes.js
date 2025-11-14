import { Router } from "express";
import { registrarPago, obtenerPagos } from "../controllers/pagos.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { connection } from "../db.js";

const router = Router();

/**
 * 🔹 Registrar un pago manualmente (sin Culqi)
 */
router.post("/", verifyToken, registrarPago);

/**
 * 🔹 Obtener lista de pagos (solo usuarios autenticados)
 */
router.get("/", verifyToken, obtenerPagos);

/**
 * 🔹 Procesar pago con Culqi (Sandbox o producción)
 */
router.post("/tarjeta", verifyToken, async (req, res) => {
  try {
    const { token, amount, email, curso_id } = req.body;
    const usuario_id = req.user.id; // viene del token JWT

    if (!token || !amount || !email || !curso_id) {
      return res.status(400).json({ success: false, error: "Faltan datos requeridos" });
    }

    // 🔸 Solicitud a Culqi (modo sandbox)
    const response = await fetch("https://api.culqi.com/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount, // en céntimos
        currency_code: "PEN",
        email,
        source_id: token,
      }),
    });

    const data = await response.json();
    console.log("🔹 Respuesta Culqi:", data);

    // ✅ Si es una venta exitosa (sin 3DS)
    if (data.object === "charge" && data.outcome?.type === "venta_exitosa") {
      await connection.query(
        `
        INSERT INTO pagos (usuario_id, curso_id, monto, metodo_pago, fecha_pago)
        VALUES (?, ?, ?, ?, NOW())
      `,
        [usuario_id, curso_id, amount / 100, "Tarjeta"]
      );

      return res.json({
        success: true,
        message: "✅ Pago exitoso registrado correctamente",
        data,
      });
    }

    // ❌ Si Culqi devuelve error o requiere autenticación 3DS
    return res.status(400).json({
      success: false,
      error:
        data.user_message ||
        "El pago no fue exitoso (posible autenticación 3DS requerida)",
      data,
    });
  } catch (error) {
    console.error("❌ Error procesando pago:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});


export default router;
