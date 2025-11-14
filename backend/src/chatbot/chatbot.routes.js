import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connection } from "../db.js";
import { verifyToken } from "../middleware/auth.middleware.js"; // 👈 Agregar middleware de auth

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
Eres un asistente virtual de "Cursos Pérez" especializado en cursos online.
INSTRUCCIONES ESTRICTAS:
- SOLO responde sobre cursos, inscripciones, precios y categorías disponibles
- Si preguntan algo fuera de estos temas, di educadamente que solo puedes ayudar con cursos
- Los precios de TODOS los cursos son $15.00
- NUNCA inventes cursos, precios o características que no existan
- Base tus respuestas únicamente en la información de la base de datos

INFORMACIÓN DISPONIBLE:
- Cursos: JavaScript, Node.js, Python, Java, Photoshop, Illustrator, UX/UI, Figma, Marketing Digital, SEO, Redes Sociales, Publicidad
- Categorías: Programación, Diseño, Marketing
- Precio uniforme: S/.15.00 por curso
`;

// Función auxiliar mejorada con manejo de errores
async function getAIResponse(userMessage, context = "") {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2, // 👈 Más determinístico
        maxOutputTokens: 500,
      }
    });
    
    const prompt = `
      ${SYSTEM_PROMPT}
      
      ${context ? `INFORMACIÓN CONTEXTUAL:\n${context}` : ''}
      
      PREGUNTA DEL USUARIO: "${userMessage}"
      
      Responde de manera útil y precisa:
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error en Gemini:", error);
    return "Lo siento, tengo problemas para procesar tu pregunta en este momento.";
  }
}
router.get("/saludo", verifyToken, async (req, res) => {
  try {
    const nombre = req.user.nombre || "usuario";
    res.json({ reply: `👋 ¡Hola ${nombre}! Soy tu asistente personal. ¿En qué puedo ayudarte hoy?` });
  } catch (error) {
    console.error("Error al generar saludo:", error);
    res.status(500).json({ reply: "⚠️ Error al generar saludo." });
  }
});

let ultimoCursoSeleccionado = null;

const cursos = [
  { id: 1, nombre: "javascript", descripcion: "Aprende JS desde cero", categoria: "Programación" },
  { id: 2, nombre: "node.js", descripcion: "Domina el backend con Node.js", categoria: "Programación" },
  { id: 3, nombre: "python", descripcion: "Fundamentos de Python", categoria: "Programación" },
  { id: 4, nombre: "java", descripcion: "Aprende programación con Java", categoria: "Programación" },
  { id: 5, nombre: "photoshop", descripcion: "Diseño y edición de imágenes", categoria: "Diseño" },
  { id: 6, nombre: "illustrator", descripcion: "Ilustración vectorial", categoria: "Diseño" },
  { id: 7, nombre: "ux/ui", descripcion: "Diseño de interfaces modernas", categoria: "Diseño" },
  { id: 8, nombre: "figma", descripcion: "Prototipado con Figma", categoria: "Diseño" },
  { id: 9, nombre: "marketing digital", descripcion: "Estrategias digitales efectivas", categoria: "Marketing" },
  { id: 10, nombre: "seo", descripcion: "Posiciona tu web en Google", categoria: "Marketing" },
  { id: 11, nombre: "redes sociales", descripcion: "Gestión de redes y contenidos", categoria: "Marketing" },
  { id: 12, nombre: "publicidad", descripcion: "Publicidad y branding", categoria: "Marketing" }
];

// 👇 Agregar middleware de autenticación
router.post("/", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const usuario_id = req.user.id || req.user.usuario_id || req.user.userId; // 👈 Del token JWT, más seguro

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ reply: "Por favor, escribe un mensaje." });
    }

    const msg = message.toLowerCase().trim();
    let respuesta = "";
    let context = "";

    // 📚 CASUÍSTICAS MEJORADAS

    // 1. Listar todos los cursos
    if (msg.includes("curso") && (msg.includes("todos") || msg.includes("disponible") || msg.includes("lista"))) {
      const [rows] = await connection.promise().query(`
        SELECT c.titulo, cat.nombre as categoria, c.precio 
        FROM cursos c 
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        ORDER BY cat.nombre, c.titulo
      `);
      
      if (rows.length > 0) {
        const lista = rows.map(r => `• ${r.titulo} (${r.categoria}) - $${r.precio}`).join('\n');
        respuesta = `🎯 **Todos nuestros cursos:**\n\n${lista}\n\n💡 *Precio especial: $15.00 por curso*`;
      } else {
        respuesta = "Actualmente no hay cursos disponibles.";
      }
    }

    // 2. Cursos por categoría
    else if (msg.includes("curso") && (msg.includes("programación") || msg.includes("diseño") || msg.includes("marketing"))) {
      let categoria = "";
      if (msg.includes("programación")) categoria = "Programación";
      else if (msg.includes("diseño")) categoria = "Diseño";
      else if (msg.includes("marketing")) categoria = "Marketing";

      const [rows] = await connection.promise().query(`
        SELECT c.titulo, c.descripcion, c.precio 
        FROM cursos c 
        JOIN categorias cat ON c.categoria_id = cat.id 
        WHERE cat.nombre = ?
      `, [categoria]);

      if (rows.length > 0) {
        const lista = rows.map(r => `• ${r.titulo}: ${r.descripcion}`).join('\n');
        respuesta = `📂 **Cursos de ${categoria}:**\n\n${lista}`;
      } else {
        respuesta = `No encontré cursos en la categoría ${categoria}.`;
      }
    }

    // 3. Cursos del usuario (inscritos)
    else if (msg.includes("inscrito") || msg.includes("matriculado") || msg.includes("mi curso") || msg.includes("compré")) {
      const [rows] = await connection.promise().query(`
        SELECT c.titulo, c.descripcion, p.fecha_pago
        FROM pagos p
        JOIN cursos c ON c.id = p.curso_id
        WHERE p.usuario_id = ?
        ORDER BY p.fecha_pago DESC
      `, [usuario_id]);

      if (rows.length > 0) {
        const lista = rows.map(r => `• ${r.titulo}`).join('\n');
        respuesta = `📖 **Tus cursos inscritos:**\n\n${lista}\n\n¡Sigue aprendiendo! 💪`;
      } else {
        respuesta = "📚 Aún no tienes cursos inscritos. ¡Explora nuestra oferta educativa!";
      }
    }

    // 4. Información de precio
    else if (msg.includes("precio") || msg.includes("cuesta") || msg.includes("valor") || msg.includes("cuánto")) {
      const [rows] = await connection.promise().query("SELECT titulo, precio FROM cursos");
      respuesta = `💵 **Precios de cursos:**\n\nTodos nuestros cursos tienen un precio uniforme de $15.00\n\nIncluyen acceso ilimitado, certificado y soporte personalizado.`;
    }


    else if (
      msg.includes("pagar con") ||
      msg.includes("quiero pagar") ||
      msg.includes("método de pago")
    ) {
      let metodo = "";
      if (msg.includes("yape")) metodo = "Yape";
      else if (msg.includes("tarjeta") || msg.includes("visa") || msg.includes("mastercard")) metodo = "Tarjeta";
      else if (msg.includes("paypal")) metodo = "PayPal";
      else if (msg.includes("cripto") || msg.includes("bitcoin") || msg.includes("usdt")) metodo = "Criptomonedas";

      if (!metodo) {
        respuesta = "💳 Puedes pagar con **Yape, Tarjeta, PayPal o Criptomonedas**. Indícame cuál prefieres usar.";
      } else {
        // ✅ Verificar si hay curso actual o usar el último guardado
        const cursoKeywords = {
          'javascript': 1,
          'node': 2,
          'python': 3,
          'java': 4,
          'photoshop': 5,
          'illustrator': 6,
          'ux/ui': 7,
          'figma': 8,
          'marketing digital': 9,
          'seo': 10,
          'redes sociales': 11,
          'publicidad': 12
        };

        let cursoId = null;
        for (const [key, id] of Object.entries(cursoKeywords)) {
          if (msg.includes(key)) {
            cursoId = id;
            ultimoCursoSeleccionado = key.trim().toLowerCase(); // 👈 actualizar el último curso si está en el mensaje
            break;
          }
        }

        // 🧠 Si no se detecta curso en este mensaje, usar el último mencionado
        if (!cursoId && ultimoCursoSeleccionado) {
          const cursoEncontrado = Object.entries(cursoKeywords).find(([key]) =>
            key === ultimoCursoSeleccionado.toLowerCase()
          );
          if (cursoEncontrado) {
            cursoId = cursoEncontrado[1];
          }
        }

        if (!cursoId) {
          respuesta = `💰 Vas a pagar con **${metodo}**, perfecto.  
          Pero antes necesito saber qué curso te interesa.  
          Ejemplo: "Quiero pagar el curso de Python con ${metodo}".`;
        } else {
          const link = `http://localhost:4200/curso/${cursoId}`;
          respuesta = `✅ Perfecto, puedes realizar el pago del curso usando **${metodo}**.  
          Ingresa aquí para continuar con tu compra:  
          👉 <a href="${link}" target="_blank">${link}</a>`;
        }
      }
    }

    // 5. Información específica de un curso
    else if (msg.match(/(javascript|node|python|java|photoshop|illustrator|figma|ux|ui|seo|marketing|redes sociales|publicidad)/i)) {
      const cursoKeywords = {
        'javascript': 'JavaScript',
        'node': 'Node.js',
        'python': 'Python',
        'java': 'Java',
        'photoshop': 'Photoshop',
        'illustrator': 'Illustrator',
        'figma': 'Figma',
        'ux': 'UX/UI',
        'ui': 'UX/UI',
        'seo': 'SEO',
        'marketing': 'Marketing Digital',
        'redes sociales': 'Redes Sociales',
        'publicidad': 'Publicidad'
      };

      let cursoBuscado = "";
      for (const [key, value] of Object.entries(cursoKeywords)) {
        if (msg.includes(key)) {
          cursoBuscado = value;
          break;
        }
      }

      if (cursoBuscado) {
        const [rows] = await connection.promise().query(`
          SELECT c.titulo, c.descripcion, c.precio, cat.nombre as categoria
          FROM cursos c 
          LEFT JOIN categorias cat ON c.categoria_id = cat.id
          WHERE c.titulo LIKE ?
        `, [`%${cursoBuscado}%`]);

        if (rows.length > 0) {
          const curso = rows[0];
          respuesta = `📘 **${curso.titulo}**\n\n📂 Categoría: ${curso.categoria}\n💵 Precio: $${curso.precio}\n📝 Descripción: ${curso.descripcion}\n\n¡Perfecto para empezar hoy mismo! 🚀`;
          ultimoCursoSeleccionado = cursoBuscado;
        }
      }
    }
    else if (
      msg.includes("pago") ||
      msg.includes("pagos") ||
      msg.includes("método de pago") ||
      msg.includes("formas de pago") ||
      msg.includes("cómo pagar") ||
      msg.includes("aceptan") && msg.includes("pago")
    ) {
      respuesta = "💳 Aceptamos los siguientes métodos de pago: **PayPal, Yape, tarjetas de crédito/débito y también criptomonedas (como USDT o Bitcoin)**. 🚀";
    }

    // 🧠 Si no cae en casuísticas específicas, usar IA con contexto
    if (!respuesta) {
      // ✅ Obtener los cursos desde la BD para generar el contexto
      const [cursos] = await connection.promise().query("SELECT titulo FROM cursos");

      // Crear texto de contexto para el modelo
      context = `Cursos disponibles: ${cursos.map(c => c.titulo).join(', ')}`;

      // Obtener respuesta de Gemini usando el contexto real
      const aiReply = await getAIResponse(msg, context);

      respuesta = aiReply || "No tengo información sobre eso por ahora, pero puedo ayudarte con nuestros cursos disponibles.";
    }

    // ✅ Enviar respuesta al frontend
    res.json({ reply: respuesta });

  } catch (error) {
    console.error("Error en chatbot:", error);
    res.status(500).json({ 
      reply: "⚠️ Lo siento, estoy teniendo problemas técnicos. Por favor, intenta nuevamente." 
    });
  }
});

export default router;