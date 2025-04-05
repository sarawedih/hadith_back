const mongoose = require("mongoose");
const fs = require("fs");
const Question_H = require("./models/Question_H");
const path = require("path");
require("dotenv").config();

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("✅ Connecté à MongoDB Atlas");

    const filePath = path.join(__dirname, "data/quiz_hadith.json");
    
    if (!fs.existsSync(filePath)) {
        console.error("❌ Fichier Quiz_hadith.json introuvable !");
        await mongoose.disconnect();
        process.exit(1);
    }

    const data = fs.readFileSync(filePath, "utf-8");

    let questions_hadith;
    try {
        questions_hadith = JSON.parse(data);
    } catch (error) {
        console.error("❌ Erreur de parsing JSON :", error);
        await mongoose.disconnect();
        process.exit(1);
    }

    // Supprimer les anciennes questions (optionnel)
    await Question_H.deleteMany({});
    console.log("🗑 Anciennes questions supprimées.");

    // Insérer les nouvelles questions
    const inserted = await Question_H.insertMany(questions_hadith);
    console.log(`✅ ${inserted.length} questions importées avec succès !`);

    // Fermer la connexion proprement
    await mongoose.disconnect();
    console.log("🔌 Déconnexion de MongoDB.");
})
.catch(async (err) => {
    console.error("❌ Erreur lors de l'importation :", err);
    await mongoose.disconnect();
    process.exit(1);
});
