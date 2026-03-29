import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;

const app = express();

app.use(cors());
app.use(express.json());

/* 🔥 CONNEXION POSTGRES ICI */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/* TEST DB */
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, now: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ROUTE SITES */
app.get("/api/sites", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_site, lib_site, latitude, longitude, zoom
      FROM db_sites
      ORDER BY id_site
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERREUR /api/sites :", error);
    res.status(500).json({ error: error.message });
  }
});

/* LANCEMENT SERVEUR */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
