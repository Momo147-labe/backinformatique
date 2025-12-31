const express = require("express");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/file.utils");
const router = express.Router();
const filePath = path.join(__dirname, "../data/incomes.json");

// Middleware pour vérifier admin ou trésorier
function checkRole(req, res, next) {
  const user = req.body.user || req.query.user;
  if (!user || !["admin", "tresorier"].includes(user.role)) {
    return res.status(403).json({ error: "Action réservée à l'admin ou au trésorier" });
  }
  next();
}

// GET all incomes (lecture pour tous)
router.get("/", (req, res) => {
  const data = readJSON(filePath);
  res.json(data);
});

// GET one income
router.get("/:id", (req, res) => {
  const data = readJSON(filePath);
  const income = data.find(e => e.id == req.params.id);
  if (!income) return res.status(404).json({ error: "Revenu non trouvé" });
  res.json(income);
});

// POST create (admin / trésorier)
router.post("/", checkRole, (req, res) => {
  const data = readJSON(filePath);
  const newIncome = { id: Date.now(), ...req.body };
  data.push(newIncome);
  writeJSON(filePath, data);
  res.status(201).json(newIncome);
});

// PUT update (admin / trésorier)
router.put("/:id", checkRole, (req, res) => {
  const data = readJSON(filePath);
  const index = data.findIndex(e => e.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Revenu non trouvé" });
  data[index] = { ...data[index], ...req.body };
  writeJSON(filePath, data);
  res.json(data[index]);
});

// DELETE (admin / trésorier)
router.delete("/:id", checkRole, (req, res) => {
  let data = readJSON(filePath);
  data = data.filter(e => e.id != req.params.id);
  writeJSON(filePath, data);
  res.json({ success: true });
});

module.exports = router;
