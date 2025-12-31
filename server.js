const express = require("express");
const https = require("https");
const cors = require("cors");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Import des routes
const usersRouter = require("./routes/users.routes");
const studentsRouter = require("./routes/students.routes");
const budgetRouter = require("./routes/budget.routes");
const expensesRouter = require("./routes/expenses.routes");
const incomesRouter = require("./routes/incomes.routes");
const eventsRouter = require("./routes/events.routes");

// --------------------
// Logger des requêtes
// --------------------
app.use((req, res, next) => {
  console.log(`\n[REQ] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log("[BODY]", req.body);
  }
  next();
});

// Routes
app.use("/users", usersRouter);
app.use("/students", studentsRouter);
app.use("/budget", budgetRouter);
app.use("/expenses", expensesRouter);
app.use("/incomes", incomesRouter);
app.use("/events", eventsRouter);

// Route de test
app.get("/", (req, res) => {
  res.send("Backend du département Informatique fonctionne !");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erreur serveur" });
});

// 🔗 URL Render du backend
const BACKEND_URL = "https://backinformatique.onrender.com";

// 🔁 Fonction de ping
function pingServer() {
  https
    .get(BACKEND_URL, (res) => {
      console.log(`[PING] Serveur réveillé - Status: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("[PING] Erreur:", err.message);
    });
}


// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
    // 🟢 Ping immédiat au démarrage
  pingServer();

  // ⏱️ Ping toutes les 10 minutes (600 000 ms)
  setInterval( ()=>{
  https
    .get(BACKEND_URL, (res) => {
      console.log(`[PING] Serveur réveillé - Status: ${res.statusCode}`);
    })
    .on("error", (err) => {
      console.error("[PING] Erreur:", err.message);
    });
}, 1000*60*10);
});
