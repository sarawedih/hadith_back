const express = require("express");
const Question_H = require("../models/Question_H"); // Import du modèle de questions depuis MongoDB
const router = express.Router();

// Stocker les sessions de test par utilisateur (gestion en mémoire temporaire)
let quizSessions = {};

/**
 * 🎯 Démarrer un test en fonction du niveau
 * Chaque niveau a un nombre croissant de questions
 */
router.get("/start/:level", async (req, res) => {
    try {
        const level = parseInt(req.params.level);
        if (level < 1 || level > 10) {
            return res.status(400).json({ error: "Le niveau doit être entre 1 et 10" });
        }

        // Définir le nombre de questions en fonction du niveau
        const numQuestions = 5 + (level - 1) * 2; // Niveau 1: 5 questions, Niveau 2: 7, etc.
        
        const sessionId = Date.now().toString(); // Générer un ID unique pour la session
        const questions_hadith= await Question_H.aggregate([{ $sample: { size: numQuestions } }]);
        //console.log("🔍 Questions récupérées :", questions_hadith);

        quizSessions[sessionId] = { level, questions_hadith, responses: [] };
        res.json({ sessionId, level, questions_hadith: questions_hadith.map(q => ({ id: q._id, question: q.question, choices: q.choices })) });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
});

/**
 * ✅ Soumettre les réponses pour une session et obtenir le score + corrections
 */
router.post("/submit", async (req, res) => {
    
    try {
        const { sessionId, answers } = req.body;
        if (!quizSessions[sessionId]) {
            return res.status(400).json({ error: "Session invalide ou expirée" });
        }

        let score = 0;
        let incorrectAnswers = [];
        let sessionQuestions = quizSessions[sessionId].questions_hadith;

        for (let userAnswer of answers) {
            const question = sessionQuestions.find(q => q._id.toString() === userAnswer.id);
            if (question) {
                if (question.correct === userAnswer.answer) {
                    score++;
                } else {
                    incorrectAnswers.push({
                        id: question._id,
                        question: question.question,
                        userAnswer: userAnswer.answer,
                        correctAnswer: question.correct
                    });
                }
            }
        }

        // Supprimer la session après soumission
        delete quizSessions[sessionId];

        res.json({
            sessionId,
            score,
            total: answers.length,
            incorrectAnswers,
            message: score > answers.length * 0.7 ? "🎉 Félicitations, vous pouvez passer au niveau suivant !" : "❌ Réessayez pour améliorer votre score."
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
});

module.exports = router;
