const fs = require("fs");

function readJSON(path) {
  if (!fs.existsSync(path)) return [];
  const data = fs.readFileSync(path, "utf8");
  return JSON.parse(data || "[]");
}

function writeJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}


// Nouvelle fonction pour convertir une image en base64
function imageToBase64(imagePath) {
  if (!fs.existsSync(imagePath)) return null;
  const bitmap = fs.readFileSync(imagePath);
  return `data:image/${path.extname(imagePath).slice(1)};base64,${Buffer.from(bitmap).toString("base64")}`;
}


module.exports = { readJSON, writeJSON, imageToBase64 };
