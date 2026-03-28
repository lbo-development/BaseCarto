const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
app.use(cors());
app.use(express.json());

/*app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "API OK2",
      database: "Connectée",
      now: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur base de données",
      error: error.message,
    });
  }
});
*/
app.get("/api/health", (req, res) => {
  res.json({ message: "API OK sans DB" });
});
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
