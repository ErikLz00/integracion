import { connection } from "../db.js";

// Listar todos los cursos
export const getCursos = (req, res) => {
  const sql = "SELECT * FROM cursos";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener los cursos" });
    res.json(results);
  });
};

// Obtener un curso por ID
export const getCursoById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM cursos WHERE id = ?";
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener el curso" });
    if (results.length === 0) return res.status(404).json({ error: "Curso no encontrado" });
    res.json(results[0]);
  });
};

