const mongoose = require("mongoose");
const fs = require("fs");
const Question = require("./models/Question");
require("dotenv").config();

// Connexion à MongoDB
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("✅ Connecté à MongoDB Atlas");

    // Spécifier le chemin du fichier JSON
    const filePath = "C:\\Users\\HPA\\Documents\\dorar-hadith-api\\dorar-hadith-api\\data\\quiz_sire.json";
    
    if (!fs.existsSync(filePath)) {
        console.error("❌ Fichier Quiz_sire.json introuvable !");
        mongoose.connection.close();
        process.exit(1);
    }

    const data = fs.readFileSync(filePath, "utf-8");
    const questions = JSON.parse(data);

    // Supprimer les anciennes questions (optionnel)
    await Question.deleteMany({});
    console.log("🗑 Anciennes questions supprimées.");

    // Insérer les nouvelles questions
    await Question.insertMany(questions);
    console.log("✅ Importation des questions réussie !");

    // Fermer la connexion
    mongoose.connection.close();
})
.catch(err => {
    console.error("❌ Erreur lors de l'importation :", err);
    mongoose.connection.close();
});
