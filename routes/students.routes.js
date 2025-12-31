const express = require("express");
const path = require("path");
const { readJSON, writeJSON } = require("../utils/file.utils");

const router = express.Router();
const filePath = path.join(__dirname, "../data/students.json");

// GET all students
router.get("/", (req, res) => res.json(readJSON(filePath)));

// GET one student
router.get("/:id", (req, res) => {
  const student = readJSON(filePath).find(s => s.id == req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  res.json(student);
});

// POST create student
router.post("/", (req, res) => {
  const students = readJSON(filePath);
  const newStudent = { id: Date.now(), ...req.body };
  students.push(newStudent);
  writeJSON(filePath, students);
  res.status(201).json(newStudent);
});

// PUT update student
router.put("/:id", (req, res) => {
  const students = readJSON(filePath);
  const index = students.findIndex(s => s.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: "Student not found" });
  students[index] = { ...students[index], ...req.body };
  writeJSON(filePath, students);
  res.json(students[index]);
});

// DELETE student
router.delete("/:id", (req, res) => {
  let students = readJSON(filePath);
  students = students.filter(s => s.id != req.params.id);
  writeJSON(filePath, students);
  res.json({ success: true });
});

module.exports = router;
