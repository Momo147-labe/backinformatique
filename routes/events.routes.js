const express = require("express");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/file.utils");
const router = express.Router();
const filePath = path.join(__dirname, "../data/events.json");

// GET all
router.get("/", (req, res) => res.json(readJSON(filePath)));

// GET one
router.get("/:id", (req, res) => {
  const event = readJSON(filePath).find(e => e.id == req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

// POST create
router.post("/", (req, res) => {
  const data = readJSON(filePath);
  const newEvent = { id: Date.now(), ...req.body };
  data.push(newEvent);
  writeJSON(filePath, data);
  res.status(201).json(newEvent);
});

// PUT update
router.put("/:id", (req, res) => {
  const data = readJSON(filePath);
  const index = data.findIndex(e => e.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Event not found" });
  data[index] = { ...data[index], ...req.body };
  writeJSON(filePath, data);
  res.json(data[index]);
});

// DELETE
router.delete("/:id", (req, res) => {
  let data = readJSON(filePath);
  data = data.filter(e => e.id != req.params.id);
  writeJSON(filePath, data);
  res.json({ success: true });
});

module.exports = router;
