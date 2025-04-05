const express = require("express");
const router = express.Router();
const Hadith = require("../models/hadith");

// 🔹 Route pour récupérer tous les hadiths avec pagination
router.get("/hadiths", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Par défaut page 1
    const limit = parseInt(req.query.limit) || 20; // Par défaut 20 hadiths par page
    const skip = (page - 1) * limit;

    const { collection } = req.query;
    const query = collection ? { collection } : {};

    const hadiths = await Hadith.find(query).skip(skip).limit(limit);
    const total = await Hadith.countDocuments(query);

    res.json({
      status: "success",
      page,
      limit,
      total,
      data: hadiths,
    });
  } catch (error) {
    next(error);
  }
});

// 🔹 Route pour récupérer un hadith par ID
router.get("/hadiths/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Requested hadith ID:", id); // ✅ Correction ici

    const hadith = await Hadith.findOne({ id });
    console.log("Query result:", hadith);

    if (!hadith) {
      return res.status(404).json({ message: "Hadith non trouvé" });
    }

    res.json(hadith);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;
