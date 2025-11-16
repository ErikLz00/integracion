import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url"; 
import { connection } from "./db.js";
import cursosRoutes from "./routes/cursos.routes.js";
import dotenv from "dotenv";
import pagosRoutes from "./routes/pagos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import chatbotRoutes from "./chatbot/chatbot.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());



const __dirname = path.dirname(fileURLToPath(import.meta.url)); 
const ANGULAR_DIST_PATH = path.join(__dirname, '..', '..', 'backend', 'dist', 'cursos-frontend', 'browser'); 

// --- Rutas de la API (Backend) ---
app.use("/api/cursos", cursosRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chatbot", chatbotRoutes);


const PUBLIC_PATH = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_PATH));

app.use(express.static(ANGULAR_DIST_PATH));


app.get('/', (req, res) => {
    
    try {
        res.sendFile(path.join(ANGULAR_DIST_PATH, 'index.html'));
    } catch (e) {
        console.error("Error al servir index.html:", e);
        res.status(500).send("Error interno del servidor al servir el frontend.");
    }
});


app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
