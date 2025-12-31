const express = require("express");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/file.utils");
const router = express.Router();
const filePath = path.join(__dirname, "../data/budget.json");

function checkBudgetRole(req, res, next) {
  const user = req.body.user || req.query.user;
  if (!user || !["admin", "tresorier"].includes(user.role)) {
    return res.status(403).json({ error: "Action réservée à l'admin ou au trésorier" });
  }
  next();
}

// GET all budgets (tous)
router.get("/", (req, res) => res.json(readJSON(filePath)));

// CRUD limité
router.post("/", checkBudgetRole, (req, res) => {
  const data = readJSON(filePath);
  const newBudget = { id: Date.now(), ...req.body };
  data.push(newBudget);
  writeJSON(filePath, data);
  res.status(201).json(newBudget);
});

router.put("/:id", checkBudgetRole, (req, res) => {
  const data = readJSON(filePath);
  const index = data.findIndex(b => b.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Budget non trouvé" });
  data[index] = { ...data[index], ...req.body };
  writeJSON(filePath, data);
  res.json(data[index]);
});

router.delete("/:id", checkBudgetRole, (req, res) => {
  let data = readJSON(filePath);
  data = data.filter(b => b.id != req.params.id);
  writeJSON(filePath, data);
  res.json({ success: true });
});

module.exports = router;
