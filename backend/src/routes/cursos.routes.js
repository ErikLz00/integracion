import express from "express";
import { connection } from "../db.js";
import { getCursos, getCursoById} from '../controllers/cursos.controller.js';

const router = express.Router();

//router.get("/", (req, res) => {
  //connection.query("SELECT * FROM cursos", (err, results) => {
    //if (err) return res.status(500).json({ error: err });
    //res.json(results);
  //});
//});

router.get("/", getCursos);        // GET /api/cursos
router.get("/:id", getCursoById);  // GET /api/cursos/:id
export default router;
