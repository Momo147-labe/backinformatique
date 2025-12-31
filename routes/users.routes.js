const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const { readJSON, writeJSON } = require("../utils/file.utils");

const router = express.Router();
const filePath = path.join(__dirname, "../data/users.json");

// Générer ID à partir du rôle, nom et prénom
function generateUserId(role, nom, prenom) {
  const clean = (str) => str.toLowerCase().replace(/\s+/g, '');
  return `${clean(role)}_${clean(nom)}_${clean(prenom)}`;
}

// Multer : stockage en mémoire pour convertir en base64
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Fichier non autorisé"), false);
    }
  },
});

// --------------------
// INSCRIPTION
// --------------------
router.post("/register", upload.single("profil"), async (req, res) => {
  try {
    console.log("req.body:", req.body); // Debug
    console.log("req.file:", req.file); // Debug

    const { nom, prenom, username, password, role, INE } = req.body;

    if (!nom || !prenom || !username || !password || !role) {
      return res.status(400).json({ error: "Nom, prenom, username, password et role requis" });
    }

    const data = readJSON(filePath);

    if (data.find(u => u.username === username)) {
      return res.status(400).json({ error: "Username déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateUserId(role, nom, prenom);

    // 🔥 Conversion image en Base64
    let profil = "";
    if (req.file) {
      profil = req.file.buffer.toString("base64");
    }

    const newUser = {
      id,
      nom,
      prenom,
      username,
      password: hashedPassword,
      role,
      INE: INE || "",
      profil,
      contact: [],
      competence: [],
      specialite: [],
      projets: [],
    };

    data.push(newUser);
    writeJSON(filePath, data);

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// LOGIN
// --------------------
router.post("/login", async (req, res) => {
  try {
    const data = readJSON(filePath);
    const { username, password } = req.body;
    const user = data.find(u => u.username === username);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// CRUD UTILISATEURS
// --------------------

// READ tous
router.get("/", (req, res) => {
  const data = readJSON(filePath);
  res.json(data);
});

// READ par id
router.get("/:id", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user);
});

// UPDATE complet pour compléter les champs vides
router.put("/:id", (req, res) => {
  const data = readJSON(filePath);
  const index = data.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Utilisateur non trouvé" });

  data[index] = { ...data[index], ...req.body };
  writeJSON(filePath, data);
  res.json(data[index]);
});

// DELETE utilisateur
router.delete("/:id", (req, res) => {
  let data = readJSON(filePath);
  data = data.filter(u => u.id !== req.params.id);
  writeJSON(filePath, data);
  res.json({ success: true });
});

// --------------------
// CRUD CONTACT
// --------------------
router.get("/:id/contact", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user.contact);
});

router.post("/:id/contact", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  user.contact.push(req.body);
  writeJSON(filePath, data);
  res.status(201).json(user.contact);
});

router.put("/:id/contact/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const i = parseInt(req.params.index);
  if (i < 0 || i >= user.contact.length) return res.status(400).json({ error: "Index invalide" });

  user.contact[i] = req.body;
  writeJSON(filePath, data);
  res.json(user.contact[i]);
});

router.delete("/:id/contact/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const i = parseInt(req.params.index);
  if (i < 0 || i >= user.contact.length) return res.status(400).json({ error: "Index invalide" });

  const removed = user.contact.splice(i, 1);
  writeJSON(filePath, data);
  res.json(removed[0]);
});

// --------------------
// CRUD COMPETENCE
// --------------------
router.get("/:id/competence", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user.competence);
});

router.post("/:id/competence", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  user.competence.push(req.body);
  writeJSON(filePath, data);
  res.status(201).json(user.competence);
});

router.put("/:id/competence/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const i = parseInt(req.params.index);
  if (i < 0 || i >= user.competence.length) return res.status(400).json({ error: "Index invalide" });

  user.competence[i] = req.body;
  writeJSON(filePath, data);
  res.json(user.competence[i]);
});

router.delete("/:id/competence/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const i = parseInt(req.params.index);
  const removed = user.competence.splice(i, 1);
  writeJSON(filePath, data);
  res.json(removed[0]);
});

// --------------------
// CRUD SPECIALITE
// --------------------
router.get("/:id/specialite", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user.specialite);
});

router.post("/:id/specialite", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  user.specialite.push(req.body);
  writeJSON(filePath, data);
  res.status(201).json(user.specialite);
});

router.put("/:id/specialite/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const i = parseInt(req.params.index);
  user.specialite[i] = req.body;
  writeJSON(filePath, data);
  res.json(user.specialite[i]);
});

router.delete("/:id/specialite/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  const i = parseInt(req.params.index);
  const removed = user.specialite.splice(i, 1);
  writeJSON(filePath, data);
  res.json(removed[0]);
});

// --------------------
// CRUD PROJETS
// --------------------
router.get("/:id/projets", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  res.json(user.projets);
});

router.post("/:id/projets", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  user.projets.push(req.body);
  writeJSON(filePath, data);
  res.status(201).json(user.projets);
});

router.put("/:id/projets/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  const i = parseInt(req.params.index);
  user.projets[i] = req.body;
  writeJSON(filePath, data);
  res.json(user.projets[i]);
});

router.delete("/:id/projets/:index", (req, res) => {
  const data = readJSON(filePath);
  const user = data.find(u => u.id === req.params.id);
  const i = parseInt(req.params.index);
  const removed = user.projets.splice(i, 1);
  writeJSON(filePath, data);
  res.json(removed[0]);
});


module.exports = router;